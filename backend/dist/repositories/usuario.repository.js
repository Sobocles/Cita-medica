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
const historial_medico_1 = __importDefault(require("../models/historial_medico"));
const sequelize_1 = require("sequelize");
class UsuarioRepository {
    // Obtener usuarios paginados
    findActiveUsers(desde_1) {
        return __awaiter(this, arguments, void 0, function* (desde, limit = 5) {
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
    // Contar usuarios activos
    countActiveUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            return usuario_1.default.count({ where: { estado: 'activo' } });
        });
    }
    // Obtener todos los pacientes (no administradores)
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
    // Crear usuario
    createUser(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            return usuario_1.default.create(userData);
        });
    }
    // Buscar usuario por ID
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return usuario_1.default.findByPk(id, {
                include: [{
                        model: rol_1.default,
                        as: 'rol',
                        attributes: ['id', 'nombre', 'codigo']
                    }]
            });
        });
    }
    // Actualizar usuario
    updateUser(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const usuario = yield usuario_1.default.findByPk(id);
            if (!usuario)
                return null;
            return usuario.update(data);
        });
    }
    // Eliminar usuario (marcar como inactivo)
    deleteUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const usuario = yield usuario_1.default.findByPk(id);
            if (!usuario)
                return null;
            // Actualizar entidades relacionadas
            yield cita_medica_1.default.update({ estado_actividad: 'inactivo' }, { where: { rut_paciente: usuario.rut } });
            yield historial_medico_1.default.update({ estado_actividad: 'inactivo' }, { where: { rut_paciente: usuario.rut } });
            return usuario.update({ estado: 'inactivo' });
        });
    }
    // Buscar por email
    findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return usuario_1.default.findOne({ where: { email } });
        });
    }
    // Buscar por teléfono
    findByPhone(telefono) {
        return __awaiter(this, void 0, void 0, function* () {
            return usuario_1.default.findOne({ where: { telefono } });
        });
    }
    // Cambiar contraseña
    changePassword(rut, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            const usuario = yield usuario_1.default.findByPk(rut);
            if (!usuario)
                return null;
            return usuario.update({ password: newPassword });
        });
    }
    getPatientsWithAppointments(rut_medico, estados) {
        return __awaiter(this, void 0, void 0, function* () {
            return cita_medica_1.default.findAll({
                where: {
                    rut_medico,
                    estado: estados,
                    estado_actividad: 'activo'
                },
                include: [{
                        model: usuario_1.default,
                        as: 'paciente',
                        include: [{
                                model: rol_1.default,
                                as: 'rol',
                                where: { codigo: { [sequelize_1.Op.ne]: 'ADMIN_ROLE' } }
                            }],
                        where: { estado: 'activo' },
                        attributes: { exclude: ['password', 'createdAt', 'updatedAt'] }
                    }]
            });
        });
    }
}
exports.default = new UsuarioRepository();
//# sourceMappingURL=usuario.repository.js.map