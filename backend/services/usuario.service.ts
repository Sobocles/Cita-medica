import usuarioRepository from '../repositories/usuario.repository';
import rolRepository from '../repositories/rol.repository';
import citaRepository from '../repositories/CitaRepository';
import historialMedicoRepository from '../repositories/HistorialMedicoRepository';
import AuthService from './auth.service';
import bcrypt from 'bcrypt';
import Usuario from '../models/usuario';
import Rol from '../models/rol';
import { Op } from 'sequelize';

/**
 * Servicio para manejar la lógica de negocio de usuarios
 */
class UsuarioService {
    /**
     * Obtiene usuarios paginados con información de rol
     */
    async getPaginatedUsers(desde: number) {
        const [total, usuarios] = await Promise.all([
            usuarioRepository.countActiveUsers(),
            usuarioRepository.findActiveUsers(desde)
        ]);

        return { total, usuarios };
    }

    /**
     * Obtiene todos los pacientes (no administradores)
     */
    async getAllPatients() {
        return usuarioRepository.findAllPatients();
    }

    /**
     * Obtiene un usuario por su ID
     */
    async getUserById(id: string) {
        const usuario = await usuarioRepository.findById(id);
        if (!usuario) {
            throw new Error('Usuario no encontrado');
        }
        return usuario;
    }

    /**
     * Crea un nuevo usuario con validaciones
     */
    async createUser(userData: any) {
        const { email, telefono, rol: rolCodigo } = userData;

        // Validaciones
        if (await AuthService.instance.verificarEmailExistente(email)) {
            throw new Error('El correo ya está registrado');
        }

        if (await AuthService.instance.verificarTelefonoExistente(telefono)) {
            throw new Error('El teléfono ya está registrado');
        }

        // Obtener ID del rol usando el repositorio
        let rolId = 2; // USER_ROLE por defecto
        if (rolCodigo) {
            const rol = await rolRepository.findByCode(rolCodigo);
            if (rol) rolId = rol.id;
        }

        // Crear usuario
        return usuarioRepository.create({
            ...userData,
            rolId
        });
    }

    /**
     * Actualiza un usuario existente
     */
    async updateUser(id: string, updateData: any) {
        // Si se proporciona un rol, obtener su ID
        if (updateData.rol) {
            const rol = await rolRepository.findByCode(updateData.rol);
            if (rol) {
                updateData.rolId = rol.id;
            }
            delete updateData.rol;
        }

        const usuario = await usuarioRepository.updateById(id, updateData);
        if (!usuario) {
            throw new Error('Usuario no encontrado');
        }

        return usuario;
    }

    /**
     * Elimina un usuario (soft delete) y sus relaciones
     * IMPORTANTE: También marca como inactivas las citas e historiales médicos relacionados
     */
    async deleteUser(id: string) {
        // Obtener el RUT del usuario
        const usuario = await usuarioRepository.findByRut(id);
        if (!usuario) {
            throw new Error('Usuario no encontrado');
        }

        // Marcar como inactivas las citas del paciente
        await citaRepository.updateWhere(
            { rut_paciente: usuario.rut },
            { estado_actividad: 'inactivo' }
        );

        // Marcar como inactivos los historiales médicos del paciente
        await historialMedicoRepository.updateWhere(
            { rut_paciente: usuario.rut },
            { estado_actividad: 'inactivo' }
        );

        // Marcar el usuario como inactivo
        const usuarioEliminado = await usuarioRepository.softDelete(id);
        if (!usuarioEliminado) {
            throw new Error('Error al eliminar usuario');
        }

        return usuarioEliminado;
    }

    /**
     * Cambia la contraseña de un usuario
     */
    async changePassword(rut: string, currentPassword: string, newPassword: string) {
        const usuario = await usuarioRepository.findById(rut, false);
        if (!usuario) {
            throw new Error('Usuario no encontrado');
        }

        // Validar contraseña actual
        const validPassword = bcrypt.compareSync(currentPassword, usuario.password);
        if (!validPassword) {
            throw new Error('Contraseña actual incorrecta');
        }

        // Validar que la nueva contraseña sea diferente
        const samePassword = bcrypt.compareSync(newPassword, usuario.password);
        if (samePassword) {
            throw new Error('La nueva contraseña no puede ser igual a la actual');
        }

        // Encriptar nueva contraseña
        const salt = bcrypt.genSaltSync();
        const hashedPassword = bcrypt.hashSync(newPassword, salt);

        // Actualizar contraseña
        return usuarioRepository.update(usuario, { password: hashedPassword } as any);
    }

    /**
     * Obtiene pacientes únicos con citas en estados específicos
     */
    async getPatientsWithAppointments(rut_medico: string, estados: string[]) {
        // Buscar usuarios que tengan citas con el médico en los estados especificados
        const usuarios = await usuarioRepository.findAll({
            include: [
                {
                    model: Rol,
                    as: 'rol',
                    where: { codigo: { [Op.ne]: 'ADMIN_ROLE' } },
                    attributes: ['id', 'nombre', 'codigo']
                },
                {
                    association: 'CitaMedicas',
                    where: {
                        rut_medico,
                        estado: { [Op.in]: estados },
                        estado_actividad: 'activo'
                    },
                    required: true
                }
            ],
            where: { estado: 'activo' },
            attributes: { exclude: ['password', 'createdAt', 'updatedAt'] }
        });

        // Eliminar duplicados por RUT
        const pacientesMap = new Map();
        usuarios.forEach(usuario => {
            if (!pacientesMap.has(usuario.rut)) {
                pacientesMap.set(usuario.rut, usuario);
            }
        });

        return Array.from(pacientesMap.values());
    }
}

export default new UsuarioService();