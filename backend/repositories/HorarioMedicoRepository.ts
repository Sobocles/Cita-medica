import HorarioMedic from '../models/horario_medico';
import Medico from '../models/medico';
import { Op, WhereOptions } from 'sequelize';

/**
 * Repositorio para manejar el acceso a datos de horarios médicos
 */
export class HorarioMedicoRepository {
    /**
     * Obtiene horarios médicos con información del médico y paginación
     */
    async findAllWithMedico(desde: number, limite: number) {
        return HorarioMedic.findAndCountAll({
            include: [{
                model: Medico,
                as: 'medico',
                attributes: ['nombre', 'apellidos', 'especialidad_medica'],
                where: { estado: 'activo' }
            }],
            offset: desde,
            limit: limite
        });
    }

    /**
     * Busca horarios médicos con opciones personalizadas
     */
    async findAll(options: any) {
        return HorarioMedic.findAndCountAll(options);
    }

    /**
     * Busca un horario médico por su ID
     */
    async findByPk(idHorario: number, options?: any) {
        return HorarioMedic.findByPk(idHorario, options);
    }

    /**
     * Crea un nuevo horario médico
     */
    async create(horarioData: any) {
        return HorarioMedic.create(horarioData);
    }

    /**
     * Actualiza un horario médico existente
     */
    async update(horario: HorarioMedic, horarioData: any) {
        return horario.update(horarioData);
    }

    /**
     * Elimina un horario médico
     */
    async destroy(horario: HorarioMedic) {
        return horario.destroy();
    }

    /**
     * Elimina todos los horarios de un médico específico
     */
    async destroyByMedico(rut_medico: string) {
        return HorarioMedic.destroy({ where: { rut_medico } });
    }

    /**
     * Elimina horarios que cumplen con las condiciones especificadas
     */
    async destroyWhere(where: WhereOptions) {
        return HorarioMedic.destroy({ where });
    }

    /**
     * Busca horarios que se solapan con el rango de horas especificado
     * @param excludeId - ID del horario a excluir de la búsqueda (útil para actualizaciones)
     */
    async findOverlappingSchedules(rut_medico: string, diaSemana: string, horaInicio: string, horaFinalizacion: string, excludeId?: number) {
        const where: any = {
            rut_medico,
            diaSemana,
            [Op.or]: [
                {
                    horaInicio: {
                        [Op.lt]: horaFinalizacion,
                        [Op.ne]: horaFinalizacion
                    },
                    horaFinalizacion: {
                        [Op.gt]: horaInicio
                    }
                },
                {
                    horaInicio: {
                        [Op.lt]: horaFinalizacion
                    },
                    horaFinalizacion: {
                        [Op.gt]: horaInicio,
                        [Op.ne]: horaInicio
                    }
                }
            ]
        };

        if (excludeId) {
            where.idHorario = { [Op.ne]: excludeId };
        }

        return HorarioMedic.findAll({ where });
    }
}

export default new HorarioMedicoRepository();