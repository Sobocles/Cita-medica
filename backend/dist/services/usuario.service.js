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
const usuario_repository_1 = __importDefault(require("../repositories/usuario.repository"));
const rol_repository_1 = __importDefault(require("../repositories/rol.repository"));
const CitaRepository_1 = __importDefault(require("../repositories/CitaRepository"));
const HistorialMedicoRepository_1 = __importDefault(require("../repositories/HistorialMedicoRepository"));
const auth_service_1 = __importDefault(require("./auth.service"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const rol_1 = __importDefault(require("../models/rol"));
const sequelize_1 = require("sequelize");
/**
 * Servicio para manejar la lógica de negocio de usuarios
 */
class UsuarioService {
    /**
     * Obtiene usuarios paginados con información de rol
     */
    getPaginatedUsers(desde) {
        return __awaiter(this, void 0, void 0, function* () {
            const [total, usuarios] = yield Promise.all([
                usuario_repository_1.default.countActiveUsers(),
                usuario_repository_1.default.findActiveUsers(desde)
            ]);
            return { total, usuarios };
        });
    }
    /**
     * Obtiene todos los pacientes (no administradores)
     */
    getAllPatients() {
        return __awaiter(this, void 0, void 0, function* () {
            return usuario_repository_1.default.findAllPatients();
        });
    }
    /**
     * Obtiene un usuario por su ID
     */
    getUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const usuario = yield usuario_repository_1.default.findById(id);
            if (!usuario) {
                throw new Error('Usuario no encontrado');
            }
            return usuario;
        });
    }
    /**
     * Crea un nuevo usuario con validaciones
     */
    createUser(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, telefono, rol: rolCodigo } = userData;
            // Validaciones
            if (yield auth_service_1.default.instance.verificarEmailExistente(email)) {
                throw new Error('El correo ya está registrado');
            }
            if (yield auth_service_1.default.instance.verificarTelefonoExistente(telefono)) {
                throw new Error('El teléfono ya está registrado');
            }
            // Obtener ID del rol usando el repositorio
            let rolId = 2; // USER_ROLE por defecto
            if (rolCodigo) {
                const rol = yield rol_repository_1.default.findByCode(rolCodigo);
                if (rol)
                    rolId = rol.id;
            }
            // Crear usuario
            return usuario_repository_1.default.create(Object.assign(Object.assign({}, userData), { rolId }));
        });
    }
    /**
     * Actualiza un usuario existente
     */
    updateUser(id, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            // Si se proporciona un rol, obtener su ID
            if (updateData.rol) {
                const rol = yield rol_repository_1.default.findByCode(updateData.rol);
                if (rol) {
                    updateData.rolId = rol.id;
                }
                delete updateData.rol;
            }
            const usuario = yield usuario_repository_1.default.updateById(id, updateData);
            if (!usuario) {
                throw new Error('Usuario no encontrado');
            }
            return usuario;
        });
    }
    /**
     * Elimina un usuario (soft delete) y sus relaciones
     * IMPORTANTE: También marca como inactivas las citas e historiales médicos relacionados
     */
    deleteUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            // Obtener el RUT del usuario
            const usuario = yield usuario_repository_1.default.findByRut(id);
            if (!usuario) {
                throw new Error('Usuario no encontrado');
            }
            // Marcar como inactivas las citas del paciente
            yield CitaRepository_1.default.updateWhere({ rut_paciente: usuario.rut }, { estado_actividad: 'inactivo' });
            // Marcar como inactivos los historiales médicos del paciente
            yield HistorialMedicoRepository_1.default.updateWhere({ rut_paciente: usuario.rut }, { estado_actividad: 'inactivo' });
            // Marcar el usuario como inactivo
            const usuarioEliminado = yield usuario_repository_1.default.softDelete(id);
            if (!usuarioEliminado) {
                throw new Error('Error al eliminar usuario');
            }
            return usuarioEliminado;
        });
    }
    /**
     * Cambia la contraseña de un usuario
     */
    changePassword(rut, currentPassword, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            const usuario = yield usuario_repository_1.default.findById(rut, false);
            if (!usuario) {
                throw new Error('Usuario no encontrado');
            }
            // Validar contraseña actual
            const validPassword = bcrypt_1.default.compareSync(currentPassword, usuario.password);
            if (!validPassword) {
                throw new Error('Contraseña actual incorrecta');
            }
            // Validar que la nueva contraseña sea diferente
            const samePassword = bcrypt_1.default.compareSync(newPassword, usuario.password);
            if (samePassword) {
                throw new Error('La nueva contraseña no puede ser igual a la actual');
            }
            // Encriptar nueva contraseña
            const salt = bcrypt_1.default.genSaltSync();
            const hashedPassword = bcrypt_1.default.hashSync(newPassword, salt);
            // Actualizar contraseña
            return usuario_repository_1.default.update(usuario, { password: hashedPassword });
        });
    }
    /**
     * Obtiene pacientes únicos con citas en estados específicos
     */
    getPatientsWithAppointments(rut_medico, estados) {
        return __awaiter(this, void 0, void 0, function* () {
            // Buscar usuarios que tengan citas con el médico en los estados especificados
            const usuarios = yield usuario_repository_1.default.findAll({
                include: [
                    {
                        model: rol_1.default,
                        as: 'rol',
                        where: { codigo: { [sequelize_1.Op.ne]: 'ADMIN_ROLE' } },
                        attributes: ['id', 'nombre', 'codigo']
                    },
                    {
                        association: 'CitaMedicas',
                        where: {
                            rut_medico,
                            estado: { [sequelize_1.Op.in]: estados },
                            estado_actividad: 'activo'
                        },
                        required: true
                    }
                ],
                where: { estado: 'activo' },
                attributes: { exclude: ['password', 'createdAt', 'updatedAt'] }
            });
            // Eliminar duplicados por RUT
            const pacientesMap = new Map();
            usuarios.forEach(usuario => {
                if (!pacientesMap.has(usuario.rut)) {
                    pacientesMap.set(usuario.rut, usuario);
                }
            });
            return Array.from(pacientesMap.values());
        });
    }
}
exports.default = new UsuarioService();
//# sourceMappingURL=usuario.service.js.map