import { Request, Response } from 'express';
import usuarioService from '../services/usuario.service';
import ResponseHelper from '../helpers/response.helper';

/**
 * Controlador para manejar las peticiones HTTP relacionadas con usuarios
 * RESPONSABILIDAD: Solo manejar request/response, delegar lógica al servicio
 */

/**
 * Obtiene usuarios paginados
 */
export const getUsuarios = async (req: Request, res: Response) => {
    try {
        const desde = Number(req.query.desde) || 0;
        const result = await usuarioService.getPaginatedUsers(desde);

        return ResponseHelper.successWithCustomData(res, result);
    } catch (error: any) {
        console.error('Error al obtener usuarios:', error);
        return ResponseHelper.serverError(res, 'Error al obtener usuarios', error);
    }
};

/**
 * Obtiene todos los pacientes (no administradores)
 */
export const getAllUsuarios = async (req: Request, res: Response) => {
    try {
        const pacientes = await usuarioService.getAllPatients();

        return ResponseHelper.successWithCustomData(res, {
            usuarios: pacientes,
            total: pacientes.length
        });
    } catch (error: any) {
        console.error('Error al obtener pacientes:', error);
        return ResponseHelper.serverError(res, 'Error al obtener pacientes', error);
    }
};

/**
 * Obtiene un usuario por su ID
 */
export const getUsuario = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const usuario = await usuarioService.getUserById(id);

        return ResponseHelper.successWithCustomData(res, { usuario });
    } catch (error: any) {
        console.error('Error al obtener usuario:', error);

        if (error.message === 'Usuario no encontrado') {
            return ResponseHelper.notFound(res, error.message);
        }

        return ResponseHelper.serverError(res, 'Error al obtener usuario', error);
    }
};

/**
 * Crea un nuevo usuario
 */
export const CrearUsuario = async (req: Request, res: Response) => {
    try {
        const user = await usuarioService.createUser(req.body);

        return ResponseHelper.successWithCustomData(res, { usuario: user });
    } catch (error: any) {
        console.error('Error al crear usuario:', error);
        return ResponseHelper.badRequest(res, error.message);
    }
};

/**
 * Actualiza un usuario existente
 */
export const putUsuario = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const usuario = await usuarioService.updateUser(id, req.body);

        return ResponseHelper.successWithCustomData(res, { usuario });
    } catch (error: any) {
        console.error('Error al actualizar usuario:', error);

        if (error.message === 'Usuario no encontrado') {
            return ResponseHelper.notFound(res, error.message);
        }

        return ResponseHelper.badRequest(res, error.message);
    }
};

/**
 * Elimina un usuario (soft delete) y sus relaciones
 */
export const deleteUsuario = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await usuarioService.deleteUser(id);

        return ResponseHelper.success(res, undefined, 'Usuario eliminado correctamente');
    } catch (error: any) {
        console.error('Error al eliminar usuario:', error);

        if (error.message === 'Usuario no encontrado') {
            return ResponseHelper.notFound(res, error.message);
        }

        return ResponseHelper.badRequest(res, error.message);
    }
};

/**
 * Cambia la contraseña de un usuario
 */
export const cambiarPassword = async (req: Request, res: Response) => {
    try {
        const { rut, password, newPassword } = req.body;
        await usuarioService.changePassword(rut, password, newPassword);

        return ResponseHelper.success(res, undefined, 'Contraseña actualizada correctamente');
    } catch (error: any) {
        console.error('Error al cambiar contraseña:', error);
        return ResponseHelper.badRequest(res, error.message);
    }
};

/**
 * Obtiene pacientes con citas en estados específicos para un médico
 */
export const getPacientesConCitasPagadasYEnCurso = async (req: Request, res: Response) => {
    try {
        const { rut_medico } = req.params;
        const pacientes = await usuarioService.getPatientsWithAppointments(
            rut_medico,
            ['en_curso', 'pagado', 'terminado']
        );

        return ResponseHelper.successWithCustomData(res, {
            usuarios: pacientes,
            total: pacientes.length
        });
    } catch (error: any) {
        console.error('Error al obtener pacientes con citas:', error);
        return ResponseHelper.serverError(res, 'Error al obtener pacientes con citas', error);
    }
};

/**
 * Obtiene pacientes con citas pagadas, en curso y terminadas
 * (Duplicado del anterior - considera consolidar)
 */
export const getPacientesConCitasPagadasYEnCursoYterminado = async (req: Request, res: Response) => {
    try {
        const { rut_medico } = req.params;
        const pacientes = await usuarioService.getPatientsWithAppointments(
            rut_medico,
            ['en_curso', 'pagado', 'terminado']
        );

        return ResponseHelper.successWithCustomData(res, {
            usuarios: pacientes,
            total: pacientes.length
        });
    } catch (error: any) {
        console.error('Error al obtener pacientes con citas:', error);
        return ResponseHelper.serverError(res, 'Error al obtener pacientes con citas', error);
    }
};