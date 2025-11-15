import Usuario from '../models/usuario';
import Rol from '../models/rol';
import CitaMedica from '../models/cita_medica';
import { Op, FindOptions, WhereOptions } from 'sequelize';

/**
 * Repositorio para manejar el acceso a datos de usuarios
 * RESPONSABILIDAD: Solo operaciones de base de datos, sin lógica de negocio
 */
class UsuarioRepository {
    /**
     * Obtener usuarios activos paginados con su rol
     */
    async findActiveUsers(desde: number, limit: number = 5) {
        return Usuario.findAll({
            attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
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
     * Contar usuarios activos
     */
    async countActiveUsers(): Promise<number> {
        return Usuario.count({ where: { estado: 'activo' } });
    }

    /**
     * Obtener todos los pacientes (no administradores) con sus citas
     */
    async findAllPatients() {
        return Usuario.findAll({
            include: [{
                model: Rol,
                as: 'rol',
                where: { codigo: { [Op.ne]: 'ADMIN_ROLE' } }
            }, {
                model: CitaMedica,
                attributes: ['idCita', 'estado', 'fecha', 'hora_inicio', 'hora_fin'],
                where: { estado: { [Op.or]: ['en_curso', 'no_asistido', 'pagado'] } },
                required: false
            }],
            where: { estado: 'activo' },
            attributes: { exclude: ['password', 'createdAt', 'updatedAt'] }
        });
    }

    /**
     * Crear un nuevo usuario
     */
    async create(userData: Partial<Usuario>) {
        return Usuario.create(userData as any);
    }

    /**
     * Buscar usuario por ID (RUT) con su rol
     */
    async findById(id: string, includeRole: boolean = true) {
        const options: FindOptions<Usuario> = includeRole ? {
            include: [{
                model: Rol,
                as: 'rol',
                attributes: ['id', 'nombre', 'codigo']
            }]
        } : {};

        return Usuario.findByPk(id, options);
    }

    /**
     * Buscar usuario por RUT sin relaciones
     */
    async findByRut(rut: string) {
        return Usuario.findByPk(rut);
    }

    /**
     * Actualizar un usuario
     */
    async update(usuario: Usuario, data: Partial<Usuario>) {
        return usuario.update(data);
    }

    /**
     * Actualizar usuario por ID
     */
    async updateById(id: string, data: Partial<Usuario>) {
        const usuario = await Usuario.findByPk(id);
        if (!usuario) return null;
        return usuario.update(data);
    }

    /**
     * Marcar usuario como inactivo (soft delete)
     */
    async softDelete(id: string) {
        const usuario = await Usuario.findByPk(id);
        if (!usuario) return null;

        return usuario.update({ estado: 'inactivo' });
    }

    /**
     * Buscar usuario por email
     */
    async findByEmail(email: string) {
        return Usuario.findOne({ where: { email } });
    }

    /**
     * Buscar usuario por teléfono
     */
    async findByPhone(telefono: string) {
        return Usuario.findOne({ where: { telefono } });
    }

    /**
     * Buscar usuario por RUT (sin relaciones)
     */
    async findOne(options: FindOptions<Usuario>) {
        return Usuario.findOne(options);
    }

    /**
     * Buscar todos los usuarios con opciones personalizadas
     */
    async findAll(options: FindOptions<Usuario>) {
        return Usuario.findAll(options);
    }

    /**
     * Contar usuarios con opciones específicas
     */
    async count(options: { where?: WhereOptions<Usuario> }): Promise<number> {
        return Usuario.count(options);
    }

    /**
     * Obtener RUT de un usuario (útil para operaciones relacionadas)
     */
    async getUserRut(id: string): Promise<string | null> {
        const usuario = await Usuario.findByPk(id, {
            attributes: ['rut']
        });
        return usuario ? usuario.rut : null;
    }
}

export default new UsuarioRepository();