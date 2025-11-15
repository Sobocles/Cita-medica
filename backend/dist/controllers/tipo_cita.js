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
exports.tipoCitaController = exports.TipoCitaController = void 0;
const tipocita_service_1 = __importDefault(require("../services/tipocita.service"));
const response_helper_1 = __importDefault(require("../helpers/response.helper"));
/**
 * Controlador para manejar las peticiones HTTP relacionadas con tipos de cita
 * RESPONSABILIDAD: Solo manejar request/response, delegar lógica al servicio
 */
class TipoCitaController {
    /**
     * Obtiene todas las especialidades médicas activas
     */
    getAllEspecialidades(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const especialidades = yield tipocita_service_1.default.getAllEspecialidades();
                return response_helper_1.default.successWithCustomData(res, { especialidades });
            }
            catch (error) {
                console.error('Error al obtener especialidades:', error);
                return response_helper_1.default.serverError(res, 'Error al obtener especialidades', error);
            }
        });
    }
    /**
     * Obtiene especialidades disponibles que tienen médicos activos con horarios
     */
    getEspecialidades(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const especialidades = yield tipocita_service_1.default.getEspecialidadesDisponibles();
                return response_helper_1.default.successWithCustomData(res, { especialidades });
            }
            catch (error) {
                console.error('Error al obtener especialidades disponibles:', error);
                return response_helper_1.default.serverError(res, 'Error al obtener especialidades disponibles', error);
            }
        });
    }
    /**
     * Obtiene tipos de cita activos con paginación
     */
    getTipoCitas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const desde = Number(req.query.desde) || 0;
                const limite = 5;
                const { count, rows: tipo_cita } = yield tipocita_service_1.default.getTipoCitas(desde, limite);
                return response_helper_1.default.successWithCustomData(res, {
                    tipo_cita,
                    total: count
                });
            }
            catch (error) {
                console.error('Error al obtener tipos de cita:', error);
                return response_helper_1.default.serverError(res, 'Error al obtener tipos de cita', error);
            }
        });
    }
    /**
     * Obtiene un tipo de cita por su ID
     */
    getTipoCita(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const tipoCita = yield tipocita_service_1.default.getTipoCita(parseInt(id));
                return response_helper_1.default.successWithCustomData(res, { tipoCita });
            }
            catch (error) {
                console.error('Error al obtener tipo de cita:', error);
                if (error.message === 'Tipo de cita no encontrado') {
                    return response_helper_1.default.notFound(res, error.message);
                }
                return response_helper_1.default.serverError(res, 'Error al obtener tipo de cita', error);
            }
        });
    }
    /**
     * Crea un nuevo tipo de cita con validaciones
     */
    crearTipoCita(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const tipoCitaData = req.body;
                const tipoCita = yield tipocita_service_1.default.crearTipoCita(tipoCitaData);
                return response_helper_1.default.created(res, { tipoCita }, 'Tipo de cita creado exitosamente');
            }
            catch (error) {
                console.error('Error al crear tipo de cita:', error);
                return response_helper_1.default.badRequest(res, error.message);
            }
        });
    }
    /**
     * Actualiza un tipo de cita existente
     */
    putTipoCita(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const tipoCitaData = req.body;
                const tipoCita = yield tipocita_service_1.default.actualizarTipoCita(parseInt(id), tipoCitaData);
                return response_helper_1.default.successWithCustomData(res, {
                    tipoCita,
                    msg: 'Tipo de cita actualizado correctamente'
                });
            }
            catch (error) {
                console.error('Error al actualizar tipo de cita:', error);
                if (error.message === 'Tipo de cita no encontrado') {
                    return response_helper_1.default.notFound(res, error.message);
                }
                return response_helper_1.default.badRequest(res, error.message);
            }
        });
    }
    /**
     * Elimina (desactiva) un tipo de cita y sus elementos relacionados
     */
    deleteTipoCita(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const tipoCita = yield tipocita_service_1.default.eliminarTipoCita(parseInt(id));
                return response_helper_1.default.successWithCustomData(res, {
                    tipoCita,
                    msg: 'Tipo de cita desactivado correctamente'
                });
            }
            catch (error) {
                console.error('Error al eliminar tipo de cita:', error);
                if (error.message === 'Tipo de cita no encontrado') {
                    return response_helper_1.default.notFound(res, error.message);
                }
                return response_helper_1.default.serverError(res, 'Error al eliminar tipo de cita', error);
            }
        });
    }
}
exports.TipoCitaController = TipoCitaController;
exports.tipoCitaController = new TipoCitaController();
//# sourceMappingURL=tipo_cita.js.map