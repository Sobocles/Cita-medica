import { Response } from 'express';

/**
 * Helper para estandarizar las respuestas HTTP en toda la aplicación
 *
 * FORMATO ESTÁNDAR:
 * {
 *   ok: boolean,
 *   msg?: string,
 *   data?: any,
 *   errors?: any
 * }
 */

interface SuccessResponse {
  ok: true;
  msg?: string;
  data?: any;
  [key: string]: any; // Para retrocompatibilidad con propiedades específicas
}

interface ErrorResponse {
  ok: false;
  msg: string;
  errors?: any;
}

export class ResponseHelper {
  /**
   * Respuesta exitosa genérica (200 OK)
   */
  static success(res: Response, data?: any, msg?: string): Response {
    const response: SuccessResponse = {
      ok: true
    };

    if (msg) response.msg = msg;
    if (data !== undefined) response.data = data;

    return res.status(200).json(response);
  }

  /**
   * Respuesta exitosa con datos personalizados
   * Útil para retrocompatibilidad cuando el frontend espera propiedades específicas
   */
  static successWithCustomData(res: Response, customData: Record<string, any>): Response {
    return res.status(200).json({
      ok: true,
      ...customData
    });
  }

  /**
   * Recurso creado exitosamente (201 Created)
   */
  static created(res: Response, data?: any, msg: string = 'Recurso creado exitosamente'): Response {
    const response: SuccessResponse = {
      ok: true,
      msg
    };

    if (data !== undefined) response.data = data;

    return res.status(201).json(response);
  }

  /**
   * Error de validación / petición incorrecta (400 Bad Request)
   */
  static badRequest(res: Response, msg: string = 'Petición incorrecta', errors?: any): Response {
    const response: ErrorResponse = {
      ok: false,
      msg
    };

    if (errors) response.errors = errors;

    return res.status(400).json(response);
  }

  /**
   * No autenticado (401 Unauthorized)
   */
  static unauthorized(res: Response, msg: string = 'No autenticado'): Response {
    return res.status(401).json({
      ok: false,
      msg
    });
  }

  /**
   * No autorizado / sin permisos (403 Forbidden)
   */
  static forbidden(res: Response, msg: string = 'No tienes permisos para realizar esta acción'): Response {
    return res.status(403).json({
      ok: false,
      msg
    });
  }

  /**
   * Recurso no encontrado (404 Not Found)
   */
  static notFound(res: Response, msg: string = 'Recurso no encontrado'): Response {
    return res.status(404).json({
      ok: false,
      msg
    });
  }

  /**
   * Conflicto - recurso ya existe (409 Conflict)
   */
  static conflict(res: Response, msg: string = 'El recurso ya existe'): Response {
    return res.status(409).json({
      ok: false,
      msg
    });
  }

  /**
   * Error interno del servidor (500 Internal Server Error)
   */
  static serverError(res: Response, msg: string = 'Error interno del servidor', error?: any): Response {
    const response: ErrorResponse = {
      ok: false,
      msg
    };

    // En desarrollo, incluir detalles del error
    if (process.env.NODE_ENV === 'development' && error) {
      response.errors = {
        message: error.message,
        stack: error.stack
      };
    }

    return res.status(500).json(response);
  }

  /**
   * Error personalizado con código de estado específico
   */
  static error(res: Response, statusCode: number, msg: string, errors?: any): Response {
    const response: ErrorResponse = {
      ok: false,
      msg
    };

    if (errors) response.errors = errors;

    return res.status(statusCode).json(response);
  }

  /**
   * Respuesta para lista paginada
   */
  static paginated(
    res: Response,
    data: any[],
    total: number,
    page?: number,
    limit?: number,
    msg?: string
  ): Response {
    const response: SuccessResponse = {
      ok: true,
      data,
      total
    };

    if (msg) response.msg = msg;
    if (page !== undefined) response.page = page;
    if (limit !== undefined) response.limit = limit;

    return res.status(200).json(response);
  }
}

export default ResponseHelper;
