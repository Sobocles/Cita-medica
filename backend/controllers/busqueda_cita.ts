import { Request, Response } from 'express';
import busquedaCitaService from '../services/busqueda-cita.service';
import ResponseHelper from '../helpers/response.helper';

/**
 * Controlador para búsqueda de médicos y horarios disponibles
 * RESPONSABILIDAD: Solo manejar request/response, delegar lógica al servicio
 *
 * ANTES: 272 líneas con funciones auxiliares y lógica compleja
 * AHORA: ~30 líneas, solo coordina entre HTTP y servicio
 */

/**
 * Busca médicos disponibles para una especialidad y fecha específica
 * Retorna bloques de tiempo disponibles para agendar citas
 */
export const buscarmedico = async (req: Request, res: Response) => {
  try {
    const { especialidad, fecha } = req.body;

    const bloques = await busquedaCitaService.buscarMedicosDisponibles(especialidad, fecha);

    return ResponseHelper.successWithCustomData(res, { bloques });
  } catch (error: any) {
    console.error('Error al buscar médico:', error);

    if (error.message === 'Tipo de cita no encontrado') {
      return ResponseHelper.notFound(res, error.message);
    }

    if (error.message.includes('no proporcionados correctamente')) {
      return ResponseHelper.badRequest(res, error.message);
    }

    return ResponseHelper.serverError(res, 'Error al buscar médicos disponibles', error);
  }
};
