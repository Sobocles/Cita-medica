import horarioMedicoRepository from '../repositories/HorarioMedicoRepository';

/**
 * Servicio para manejar la lógica de negocio de horarios médicos
 */
export class HorarioMedicoService {
    /**
     * Obtiene todos los horarios médicos con información del médico y paginación
     */
    async getHorariosMedicos(desde: number, limite: number) {
        return horarioMedicoRepository.findAllWithMedico(desde, limite);
    }

    /**
     * Obtiene un horario médico por su ID
     */
    async getHorarioMedico(idHorario: number) {
        return horarioMedicoRepository.findByPk(idHorario);
    }

    /**
     * Crea un nuevo horario médico con validación de solapamiento
     */
    async crearHorarioMedico(horarioData: any) {
        const { rut_medico, diaSemana, horaInicio, horaFinalizacion } = horarioData;

        // Verificar solapamiento
        const horariosExistentes = await horarioMedicoRepository.findOverlappingSchedules(
            rut_medico,
            diaSemana,
            horaInicio,
            horaFinalizacion
        );

        if (horariosExistentes.length > 0) {
            throw new Error('Ya existe un horario solapado para este médico en el mismo día');
        }

        return horarioMedicoRepository.create(horarioData);
    }

    /**
     * Actualiza un horario médico existente con validación de solapamiento
     */
    async actualizarHorarioMedico(idHorario: number, horarioData: any) {
        const horario = await horarioMedicoRepository.findByPk(idHorario);
        if (!horario) throw new Error('Horario no encontrado');

        const { rut_medico, diaSemana, horaInicio, horaFinalizacion } = horarioData;

        // Verificar solapamiento excluyendo el horario actual
        const horariosExistentes = await horarioMedicoRepository.findOverlappingSchedules(
            rut_medico,
            diaSemana,
            horaInicio,
            horaFinalizacion,
            idHorario
        );

        if (horariosExistentes.length > 0) {
            throw new Error('Ya existe un horario solapado para este médico en el mismo día');
        }

        return horarioMedicoRepository.update(horario, horarioData);
    }

    /**
     * Elimina un horario médico
     */
    async eliminarHorarioMedico(idHorario: number) {
        const horario = await horarioMedicoRepository.findByPk(idHorario);
        if (!horario) throw new Error('Horario no encontrado');

        return horarioMedicoRepository.destroy(horario);
    }
}

export default new HorarioMedicoService();