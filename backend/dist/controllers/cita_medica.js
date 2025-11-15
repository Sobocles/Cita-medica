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
                res.json({
                    ok: true,
                    citas: resultado.citas,
                    total: resultado.total
                });
            }
            catch (error) {
                console.error('Error al obtener citas:', error);
                res.status(500).json({
                    ok: false,
                    error: 'Error al obtener citas'
                });
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
                res.json({
                    ok: true,
                    citas: resultado.citas,
                    total: resultado.count
                });
            }
            catch (error) {
                console.error('Error al obtener citas del médico:', error);
                if (error.message === 'No se encontraron citas activas para este médico') {
                    return res.status(404).json({
                        ok: false,
                        msg: error.message
                    });
                }
                res.status(500).json({
                    ok: false,
                    msg: 'Error interno del servidor'
                });
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
                res.json({
                    ok: true,
                    citas: resultado.citas,
                    total: resultado.count
                });
            }
            catch (error) {
                console.error('Error al obtener citas del paciente:', error);
                if (error.message === 'No se encontraron citas activas para este paciente') {
                    return res.status(404).json({
                        ok: false,
                        msg: error.message
                    });
                }
                res.status(500).json({
                    ok: false,
                    msg: 'Error interno del servidor'
                });
            }
        });
        /**
         * Obtiene una cita con su factura y relaciones completas
         */
        this.getCitaFactura = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const idCita = parseInt(req.params.idCita);
                const citaMedica = yield Cita_service_1.default.getCitaFactura(idCita);
                return res.json({
                    ok: true,
                    citaMedica
                });
            }
            catch (error) {
                console.error('Error al obtener la cita médica y su factura:', error);
                if (error.message === 'Es necesario el ID de la cita médica') {
                    return res.status(400).json({
                        ok: false,
                        mensaje: error.message
                    });
                }
                if (error.message === 'Cita médica no encontrada') {
                    return res.status(404).json({
                        ok: false,
                        mensaje: error.message
                    });
                }
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al obtener la cita médica y su factura',
                    error: error.message
                });
            }
        });
        /**
         * Crea una nueva cita médica (usado por administradores)
         */
        this.crearCita = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const citaData = req.body.cita;
                const nuevaCita = yield Cita_service_1.default.crearCita(citaData);
                res.json({
                    ok: true,
                    cita: nuevaCita
                });
            }
            catch (error) {
                console.error('Error al crear cita:', error);
                if (error.message === 'Ya existe una cita con el mismo ID') {
                    return res.status(400).json({
                        ok: false,
                        msg: error.message
                    });
                }
                res.status(500).json({
                    ok: false,
                    msg: 'Error al crear la cita médica'
                });
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
                return res.status(201).json({
                    ok: true,
                    cita: resultado
                });
            }
            catch (error) {
                console.error('Error al crear la cita médica:', error);
                if (error.message === 'Ya tienes una cita programada. Debes asistir y terminar tu cita actual para agendar otra.') {
                    return res.status(400).json({
                        ok: false,
                        mensaje: error.message
                    });
                }
                if (error.message === 'Todos los campos son requeridos') {
                    return res.status(400).json({
                        ok: false,
                        mensaje: error.message
                    });
                }
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al crear la cita médica',
                    error: error.message
                });
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
                res.json({
                    ok: true,
                    msg: 'Cita actualizada correctamente',
                    cita: citaActualizada
                });
            }
            catch (error) {
                console.error('Error al actualizar cita:', error);
                if (error.message === 'Cita no encontrada') {
                    return res.status(404).json({
                        ok: false,
                        msg: error.message
                    });
                }
                res.status(500).json({
                    ok: false,
                    msg: 'Error al actualizar la cita'
                });
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
                res.json({
                    ok: true,
                    msg: resultado.mensaje
                });
            }
            catch (error) {
                console.error('Error al eliminar cita:', error);
                if ((_a = error.message) === null || _a === void 0 ? void 0 : _a.includes('No existe una cita con el id')) {
                    return res.status(404).json({
                        ok: false,
                        msg: error.message
                    });
                }
                res.status(500).json({
                    ok: false,
                    msg: 'Error en el servidor'
                });
            }
        });
    }
    static get instance() {
        return this._instance || (this._instance = new Cita());
    }
}
exports.default = Cita;
//# sourceMappingURL=cita_medica.js.map