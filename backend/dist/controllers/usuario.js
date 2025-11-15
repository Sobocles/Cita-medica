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
exports.getPacientesConCitasPagadasYEnCursoYterminado = exports.getPacientesConCitasPagadasYEnCurso = exports.cambiarPassword = exports.deleteUsuario = exports.putUsuario = exports.CrearUsuario = exports.getUsuario = exports.getAllUsuarios = exports.getUsuarios = void 0;
const usuario_service_1 = __importDefault(require("../services/usuario.service"));
const response_helper_1 = __importDefault(require("../helpers/response.helper"));
/**
 * Controlador para manejar las peticiones HTTP relacionadas con usuarios
 * RESPONSABILIDAD: Solo manejar request/response, delegar lógica al servicio
 */
/**
 * Obtiene usuarios paginados
 */
const getUsuarios = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const desde = Number(req.query.desde) || 0;
        const result = yield usuario_service_1.default.getPaginatedUsers(desde);
        return response_helper_1.default.successWithCustomData(res, result);
    }
    catch (error) {
        console.error('Error al obtener usuarios:', error);
        return response_helper_1.default.serverError(res, 'Error al obtener usuarios', error);
    }
});
exports.getUsuarios = getUsuarios;
/**
 * Obtiene todos los pacientes (no administradores)
 */
const getAllUsuarios = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pacientes = yield usuario_service_1.default.getAllPatients();
        return response_helper_1.default.successWithCustomData(res, {
            usuarios: pacientes,
            total: pacientes.length
        });
    }
    catch (error) {
        console.error('Error al obtener pacientes:', error);
        return response_helper_1.default.serverError(res, 'Error al obtener pacientes', error);
    }
});
exports.getAllUsuarios = getAllUsuarios;
/**
 * Obtiene un usuario por su ID
 */
const getUsuario = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const usuario = yield usuario_service_1.default.getUserById(id);
        return response_helper_1.default.successWithCustomData(res, { usuario });
    }
    catch (error) {
        console.error('Error al obtener usuario:', error);
        if (error.message === 'Usuario no encontrado') {
            return response_helper_1.default.notFound(res, error.message);
        }
        return response_helper_1.default.serverError(res, 'Error al obtener usuario', error);
    }
});
exports.getUsuario = getUsuario;
/**
 * Crea un nuevo usuario
 */
const CrearUsuario = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield usuario_service_1.default.createUser(req.body);
        return response_helper_1.default.successWithCustomData(res, { usuario: user });
    }
    catch (error) {
        console.error('Error al crear usuario:', error);
        return response_helper_1.default.badRequest(res, error.message);
    }
});
exports.CrearUsuario = CrearUsuario;
/**
 * Actualiza un usuario existente
 */
const putUsuario = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const usuario = yield usuario_service_1.default.updateUser(id, req.body);
        return response_helper_1.default.successWithCustomData(res, { usuario });
    }
    catch (error) {
        console.error('Error al actualizar usuario:', error);
        if (error.message === 'Usuario no encontrado') {
            return response_helper_1.default.notFound(res, error.message);
        }
        return response_helper_1.default.badRequest(res, error.message);
    }
});
exports.putUsuario = putUsuario;
/**
 * Elimina un usuario (soft delete) y sus relaciones
 */
const deleteUsuario = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield usuario_service_1.default.deleteUser(id);
        return response_helper_1.default.success(res, undefined, 'Usuario eliminado correctamente');
    }
    catch (error) {
        console.error('Error al eliminar usuario:', error);
        if (error.message === 'Usuario no encontrado') {
            return response_helper_1.default.notFound(res, error.message);
        }
        return response_helper_1.default.badRequest(res, error.message);
    }
});
exports.deleteUsuario = deleteUsuario;
/**
 * Cambia la contraseña de un usuario
 */
const cambiarPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { rut, password, newPassword } = req.body;
        yield usuario_service_1.default.changePassword(rut, password, newPassword);
        return response_helper_1.default.success(res, undefined, 'Contraseña actualizada correctamente');
    }
    catch (error) {
        console.error('Error al cambiar contraseña:', error);
        return response_helper_1.default.badRequest(res, error.message);
    }
});
exports.cambiarPassword = cambiarPassword;
/**
 * Obtiene pacientes con citas en estados específicos para un médico
 */
const getPacientesConCitasPagadasYEnCurso = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { rut_medico } = req.params;
        const pacientes = yield usuario_service_1.default.getPatientsWithAppointments(rut_medico, ['en_curso', 'pagado', 'terminado']);
        return response_helper_1.default.successWithCustomData(res, {
            usuarios: pacientes,
            total: pacientes.length
        });
    }
    catch (error) {
        console.error('Error al obtener pacientes con citas:', error);
        return response_helper_1.default.serverError(res, 'Error al obtener pacientes con citas', error);
    }
});
exports.getPacientesConCitasPagadasYEnCurso = getPacientesConCitasPagadasYEnCurso;
/**
 * Obtiene pacientes con citas pagadas, en curso y terminadas
 * (Duplicado del anterior - considera consolidar)
 */
const getPacientesConCitasPagadasYEnCursoYterminado = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { rut_medico } = req.params;
        const pacientes = yield usuario_service_1.default.getPatientsWithAppointments(rut_medico, ['en_curso', 'pagado', 'terminado']);
        return response_helper_1.default.successWithCustomData(res, {
            usuarios: pacientes,
            total: pacientes.length
        });
    }
    catch (error) {
        console.error('Error al obtener pacientes con citas:', error);
        return response_helper_1.default.serverError(res, 'Error al obtener pacientes con citas', error);
    }
});
exports.getPacientesConCitasPagadasYEnCursoYterminado = getPacientesConCitasPagadasYEnCursoYterminado;
//# sourceMappingURL=usuario.js.map