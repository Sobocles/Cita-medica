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
exports.TipoCitaService = void 0;
const TipoCitaRepository_1 = __importDefault(require("../repositories/TipoCitaRepository"));
const medico_repository_1 = __importDefault(require("../repositories/medico.repository"));
const CitaRepository_1 = __importDefault(require("../repositories/CitaRepository"));
const HorarioMedicoRepository_1 = __importDefault(require("../repositories/HorarioMedicoRepository"));
const sequelize_1 = require("sequelize");
/**
 * Servicio para manejar la lógica de negocio de tipos de cita
 */
class TipoCitaService {
    /**
     * Obtiene todas las especialidades médicas activas
     */
    getAllEspecialidades() {
        return __awaiter(this, void 0, void 0, function* () {
            return TipoCitaRepository_1.default.findActiveEspecialidades();
        });
    }
    /**
     * Obtiene especialidades disponibles que tienen médicos activos con horarios
     * Una especialidad está "disponible" si:
     * - Existe en tipocitas como activa
     * - Tiene al menos un médico activo con esa especialidad
     * - Ese médico tiene horarios configurados
     */
    getEspecialidadesDisponibles() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Obtener todas las especialidades activas
                const todasEspecialidades = yield TipoCitaRepository_1.default.getEspecialidadesArray();
                // Filtrar solo las que tienen médicos activos con horarios
                const especialidadesConMedicos = [];
                for (const especialidad of todasEspecialidades) {
                    // Buscar médicos activos con esta especialidad que tengan horarios
                    const medicosConHorarios = yield medico_repository_1.default.findAll({
                        where: {
                            especialidad_medica: especialidad,
                            estado: 'activo'
                        },
                        include: [{
                                association: 'HorarioMedics',
                                required: true,
                                attributes: ['idHorario']
                            }],
                        attributes: ['rut'],
                        limit: 1 // Solo necesitamos saber si existe al menos uno
                    });
                    if (medicosConHorarios.length > 0) {
                        especialidadesConMedicos.push({ especialidad_medica: especialidad });
                    }
                }
                return especialidadesConMedicos;
            }
            catch (error) {
                console.error("Error getting available specialties", error);
                // Fallback: retornar todas las especialidades activas
                const especialidades = yield this.getAllEspecialidades();
                return especialidades.map(e => ({ especialidad_medica: e.especialidad_medica }));
            }
        });
    }
    /**
     * Obtiene tipos de cita activos con paginación
     */
    getTipoCitas(desde, limite) {
        return __awaiter(this, void 0, void 0, function* () {
            return TipoCitaRepository_1.default.findAndCountAll({
                where: { estado: 'activo' },
                offset: desde,
                limit: limite
            });
        });
    }
    /**
     * Obtiene un tipo de cita por su ID
     */
    getTipoCita(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const tipoCita = yield TipoCitaRepository_1.default.findByPk(id);
            if (!tipoCita) {
                throw new Error('Tipo de cita no encontrado');
            }
            return tipoCita;
        });
    }
    /**
     * Crea un nuevo tipo de cita con validaciones
     */
    crearTipoCita(tipoCitaData) {
        return __awaiter(this, void 0, void 0, function* () {
            const normalizedData = Object.assign(Object.assign({}, tipoCitaData), { especialidad_medica: this.normalizarEspecialidad(tipoCitaData.especialidad_medica || '') });
            // Verificar que no exista una especialidad activa con el mismo nombre
            const exists = yield TipoCitaRepository_1.default.findOne({
                where: {
                    especialidad_medica: normalizedData.especialidad_medica,
                    estado: 'activo'
                }
            });
            if (exists) {
                throw new Error(`La especialidad '${normalizedData.especialidad_medica}' ya está registrada`);
            }
            return TipoCitaRepository_1.default.create(normalizedData);
        });
    }
    /**
     * Actualiza un tipo de cita existente
     */
    actualizarTipoCita(id, tipoCitaData) {
        return __awaiter(this, void 0, void 0, function* () {
            const tipoCita = yield TipoCitaRepository_1.default.findByPk(id);
            if (!tipoCita) {
                throw new Error('Tipo de cita no encontrado');
            }
            return TipoCitaRepository_1.default.update(id, tipoCitaData);
        });
    }
    /**
     * Elimina (desactiva) un tipo de cita y sus elementos relacionados
     * IMPORTANTE: También desactiva médicos, citas y horarios relacionados
     */
    eliminarTipoCita(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const tipoCita = yield TipoCitaRepository_1.default.desactivar(id);
            if (!tipoCita) {
                throw new Error('Tipo de cita no encontrado');
            }
            // Si el tipo de cita tiene especialidad, desactivar elementos relacionados
            if (tipoCita.especialidad_medica) {
                yield this.desactivarElementosRelacionados(tipoCita.especialidad_medica);
            }
            return tipoCita;
        });
    }
    /**
     * Desactiva médicos, citas y horarios relacionados con una especialidad
     * @private
     */
    desactivarElementosRelacionados(especialidad) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // 1. Obtener médicos con esta especialidad
                const medicos = yield medico_repository_1.default.findAll({
                    where: { especialidad_medica: especialidad },
                    attributes: ['rut']
                });
                if (medicos.length === 0) {
                    return; // No hay médicos con esta especialidad
                }
                const rutsMedicos = medicos.map(m => m.rut);
                // 2. Desactivar médicos con esta especialidad
                yield medico_repository_1.default.updateWhere({ especialidad_medica: especialidad }, { estado: 'inactivo' });
                // 3. Desactivar citas de estos médicos en estados específicos
                yield CitaRepository_1.default.updateWhere({
                    rut_medico: { [sequelize_1.Op.in]: rutsMedicos },
                    estado: { [sequelize_1.Op.in]: ['terminado', 'no_pagado', 'no_asistio'] }
                }, { estado_actividad: 'inactivo' });
                // 4. Eliminar horarios de estos médicos
                for (const rut of rutsMedicos) {
                    yield HorarioMedicoRepository_1.default.destroyByMedico(rut);
                }
            }
            catch (error) {
                console.error("Error desactivando elementos relacionados con especialidad", error);
                throw new Error('Error al desactivar elementos relacionados con la especialidad');
            }
        });
    }
    /**
     * Normaliza el nombre de una especialidad
     * - Remueve acentos
     * - Convierte a minúsculas
     * @private
     */
    normalizarEspecialidad(especialidad) {
        return especialidad
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();
    }
}
exports.TipoCitaService = TipoCitaService;
exports.default = new TipoCitaService();
//# sourceMappingURL=tipocita.service.js.map