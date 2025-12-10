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
import { MERCADOPAGO_ACCESS_TOKEN, BACKEND_URL, FRONTEND_URL, NGROK_URL } from '../global/enviorenment';
import ResponseHelper from '../helpers/response.helper';

/**
 * Controlador para manejar pagos con MercadoPago
 * IMPORTANTE: Usa variables de entorno para todas las credenciales
 */

export const createOrder = async (req: Request, res: Response) => {
  console.log("ENTRO A CREATE ORDER");

  // Configurar MercadoPago - SIN FALLBACK hardcodeado por seguridad
  try {
    mercadopago.configure({
      access_token: MERCADOPAGO_ACCESS_TOKEN,
    });
  } catch (error: any) {
    console.error('Error al configurar MercadoPago:', error);
    return ResponseHelper.serverError(res, 'Error de configuración del servicio de pagos', error);
  }

  const { motivo, idCita } = req.body;

  try {
    // Cargar la cita con el paciente y tipo de cita para calcular el precio correcto
    const cita = await CitaMedica.findByPk(idCita, {
      include: [
        {
          model: Usuario,
          as: 'paciente',
          attributes: ['tipo_prevision', 'prevision_validada', 'tramo_fonasa', 'nombre_isapre']
        },
        {
          model: tipo_cita,
          as: 'tipoCita',
          attributes: ['precio', 'precio_fonasa', 'precio_isapre', 'precio_particular', 'tipo_cita']
        }
      ]
    });

    if (!cita) {
      return ResponseHelper.notFound(res, 'Cita médica no encontrada');
    }

    if (!cita.tipoCita) {
      return ResponseHelper.serverError(res, 'No se pudo obtener el tipo de cita');
    }

    // Calcular el precio según la previsión del paciente
    const tipoPrevision = cita.paciente?.tipo_prevision || 'Particular';
    const precioOriginal = cita.tipoCita.precio_particular || cita.tipoCita.precio;
    let precioFinal: number;
    let porcentajeDescuento = 0;

    switch (tipoPrevision) {
      case 'Fonasa':
        precioFinal = cita.tipoCita.precio_fonasa || cita.tipoCita.precio * 0.7;
        porcentajeDescuento = 30;
        console.log(`💰 Precio Fonasa aplicado: ${precioFinal} (paciente con Fonasa - 30% descuento)`);
        break;
      case 'Isapre':
        precioFinal = cita.tipoCita.precio_isapre || cita.tipoCita.precio * 0.84;
        porcentajeDescuento = 16;
        console.log(`💰 Precio Isapre aplicado: ${precioFinal} (paciente con Isapre - 16% descuento)`);
        break;
      case 'Particular':
      default:
        precioFinal = precioOriginal;
        porcentajeDescuento = 0;
        console.log(`💰 Precio Particular aplicado: ${precioFinal} (paciente particular)`);
        break;
    }

    const descuentoAplicado = precioOriginal - precioFinal;

    // Determinar si requiere validación:
    // - Si es Particular: NO requiere validación
    // - Si tiene Fonasa/Isapre pero YA validó en una cita anterior: NO requiere validación
    // - Si tiene Fonasa/Isapre pero NUNCA ha validado: SÍ requiere validación
    const previsionYaValidada = cita.paciente?.prevision_validada || false;
    const requiereValidacion = tipoPrevision !== 'Particular' && !previsionYaValidada;

    console.log(`📋 Validación de previsión:`);
    console.log(`   - Tipo de previsión: ${tipoPrevision}`);
    console.log(`   - ¿Ya validó previamente?: ${previsionYaValidada ? 'SÍ' : 'NO'}`);
    console.log(`   - ¿Requiere validación en esta cita?: ${requiereValidacion ? 'SÍ' : 'NO'}`);

    // Guardar información de precios y previsión en la cita
    await cita.update({
      precio_original: precioOriginal,
      precio_final: precioFinal,
      tipo_prevision_aplicada: tipoPrevision,
      descuento_aplicado: descuentoAplicado,
      porcentaje_descuento: porcentajeDescuento,
      requiere_validacion_prevision: requiereValidacion,
      prevision_validada: previsionYaValidada // Si ya validó antes, marcarla como validada automáticamente
    });

    // URLs dinámicas basadas en variables de entorno
    const baseUrl = NGROK_URL || BACKEND_URL;
    const frontendUrl = FRONTEND_URL;

    const preference: CreatePreferencePayload = {
      items: [
        {
          title: motivo || cita.tipoCita.tipo_cita,
          unit_price: precioFinal,
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

    return ResponseHelper.successWithCustomData(res, {
      id: response.body.id,
      init_point: response.body.init_point,
      sandbox_init_point: response.body.sandbox_init_point
    });

  } catch (error: any) {
    console.error('Error en createOrder:', error);
    return ResponseHelper.serverError(res, 'Error al generar el link de pago', error);
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
          especialidad: cita.tipoCita.especialidad_medica,
          tipoPrevision: cita.tipo_prevision_aplicada || 'Particular',
          precioOriginal: cita.precio_original || cita.tipoCita.precio,
          precioFinal: cita.precio_final || montoPagado,
          descuentoAplicado: cita.descuento_aplicado || 0,
          requiereValidacion: cita.requiere_validacion_prevision || false
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