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
const Cita_service_1 = __importDefault(require("../services/Cita.service"));
const response_helper_1 = __importDefault(require("../helpers/response.helper"));
/**
 * Controlador para manejar las peticiones HTTP relacionadas con citas médicas
 * RESPONSABILIDAD: Solo manejar request/response, delegar lógica al servicio
 */
class Cita {
    constructor() {
        /**
         * Obtiene todas las citas activas con paginación
         */
        this.getCitas = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const desde = Number(req.query.desde) || 0;
                const limite = 5;
                const resultado = yield Cita_service_1.default.getCitas(desde, limite);
                return response_helper_1.default.successWithCustomData(res, {
                    citas: resultado.citas,
                    total: resultado.total
                });
            }
            catch (error) {
                console.error('Error al obtener citas:', error);
                return response_helper_1.default.serverError(res, 'Error al obtener citas', error);
            }
        });
        /**
         * Obtiene las citas de un médico específico con paginación
         */
        this.getCitasMedico = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { rut_medico } = req.params;
                const desde = Number(req.query.desde) || 0;
                const limite = Number(req.query.limite) || 5;
                const resultado = yield Cita_service_1.default.getCitasMedico(rut_medico, desde, limite);
                return response_helper_1.default.successWithCustomData(res, {
                    citas: resultado.citas,
                    total: resultado.count
                });
            }
            catch (error) {
                console.error('Error al obtener citas del médico:', error);
                if (error.message === 'No se encontraron citas activas para este médico') {
                    return response_helper_1.default.notFound(res, error.message);
                }
                return response_helper_1.default.serverError(res, 'Error al obtener citas del médico', error);
            }
        });
        /**
         * Obtiene las citas de un paciente específico con paginación
         */
        this.getCitasPaciente = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { rut_paciente } = req.params;
                const desde = Number(req.query.desde) || 0;
                const limite = Number(req.query.limite) || 5;
                const resultado = yield Cita_service_1.default.getCitasPaciente(rut_paciente, desde, limite);
                return response_helper_1.default.successWithCustomData(res, {
                    citas: resultado.citas,
                    total: resultado.count
                });
            }
            catch (error) {
                console.error('Error al obtener citas del paciente:', error);
                if (error.message === 'No se encontraron citas activas para este paciente') {
                    return response_helper_1.default.notFound(res, error.message);
                }
                return response_helper_1.default.serverError(res, 'Error al obtener citas del paciente', error);
            }
        });
        /**
         * Obtiene una cita con su factura y relaciones completas
         */
        this.getCitaFactura = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const idCita = parseInt(req.params.idCita);
                const citaMedica = yield Cita_service_1.default.getCitaFactura(idCita);
                return response_helper_1.default.successWithCustomData(res, { citaMedica });
            }
            catch (error) {
                console.error('Error al obtener la cita médica y su factura:', error);
                if (error.message === 'Es necesario el ID de la cita médica') {
                    return response_helper_1.default.badRequest(res, error.message);
                }
                if (error.message === 'Cita médica no encontrada') {
                    return response_helper_1.default.notFound(res, error.message);
                }
                return response_helper_1.default.serverError(res, 'Error al obtener la cita médica y su factura', error);
            }
        });
        /**
         * Crea una nueva cita médica (usado por administradores)
         */
        this.crearCita = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const citaData = req.body.cita;
                const nuevaCita = yield Cita_service_1.default.crearCita(citaData);
                return response_helper_1.default.successWithCustomData(res, { cita: nuevaCita });
            }
            catch (error) {
                console.error('Error al crear cita:', error);
                if (error.message === 'Ya existe una cita con el mismo ID') {
                    return response_helper_1.default.badRequest(res, error.message);
                }
                return response_helper_1.default.serverError(res, 'Error al crear la cita médica', error);
            }
        });
        /**
         * Crea una cita médica desde la perspectiva del paciente
         * Verifica que el paciente no tenga citas activas antes de crear
         */
        this.crearCitaPaciente = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { rutMedico, hora_inicio, hora_fin, idTipoCita, especialidad, rutPaciente, fecha } = req.body;
                const resultado = yield Cita_service_1.default.crearCitaPaciente({
                    rutMedico,
                    hora_inicio,
                    hora_fin,
                    idTipoCita,
                    especialidad,
                    rutPaciente,
                    fecha
                });
                return response_helper_1.default.created(res, { cita: resultado }, 'Cita creada exitosamente');
            }
            catch (error) {
                console.error('Error al crear la cita médica:', error);
                if (error.message === 'Ya tienes una cita programada. Debes asistir y terminar tu cita actual para agendar otra.') {
                    return response_helper_1.default.badRequest(res, error.message);
                }
                if (error.message === 'Todos los campos son requeridos') {
                    return response_helper_1.default.badRequest(res, error.message);
                }
                return response_helper_1.default.serverError(res, 'Error al crear la cita médica', error);
            }
        });
        /**
         * Actualiza una cita existente
         */
        this.putCita = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const idCita = parseInt(req.params.id);
                const citaData = req.body;
                const citaActualizada = yield Cita_service_1.default.actualizarCita(idCita, citaData);
                return response_helper_1.default.successWithCustomData(res, {
                    cita: citaActualizada,
                    msg: 'Cita actualizada correctamente'
                });
            }
            catch (error) {
                console.error('Error al actualizar cita:', error);
                if (error.message === 'Cita no encontrada') {
                    return response_helper_1.default.notFound(res, error.message);
                }
                return response_helper_1.default.serverError(res, 'Error al actualizar la cita', error);
            }
        });
        /**
         * Elimina lógicamente una cita (soft delete)
         */
        this.deleteCita = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const idCita = parseInt(req.params.id);
                const resultado = yield Cita_service_1.default.eliminarCita(idCita);
                return response_helper_1.default.success(res, undefined, resultado.mensaje);
            }
            catch (error) {
                console.error('Error al eliminar cita:', error);
                if ((_a = error.message) === null || _a === void 0 ? void 0 : _a.includes('No existe una cita con el id')) {
                    return response_helper_1.default.notFound(res, error.message);
                }
                return response_helper_1.default.serverError(res, 'Error al eliminar cita', error);
            }
        });
        /**
         * Valida la previsión del paciente el día de la cita (uso presencial)
         * Permite 3 escenarios:
         * 1. Validó correctamente (trae documentos) -> marca prevision_validada = true
         * 2. No trajo documentos -> registra diferencia_pagada_efectivo
         * 3. Mintió sobre previsión -> actualiza tipo_prevision real del usuario
         */
        this.validarPrevision = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const idCita = parseInt(req.params.idCita);
                const { validado, // true/false si validó correctamente
                diferenciaEfectivo, // monto pagado en efectivo si no validó
                tipoPrevisionReal, // tipo real si mintió
                observaciones // comentarios adicionales
                 } = req.body;
                const resultado = yield Cita_service_1.default.validarPrevision(idCita, validado, diferenciaEfectivo, tipoPrevisionReal, observaciones);
                return response_helper_1.default.successWithCustomData(res, {
                    cita: resultado.cita,
                    usuario: resultado.usuario,
                    mensaje: resultado.mensaje
                });
            }
            catch (error) {
                console.error('Error al validar previsión:', error);
                if (error.message === 'Cita no encontrada') {
                    return response_helper_1.default.notFound(res, error.message);
                }
                if (error.message === 'Esta cita no requiere validación de previsión') {
                    return response_helper_1.default.badRequest(res, error.message);
                }
                if (error.message === 'La previsión de esta cita ya fue validada anteriormente') {
                    return response_helper_1.default.badRequest(res, error.message);
                }
                return response_helper_1.default.serverError(res, 'Error al validar la previsión', error);
            }
        });
    }
    static get instance() {
        return this._instance || (this._instance = new Cita());
    }
}
exports.default = Cita;
//# sourceMappingURL=cita_medica.js.map