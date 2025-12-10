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

    // Retornar con el nombre apropiado según el tipo de búsqueda
    const responseKey = getResponseKey(tabla);
    return ResponseHelper.successWithCustomData(res, { [responseKey]: data });
  } catch (error: any) {
    console.error('Error en búsqueda por colección:', error);

    if (error.message.includes('no soportada')) {
      return ResponseHelper.badRequest(res, error.message);
    }

    return ResponseHelper.serverError(res, 'Error al buscar en la colección', error);
  }
};

/**
 * Obtiene el nombre de la propiedad de respuesta según el tipo de búsqueda
 */
function getResponseKey(tabla: string): string {
  const keyMap: { [key: string]: string } = {
    'usuarios': 'usuarios',
    'medicos': 'medicos',
    'horario_medico': 'horarios',
    'cita_medica': 'citas',
    'cita_medico': 'citas',
    'tipo_cita': 'tipos',
    'facturas': 'facturas',
    'historiales': 'historiales'
  };

  return keyMap[tabla] || 'resultados';
}

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
