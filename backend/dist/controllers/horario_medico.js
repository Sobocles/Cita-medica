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
exports.horarioMedicoController = void 0;
const horario_medico_service_1 = __importDefault(require("../services/horario.medico.service"));
/**
 * Controlador para manejar las peticiones HTTP relacionadas con horarios médicos
 * RESPONSABILIDAD: Solo manejar request/response, delegar lógica al servicio
 */
class HorarioMedicoController {
    /**
     * Obtiene todos los horarios médicos con paginación
     */
    getHorariosMedicos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const desde = Number(req.query.desde) || 0;
                const limite = 5;
                const { count, rows: horarios } = yield horario_medico_service_1.default.getHorariosMedicos(desde, limite);
                res.json({
                    ok: true,
                    horarios,
                    total: count
                });
            }
            catch (error) {
                console.error('Error al obtener horarios médicos:', error);
                res.status(500).json({
                    ok: false,
                    msg: 'Error interno del servidor',
                    error: error.message
                });
            }
        });
    }
    /**
     * Obtiene un horario médico por su ID
     */
    getHorarioMedico(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const horario = yield horario_medico_service_1.default.getHorarioMedico(parseInt(id));
                if (!horario) {
                    return res.status(404).json({
                        ok: false,
                        msg: 'Horario no encontrado'
                    });
                }
                res.json({
                    ok: true,
                    horario
                });
            }
            catch (error) {
                console.error('Error al obtener horario médico:', error);
                res.status(500).json({
                    ok: false,
                    msg: 'Error interno del servidor',
                    error: error.message
                });
            }
        });
    }
    /**
     * Crea un nuevo horario médico con validación de solapamiento
     */
    crearHorarioMedico(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const horario = yield horario_medico_service_1.default.crearHorarioMedico(req.body);
                res.status(201).json({
                    ok: true,
                    horario
                });
            }
            catch (error) {
                console.error('Error al crear horario médico:', error);
                res.status(400).json({
                    ok: false,
                    msg: error.message
                });
            }
        });
    }
    /**
     * Actualiza un horario médico existente
     */
    putHorarioMedico(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const horario = yield horario_medico_service_1.default.actualizarHorarioMedico(parseInt(id), req.body);
                res.json({
                    ok: true,
                    msg: 'Horario actualizado correctamente',
                    horario
                });
            }
            catch (error) {
                console.error('Error al actualizar horario médico:', error);
                if (error.message === 'Horario no encontrado') {
                    return res.status(404).json({
                        ok: false,
                        msg: error.message
                    });
                }
                res.status(400).json({
                    ok: false,
                    msg: error.message
                });
            }
        });
    }
    /**
     * Elimina un horario médico
     */
    deleteHorarioMedico(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                yield horario_medico_service_1.default.eliminarHorarioMedico(parseInt(id));
                res.json({
                    ok: true,
                    msg: 'Horario eliminado correctamente'
                });
            }
            catch (error) {
                console.error('Error al eliminar horario médico:', error);
                if (error.message === 'Horario no encontrado') {
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
exports.default = HorarioMedicoController;
exports.horarioMedicoController = new HorarioMedicoController();
//# sourceMappingURL=horario_medico.js.map