import { Request, Response } from 'express';
import citaService from '../services/Cita.service';
import ResponseHelper from '../helpers/response.helper';

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

            return ResponseHelper.successWithCustomData(res, {
                citas: resultado.citas,
                total: resultado.total
            });
        } catch (error: any) {
            console.error('Error al obtener citas:', error);
            return ResponseHelper.serverError(res, 'Error al obtener citas', error);
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

            return ResponseHelper.successWithCustomData(res, {
                citas: resultado.citas,
                total: resultado.count
            });
        } catch (error: any) {
            console.error('Error al obtener citas del médico:', error);

            if (error.message === 'No se encontraron citas activas para este médico') {
                return ResponseHelper.notFound(res, error.message);
            }

            return ResponseHelper.serverError(res, 'Error al obtener citas del médico', error);
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

            return ResponseHelper.successWithCustomData(res, {
                citas: resultado.citas,
                total: resultado.count
            });
        } catch (error: any) {
            console.error('Error al obtener citas del paciente:', error);

            if (error.message === 'No se encontraron citas activas para este paciente') {
                return ResponseHelper.notFound(res, error.message);
            }

            return ResponseHelper.serverError(res, 'Error al obtener citas del paciente', error);
        }
    };



    /**
     * Obtiene una cita con su factura y relaciones completas
     */
    getCitaFactura = async (req: Request, res: Response) => {
        try {
            const idCita = parseInt(req.params.idCita);

            const citaMedica = await citaService.getCitaFactura(idCita);

            return ResponseHelper.successWithCustomData(res, { citaMedica });
        } catch (error: any) {
            console.error('Error al obtener la cita médica y su factura:', error);

            if (error.message === 'Es necesario el ID de la cita médica') {
                return ResponseHelper.badRequest(res, error.message);
            }

            if (error.message === 'Cita médica no encontrada') {
                return ResponseHelper.notFound(res, error.message);
            }

            return ResponseHelper.serverError(res, 'Error al obtener la cita médica y su factura', error);
        }
    };






        

    /**
     * Crea una nueva cita médica (usado por administradores)
     */
    public crearCita = async (req: Request, res: Response) => {
        try {
            const citaData = req.body.cita;

            const nuevaCita = await citaService.crearCita(citaData);

            return ResponseHelper.successWithCustomData(res, { cita: nuevaCita });
        } catch (error: any) {
            console.error('Error al crear cita:', error);

            if (error.message === 'Ya existe una cita con el mismo ID') {
                return ResponseHelper.badRequest(res, error.message);
            }

            return ResponseHelper.serverError(res, 'Error al crear la cita médica', error);
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

            return ResponseHelper.created(res, { cita: resultado }, 'Cita creada exitosamente');
        } catch (error: any) {
            console.error('Error al crear la cita médica:', error);

            if (error.message === 'Ya tienes una cita programada. Debes asistir y terminar tu cita actual para agendar otra.') {
                return ResponseHelper.badRequest(res, error.message);
            }

            if (error.message === 'Todos los campos son requeridos') {
                return ResponseHelper.badRequest(res, error.message);
            }

            return ResponseHelper.serverError(res, 'Error al crear la cita médica', error);
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

            return ResponseHelper.successWithCustomData(res, {
                cita: citaActualizada,
                msg: 'Cita actualizada correctamente'
            });
        } catch (error: any) {
            console.error('Error al actualizar cita:', error);

            if (error.message === 'Cita no encontrada') {
                return ResponseHelper.notFound(res, error.message);
            }

            return ResponseHelper.serverError(res, 'Error al actualizar la cita', error);
        }
    };
        



    /**
     * Elimina lógicamente una cita (soft delete)
     */
    public deleteCita = async (req: Request, res: Response) => {
        try {
            const idCita = parseInt(req.params.id);

            const resultado = await citaService.eliminarCita(idCita);

            return ResponseHelper.success(res, undefined, resultado.mensaje);
        } catch (error: any) {
            console.error('Error al eliminar cita:', error);

            if (error.message?.includes('No existe una cita con el id')) {
                return ResponseHelper.notFound(res, error.message);
            }

            return ResponseHelper.serverError(res, 'Error al eliminar cita', error);
        }
    };
}