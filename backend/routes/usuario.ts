// BACKEND/routes/usuario.ts
import { Router } from 'express';
import { check } from 'express-validator';
import {
  getUsuario,
  getUsuarios,
  putUsuario,
  deleteUsuario,
  getAllUsuarios,
  getPacientesConCitasPagadasYEnCursoYterminado,
  getPacientesConCitasPagadasYEnCurso,
  cambiarPassword,
  CrearUsuario
} from '../controllers/usuario';
import validarCampos from '../middlewares/validar-campos';
import ValidarJwt from '../middlewares/validar-jwt';
import {
  updateUsuarioValidators,
  deleteUsuarioValidators,
  getUsuarioValidators,
  cambiarPasswordValidators
} from '../middlewares/validators/usuario.validators';

const router = Router();

// Obtener todos los usuarios
router.get('/', getUsuarios);

// Obtener todos los usuarios (para listados)
router.get('/all', getAllUsuarios);

// Obtener pacientes con citas en curso para un médico
router.get('/allCurso/:rut_medico', getPacientesConCitasPagadasYEnCurso);

// Obtener pacientes con citas en curso o terminadas para un médico
router.get('/allCursoTerminado/:rut_medico', getPacientesConCitasPagadasYEnCursoYterminado);

// Obtener un usuario por ID
router.get('/:id', [
  ...getUsuarioValidators,
  validarCampos.instance.validarCampos
], getUsuario);

// Restaurar la ruta de creación de usuario para mantener compatibilidad
router.post(
  '/',
  [
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('apellidos', 'Los apellidos son obligatorios').not().isEmpty(),
    check('email', 'El correo es obligatorio').isEmail(),
    check('telefono', 'El teléfono es obligatorio').not().isEmpty(),
    check('direccion', 'La dirección es obligatoria').not().isEmpty(),
    validarCampos.instance.validarCampos
  ],
  CrearUsuario
);

// Actualizar un usuario
router.put('/:id', [
  ...updateUsuarioValidators,
  validarCampos.instance.validarCampos
], putUsuario);

// Eliminar un usuario
router.delete('/:rut', [
  ...deleteUsuarioValidators,
  validarCampos.instance.validarCampos
], deleteUsuario);

// Cambiar contraseña
router.post('/cambiarPassword', [
  ...cambiarPasswordValidators,
  validarCampos.instance.validarCampos
], cambiarPassword);

export default router;