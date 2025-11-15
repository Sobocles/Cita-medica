import CitaMedica from '../models/cita_medica';
import { Op, WhereOptions, IncludeOptions, FindOptions } from 'sequelize';
import { CitaMedicaAttributes } from '../models/cita_medica';
import Usuario from '../models/usuario';
import Medico from '../models/medico';
import TipoCita from '../models/tipo_cita';
import Factura from '../models/factura';

export class CitaRepository {
    /**
     * Busca y cuenta todas las citas con opciones de paginación y filtros
     */
    async findAndCountAll(options: FindOptions<CitaMedicaAttributes>) {
        return CitaMedica.findAndCountAll(options);
    }

    /**
     * Busca una cita por su ID primario
     */
    async findByPk(idCita: number, options?: FindOptions<CitaMedicaAttributes>) {
        return CitaMedica.findByPk(idCita, options);
    }

    /**
     * Busca una cita que cumpla con las opciones especificadas
     */
    async findOne(options: FindOptions<CitaMedicaAttributes>) {
        return CitaMedica.findOne(options);
    }

    /**
     * Busca todas las citas que cumplan con las opciones especificadas
     */
    async findAll(options: FindOptions<CitaMedicaAttributes>) {
        return CitaMedica.findAll(options);
    }

    /**
     * Crea una nueva cita médica
     */
    async create(citaData: Partial<CitaMedicaAttributes>) {
        return CitaMedica.create(citaData as CitaMedicaAttributes);
    }

    /**
     * Actualiza una cita existente
     */
    async update(cita: CitaMedica, citaData: Partial<CitaMedicaAttributes>) {
        return cita.update(citaData);
    }

    /**
     * Cuenta las citas que cumplen con las opciones especificadas
     */
    async count(options: { where?: WhereOptions<CitaMedicaAttributes> }) {
        return CitaMedica.count(options);
    }

    /**
     * Actualiza citas que cumplen con las condiciones especificadas
     */
    async updateWhere(where: WhereOptions<CitaMedicaAttributes>, data: Partial<CitaMedicaAttributes>) {
        return CitaMedica.update(data, { where });
    }

    /**
     * Cuenta citas activas excluyendo las no pagadas
     */
    async countActiveCitasExcludingNoPagado(): Promise<number> {
        return this.count({
            where: {
                estado_actividad: 'activo',
                estado: { [Op.ne]: 'no_pagado' }
            }
        });
    }

    /**
     * Busca citas activas con relaciones (paciente, médico, tipo de cita)
     */
    async findActiveCitasWithRelations(desde: number, limite: number) {
        return this.findAll({
            include: this.getDefaultIncludes(),
            where: {
                estado_actividad: 'activo',
                estado: { [Op.ne]: 'no_pagado' }
            },
            attributes: ['idCita', 'motivo', 'fecha', 'hora_inicio', 'hora_fin', 'estado'],
            offset: desde,
            limit: limite,
        });
    }

    /**
     * Cuenta citas activas de un médico específico
     */
    async countCitasByMedico(rut_medico: string): Promise<number> {
        return this.count({
            where: {
                rut_medico,
                estado: { [Op.or]: ['en_curso', 'pagado', 'terminado'] },
                estado_actividad: 'activo'
            }
        });
    }

    /**
     * Busca citas de un médico con paginación
     */
    async findCitasByMedico(rut_medico: string, desde: number, limite: number) {
        return this.findAll({
            where: {
                rut_medico,
                estado: { [Op.or]: ['en_curso', 'pagado', 'terminado'] },
                estado_actividad: 'activo'
            },
            include: [
                {
                    model: Usuario,
                    as: 'paciente',
                    attributes: ['nombre', 'apellidos']
                },
                {
                    model: Medico,
                    as: 'medico',
                    attributes: ['nombre', 'apellidos']
                }
            ],
            attributes: { exclude: ['rut_paciente', 'rut_medico'] },
            offset: desde,
            limit: limite
        });
    }

    /**
     * Cuenta citas activas de un paciente específico
     */
    async countCitasByPaciente(rut_paciente: string): Promise<number> {
        return this.count({
            where: {
                rut_paciente,
                estado: { [Op.or]: ['en_curso', 'pagado', 'terminado'] },
                estado_actividad: 'activo'
            }
        });
    }

    /**
     * Busca citas de un paciente con paginación
     */
    async findCitasByPaciente(rut_paciente: string, desde: number, limite: number) {
        return this.findAll({
            where: {
                rut_paciente,
                estado: { [Op.or]: ['en_curso', 'pagado', 'terminado'] },
                estado_actividad: 'activo'
            },
            include: [
                {
                    model: Usuario,
                    as: 'paciente',
                    attributes: ['nombre', 'apellidos']
                },
                {
                    model: Medico,
                    as: 'medico',
                    attributes: ['nombre', 'apellidos']
                }
            ],
            attributes: { exclude: ['rut_paciente', 'rut_medico'] },
            offset: desde,
            limit: limite
        });
    }

    /**
     * Busca una cita con su factura y relaciones completas
     */
    async findCitaWithFactura(idCita: number) {
        return this.findOne({
            where: { idCita },
            include: [
                {
                    model: Factura,
                    as: 'factura',
                    required: false
                },
                {
                    model: Medico,
                    as: 'medico',
                    attributes: ['nombre', 'apellidos', 'especialidad_medica']
                },
                {
                    model: Usuario,
                    as: 'paciente',
                    attributes: ['nombre', 'apellidos', 'email']
                }
            ]
        });
    }

    /**
     * Verifica si existe una cita activa para un paciente
     */
    async existsActiveCitaForPaciente(rut_paciente: string): Promise<boolean> {
        const cita = await this.findOne({
            where: {
                rut_paciente,
                estado: { [Op.or]: ['pagado', 'en_curso'] },
                estado_actividad: 'activo'
            }
        });
        return !!cita;
    }

    /**
     * Realiza un soft delete cambiando el estado de actividad
     */
    async softDelete(idCita: number): Promise<[number]> {
        return CitaMedica.update(
            { estado_actividad: 'inactivo' },
            { where: { idCita } }
        );
    }

    /**
     * Obtiene las relaciones por defecto (paciente, médico, tipo de cita)
     */
    private getDefaultIncludes(): IncludeOptions[] {
        return [
            {
                model: Usuario,
                as: 'paciente',
                attributes: ['nombre', 'apellidos']
            },
            {
                model: Medico,
                as: 'medico',
                attributes: ['nombre', 'apellidos']
            },
            {
                model: TipoCita,
                as: 'tipoCita',
                attributes: ['especialidad_medica']
            }
        ];
    }
}

export default new CitaRepository();