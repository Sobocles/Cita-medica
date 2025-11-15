import { param } from 'express-validator';

/**
 * Validadores para endpoints de búsqueda
 */

// Tablas permitidas para búsqueda
const TABLAS_PERMITIDAS = [
  'usuarios',
  'medicos',
  'citas',
  'tipo_citas',
  'horarios',
  'facturas',
  'historial_medico'
];

export const busquedaGeneralValidators = [
  param('busqueda')
    .trim()
    .notEmpty().withMessage('El término de búsqueda es obligatorio')
    .isLength({ min: 1, max: 100 }).withMessage('El término de búsqueda debe tener entre 1 y 100 caracteres')
    .matches(/^[a-zA-Z0-9\s\-\_áéíóúñÁÉÍÓÚÑ]+$/).withMessage('El término de búsqueda contiene caracteres no permitidos')
];

export const busquedaColeccionValidators = [
  param('tabla')
    .trim()
    .notEmpty().withMessage('La tabla es obligatoria')
    .isIn(TABLAS_PERMITIDAS).withMessage(`La tabla debe ser una de: ${TABLAS_PERMITIDAS.join(', ')}`),

  param('busqueda')
    .trim()
    .notEmpty().withMessage('El término de búsqueda es obligatorio')
    .isLength({ min: 1, max: 100 }).withMessage('El término de búsqueda debe tener entre 1 y 100 caracteres')
    .matches(/^[a-zA-Z0-9\s\-\_áéíóúñÁÉÍÓÚÑ]+$/).withMessage('El término de búsqueda contiene caracteres no permitidos')
];
