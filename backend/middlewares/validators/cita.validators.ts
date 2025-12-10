import { body, param, query } from 'express-validator';

/**
 * Validadores para endpoints de citas médicas
 */

// Validador para hora en formato HH:MM
const isValidTime = (time: string): boolean => {
  const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return timePattern.test(time);
};

// Validador para RUT chileno
const isValidRut = (rut: string): boolean => {
  if (!rut || typeof rut !== 'string') return false;
  const rutPattern = /^(\d{1,2}\.?\d{3}\.?\d{3}[-]?[0-9kK])$/;
  return rutPattern.test(rut.replace(/\./g, ''));
};

// Validador para fecha (YYYY-MM-DD o Date)
const isValidDate = (date: any): boolean => {
  const dateObj = new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj.getTime());
};

export const crearCitaValidators = [
  body('rut_paciente')
    .trim()
    .notEmpty().withMessage('El RUT del paciente es obligatorio')
    .custom(isValidRut).withMessage('Formato de RUT del paciente inválido'),

  body('rut_medico')
    .trim()
    .notEmpty().withMessage('El RUT del médico es obligatorio')
    .custom(isValidRut).withMessage('Formato de RUT del médico inválido'),

  body('fecha')
    .notEmpty().withMessage('La fecha es obligatoria')
    .custom(isValidDate).withMessage('Formato de fecha inválido')
    .custom((value) => {
      const citaDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return citaDate >= today;
    }).withMessage('La fecha de la cita no puede ser anterior a hoy'),

  body('hora_inicio')
    .trim()
    .notEmpty().withMessage('La hora de inicio es obligatoria')
    .custom(isValidTime).withMessage('Formato de hora inválido (debe ser HH:MM)'),

  body('hora_fin')
    .trim()
    .notEmpty().withMessage('La hora de fin es obligatoria')
    .custom(isValidTime).withMessage('Formato de hora inválido (debe ser HH:MM)')
    .custom((value, { req }) => {
      if (req.body.hora_inicio && value <= req.body.hora_inicio) {
        throw new Error('La hora de fin debe ser posterior a la hora de inicio');
      }
      return true;
    }),

  body('idTipoCita')
    .notEmpty().withMessage('El tipo de cita es obligatorio')
    .isInt({ min: 1 }).withMessage('El ID del tipo de cita debe ser un número válido'),

  body('motivo')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('El motivo no puede exceder 500 caracteres'),

  body('estado')
    .optional()
    .isIn(['no_pagado', 'pagado', 'en_curso', 'terminado', 'no_asistio'])
    .withMessage('Estado inválido')
];

export const crearCitaPacienteValidators = [
  body('rutPaciente')
    .trim()
    .notEmpty().withMessage('El RUT del paciente es obligatorio')
    .custom(isValidRut).withMessage('Formato de RUT inválido'),

  body('rutMedico')
    .trim()
    .notEmpty().withMessage('El RUT del médico es obligatorio')
    .custom(isValidRut).withMessage('Formato de RUT del médico inválido'),

  body('fecha')
    .notEmpty().withMessage('La fecha es obligatoria')
    .custom(isValidDate).withMessage('Formato de fecha inválido')
    .custom((value) => {
      const citaDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return citaDate >= today;
    }).withMessage('La fecha de la cita no puede ser anterior a hoy'),

  body('hora_inicio')
    .trim()
    .notEmpty().withMessage('La hora de inicio es obligatoria')
    .custom(isValidTime).withMessage('Formato de hora inválido (debe ser HH:MM)'),

  body('hora_fin')
    .trim()
    .notEmpty().withMessage('La hora de fin es obligatoria')
    .custom(isValidTime).withMessage('Formato de hora inválido (debe ser HH:MM)'),

  body('especialidad')
    .trim()
    .notEmpty().withMessage('La especialidad es obligatoria')
    .isLength({ min: 2, max: 100 }).withMessage('La especialidad debe tener entre 2 y 100 caracteres'),

  body('idTipoCita')
    .notEmpty().withMessage('El tipo de cita es obligatorio')
    .isInt({ min: 1 }).withMessage('El ID del tipo de cita debe ser un número válido')
];

export const updateCitaValidators = [
  param('id')
    .notEmpty().withMessage('El ID de la cita es obligatorio')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número válido'),

  body('fecha')
    .optional()
    .custom(isValidDate).withMessage('Formato de fecha inválido'),

  body('hora_inicio')
    .optional()
    .trim()
    .custom(isValidTime).withMessage('Formato de hora inválido (debe ser HH:MM)'),

  body('hora_fin')
    .optional()
    .trim()
    .custom(isValidTime).withMessage('Formato de hora inválido (debe ser HH:MM)'),

  body('estado')
    .optional()
    .isIn(['no_pagado', 'pagado', 'en_curso', 'terminado', 'no_asistio'])
    .withMessage('Estado inválido'),

  body('motivo')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('El motivo no puede exceder 500 caracteres')
];

export const deleteCitaValidators = [
  param('id')
    .notEmpty().withMessage('El ID de la cita es obligatorio')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número válido')
];

export const getCitaValidators = [
  param('idCita')
    .notEmpty().withMessage('El ID de la cita es obligatorio')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número válido')
];

export const getCitasMedicoValidators = [
  param('rut_medico')
    .trim()
    .notEmpty().withMessage('El RUT del médico es obligatorio')
    .custom(isValidRut).withMessage('Formato de RUT inválido')
];

export const getCitasPacienteValidators = [
  param('rut_paciente')
    .trim()
    .notEmpty().withMessage('El RUT del paciente es obligatorio')
    .custom(isValidRut).withMessage('Formato de RUT inválido')
];

export const getCitasPaginationValidators = [
  query('desde')
    .optional()
    .isInt({ min: 0 }).withMessage('El parámetro "desde" debe ser un número mayor o igual a 0')
];
