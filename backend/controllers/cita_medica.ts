import { Request, Response } from 'express';
import citaService from '../services/Cita.service';

/**
 * Controlador para manejar las peticiones HTTP relacionadas con citas médicas
 * RESPONSABILIDAD: Solo manejar request/response, delegar lógica al servicio
 */
export default class Cita {
    private static _instance: Cita;

    public static get instance() {
        return this._instance || (this._instance = new Cita());
    }
    
    /**
     * Obtiene todas las citas activas con paginación
     */
    public getCitas = async (req: Request, res: Response) => {
        try {
            const desde = Number(req.query.desde) || 0;
            const limite = 5;

            const resultado = await citaService.getCitas(desde, limite);

            res.json({
                ok: true,
                citas: resultado.citas,
                total: resultado.total
            });
        } catch (error) {
            console.error('Error al obtener citas:', error);
            res.status(500).json({
                ok: false,
                error: 'Error al obtener citas'
            });
        }
    };
    
 

    

    /**
     * Obtiene las citas de un médico específico con paginación
     */
    public getCitasMedico = async (req: Request, res: Response) => {
        try {
            const { rut_medico } = req.params;
            const desde = Number(req.query.desde) || 0;
            const limite = Number(req.query.limite) || 5;

            const resultado = await citaService.getCitasMedico(rut_medico, desde, limite);

            res.json({
                ok: true,
                citas: resultado.citas,
                total: resultado.count
            });
        } catch (error: any) {
            console.error('Error al obtener citas del médico:', error);

            if (error.message === 'No se encontraron citas activas para este médico') {
                return res.status(404).json({
                    ok: false,
                    msg: error.message
                });
            }

            res.status(500).json({
                ok: false,
                msg: 'Error interno del servidor'
            });
        }
    };


    /**
     * Obtiene las citas de un paciente específico con paginación
     */
    public getCitasPaciente = async (req: Request, res: Response) => {
        try {
            const { rut_paciente } = req.params;
            const desde = Number(req.query.desde) || 0;
            const limite = Number(req.query.limite) || 5;

            const resultado = await citaService.getCitasPaciente(rut_paciente, desde, limite);

            res.json({
                ok: true,
                citas: resultado.citas,
                total: resultado.count
            });
        } catch (error: any) {
            console.error('Error al obtener citas del paciente:', error);

            if (error.message === 'No se encontraron citas activas para este paciente') {
                return res.status(404).json({
                    ok: false,
                    msg: error.message
                });
            }

            res.status(500).json({
                ok: false,
                msg: 'Error interno del servidor'
            });
        }
    };



    /**
     * Obtiene una cita con su factura y relaciones completas
     */
    getCitaFactura = async (req: Request, res: Response) => {
        try {
            const idCita = parseInt(req.params.idCita);

            const citaMedica = await citaService.getCitaFactura(idCita);

            return res.json({
                ok: true,
                citaMedica
            });
        } catch (error: any) {
            console.error('Error al obtener la cita médica y su factura:', error);

            if (error.message === 'Es necesario el ID de la cita médica') {
                return res.status(400).json({
                    ok: false,
                    mensaje: error.message
                });
            }

            if (error.message === 'Cita médica no encontrada') {
                return res.status(404).json({
                    ok: false,
                    mensaje: error.message
                });
            }

            return res.status(500).json({
                ok: false,
                mensaje: 'Error al obtener la cita médica y su factura',
                error: error.message
            });
        }
    };






        

    /**
     * Crea una nueva cita médica (usado por administradores)
     */
    public crearCita = async (req: Request, res: Response) => {
        try {
            const citaData = req.body.cita;

            const nuevaCita = await citaService.crearCita(citaData);

            res.json({
                ok: true,
                cita: nuevaCita
            });
        } catch (error: any) {
            console.error('Error al crear cita:', error);

            if (error.message === 'Ya existe una cita con el mismo ID') {
                return res.status(400).json({
                    ok: false,
                    msg: error.message
                });
            }

            res.status(500).json({
                ok: false,
                msg: 'Error al crear la cita médica'
            });
        }
    };


    /**
     * Crea una cita médica desde la perspectiva del paciente
     * Verifica que el paciente no tenga citas activas antes de crear
     */
    crearCitaPaciente = async (req: Request, res: Response) => {
        try {
            const { rutMedico, hora_inicio, hora_fin, idTipoCita, especialidad, rutPaciente, fecha } = req.body;

            const resultado = await citaService.crearCitaPaciente({
                rutMedico,
                hora_inicio,
                hora_fin,
                idTipoCita,
                especialidad,
                rutPaciente,
                fecha
            });

            return res.status(201).json({
                ok: true,
                cita: resultado
            });
        } catch (error: any) {
            console.error('Error al crear la cita médica:', error);

            if (error.message === 'Ya tienes una cita programada. Debes asistir y terminar tu cita actual para agendar otra.') {
                return res.status(400).json({
                    ok: false,
                    mensaje: error.message
                });
            }

            if (error.message === 'Todos los campos son requeridos') {
                return res.status(400).json({
                    ok: false,
                    mensaje: error.message
                });
            }

            return res.status(500).json({
                ok: false,
                mensaje: 'Error al crear la cita médica',
                error: error.message
            });
        }
    };
    
      
      
      
      



    /**
     * Actualiza una cita existente
     */
    public putCita = async (req: Request, res: Response) => {
        try {
            const idCita = parseInt(req.params.id);
            const citaData = req.body;

            const citaActualizada = await citaService.actualizarCita(idCita, citaData);

            res.json({
                ok: true,
                msg: 'Cita actualizada correctamente',
                cita: citaActualizada
            });
        } catch (error: any) {
            console.error('Error al actualizar cita:', error);

            if (error.message === 'Cita no encontrada') {
                return res.status(404).json({
                    ok: false,
                    msg: error.message
                });
            }

            res.status(500).json({
                ok: false,
                msg: 'Error al actualizar la cita'
            });
        }
    };
        



    /**
     * Elimina lógicamente una cita (soft delete)
     */
    public deleteCita = async (req: Request, res: Response) => {
        try {
            const idCita = parseInt(req.params.id);

            const resultado = await citaService.eliminarCita(idCita);

            res.json({
                ok: true,
                msg: resultado.mensaje
            });
        } catch (error: any) {
            console.error('Error al eliminar cita:', error);

            if (error.message?.includes('No existe una cita con el id')) {
                return res.status(404).json({
                    ok: false,
                    msg: error.message
                });
            }

            res.status(500).json({
                ok: false,
                msg: 'Error en el servidor'
            });
        }
    };
}