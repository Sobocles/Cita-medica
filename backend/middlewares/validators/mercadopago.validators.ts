import { body, param } from 'express-validator';

/**
 * Validadores para endpoints de MercadoPago
 */

export const createOrderValidators = [
  body('motivo')
    .trim()
    .notEmpty().withMessage('El motivo de la orden es obligatorio')
    .isLength({ min: 3, max: 200 }).withMessage('El motivo debe tener entre 3 y 200 caracteres')
    .matches(/^[a-zA-Z0-9\s\-\_áéíóúñÁÉÍÓÚÑ]+$/).withMessage('El motivo contiene caracteres no permitidos'),

  body('precio')
    .notEmpty().withMessage('El precio es obligatorio')
    .isFloat({ min: 100, max: 10000000 }).withMessage('El precio debe estar entre $100 y $10.000.000')
    .custom((value) => {
      // Verificar que el precio sea un número válido con máximo 2 decimales
      const priceStr = value.toString();
      const decimals = priceStr.includes('.') ? priceStr.split('.')[1].length : 0;
      if (decimals > 2) {
        throw new Error('El precio no puede tener más de 2 decimales');
      }
      return true;
    }),

  body('idCita')
    .notEmpty().withMessage('El ID de la cita es obligatorio')
    .isInt({ min: 1 }).withMessage('El ID de la cita debe ser un número válido mayor a 0')
];

export const webhookValidators = [
  body('type')
    .optional()
    .isString().withMessage('El tipo debe ser una cadena de texto'),

  body('data')
    .optional()
    .isObject().withMessage('Los datos deben ser un objeto'),

  body('data.id')
    .optional()
    .isString().withMessage('El ID del pago debe ser una cadena de texto')
];

export const getFacturaValidators = [
  param('id')
    .notEmpty().withMessage('El ID de la factura es obligatorio')
    .isInt({ min: 1 }).withMessage('El ID de la factura debe ser un número válido')
];
