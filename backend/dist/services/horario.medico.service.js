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
exports.HorarioMedicoService = void 0;
const HorarioMedicoRepository_1 = __importDefault(require("../repositories/HorarioMedicoRepository"));
/**
 * Servicio para manejar la lógica de negocio de horarios médicos
 */
class HorarioMedicoService {
    /**
     * Obtiene todos los horarios médicos con información del médico y paginación
     */
    getHorariosMedicos(desde, limite) {
        return __awaiter(this, void 0, void 0, function* () {
            return HorarioMedicoRepository_1.default.findAllWithMedico(desde, limite);
        });
    }
    /**
     * Obtiene un horario médico por su ID
     */
    getHorarioMedico(idHorario) {
        return __awaiter(this, void 0, void 0, function* () {
            return HorarioMedicoRepository_1.default.findByPk(idHorario);
        });
    }
    /**
     * Crea un nuevo horario médico con validación de solapamiento
     */
    crearHorarioMedico(horarioData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { rut_medico, diaSemana, horaInicio, horaFinalizacion } = horarioData;
            // Verificar solapamiento
            const horariosExistentes = yield HorarioMedicoRepository_1.default.findOverlappingSchedules(rut_medico, diaSemana, horaInicio, horaFinalizacion);
            if (horariosExistentes.length > 0) {
                throw new Error('Ya existe un horario solapado para este médico en el mismo día');
            }
            return HorarioMedicoRepository_1.default.create(horarioData);
        });
    }
    /**
     * Actualiza un horario médico existente con validación de solapamiento
     */
    actualizarHorarioMedico(idHorario, horarioData) {
        return __awaiter(this, void 0, void 0, function* () {
            const horario = yield HorarioMedicoRepository_1.default.findByPk(idHorario);
            if (!horario)
                throw new Error('Horario no encontrado');
            const { rut_medico, diaSemana, horaInicio, horaFinalizacion } = horarioData;
            // Verificar solapamiento excluyendo el horario actual
            const horariosExistentes = yield HorarioMedicoRepository_1.default.findOverlappingSchedules(rut_medico, diaSemana, horaInicio, horaFinalizacion, idHorario);
            if (horariosExistentes.length > 0) {
                throw new Error('Ya existe un horario solapado para este médico en el mismo día');
            }
            return HorarioMedicoRepository_1.default.update(horario, horarioData);
        });
    }
    /**
     * Elimina un horario médico
     */
    eliminarHorarioMedico(idHorario) {
        return __awaiter(this, void 0, void 0, function* () {
            const horario = yield HorarioMedicoRepository_1.default.findByPk(idHorario);
            if (!horario)
                throw new Error('Horario no encontrado');
            return HorarioMedicoRepository_1.default.destroy(horario);
        });
    }
}
exports.HorarioMedicoService = HorarioMedicoService;
exports.default = new HorarioMedicoService();
//# sourceMappingURL=horario.medico.service.js.map