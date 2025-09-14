import { Request, Response } from 'express';
import mercadopago from "mercadopago";
import { CreatePreferencePayload } from 'mercadopago/models/preferences/create-payload.model';
import Factura from '../models/factura'; 
import tipo_cita from '../models/tipo_cita';
import CitaMedica from '../models/cita_medica';
import Medico from '../models/medico';
import Usuario from '../models/usuario';
import Email from '../helpers/emails';
import db from '../db/connection';

export const createOrder = async (req: Request, res: Response) => {
  console.log("ENTRO A CREATE ORDER");
  
  // Configurar MercadoPago con variable de entorno
  mercadopago.configure({
    access_token: process.env.MERCADOPAGO_ACCESS_TOKEN || 'TEST-884031095793760-111819-b2ad3ea11301ffbeab5f5eaef06ad47f-293343090',
  });

  const { motivo, precio, idCita } = req.body;

  try {
    // URLs dinámicas basadas en variables de entorno
    const baseUrl = process.env.NGROK_URL || process.env.BACKEND_URL || 'http://localhost:8000';
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';

    const preference: CreatePreferencePayload = {
      items: [
        {
          title: motivo,
          unit_price: precio,
          currency_id: 'CLP',
          quantity: 1,
        }
      ],
      external_reference: idCita.toString(),
      back_urls: {
        success: `${frontendUrl}/payment-success?idCita=${idCita}`,
        failure: `${frontendUrl}/payment-failure`,
        pending: `${baseUrl}/api/mercadoPago/pending`
      },
      notification_url: `${baseUrl}/api/mercadoPago/webhook`,
      auto_return: "approved",
    };

    const response = await mercadopago.preferences.create(preference);
    
    res.json({
      ok: true,
      id: response.body.id,
      init_point: response.body.init_point,
      sandbox_init_point: response.body.sandbox_init_point
    });

  } catch (error) {
    const err = error as Error;
    console.error('Error en createOrder:', err);
    res.status(500).json({
      error: 'Error al generar el link de pago',
      detalle: err.message
    });
  }
};

export const receiveWebhook = async (req: Request, res: Response) => {
  console.log('===== WEBHOOK RECIBIDO =====');
  console.log('Método:', req.method);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);

  try {
    let paymentId: number;
    let idCita: number;

    if (req.body.type === 'payment') {
      paymentId = Number(req.body.data.id);
      console.log('Payment ID recibido:', paymentId);

      const payment = await obtenerPagoConReintentos(paymentId, 10, 5000);
      console.log("aqui el payment", payment);
      console.log("aqui el payment status", payment.status);
      
      idCita = parseInt(payment.external_reference, 10);
      if (isNaN(idCita)) {
        throw new Error(`External reference inválido: ${payment.external_reference}`);
      }

      if (payment.status === 'approved') {
        await procesarPagoExitoso(paymentId, idCita, payment.transaction_amount);
      }
    }

    res.status(200).send('OK');
  } catch (error: any) {
    console.error('Error crítico en webhook:', {
      error: error.message,
      stack: error.stack,
      body: req.body
    });
    res.status(200).send('OK');
  }
};

async function obtenerPagoConReintentos(paymentId: number, maxRetries = 10, baseDelay = 5000) {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      const { body } = await mercadopago.payment.findById(paymentId);
      console.log(`✅ Pago ${paymentId} obtenido en intento ${retries + 1}`);
      console.log(`Status del pago: ${body.status}`);
      console.log(`External reference: ${body.external_reference}`);
      return body;
    } catch (error: any) {
      if (error.status === 404) {
        const delay = baseDelay * Math.pow(2, retries);
        console.log(`⌛ Reintento ${retries + 1}/${maxRetries} en ${delay}ms para pago ${paymentId}`);
        await new Promise(resolve => setTimeout(resolve, delay));
        retries++;
      } else {
        console.error('Error diferente a 404:', error);
        throw error;
      }
    }
  }
  throw new Error(`❌ Pago ${paymentId} no encontrado después de ${maxRetries} intentos`);
}

async function procesarPagoExitoso(paymentId: number, idCita: number, montoPagado: number) {
  console.log("entro a la funcion de pago exitoso");
  const transaction = await db.transaction();
  
  try {
    const cita = await CitaMedica.findByPk(idCita, {
      include: [
        { 
          association: 'tipoCita',
          attributes: ['precio', 'especialidad_medica'] 
        },
        {
          association: 'paciente',
          attributes: ['email', 'nombre']
        },
        {
          association: 'medico',
          attributes: ['nombre', 'apellidos']
        }
      ],
      transaction
    });

    if (!cita || !cita.tipoCita || !cita.medico) {
      throw new Error(`Cita ${idCita} no encontrada o sin datos necesarios`);
    }

    if (montoPagado !== cita.tipoCita.precio) {
      throw new Error(`Monto discrepante. Esperado: $${cita.tipoCita.precio}, Recibido: $${montoPagado}`);
    }

    const factura = await Factura.create({
      id_cita: idCita,
      payment_method_id: 'mercado_pago',
      transaction_amount: cita.tipoCita.precio,
      monto_pagado: montoPagado,
      payment_status: 'approved',
      estado_pago: 'pagado',
      fecha_pago: new Date(),
      estado: 'activo'
    }, { transaction });

    await cita.update({ estado: 'pagado' }, { transaction });

    if (cita.paciente && cita.paciente.email) {
      try {
        const fechaFormateada = cita.fecha.toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        await Email.instance.enviarConfirmacionCita({
          emailPaciente: cita.paciente.email,
          pacienteNombre: cita.paciente.nombre,
          fecha: fechaFormateada,
          hora_inicio: cita.hora_inicio,
          medicoNombre: `${cita.medico.nombre} ${cita.medico.apellidos}`,
          especialidad: cita.tipoCita.especialidad_medica
        });
      } catch (emailError) {
        console.error('Error al enviar correo (no crítico):', emailError);
      }
    } else {
      console.warn('No se envió correo: paciente sin email válido');
    }

    await transaction.commit();
    console.log(`Pago ${paymentId} procesado. Factura ID: ${factura.id_factura}`);

  } catch (error) {
    await transaction.rollback();
    console.error('Error en transacción:', error);
    throw error;
  }
}