"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cita_medica_1 = __importDefault(require("../controllers/cita_medica"));
const validar_campos_1 = __importDefault(require("../middlewares/validar-campos"));
const validar_jwt_1 = __importDefault(require("../middlewares/validar-jwt"));
const cita_validators_1 = require("../middlewares/validators/cita.validators");
const router = (0, express_1.Router)();
// Obtener todas las citas con paginación
router.get('/', [
    ...cita_validators_1.getCitasPaginationValidators,
    validar_campos_1.default.instance.validarCampos
], cita_medica_1.default.instance.getCitas);
// Obtener una cita con factura
router.get('/:idCita', [
    ...cita_validators_1.getCitaValidators,
    validar_campos_1.default.instance.validarCampos
], cita_medica_1.default.instance.getCitaFactura);
// Obtener citas de un médico
router.get('/medico/:rut_medico', [
    ...cita_validators_1.getCitasMedicoValidators,
    validar_campos_1.default.instance.validarCampos
], cita_medica_1.default.instance.getCitasMedico);
// Obtener citas de un paciente
router.get('/usuario/:rut_paciente', [
    ...cita_validators_1.getCitasPacienteValidators,
    validar_campos_1.default.instance.validarCampos
], cita_medica_1.default.instance.getCitasPaciente);
// Crear una cita
router.post('/', [
    ...cita_validators_1.crearCitaValidators,
    validar_campos_1.default.instance.validarCampos
], cita_medica_1.default.instance.crearCita);
// Crear una cita como paciente
router.post('/crearCitapaciente', [
    ...cita_validators_1.crearCitaPacienteValidators,
    validar_campos_1.default.instance.validarCampos
], cita_medica_1.default.instance.crearCitaPaciente);
// Actualizar una cita
router.put('/:id', [
    ...cita_validators_1.updateCitaValidators,
    validar_campos_1.default.instance.validarCampos
], cita_medica_1.default.instance.putCita);
// Eliminar una cita
router.delete('/:id', [
    ...cita_validators_1.deleteCitaValidators,
    validar_campos_1.default.instance.validarCampos
], cita_medica_1.default.instance.deleteCita);
// Validar previsión presencialmente (para recepcionista/admin)
router.post('/validar-prevision/:idCita', [
    validar_jwt_1.default.instance.validarJwt,
    validar_campos_1.default.instance.validarCampos
], cita_medica_1.default.instance.validarPrevision);
exports.default = router;
//# sourceMappingURL=cita_medica.js.map