import { Request, Response } from 'express';
import horarioMedicoService from '../services/horario.medico.service';

/**
 * Controlador para manejar las peticiones HTTP relacionadas con horarios médicos
 * RESPONSABILIDAD: Solo manejar request/response, delegar lógica al servicio
 */
export default class HorarioMedicoController {
    /**
     * Obtiene todos los horarios médicos con paginación
     */
    async getHorariosMedicos(req: Request, res: Response) {
        try {
            const desde = Number(req.query.desde) || 0;
            const limite = 5;

            const { count, rows: horarios } = await horarioMedicoService.getHorariosMedicos(desde, limite);

            res.json({
                ok: true,
                horarios,
                total: count
            });
        } catch (error: any) {
            console.error('Error al obtener horarios médicos:', error);
            res.status(500).json({
                ok: false,
                msg: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Obtiene un horario médico por su ID
     */
    async getHorarioMedico(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const horario = await horarioMedicoService.getHorarioMedico(parseInt(id));

            if (!horario) {
                return res.status(404).json({
                    ok: false,
                    msg: 'Horario no encontrado'
                });
            }

            res.json({
                ok: true,
                horario
            });
        } catch (error: any) {
            console.error('Error al obtener horario médico:', error);
            res.status(500).json({
                ok: false,
                msg: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Crea un nuevo horario médico con validación de solapamiento
     */
    async crearHorarioMedico(req: Request, res: Response) {
        try {
            const horario = await horarioMedicoService.crearHorarioMedico(req.body);
            res.status(201).json({
                ok: true,
                horario
            });
        } catch (error: any) {
            console.error('Error al crear horario médico:', error);
            res.status(400).json({
                ok: false,
                msg: error.message
            });
        }
    }

    /**
     * Actualiza un horario médico existente
     */
    async putHorarioMedico(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const horario = await horarioMedicoService.actualizarHorarioMedico(parseInt(id), req.body);

            res.json({
                ok: true,
                msg: 'Horario actualizado correctamente',
                horario
            });
        } catch (error: any) {
            console.error('Error al actualizar horario médico:', error);

            if (error.message === 'Horario no encontrado') {
                return res.status(404).json({
                    ok: false,
                    msg: error.message
                });
            }

            res.status(400).json({
                ok: false,
                msg: error.message
            });
        }
    }

    /**
     * Elimina un horario médico
     */
    async deleteHorarioMedico(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await horarioMedicoService.eliminarHorarioMedico(parseInt(id));

            res.json({
                ok: true,
                msg: 'Horario eliminado correctamente'
            });
        } catch (error: any) {
            console.error('Error al eliminar horario médico:', error);

            if (error.message === 'Horario no encontrado') {
                return res.status(404).json({
                    ok: false,
                    msg: error.message
                });
            }

            res.status(500).json({
                ok: false,
                msg: 'Error interno del servidor',
                error: error.message
            });
        }
    }
}

export const horarioMedicoController = new HorarioMedicoController();