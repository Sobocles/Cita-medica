import { Request, Response } from 'express';
import medicoService from '../services/medico.service';
import JwtGenerate from '../helpers/jwt';
import { UserRole } from '../types/enums';
import ResponseHelper from '../helpers/response.helper';

/**
 * Controlador para manejar las peticiones HTTP relacionadas con médicos
 * RESPONSABILIDAD: Solo manejar request/response, delegar lógica al servicio
 */
export default class MedicosController {
    private static _instance: MedicosController;

    public static get instance() {
        return this._instance || (this._instance = new MedicosController());
    }

    /**
     * Obtiene médicos paginados
     */
    async getMedicos(req: Request, res: Response) {
        try {
            const desde = Number(req.query.desde) || 0;
            const result = await medicoService.getPaginatedMedicos(desde);

            return ResponseHelper.successWithCustomData(res, {
                medicos: result.medicos,
                total: result.total
            });
        } catch (error: any) {
            console.error('Error al obtener los médicos:', error);
            return ResponseHelper.serverError(res, 'Error al obtener médicos', error);
        }
    }

    /**
     * Obtiene médicos filtrados por especialidades activas
     */
    async getMedicosEspecialidad(req: Request, res: Response) {
        try {
            const medicos = await medicoService.getMedicosByEspecialidad();

            return ResponseHelper.successWithCustomData(res, { medicos });
        } catch (error: any) {
            console.error('Error al obtener médicos por especialidad:', error);
            return ResponseHelper.serverError(res, 'Error al obtener médicos por especialidad', error);
        }
    }

    /**
     * Obtiene todos los médicos activos sin paginación
     */
    async getAllMedicos(req: Request, res: Response) {
        try {
            const result = await medicoService.getAllMedicos();

            return ResponseHelper.successWithCustomData(res, {
                medicos: result.medicos,
                total: result.total
            });
        } catch (error: any) {
            console.error('Error al obtener todos los médicos:', error);
            return ResponseHelper.serverError(res, 'Error al obtener todos los médicos', error);
        }
    }

    /**
     * Obtiene un médico por su RUT
     */
    async getMedico(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const medico = await medicoService.getMedicoById(id);

            return ResponseHelper.successWithCustomData(res, { medico });
        } catch (error: any) {
            console.error('Error al obtener médico:', error);

            if (error.message === 'Médico no encontrado') {
                return ResponseHelper.notFound(res, error.message);
            }

            return ResponseHelper.serverError(res, 'Error al obtener médico', error);
        }
    }

    /**
     * Crea un nuevo médico y genera su JWT
     */
    async crearMedico(req: Request, res: Response) {
        try {
            const medico = await medicoService.createMedico(req.body);

            // Para el token, necesitamos el rol como string
            const medicoJSON: any = medico.toJSON();
            const rol = medicoJSON.rol?.codigo || UserRole.MEDICO;

            // Generar JWT
            const token = await JwtGenerate.instance.generarJWT(
                medico.rut,
                medico.nombre,
                medico.apellidos,
                rol
            );

            return ResponseHelper.successWithCustomData(res, {
                medico: medicoJSON,
                token
            });
        } catch (error: any) {
            console.error('Error al crear médico:', error);
            return ResponseHelper.badRequest(res, error.message);
        }
    }

    /**
     * Actualiza un médico existente
     */
    async putMedico(req: Request, res: Response) {
        try {
            const { rut } = req.params;
            const medico = await medicoService.updateMedico(rut, req.body);

            // Procesar para respuesta
            const medicoJSON: any = medico.toJSON();
            if (medicoJSON.rol && medicoJSON.rol.codigo) {
                medicoJSON.rol = medicoJSON.rol.codigo;
            }

            return ResponseHelper.successWithCustomData(res, { medico: medicoJSON });
        } catch (error: any) {
            console.error('Error al actualizar médico:', error);

            if (error.message === 'Médico no encontrado') {
                return ResponseHelper.notFound(res, error.message);
            }

            return ResponseHelper.badRequest(res, error.message);
        }
    }

    /**
     * Elimina un médico (soft delete) y sus relaciones
     */
    async deleteMedico(req: Request, res: Response) {
        try {
            const { rut } = req.params;
            await medicoService.deleteMedico(rut);

            return ResponseHelper.success(res, undefined, 'Médico eliminado correctamente');
        } catch (error: any) {
            console.error('Error al eliminar médico:', error);

            if (error.message === 'Médico no encontrado') {
                return ResponseHelper.notFound(res, error.message);
            }

            return ResponseHelper.badRequest(res, error.message);
        }
    }

    /**
     * Cambia la contraseña de un médico
     */
    async cambiarPasswordMedico(req: Request, res: Response) {
        try {
            const { rut, password, newPassword } = req.body;
            await medicoService.changePassword(rut, password, newPassword);

            return ResponseHelper.success(res, undefined, 'Contraseña actualizada correctamente');
        } catch (error: any) {
            console.error('Error al cambiar contraseña:', error);

            if (error.message === 'Médico no encontrado') {
                return ResponseHelper.notFound(res, error.message);
            }

            return ResponseHelper.badRequest(res, error.message);
        }
    }
}