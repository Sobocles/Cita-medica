import { Router } from 'express';
import CitaMedica from '../controllers/cita_medica';
import validarCampos from '../middlewares/validar-campos';
import ValidarJwt from '../middlewares/validar-jwt';
import {
  crearCitaValidators,
  crearCitaPacienteValidators,
  updateCitaValidators,
  deleteCitaValidators,
  getCitaValidators,
  getCitasMedicoValidators,
  getCitasPacienteValidators,
  getCitasPaginationValidators
} from '../middlewares/validators/cita.validators';

const router = Router();

// Obtener todas las citas con paginación
router.get('/', [
  ...getCitasPaginationValidators,
  validarCampos.instance.validarCampos
], CitaMedica.instance.getCitas);

// Obtener una cita con factura
router.get('/:idCita', [
  ...getCitaValidators,
  validarCampos.instance.validarCampos
], CitaMedica.instance.getCitaFactura);

// Obtener citas de un médico
router.get('/medico/:rut_medico', [
  ...getCitasMedicoValidators,
  validarCampos.instance.validarCampos
], CitaMedica.instance.getCitasMedico);

// Obtener citas de un paciente
router.get('/usuario/:rut_paciente', [
  ...getCitasPacienteValidators,
  validarCampos.instance.validarCampos
], CitaMedica.instance.getCitasPaciente);

// Crear una cita
router.post('/', [
  ...crearCitaValidators,
  validarCampos.instance.validarCampos
], CitaMedica.instance.crearCita);

// Crear una cita como paciente
router.post('/crearCitapaciente', [
  ...crearCitaPacienteValidators,
  validarCampos.instance.validarCampos
], CitaMedica.instance.crearCitaPaciente);

// Actualizar una cita
router.put('/:id', [
  ...updateCitaValidators,
  validarCampos.instance.validarCampos
], CitaMedica.instance.putCita);

// Eliminar una cita
router.delete('/:id', [
  ...deleteCitaValidators,
  validarCampos.instance.validarCampos
], CitaMedica.instance.deleteCita);

// Validar previsión presencialmente (para recepcionista/admin)
router.post('/validar-prevision/:idCita', [
  ValidarJwt.instance.validarJwt,
  validarCampos.instance.validarCampos
], CitaMedica.instance.validarPrevision);

export default router;
