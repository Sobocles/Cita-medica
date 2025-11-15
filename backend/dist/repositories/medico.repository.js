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
exports.CitaRepository = void 0;
const medico_1 = __importDefault(require("../models/medico"));
const rol_1 = __importDefault(require("../models/rol"));
const cita_medica_1 = __importDefault(require("../models/cita_medica"));
const horario_medico_1 = __importDefault(require("../models/horario_medico"));
const sequelize_1 = require("sequelize");
const tipo_cita_1 = __importDefault(require("../models/tipo_cita"));
class MedicoRepository {
    // Obtener médicos paginados
    findActiveMedicos(desde_1) {
        return __awaiter(this, arguments, void 0, function* (desde, limit = 5) {
            return medico_1.default.findAll({
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
    // Contar médicos activos
    countActiveMedicos() {
        return __awaiter(this, void 0, void 0, function* () {
            return medico_1.default.count({ where: { estado: 'activo' } });
        });
    }
    // Obtener todos los médicos activos (sin paginación)
    findAllActiveMedicos() {
        return __awaiter(this, void 0, void 0, function* () {
            return medico_1.default.findAll({
                where: { estado: 'activo' },
                include: [{
                        model: rol_1.default,
                        as: 'rol',
                        attributes: ['id', 'nombre', 'codigo']
                    }]
            });
        });
    }
    // Obtener médicos por especialidad (con especialidades válidas)
    findMedicosByValidEspecialidades() {
        return __awaiter(this, void 0, void 0, function* () {
            // Obtener especialidades válidas
            const especialidadesValidas = yield tipo_cita_1.default.findAll({
                attributes: ['especialidad_medica']
            });
            const especialidades = especialidadesValidas.map(ec => ec.especialidad_medica);
            // Obtener médicos activos
            const medicos = yield medico_1.default.findAll({
                attributes: ['rut', 'nombre', 'apellidos', 'especialidad_medica'],
                include: [{
                        model: rol_1.default,
                        as: 'rol',
                        attributes: ['codigo']
                    }],
                where: { estado: 'activo' }
            });
            // Procesar para compatibilidad y filtrar
            return medicos
                .map(medico => {
                const medicoJSON = medico.toJSON();
                if (medicoJSON.rol && medicoJSON.rol.codigo) {
                    medicoJSON.rol = medicoJSON.rol.codigo;
                }
                return medicoJSON;
            })
                .filter(medico => especialidades.includes(medico.especialidad_medica));
        });
    }
    // Buscar médico por ID
    findById(rut) {
        return __awaiter(this, void 0, void 0, function* () {
            return medico_1.default.findByPk(rut, {
                include: [{
                        model: rol_1.default,
                        as: 'rol',
                        attributes: ['id', 'nombre', 'codigo']
                    }]
            });
        });
    }
    // Buscar por email
    findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return medico_1.default.findOne({
                where: { email },
                include: [{
                        model: rol_1.default,
                        as: 'rol',
                        attributes: ['id', 'nombre', 'codigo']
                    }]
            });
        });
    }
    // Buscar por teléfono
    findByPhone(telefono) {
        return __awaiter(this, void 0, void 0, function* () {
            return medico_1.default.findOne({ where: { telefono } });
        });
    }
    // Crear médico
    createMedico(medicoData) {
        return __awaiter(this, void 0, void 0, function* () {
            return medico_1.default.create(medicoData);
        });
    }
    // Actualizar médico
    updateMedico(rut, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const medico = yield medico_1.default.findByPk(rut);
            if (!medico)
                return null;
            return medico.update(data);
        });
    }
    // Eliminar médico (marcar como inactivo y actualizar entidades relacionadas)
    deleteMedico(rut) {
        return __awaiter(this, void 0, void 0, function* () {
            const medico = yield medico_1.default.findByPk(rut);
            if (!medico)
                return null;
            // Actualizar citas médicas en estados específicos
            yield cita_medica_1.default.update({ estado_actividad: 'inactivo' }, {
                where: {
                    rut_medico: rut,
                    estado: { [sequelize_1.Op.in]: ['terminado', 'no_pagado', 'no_asistio'] }
                }
            });
            // Eliminar horarios del médico
            yield horario_medico_1.default.destroy({ where: { rut_medico: rut } });
            // Marcar médico como inactivo
            return medico.update({ estado: 'inactivo' });
        });
    }
    // Cambiar contraseña
    changePassword(rut, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            const medico = yield medico_1.default.findByPk(rut);
            if (!medico)
                return null;
            return medico.update({ password: newPassword });
        });
    }
    updateWhere(where, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return medico_1.default.update(data, { where });
        });
    }
}
// Ejemplo para CitaRepository
class CitaRepository {
}
exports.CitaRepository = CitaRepository;
exports.default = new MedicoRepository();
//# sourceMappingURL=medico.repository.js.map