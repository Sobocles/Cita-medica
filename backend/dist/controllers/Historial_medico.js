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
exports.historialMedicoController = void 0;
const historialmedico_service_1 = __importDefault(require("../services/historialmedico.service"));
/**
 * Controlador para manejar las peticiones HTTP relacionadas con historiales médicos
 * RESPONSABILIDAD: Solo manejar request/response, delegar lógica al servicio
 */
class HistorialMedicoController {
    /**
     * Obtiene todos los historiales médicos
     */
    getHistoriales(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { count, rows: historiales } = yield historialmedico_service_1.default.getHistoriales();
                res.json({
                    ok: true,
                    historiales,
                    total: count
                });
            }
            catch (error) {
                console.error('Error al obtener historiales:', error);
                res.status(500).json({
                    ok: false,
                    msg: 'Error interno del servidor',
                    error: error.message
                });
            }
        });
    }
    /**
     * Obtiene los historiales médicos de un paciente con paginación
     */
    getHistorial(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const desde = Number(req.query.desde) || 0;
                const limite = Number(req.query.limite) || 5;
                const { count, historiales } = yield historialmedico_service_1.default.getHistorialPaciente(id, desde, limite);
                if (count === 0) {
                    return res.status(200).json({
                        ok: true,
                        msg: 'No hay historiales activos para el paciente',
                        historiales: [],
                        total: 0
                    });
                }
                res.json({
                    ok: true,
                    historiales,
                    total: count
                });
            }
            catch (error) {
                console.error('Error al obtener historiales del paciente:', error);
                res.status(500).json({
                    ok: false,
                    msg: 'Error interno del servidor',
                    error: error.message
                });
            }
        });
    }
    /**
     * Obtiene los historiales médicos de un médico con paginación
     */
    getHistorialMedico(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const desde = Number(req.query.desde) || 0;
                const limite = Number(req.query.limite) || 5;
                const { count, historiales } = yield historialmedico_service_1.default.getHistorialMedico(id, desde, limite);
                if (count === 0) {
                    return res.status(200).json({
                        ok: true,
                        msg: 'No hay historiales activos para este médico',
                        historiales: [],
                        total: 0
                    });
                }
                res.json({
                    ok: true,
                    historiales,
                    total: count
                });
            }
            catch (error) {
                console.error('Error al obtener historiales del médico:', error);
                res.status(500).json({
                    ok: false,
                    msg: 'Error interno del servidor',
                    error: error.message
                });
            }
        });
    }
    /**
     * Obtiene un historial médico por su ID
     */
    getHistorialPorId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const historial = yield historialmedico_service_1.default.getHistorialPorId(parseInt(id));
                if (!historial) {
                    return res.status(404).json({
                        ok: false,
                        msg: 'No se encontró el historial médico'
                    });
                }
                res.json({
                    ok: true,
                    historial
                });
            }
            catch (error) {
                console.error('Error al obtener historial por ID:', error);
                res.status(500).json({
                    ok: false,
                    msg: 'Error interno del servidor',
                    error: error.message
                });
            }
        });
    }
    /**
     * Crea un nuevo historial médico y actualiza la cita relacionada
     */
    crearHistorial(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const historial = yield historialmedico_service_1.default.crearHistorial(req.body);
                res.status(201).json({
                    ok: true,
                    historial
                });
            }
            catch (error) {
                console.error('Error al crear historial:', error);
                res.status(400).json({
                    ok: false,
                    msg: error.message
                });
            }
        });
    }
    /**
     * Actualiza un historial médico existente
     */
    putHistorial(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const historial = yield historialmedico_service_1.default.actualizarHistorial(parseInt(id), req.body);
                res.json({
                    ok: true,
                    msg: 'Historial actualizado correctamente',
                    historial
                });
            }
            catch (error) {
                console.error('Error al actualizar historial:', error);
                if (error.message === 'Historial no encontrado') {
                    return res.status(404).json({
                        ok: false,
                        msg: error.message
                    });
                }
                res.status(500).json({
                    ok: false,
                    msg: 'Error interno del servidor',
                    error: error.message
                });
            }
        });
    }
    /**
     * Elimina (desactiva) un historial médico
     */
    deleteHistorial(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                yield historialmedico_service_1.default.eliminarHistorial(parseInt(id));
                res.json({
                    ok: true,
                    msg: 'Historial actualizado a inactivo correctamente'
                });
            }
            catch (error) {
                console.error('Error al eliminar historial:', error);
                if (error.message === 'Historial no encontrado') {
                    return res.status(404).json({
                        ok: false,
                        msg: error.message
                    });
                }
                res.status(500).json({
                    ok: false,
                    msg: 'Error interno del servidor',
                    error: error.message
                });
            }
        });
    }
}
exports.default = HistorialMedicoController;
exports.historialMedicoController = new HistorialMedicoController();
//# sourceMappingURL=historial_medico.js.map