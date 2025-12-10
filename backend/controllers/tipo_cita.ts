import { Request, Response } from 'express';
import tipoCitaService from '../services/tipocita.service';
import { CrearTipoCitaDto, ActualizarTipoCitaDto } from '../dtos/tipo-cita.dto';
import ResponseHelper from '../helpers/response.helper';

/**
 * Controlador para manejar las peticiones HTTP relacionadas con tipos de cita
 * RESPONSABILIDAD: Solo manejar request/response, delegar lógica al servicio
 */
export class TipoCitaController {
  /**
   * Obtiene todas las especialidades médicas activas
   */
  async getAllEspecialidades(req: Request, res: Response) {
    try {
      const especialidades = await tipoCitaService.getAllEspecialidades();
      return ResponseHelper.successWithCustomData(res, { especialidades });
    } catch (error: any) {
      console.error('Error al obtener especialidades:', error);
      return ResponseHelper.serverError(res, 'Error al obtener especialidades', error);
    }
  }

  /**
   * Obtiene especialidades disponibles que tienen médicos activos con horarios
   */
  async getEspecialidades(req: Request, res: Response) {
    try {
      const especialidades = await tipoCitaService.getEspecialidadesDisponibles();
      return ResponseHelper.successWithCustomData(res, { especialidades });
    } catch (error: any) {
      console.error('Error al obtener especialidades disponibles:', error);
      return ResponseHelper.serverError(res, 'Error al obtener especialidades disponibles', error);
    }
  }

  /**
   * Obtiene tipos de cita activos con paginación
   */
  async getTipoCitas(req: Request, res: Response) {
    try {
      const desde = Number(req.query.desde) || 0;
      const limite = 5;
      const { count, rows: tipo_cita } = await tipoCitaService.getTipoCitas(desde, limite);

      return ResponseHelper.successWithCustomData(res, {
        tipo_cita,
        total: count
      });
    } catch (error: any) {
      console.error('Error al obtener tipos de cita:', error);
      return ResponseHelper.serverError(res, 'Error al obtener tipos de cita', error);
    }
  }

  /**
   * Obtiene un tipo de cita por su ID
   */
  async getTipoCita(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tipoCita = await tipoCitaService.getTipoCita(parseInt(id));

      return ResponseHelper.successWithCustomData(res, { tipoCita });
    } catch (error: any) {
      console.error('Error al obtener tipo de cita:', error);

      if (error.message === 'Tipo de cita no encontrado') {
        return ResponseHelper.notFound(res, error.message);
      }

      return ResponseHelper.serverError(res, 'Error al obtener tipo de cita', error);
    }
  }

  /**
   * Crea un nuevo tipo de cita con validaciones
   */
  async crearTipoCita(req: Request, res: Response) {
    try {
      const tipoCitaData: CrearTipoCitaDto = req.body;
      const tipoCita = await tipoCitaService.crearTipoCita(tipoCitaData);

      return ResponseHelper.created(res, { tipoCita }, 'Tipo de cita creado exitosamente');
    } catch (error: any) {
      console.error('Error al crear tipo de cita:', error);
      return ResponseHelper.badRequest(res, error.message);
    }
  }

  /**
   * Actualiza un tipo de cita existente
   */
  async putTipoCita(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tipoCitaData: ActualizarTipoCitaDto = req.body;
      const tipoCita = await tipoCitaService.actualizarTipoCita(parseInt(id), tipoCitaData);

      return ResponseHelper.successWithCustomData(res, {
        tipoCita,
        msg: 'Tipo de cita actualizado correctamente'
      });
    } catch (error: any) {
      console.error('Error al actualizar tipo de cita:', error);

      if (error.message === 'Tipo de cita no encontrado') {
        return ResponseHelper.notFound(res, error.message);
      }

      return ResponseHelper.badRequest(res, error.message);
    }
  }

  /**
   * Elimina (desactiva) un tipo de cita y sus elementos relacionados
   */
  async deleteTipoCita(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tipoCita = await tipoCitaService.eliminarTipoCita(parseInt(id));

      return ResponseHelper.successWithCustomData(res, {
        tipoCita,
        msg: 'Tipo de cita desactivado correctamente'
      });
    } catch (error: any) {
      console.error('Error al eliminar tipo de cita:', error);

      if (error.message === 'Tipo de cita no encontrado') {
        return ResponseHelper.notFound(res, error.message);
      }

      return ResponseHelper.serverError(res, 'Error al eliminar tipo de cita', error);
    }
  }
}

export const tipoCitaController = new TipoCitaController();