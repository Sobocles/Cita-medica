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
const medico_1 = __importDefault(require("../models/medico"));
const rol_1 = __importDefault(require("../models/rol"));
const sequelize_1 = require("sequelize");
/**
 * Repositorio para manejar el acceso a datos de médicos
 * RESPONSABILIDAD: Solo operaciones de base de datos, sin lógica de negocio
 */
class MedicoRepository {
    /**
     * Obtener médicos activos paginados con su rol
     */
    findActiveMedicos(desde, limit = 5) {
        return __awaiter(this, void 0, void 0, function* () {
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
    /**
     * Contar médicos activos
     */
    countActiveMedicos() {
        return __awaiter(this, void 0, void 0, function* () {
            return medico_1.default.count({ where: { estado: 'activo' } });
        });
    }
    /**
     * Obtener todos los médicos activos (sin paginación)
     */
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
    /**
     * Obtener médicos activos con especialidades específicas
     * Filtra por especialidades proporcionadas
     */
    findActiveMedicosByEspecialidades(especialidades) {
        return __awaiter(this, void 0, void 0, function* () {
            return medico_1.default.findAll({
                attributes: ['rut', 'nombre', 'apellidos', 'especialidad_medica'],
                include: [{
                        model: rol_1.default,
                        as: 'rol',
                        attributes: ['codigo']
                    }],
                where: {
                    estado: 'activo',
                    especialidad_medica: { [sequelize_1.Op.in]: especialidades }
                }
            });
        });
    }
    /**
     * Buscar médico por RUT con su rol
     */
    findById(rut, includeRole = true) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = includeRole ? {
                include: [{
                        model: rol_1.default,
                        as: 'rol',
                        attributes: ['id', 'nombre', 'codigo']
                    }]
            } : {};
            return medico_1.default.findByPk(rut, options);
        });
    }
    /**
     * Buscar médico por RUT sin relaciones
     */
    findByRut(rut) {
        return __awaiter(this, void 0, void 0, function* () {
            return medico_1.default.findByPk(rut);
        });
    }
    /**
     * Buscar médico por email
     */
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
    /**
     * Buscar médico por teléfono
     */
    findByPhone(telefono) {
        return __awaiter(this, void 0, void 0, function* () {
            return medico_1.default.findOne({ where: { telefono } });
        });
    }
    /**
     * Crear un nuevo médico
     */
    create(medicoData) {
        return __awaiter(this, void 0, void 0, function* () {
            return medico_1.default.create(medicoData);
        });
    }
    /**
     * Actualizar un médico
     */
    update(medico, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return medico.update(data);
        });
    }
    /**
     * Actualizar médico por RUT
     */
    updateByRut(rut, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const medico = yield medico_1.default.findByPk(rut);
            if (!medico)
                return null;
            return medico.update(data);
        });
    }
    /**
     * Marcar médico como inactivo (soft delete)
     */
    softDelete(rut) {
        return __awaiter(this, void 0, void 0, function* () {
            const medico = yield medico_1.default.findByPk(rut);
            if (!medico)
                return null;
            return medico.update({ estado: 'inactivo' });
        });
    }
    /**
     * Buscar médico con opciones personalizadas
     */
    findOne(options) {
        return __awaiter(this, void 0, void 0, function* () {
            return medico_1.default.findOne(options);
        });
    }
    /**
     * Buscar todos los médicos con opciones personalizadas
     */
    findAll(options) {
        return __awaiter(this, void 0, void 0, function* () {
            return medico_1.default.findAll(options);
        });
    }
    /**
     * Contar médicos con opciones específicas
     */
    count(options) {
        return __awaiter(this, void 0, void 0, function* () {
            return medico_1.default.count(options);
        });
    }
    /**
     * Actualizar médicos que cumplen con las condiciones especificadas
     */
    updateWhere(where, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return medico_1.default.update(data, { where });
        });
    }
}
exports.default = new MedicoRepository();
//# sourceMappingURL=medico.repository.js.map