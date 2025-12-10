import Medico from '../models/medico';
import Rol from '../models/rol';
import { Op, FindOptions, WhereOptions } from 'sequelize';

/**
 * Repositorio para manejar el acceso a datos de médicos
 * RESPONSABILIDAD: Solo operaciones de base de datos, sin lógica de negocio
 */
class MedicoRepository {
    /**
     * Obtener médicos activos paginados con su rol
     */
    async findActiveMedicos(desde: number, limit: number = 5) {
        return Medico.findAll({
            where: { estado: 'activo' },
            include: [{
                model: Rol,
                as: 'rol',
                attributes: ['id', 'nombre', 'codigo']
            }],
            offset: desde,
            limit
        });
    }

    /**
     * Contar médicos activos
     */
    async countActiveMedicos(): Promise<number> {
        return Medico.count({ where: { estado: 'activo' } });
    }

    /**
     * Obtener todos los médicos activos (sin paginación)
     */
    async findAllActiveMedicos() {
        return Medico.findAll({
            where: { estado: 'activo' },
            include: [{
                model: Rol,
                as: 'rol',
                attributes: ['id', 'nombre', 'codigo']
            }]
        });
    }

    /**
     * Obtener médicos activos con especialidades específicas
     * Filtra por especialidades proporcionadas
     */
    async findActiveMedicosByEspecialidades(especialidades: string[]) {
        return Medico.findAll({
            attributes: ['rut', 'nombre', 'apellidos', 'especialidad_medica'],
            include: [{
                model: Rol,
                as: 'rol',
                attributes: ['codigo']
            }],
            where: {
                estado: 'activo',
                especialidad_medica: { [Op.in]: especialidades }
            }
        });
    }

    /**
     * Buscar médico por RUT con su rol
     */
    async findById(rut: string, includeRole: boolean = true) {
        const options: FindOptions = includeRole ? {
            include: [{
                model: Rol,
                as: 'rol',
                attributes: ['id', 'nombre', 'codigo']
            }]
        } : {};

        return Medico.findByPk(rut, options);
    }

    /**
     * Buscar médico por RUT sin relaciones
     */
    async findByRut(rut: string) {
        return Medico.findByPk(rut);
    }

    /**
     * Buscar médico por email
     */
    async findByEmail(email: string) {
        return Medico.findOne({
            where: { email },
            include: [{
                model: Rol,
                as: 'rol',
                attributes: ['id', 'nombre', 'codigo']
            }]
        });
    }

    /**
     * Buscar médico por teléfono
     */
    async findByPhone(telefono: string) {
        return Medico.findOne({ where: { telefono } });
    }

    /**
     * Crear un nuevo médico
     */
    async create(medicoData: Partial<Medico>) {
        return Medico.create(medicoData as any);
    }

    /**
     * Actualizar un médico
     */
    async update(medico: Medico, data: Partial<Medico>) {
        return medico.update(data);
    }

    /**
     * Actualizar médico por RUT
     */
    async updateByRut(rut: string, data: Partial<Medico>) {
        const medico = await Medico.findByPk(rut);
        if (!medico) return null;
        return medico.update(data);
    }

    /**
     * Marcar médico como inactivo (soft delete)
     */
    async softDelete(rut: string) {
        const medico = await Medico.findByPk(rut);
        if (!medico) return null;
        return medico.update({ estado: 'inactivo' });
    }

    /**
     * Buscar médico con opciones personalizadas
     */
    async findOne(options: FindOptions) {
        return Medico.findOne(options);
    }

    /**
     * Buscar todos los médicos con opciones personalizadas
     */
    async findAll(options: FindOptions) {
        return Medico.findAll(options);
    }

    /**
     * Contar médicos con opciones específicas
     */
    async count(options: { where?: WhereOptions }): Promise<number> {
        return Medico.count(options);
    }

    /**
     * Actualizar médicos que cumplen con las condiciones especificadas
     */
    async updateWhere(where: WhereOptions, data: Partial<Medico>) {
        return Medico.update(data, { where });
    }
}

export default new MedicoRepository();