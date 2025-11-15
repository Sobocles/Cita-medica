"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// BACKEND/routes/usuario.ts
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const usuario_1 = require("../controllers/usuario");
const validar_campos_1 = __importDefault(require("../middlewares/validar-campos"));
const usuario_validators_1 = require("../middlewares/validators/usuario.validators");
const router = (0, express_1.Router)();
// Obtener todos los usuarios
router.get('/', usuario_1.getUsuarios);
// Obtener todos los usuarios (para listados)
router.get('/all', usuario_1.getAllUsuarios);
// Obtener pacientes con citas en curso para un médico
router.get('/allCurso/:rut_medico', usuario_1.getPacientesConCitasPagadasYEnCurso);
// Obtener pacientes con citas en curso o terminadas para un médico
router.get('/allCursoTerminado/:rut_medico', usuario_1.getPacientesConCitasPagadasYEnCursoYterminado);
// Obtener un usuario por ID
router.get('/:id', [
    ...usuario_validators_1.getUsuarioValidators,
    validar_campos_1.default.instance.validarCampos
], usuario_1.getUsuario);
// Restaurar la ruta de creación de usuario para mantener compatibilidad
router.post('/', [
    (0, express_validator_1.check)('nombre', 'El nombre es obligatorio').not().isEmpty(),
    (0, express_validator_1.check)('apellidos', 'Los apellidos son obligatorios').not().isEmpty(),
    (0, express_validator_1.check)('email', 'El correo es obligatorio').isEmail(),
    (0, express_validator_1.check)('telefono', 'El teléfono es obligatorio').not().isEmpty(),
    (0, express_validator_1.check)('direccion', 'La dirección es obligatoria').not().isEmpty(),
    validar_campos_1.default.instance.validarCampos
], usuario_1.CrearUsuario);
// Actualizar un usuario
router.put('/:id', [
    ...usuario_validators_1.updateUsuarioValidators,
    validar_campos_1.default.instance.validarCampos
], usuario_1.putUsuario);
// Eliminar un usuario
router.delete('/:rut', [
    ...usuario_validators_1.deleteUsuarioValidators,
    validar_campos_1.default.instance.validarCampos
], usuario_1.deleteUsuario);
// Cambiar contraseña
router.post('/cambiarPassword', [
    ...usuario_validators_1.cambiarPasswordValidators,
    validar_campos_1.default.instance.validarCampos
], usuario_1.cambiarPassword);
exports.default = router;
//# sourceMappingURL=usuario.js.map