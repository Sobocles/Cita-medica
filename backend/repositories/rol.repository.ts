import Rol from '../models/rol';
import { FindOptions, WhereOptions } from 'sequelize';

/**
 * Repositorio para manejar el acceso a datos de roles
 */
export class RolRepository {
    /**
     * Busca un rol por su código
     */
    async findByCode(codigo: string): Promise<Rol | null> {
        return Rol.findOne({ where: { codigo } });
    }

    /**
     * Busca un rol por su ID
     */
    async findById(id: number): Promise<Rol | null> {
        return Rol.findByPk(id);
    }

    /**
     * Busca un rol por opciones específicas
     */
    async findOne(options: FindOptions<Rol>): Promise<Rol | null> {
        return Rol.findOne(options);
    }

    /**
     * Obtiene todos los roles activos
     */
    async findAllActive(): Promise<Rol[]> {
        return Rol.findAll({
            where: { estado: 'activo' }
        });
    }

    /**
     * Obtiene todos los roles
     */
    async findAll(options?: FindOptions<Rol>): Promise<Rol[]> {
        return Rol.findAll(options);
    }

    /**
     * Crea un nuevo rol
     */
    async create(rolData: Partial<Rol>): Promise<Rol> {
        return Rol.create(rolData as any);
    }

    /**
     * Actualiza un rol
     */
    async update(rol: Rol, data: Partial<Rol>): Promise<Rol> {
        return rol.update(data);
    }
}

export default new RolRepository();
