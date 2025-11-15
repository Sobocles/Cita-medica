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
const usuario_1 = __importDefault(require("../models/usuario"));
const rol_1 = __importDefault(require("../models/rol"));
const cita_medica_1 = __importDefault(require("../models/cita_medica"));
const sequelize_1 = require("sequelize");
/**
 * Repositorio para manejar el acceso a datos de usuarios
 * RESPONSABILIDAD: Solo operaciones de base de datos, sin lógica de negocio
 */
class UsuarioRepository {
    /**
     * Obtener usuarios activos paginados con su rol
     */
    findActiveUsers(desde, limit = 5) {
        return __awaiter(this, void 0, void 0, function* () {
            return usuario_1.default.findAll({
                attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
                where: { estado: 'activo' },
                include: [{
                        model: rol_1.default,
                        as: 'rol',
                        attributes: ['id', 'nombre', 'codigo']
                    }],
                offset: desde,
                limit
            });
        });
    }
    /**
     * Contar usuarios activos
     */
    countActiveUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            return usuario_1.default.count({ where: { estado: 'activo' } });
        });
    }
    /**
     * Obtener todos los pacientes (no administradores) con sus citas
     */
    findAllPatients() {
        return __awaiter(this, void 0, void 0, function* () {
            return usuario_1.default.findAll({
                include: [{
                        model: rol_1.default,
                        as: 'rol',
                        where: { codigo: { [sequelize_1.Op.ne]: 'ADMIN_ROLE' } }
                    }, {
                        model: cita_medica_1.default,
                        attributes: ['idCita', 'estado', 'fecha', 'hora_inicio', 'hora_fin'],
                        where: { estado: { [sequelize_1.Op.or]: ['en_curso', 'no_asistido', 'pagado'] } },
                        required: false
                    }],
                where: { estado: 'activo' },
                attributes: { exclude: ['password', 'createdAt', 'updatedAt'] }
            });
        });
    }
    /**
     * Crear un nuevo usuario
     */
    create(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            return usuario_1.default.create(userData);
        });
    }
    /**
     * Buscar usuario por ID (RUT) con su rol
     */
    findById(id, includeRole = true) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = includeRole ? {
                include: [{
                        model: rol_1.default,
                        as: 'rol',
                        attributes: ['id', 'nombre', 'codigo']
                    }]
            } : {};
            return usuario_1.default.findByPk(id, options);
        });
    }
    /**
     * Buscar usuario por RUT sin relaciones
     */
    findByRut(rut) {
        return __awaiter(this, void 0, void 0, function* () {
            return usuario_1.default.findByPk(rut);
        });
    }
    /**
     * Actualizar un usuario
     */
    update(usuario, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return usuario.update(data);
        });
    }
    /**
     * Actualizar usuario por ID
     */
    updateById(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const usuario = yield usuario_1.default.findByPk(id);
            if (!usuario)
                return null;
            return usuario.update(data);
        });
    }
    /**
     * Marcar usuario como inactivo (soft delete)
     */
    softDelete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const usuario = yield usuario_1.default.findByPk(id);
            if (!usuario)
                return null;
            return usuario.update({ estado: 'inactivo' });
        });
    }
    /**
     * Buscar usuario por email
     */
    findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return usuario_1.default.findOne({ where: { email } });
        });
    }
    /**
     * Buscar usuario por teléfono
     */
    findByPhone(telefono) {
        return __awaiter(this, void 0, void 0, function* () {
            return usuario_1.default.findOne({ where: { telefono } });
        });
    }
    /**
     * Buscar usuario por RUT (sin relaciones)
     */
    findOne(options) {
        return __awaiter(this, void 0, void 0, function* () {
            return usuario_1.default.findOne(options);
        });
    }
    /**
     * Buscar todos los usuarios con opciones personalizadas
     */
    findAll(options) {
        return __awaiter(this, void 0, void 0, function* () {
            return usuario_1.default.findAll(options);
        });
    }
    /**
     * Contar usuarios con opciones específicas
     */
    count(options) {
        return __awaiter(this, void 0, void 0, function* () {
            return usuario_1.default.count(options);
        });
    }
    /**
     * Obtener RUT de un usuario (útil para operaciones relacionadas)
     */
    getUserRut(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const usuario = yield usuario_1.default.findByPk(id, {
                attributes: ['rut']
            });
            return usuario ? usuario.rut : null;
        });
    }
}
exports.default = new UsuarioRepository();
//# sourceMappingURL=usuario.repository.js.map