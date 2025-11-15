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
const cita_medica_1 = __importDefault(require("../models/cita_medica"));
const sequelize_1 = require("sequelize");
const usuario_1 = __importDefault(require("../models/usuario"));
const medico_1 = __importDefault(require("../models/medico"));
const tipo_cita_1 = __importDefault(require("../models/tipo_cita"));
const factura_1 = __importDefault(require("../models/factura"));
class CitaRepository {
    /**
     * Busca y cuenta todas las citas con opciones de paginación y filtros
     */
    findAndCountAll(options) {
        return __awaiter(this, void 0, void 0, function* () {
            return cita_medica_1.default.findAndCountAll(options);
        });
    }
    /**
     * Busca una cita por su ID primario
     */
    findByPk(idCita, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return cita_medica_1.default.findByPk(idCita, options);
        });
    }
    /**
     * Busca una cita que cumpla con las opciones especificadas
     */
    findOne(options) {
        return __awaiter(this, void 0, void 0, function* () {
            return cita_medica_1.default.findOne(options);
        });
    }
    /**
     * Busca todas las citas que cumplan con las opciones especificadas
     */
    findAll(options) {
        return __awaiter(this, void 0, void 0, function* () {
            return cita_medica_1.default.findAll(options);
        });
    }
    /**
     * Crea una nueva cita médica
     */
    create(citaData) {
        return __awaiter(this, void 0, void 0, function* () {
            return cita_medica_1.default.create(citaData);
        });
    }
    /**
     * Actualiza una cita existente
     */
    update(cita, citaData) {
        return __awaiter(this, void 0, void 0, function* () {
            return cita.update(citaData);
        });
    }
    /**
     * Cuenta las citas que cumplen con las opciones especificadas
     */
    count(options) {
        return __awaiter(this, void 0, void 0, function* () {
            return cita_medica_1.default.count(options);
        });
    }
    /**
     * Actualiza citas que cumplen con las condiciones especificadas
     */
    updateWhere(where, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return cita_medica_1.default.update(data, { where });
        });
    }
    /**
     * Cuenta citas activas excluyendo las no pagadas
     */
    countActiveCitasExcludingNoPagado() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.count({
                where: {
                    estado_actividad: 'activo',
                    estado: { [sequelize_1.Op.ne]: 'no_pagado' }
                }
            });
        });
    }
    /**
     * Busca citas activas con relaciones (paciente, médico, tipo de cita)
     */
    findActiveCitasWithRelations(desde, limite) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.findAll({
                include: this.getDefaultIncludes(),
                where: {
                    estado_actividad: 'activo',
                    estado: { [sequelize_1.Op.ne]: 'no_pagado' }
                },
                attributes: ['idCita', 'motivo', 'fecha', 'hora_inicio', 'hora_fin', 'estado'],
                offset: desde,
                limit: limite,
            });
        });
    }
    /**
     * Cuenta citas activas de un médico específico
     */
    countCitasByMedico(rut_medico) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.count({
                where: {
                    rut_medico,
                    estado: { [sequelize_1.Op.or]: ['en_curso', 'pagado', 'terminado'] },
                    estado_actividad: 'activo'
                }
            });
        });
    }
    /**
     * Busca citas de un médico con paginación
     */
    findCitasByMedico(rut_medico, desde, limite) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.findAll({
                where: {
                    rut_medico,
                    estado: { [sequelize_1.Op.or]: ['en_curso', 'pagado', 'terminado'] },
                    estado_actividad: 'activo'
                },
                include: [
                    {
                        model: usuario_1.default,
                        as: 'paciente',
                        attributes: ['nombre', 'apellidos']
                    },
                    {
                        model: medico_1.default,
                        as: 'medico',
                        attributes: ['nombre', 'apellidos']
                    }
                ],
                attributes: { exclude: ['rut_paciente', 'rut_medico'] },
                offset: desde,
                limit: limite
            });
        });
    }
    /**
     * Cuenta citas activas de un paciente específico
     */
    countCitasByPaciente(rut_paciente) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.count({
                where: {
                    rut_paciente,
                    estado: { [sequelize_1.Op.or]: ['en_curso', 'pagado', 'terminado'] },
                    estado_actividad: 'activo'
                }
            });
        });
    }
    /**
     * Busca citas de un paciente con paginación
     */
    findCitasByPaciente(rut_paciente, desde, limite) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.findAll({
                where: {
                    rut_paciente,
                    estado: { [sequelize_1.Op.or]: ['en_curso', 'pagado', 'terminado'] },
                    estado_actividad: 'activo'
                },
                include: [
                    {
                        model: usuario_1.default,
                        as: 'paciente',
                        attributes: ['nombre', 'apellidos']
                    },
                    {
                        model: medico_1.default,
                        as: 'medico',
                        attributes: ['nombre', 'apellidos']
                    }
                ],
                attributes: { exclude: ['rut_paciente', 'rut_medico'] },
                offset: desde,
                limit: limite
            });
        });
    }
    /**
     * Busca una cita con su factura y relaciones completas
     */
    findCitaWithFactura(idCita) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.findOne({
                where: { idCita },
                include: [
                    {
                        model: factura_1.default,
                        as: 'factura',
                        required: false
                    },
                    {
                        model: medico_1.default,
                        as: 'medico',
                        attributes: ['nombre', 'apellidos', 'especialidad_medica']
                    },
                    {
                        model: usuario_1.default,
                        as: 'paciente',
                        attributes: ['nombre', 'apellidos', 'email']
                    }
                ]
            });
        });
    }
    /**
     * Verifica si existe una cita activa para un paciente
     */
    existsActiveCitaForPaciente(rut_paciente) {
        return __awaiter(this, void 0, void 0, function* () {
            const cita = yield this.findOne({
                where: {
                    rut_paciente,
                    estado: { [sequelize_1.Op.or]: ['pagado', 'en_curso'] },
                    estado_actividad: 'activo'
                }
            });
            return !!cita;
        });
    }
    /**
     * Realiza un soft delete cambiando el estado de actividad
     */
    softDelete(idCita) {
        return __awaiter(this, void 0, void 0, function* () {
            return cita_medica_1.default.update({ estado_actividad: 'inactivo' }, { where: { idCita } });
        });
    }
    /**
     * Obtiene las relaciones por defecto (paciente, médico, tipo de cita)
     */
    getDefaultIncludes() {
        return [
            {
                model: usuario_1.default,
                as: 'paciente',
                attributes: ['nombre', 'apellidos']
            },
            {
                model: medico_1.default,
                as: 'medico',
                attributes: ['nombre', 'apellidos']
            },
            {
                model: tipo_cita_1.default,
                as: 'tipoCita',
                attributes: ['especialidad_medica']
            }
        ];
    }
}
exports.CitaRepository = CitaRepository;
exports.default = new CitaRepository();
//# sourceMappingURL=CitaRepository.js.map