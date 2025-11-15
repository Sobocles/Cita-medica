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
const medico_repository_1 = __importDefault(require("../repositories/medico.repository"));
const rol_repository_1 = __importDefault(require("../repositories/rol.repository"));
const TipoCitaRepository_1 = __importDefault(require("../repositories/TipoCitaRepository"));
const CitaRepository_1 = __importDefault(require("../repositories/CitaRepository"));
const HorarioMedicoRepository_1 = __importDefault(require("../repositories/HorarioMedicoRepository"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const enums_1 = require("../types/enums");
const auth_service_1 = __importDefault(require("./auth.service"));
const sequelize_1 = require("sequelize");
/**
 * Servicio para manejar la lógica de negocio de médicos
 */
class MedicoService {
    /**
     * Obtiene médicos paginados con información de rol
     */
    getPaginatedMedicos(desde) {
        return __awaiter(this, void 0, void 0, function* () {
            const [total, medicos] = yield Promise.all([
                medico_repository_1.default.countActiveMedicos(),
                medico_repository_1.default.findActiveMedicos(desde)
            ]);
            return { total, medicos };
        });
    }
    /**
     * Obtiene todos los médicos activos
     */
    getAllMedicos() {
        return __awaiter(this, void 0, void 0, function* () {
            const medicos = yield medico_repository_1.default.findAllActiveMedicos();
            const total = medicos.length;
            // Procesar para asignar el rol como string (compatibilidad con frontend)
            const medicosProcesados = medicos.map(medico => {
                const medicoJSON = medico.toJSON();
                if (medicoJSON.rol && medicoJSON.rol.codigo) {
                    medicoJSON.rol = medicoJSON.rol.codigo;
                }
                return medicoJSON;
            });
            return { total, medicos: medicosProcesados };
        });
    }
    /**
     * Obtiene médicos filtrados por especialidades activas
     */
    getMedicosByEspecialidad() {
        return __awaiter(this, void 0, void 0, function* () {
            // Obtener especialidades válidas desde TipoCita
            const especialidades = yield TipoCitaRepository_1.default.getEspecialidadesArray();
            // Obtener médicos que tienen esas especialidades
            const medicos = yield medico_repository_1.default.findActiveMedicosByEspecialidades(especialidades);
            // Procesar para asignar el rol como string
            return medicos.map(medico => {
                const medicoJSON = medico.toJSON();
                if (medicoJSON.rol && medicoJSON.rol.codigo) {
                    medicoJSON.rol = medicoJSON.rol.codigo;
                }
                return medicoJSON;
            });
        });
    }
    /**
     * Obtiene un médico por su RUT
     */
    getMedicoById(rut) {
        return __awaiter(this, void 0, void 0, function* () {
            const medico = yield medico_repository_1.default.findById(rut);
            if (!medico) {
                throw new Error('Médico no encontrado');
            }
            // Procesar para asignar el rol como string
            const medicoJSON = medico.toJSON();
            if (medicoJSON.rol && medicoJSON.rol.codigo) {
                medicoJSON.rol = medicoJSON.rol.codigo;
            }
            return medicoJSON;
        });
    }
    /**
     * Crea un nuevo médico con validaciones
     */
    createMedico(medicoData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, rut, telefono, rol: rolCodigo, password } = medicoData;
            // Validar email único
            if (yield auth_service_1.default.instance.verificarEmailExistente(email)) {
                throw new Error('El correo ya está registrado');
            }
            // Validar RUT único
            const existeRut = yield medico_repository_1.default.findById(rut);
            if (existeRut) {
                throw new Error('El RUT ya está registrado');
            }
            // Validar teléfono único
            if (yield auth_service_1.default.instance.verificarTelefonoExistente(telefono)) {
                throw new Error('El teléfono ya está registrado');
            }
            // Obtener ID del rol usando el repositorio
            let rolId = 3; // MEDICO_ROLE por defecto
            if (rolCodigo) {
                const rol = yield rol_repository_1.default.findByCode(rolCodigo);
                if (rol)
                    rolId = rol.id;
            }
            else {
                const rolMedico = yield rol_repository_1.default.findByCode(enums_1.UserRole.MEDICO);
                if (rolMedico)
                    rolId = rolMedico.id;
            }
            // Encriptar contraseña
            const saltRounds = 10;
            const hashedPassword = yield bcrypt_1.default.hash(password, saltRounds);
            // Crear médico
            return medico_repository_1.default.create(Object.assign(Object.assign({}, medicoData), { password: hashedPassword, rolId }));
        });
    }
    /**
     * Actualiza un médico existente
     */
    updateMedico(rut, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            // Si se proporciona un rol, obtener su ID
            if (updateData.rol) {
                const rol = yield rol_repository_1.default.findByCode(updateData.rol);
                if (rol) {
                    updateData.rolId = rol.id;
                }
                delete updateData.rol;
            }
            const medico = yield medico_repository_1.default.updateByRut(rut, updateData);
            if (!medico) {
                throw new Error('Médico no encontrado');
            }
            return medico;
        });
    }
    /**
     * Elimina un médico (soft delete) y sus relaciones
     * IMPORTANTE: También marca como inactivas las citas y elimina horarios
     */
    deleteMedico(rut) {
        return __awaiter(this, void 0, void 0, function* () {
            // Verificar que el médico existe
            const medico = yield medico_repository_1.default.findByRut(rut);
            if (!medico) {
                throw new Error('Médico no encontrado');
            }
            // Marcar como inactivas las citas médicas terminadas, no pagadas o no asistidas
            yield CitaRepository_1.default.updateWhere({
                rut_medico: rut,
                estado: { [sequelize_1.Op.in]: ['terminado', 'no_pagado', 'no_asistio'] }
            }, { estado_actividad: 'inactivo' });
            // Eliminar todos los horarios del médico
            yield HorarioMedicoRepository_1.default.destroyByMedico(rut);
            // Marcar el médico como inactivo
            const medicoEliminado = yield medico_repository_1.default.softDelete(rut);
            if (!medicoEliminado) {
                throw new Error('Error al eliminar médico');
            }
            return medicoEliminado;
        });
    }
    /**
     * Cambia la contraseña de un médico
     */
    changePassword(rut, currentPassword, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            const medico = yield medico_repository_1.default.findById(rut, false);
            if (!medico) {
                throw new Error('Médico no encontrado');
            }
            // Validar contraseña actual
            const validPassword = bcrypt_1.default.compareSync(currentPassword, medico.password);
            if (!validPassword) {
                throw new Error('Contraseña actual incorrecta');
            }
            // Validar que la nueva contraseña sea diferente
            const samePassword = bcrypt_1.default.compareSync(newPassword, medico.password);
            if (samePassword) {
                throw new Error('La nueva contraseña no puede ser igual a la actual');
            }
            // Encriptar nueva contraseña
            const salt = bcrypt_1.default.genSaltSync();
            const hashedPassword = bcrypt_1.default.hashSync(newPassword, salt);
            // Actualizar contraseña
            return medico_repository_1.default.update(medico, { password: hashedPassword });
        });
    }
}
exports.default = new MedicoService();
//# sourceMappingURL=medico.service.js.map