import { Request, Response } from 'express';
import historialMedicoService from '../services/historialmedico.service';

/**
 * Controlador para manejar las peticiones HTTP relacionadas con historiales médicos
 * RESPONSABILIDAD: Solo manejar request/response, delegar lógica al servicio
 */
export default class HistorialMedicoController {
    /**
     * Obtiene todos los historiales médicos
     */
    async getHistoriales(req: Request, res: Response) {
        try {
            const { count, rows: historiales } = await historialMedicoService.getHistoriales();
            res.json({
                ok: true,
                historiales,
                total: count
            });
        } catch (error: any) {
            console.error('Error al obtener historiales:', error);
            res.status(500).json({
                ok: false,
                msg: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Obtiene los historiales médicos de un paciente con paginación
     */
    async getHistorial(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const desde = Number(req.query.desde) || 0;
            const limite = Number(req.query.limite) || 5;

            const { count, historiales } = await historialMedicoService.getHistorialPaciente(
                id, desde, limite
            );

            if (count === 0) {
                return res.status(200).json({
                    ok: true,
                    msg: 'No hay historiales activos para el paciente',
                    historiales: [],
                    total: 0
                });
            }

            res.json({
                ok: true,
                historiales,
                total: count
            });
        } catch (error: any) {
            console.error('Error al obtener historiales del paciente:', error);
            res.status(500).json({
                ok: false,
                msg: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Obtiene los historiales médicos de un médico con paginación
     */
    async getHistorialMedico(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const desde = Number(req.query.desde) || 0;
            const limite = Number(req.query.limite) || 5;

            const { count, historiales } = await historialMedicoService.getHistorialMedico(
                id, desde, limite
            );

            if (count === 0) {
                return res.status(200).json({
                    ok: true,
                    msg: 'No hay historiales activos para este médico',
                    historiales: [],
                    total: 0
                });
            }

            res.json({
                ok: true,
                historiales,
                total: count
            });
        } catch (error: any) {
            console.error('Error al obtener historiales del médico:', error);
            res.status(500).json({
                ok: false,
                msg: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Obtiene un historial médico por su ID
     */
    async getHistorialPorId(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const historial = await historialMedicoService.getHistorialPorId(parseInt(id));

            if (!historial) {
                return res.status(404).json({
                    ok: false,
                    msg: 'No se encontró el historial médico'
                });
            }

            res.json({
                ok: true,
                historial
            });
        } catch (error: any) {
            console.error('Error al obtener historial por ID:', error);
            res.status(500).json({
                ok: false,
                msg: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Crea un nuevo historial médico y actualiza la cita relacionada
     */
    async crearHistorial(req: Request, res: Response) {
        try {
            const historial = await historialMedicoService.crearHistorial(req.body);
            res.status(201).json({
                ok: true,
                historial
            });
        } catch (error: any) {
            console.error('Error al crear historial:', error);
            res.status(400).json({
                ok: false,
                msg: error.message
            });
        }
    }

    /**
     * Actualiza un historial médico existente
     */
    async putHistorial(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const historial = await historialMedicoService.actualizarHistorial(
                parseInt(id),
                req.body
            );

            res.json({
                ok: true,
                msg: 'Historial actualizado correctamente',
                historial
            });
        } catch (error: any) {
            console.error('Error al actualizar historial:', error);

            if (error.message === 'Historial no encontrado') {
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

    /**
     * Elimina (desactiva) un historial médico
     */
    async deleteHistorial(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await historialMedicoService.eliminarHistorial(parseInt(id));

            res.json({
                ok: true,
                msg: 'Historial actualizado a inactivo correctamente'
            });
        } catch (error: any) {
            console.error('Error al eliminar historial:', error);

            if (error.message === 'Historial no encontrado') {
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

export const historialMedicoController = new HistorialMedicoController();