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
const medico_service_1 = __importDefault(require("../services/medico.service"));
const jwt_1 = __importDefault(require("../helpers/jwt"));
const enums_1 = require("../types/enums");
const response_helper_1 = __importDefault(require("../helpers/response.helper"));
/**
 * Controlador para manejar las peticiones HTTP relacionadas con médicos
 * RESPONSABILIDAD: Solo manejar request/response, delegar lógica al servicio
 */
class MedicosController {
    static get instance() {
        return this._instance || (this._instance = new MedicosController());
    }
    /**
     * Obtiene médicos paginados
     */
    getMedicos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const desde = Number(req.query.desde) || 0;
                const result = yield medico_service_1.default.getPaginatedMedicos(desde);
                return response_helper_1.default.successWithCustomData(res, {
                    medicos: result.medicos,
                    total: result.total
                });
            }
            catch (error) {
                console.error('Error al obtener los médicos:', error);
                return response_helper_1.default.serverError(res, 'Error al obtener médicos', error);
            }
        });
    }
    /**
     * Obtiene médicos filtrados por especialidades activas
     */
    getMedicosEspecialidad(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const medicos = yield medico_service_1.default.getMedicosByEspecialidad();
                return response_helper_1.default.successWithCustomData(res, { medicos });
            }
            catch (error) {
                console.error('Error al obtener médicos por especialidad:', error);
                return response_helper_1.default.serverError(res, 'Error al obtener médicos por especialidad', error);
            }
        });
    }
    /**
     * Obtiene todos los médicos activos sin paginación
     */
    getAllMedicos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield medico_service_1.default.getAllMedicos();
                return response_helper_1.default.successWithCustomData(res, {
                    medicos: result.medicos,
                    total: result.total
                });
            }
            catch (error) {
                console.error('Error al obtener todos los médicos:', error);
                return response_helper_1.default.serverError(res, 'Error al obtener todos los médicos', error);
            }
        });
    }
    /**
     * Obtiene un médico por su RUT
     */
    getMedico(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const medico = yield medico_service_1.default.getMedicoById(id);
                return response_helper_1.default.successWithCustomData(res, { medico });
            }
            catch (error) {
                console.error('Error al obtener médico:', error);
                if (error.message === 'Médico no encontrado') {
                    return response_helper_1.default.notFound(res, error.message);
                }
                return response_helper_1.default.serverError(res, 'Error al obtener médico', error);
            }
        });
    }
    /**
     * Crea un nuevo médico y genera su JWT
     */
    crearMedico(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const medico = yield medico_service_1.default.createMedico(req.body);
                // Para el token, necesitamos el rol como string
                const medicoJSON = medico.toJSON();
                const rol = ((_a = medicoJSON.rol) === null || _a === void 0 ? void 0 : _a.codigo) || enums_1.UserRole.MEDICO;
                // Generar JWT
                const token = yield jwt_1.default.instance.generarJWT(medico.rut, medico.nombre, medico.apellidos, rol);
                return response_helper_1.default.successWithCustomData(res, {
                    medico: medicoJSON,
                    token
                });
            }
            catch (error) {
                console.error('Error al crear médico:', error);
                return response_helper_1.default.badRequest(res, error.message);
            }
        });
    }
    /**
     * Actualiza un médico existente
     */
    putMedico(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { rut } = req.params;
                const medico = yield medico_service_1.default.updateMedico(rut, req.body);
                // Procesar para respuesta
                const medicoJSON = medico.toJSON();
                if (medicoJSON.rol && medicoJSON.rol.codigo) {
                    medicoJSON.rol = medicoJSON.rol.codigo;
                }
                return response_helper_1.default.successWithCustomData(res, { medico: medicoJSON });
            }
            catch (error) {
                console.error('Error al actualizar médico:', error);
                if (error.message === 'Médico no encontrado') {
                    return response_helper_1.default.notFound(res, error.message);
                }
                return response_helper_1.default.badRequest(res, error.message);
            }
        });
    }
    /**
     * Elimina un médico (soft delete) y sus relaciones
     */
    deleteMedico(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { rut } = req.params;
                yield medico_service_1.default.deleteMedico(rut);
                return response_helper_1.default.success(res, undefined, 'Médico eliminado correctamente');
            }
            catch (error) {
                console.error('Error al eliminar médico:', error);
                if (error.message === 'Médico no encontrado') {
                    return response_helper_1.default.notFound(res, error.message);
                }
                return response_helper_1.default.badRequest(res, error.message);
            }
        });
    }
    /**
     * Cambia la contraseña de un médico
     */
    cambiarPasswordMedico(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { rut, password, newPassword } = req.body;
                yield medico_service_1.default.changePassword(rut, password, newPassword);
                return response_helper_1.default.success(res, undefined, 'Contraseña actualizada correctamente');
            }
            catch (error) {
                console.error('Error al cambiar contraseña:', error);
                if (error.message === 'Médico no encontrado') {
                    return response_helper_1.default.notFound(res, error.message);
                }
                return response_helper_1.default.badRequest(res, error.message);
            }
        });
    }
}
exports.default = MedicosController;
//# sourceMappingURL=medico.js.map