import { body, param } from 'express-validator';

/**
 * Validadores para endpoints de usuario
 */

// Validador para RUT chileno (formato básico)
const isValidRut = (rut: string): boolean => {
  if (!rut || typeof rut !== 'string') return false;
  // Formato: 12345678-9 o 12.345.678-9
  const rutPattern = /^(\d{1,2}\.?\d{3}\.?\d{3}[-]?[0-9kK])$/;
  return rutPattern.test(rut.replace(/\./g, ''));
};

export const updateUsuarioValidators = [
  param('id')
    .trim()
    .notEmpty().withMessage('El ID (RUT) es obligatorio')
    .custom(isValidRut).withMessage('Formato de RUT inválido'),

  body('nombre')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .matches(/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/).withMessage('El nombre solo puede contener letras'),

  body('apellidos')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Los apellidos deben tener entre 2 y 100 caracteres')
    .matches(/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/).withMessage('Los apellidos solo pueden contener letras'),

  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Formato de email inválido')
    .normalizeEmail(),

  body('telefono')
    .optional()
    .trim()
    .matches(/^(\+?56)?[2-9]\d{8}$/).withMessage('Formato de teléfono chileno inválido'),

  body('direccion')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 }).withMessage('La dirección debe tener entre 5 y 200 caracteres'),

  body('estado')
    .optional()
    .isIn(['activo', 'inactivo']).withMessage('El estado debe ser "activo" o "inactivo"')
];

export const deleteUsuarioValidators = [
  param('rut')
    .trim()
    .notEmpty().withMessage('El RUT es obligatorio')
    .custom(isValidRut).withMessage('Formato de RUT inválido')
];

export const getUsuarioValidators = [
  param('id')
    .trim()
    .notEmpty().withMessage('El ID es obligatorio')
];

export const cambiarPasswordValidators = [
  body('rut')
    .trim()
    .notEmpty().withMessage('El RUT es obligatorio')
    .custom(isValidRut).withMessage('Formato de RUT inválido'),

  body('password')
    .trim()
    .notEmpty().withMessage('La contraseña actual es obligatoria')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),

  body('newPassword')
    .trim()
    .notEmpty().withMessage('La nueva contraseña es obligatoria')
    .isLength({ min: 6 }).withMessage('La nueva contraseña debe tener al menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número')
];
