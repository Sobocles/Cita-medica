import { Request, Response } from 'express';
import busquedaService from '../services/busqueda.service';
import ResponseHelper from '../helpers/response.helper';

/**
 * Controlador para manejar búsquedas en diferentes colecciones
 * RESPONSABILIDAD: Solo manejar request/response, delegar lógica al servicio
 *
 * ANTES: 236 líneas con switch gigante y lógica de negocio
 * AHORA: ~50 líneas, solo coordina entre HTTP y servicio
 */

/**
 * Busca documentos en una colección específica
 */
export const getDocumentosColeccion = async (req: Request, res: Response) => {
  try {
    const { tabla, busqueda } = req.params;

    console.log('Búsqueda en tabla:', tabla, 'término:', busqueda);

    const data = await busquedaService.buscarEnColeccion(tabla, busqueda);

    return ResponseHelper.successWithCustomData(res, { citas: data });
  } catch (error: any) {
    console.error('Error en búsqueda por colección:', error);

    if (error.message.includes('no soportada')) {
      return ResponseHelper.badRequest(res, error.message);
    }

    return ResponseHelper.serverError(res, 'Error al buscar en la colección', error);
  }
};

/**
 * Busca en todas las colecciones (búsqueda global)
 */
export const getTodo = async (req: Request, res: Response) => {
  try {
    const { busqueda } = req.params;

    console.log('Búsqueda global:', busqueda);

    const resultados = await busquedaService.buscarTodo(busqueda);

    return ResponseHelper.successWithCustomData(res, { resultados });
  } catch (error: any) {
    console.error('Error en búsqueda global:', error);
    return ResponseHelper.serverError(res, 'Error en la búsqueda', error);
  }
};
