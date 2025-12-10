"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.receiveWebhook = exports.createOrder = void 0;
const mercadopago_1 = __importDefault(require("mercadopago"));
const factura_1 = __importDefault(require("../models/factura"));
const tipo_cita_1 = __importDefault(require("../models/tipo_cita"));
const cita_medica_1 = __importDefault(require("../models/cita_medica"));
const usuario_1 = __importDefault(require("../models/usuario"));
const emails_1 = __importDefault(require("../helpers/emails"));
const connection_1 = __importDefault(require("../db/connection"));
const enviorenment_1 = require("../global/enviorenment");
const response_helper_1 = __importDefault(require("../helpers/response.helper"));
/**
 * Controlador para manejar pagos con MercadoPago
 * IMPORTANTE: Usa variables de entorno para todas las credenciales
 */
const createOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    console.log("ENTRO A CREATE ORDER");
    // Configurar MercadoPago - SIN FALLBACK hardcodeado por seguridad
    try {
        mercadopago_1.default.configure({
            access_token: enviorenment_1.MERCADOPAGO_ACCESS_TOKEN,
        });
    }
    catch (error) {
        console.error('Error al configurar MercadoPago:', error);
        return response_helper_1.default.serverError(res, 'Error de configuración del servicio de pagos', error);
    }
    const { motivo, idCita } = req.body;
    try {
        // Cargar la cita con el paciente y tipo de cita para calcular el precio correcto
        const cita = yield cita_medica_1.default.findByPk(idCita, {
            include: [
                {
                    model: usuario_1.default,
                    as: 'paciente',
                    attributes: ['tipo_prevision', 'prevision_validada', 'tramo_fonasa', 'nombre_isapre']
                },
                {
                    model: tipo_cita_1.default,
                    as: 'tipoCita',
                    attributes: ['precio', 'precio_fonasa', 'precio_isapre', 'precio_particular', 'tipo_cita']
                }
            ]
        });
        if (!cita) {
            return response_helper_1.default.notFound(res, 'Cita médica no encontrada');
        }
        if (!cita.tipoCita) {
            return response_helper_1.default.serverError(res, 'No se pudo obtener el tipo de cita');
        }
        // Calcular el precio según la previsión del paciente
        const tipoPrevision = ((_a = cita.paciente) === null || _a === void 0 ? void 0 : _a.tipo_prevision) || 'Particular';
        const precioOriginal = cita.tipoCita.precio_particular || cita.tipoCita.precio;
        let precioFinal;
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
        const previsionYaValidada = ((_b = cita.paciente) === null || _b === void 0 ? void 0 : _b.prevision_validada) || false;
        const requiereValidacion = tipoPrevision !== 'Particular' && !previsionYaValidada;
        console.log(`📋 Validación de previsión:`);
        console.log(`   - Tipo de previsión: ${tipoPrevision}`);
        console.log(`   - ¿Ya validó previamente?: ${previsionYaValidada ? 'SÍ' : 'NO'}`);
        console.log(`   - ¿Requiere validación en esta cita?: ${requiereValidacion ? 'SÍ' : 'NO'}`);
        // Guardar información de precios y previsión en la cita
        yield cita.update({
            precio_original: precioOriginal,
            precio_final: precioFinal,
            tipo_prevision_aplicada: tipoPrevision,
            descuento_aplicado: descuentoAplicado,
            porcentaje_descuento: porcentajeDescuento,
            requiere_validacion_prevision: requiereValidacion,
            prevision_validada: previsionYaValidada // Si ya validó antes, marcarla como validada automáticamente
        });
        // URLs dinámicas basadas en variables de entorno
        const baseUrl = enviorenment_1.NGROK_URL || enviorenment_1.BACKEND_URL;
        const frontendUrl = enviorenment_1.FRONTEND_URL;
        const preference = {
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
        const response = yield mercadopago_1.default.preferences.create(preference);
        return response_helper_1.default.successWithCustomData(res, {
            id: response.body.id,
            init_point: response.body.init_point,
            sandbox_init_point: response.body.sandbox_init_point
        });
    }
    catch (error) {
        console.error('Error en createOrder:', error);
        return response_helper_1.default.serverError(res, 'Error al generar el link de pago', error);
    }
});
exports.createOrder = createOrder;
const receiveWebhook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('===== WEBHOOK RECIBIDO =====');
    console.log('Método:', req.method);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    try {
        let paymentId;
        let idCita;
        if (req.body.type === 'payment') {
            paymentId = Number(req.body.data.id);
            console.log('Payment ID recibido:', paymentId);
            const payment = yield obtenerPagoConReintentos(paymentId, 10, 5000);
            console.log("aqui el payment", payment);
            console.log("aqui el payment status", payment.status);
            idCita = parseInt(payment.external_reference, 10);
            if (isNaN(idCita)) {
                throw new Error(`External reference inválido: ${payment.external_reference}`);
            }
            if (payment.status === 'approved') {
                yield procesarPagoExitoso(paymentId, idCita, payment.transaction_amount);
            }
        }
        res.status(200).send('OK');
    }
    catch (error) {
        console.error('Error crítico en webhook:', {
            error: error.message,
            stack: error.stack,
            body: req.body
        });
        res.status(200).send('OK');
    }
});
exports.receiveWebhook = receiveWebhook;
function obtenerPagoConReintentos(paymentId, maxRetries = 10, baseDelay = 5000) {
    return __awaiter(this, void 0, void 0, function* () {
        let retries = 0;
        while (retries < maxRetries) {
            try {
                const { body } = yield mercadopago_1.default.payment.findById(paymentId);
                console.log(`✅ Pago ${paymentId} obtenido en intento ${retries + 1}`);
                console.log(`Status del pago: ${body.status}`);
                console.log(`External reference: ${body.external_reference}`);
                return body;
            }
            catch (error) {
                if (error.status === 404) {
                    const delay = baseDelay * Math.pow(2, retries);
                    console.log(`⌛ Reintento ${retries + 1}/${maxRetries} en ${delay}ms para pago ${paymentId}`);
                    yield new Promise(resolve => setTimeout(resolve, delay));
                    retries++;
                }
                else {
                    console.error('Error diferente a 404:', error);
                    throw error;
                }
            }
        }
        throw new Error(`❌ Pago ${paymentId} no encontrado después de ${maxRetries} intentos`);
    });
}
function procesarPagoExitoso(paymentId, idCita, montoPagado) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("entro a la funcion de pago exitoso");
        const transaction = yield connection_1.default.transaction();
        try {
            const cita = yield cita_medica_1.default.findByPk(idCita, {
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
            const factura = yield factura_1.default.create({
                id_cita: idCita,
                payment_method_id: 'mercado_pago',
                transaction_amount: cita.tipoCita.precio,
                monto_pagado: montoPagado,
                payment_status: 'approved',
                estado_pago: 'pagado',
                fecha_pago: new Date(),
                estado: 'activo'
            }, { transaction });
            yield cita.update({ estado: 'pagado' }, { transaction });
            if (cita.paciente && cita.paciente.email) {
                try {
                    const fechaFormateada = cita.fecha.toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });
                    yield emails_1.default.instance.enviarConfirmacionCita({
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
                }
                catch (emailError) {
                    console.error('Error al enviar correo (no crítico):', emailError);
                }
            }
            else {
                console.warn('No se envió correo: paciente sin email válido');
            }
            yield transaction.commit();
            console.log(`Pago ${paymentId} procesado. Factura ID: ${factura.id_factura}`);
        }
        catch (error) {
            yield transaction.rollback();
            console.error('Error en transacción:', error);
            throw error;
        }
    });
}
//# sourceMappingURL=mercadoPago.js.map