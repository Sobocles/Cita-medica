"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validar_campos_1 = __importDefault(require("../middlewares/validar-campos"));
const medico_1 = __importDefault(require("../controllers/medico"));
const express_validator_1 = require("express-validator");
const validar_jwt_1 = __importDefault(require("../middlewares/validar-jwt"));
const s3_config_1 = require("../config/s3.config");
const router = (0, express_1.Router)();
router.get('/', [
    validar_campos_1.default.instance.validarCampos
], medico_1.default.instance.getMedicos);
router.get('/Especialidades', [
    validar_campos_1.default.instance.validarCampos
], medico_1.default.instance.getMedicosEspecialidad);
router.get('/all', [
    validar_campos_1.default.instance.validarCampos
], medico_1.default.instance.getAllMedicos);
router.get('/:id', [
    validar_campos_1.default.instance.validarCampos
], medico_1.default.instance.getMedico);
router.post('/', [
    // Agrega las validaciones para cada campo del médico aquí
    (0, express_validator_1.check)('nombre', 'El nombre es obligatorio').not().isEmpty(),
    (0, express_validator_1.check)('apellidos', 'Los apellidos son obligatorios').not().isEmpty(),
    (0, express_validator_1.check)('email', 'El email es obligatorio').isEmail(),
    (0, express_validator_1.check)('direccion', 'La dirección es obligatoria').not().isEmpty(),
    // Agrega más validaciones según tus necesidades
], medico_1.default.instance.crearMedico);
router.post('/cambiarPassword', [], medico_1.default.instance.cambiarPasswordMedico);
router.put('/:rut', [], medico_1.default.instance.putMedico);
router.delete('/:rut', [
    validar_campos_1.default.instance.validarCampos
], medico_1.default.instance.deleteMedico);
/**
 * Rutas para manejo de imágenes de médicos (AWS S3)
 */
// Subir imagen de perfil del médico
router.post('/:rut/imagen', [
    validar_jwt_1.default.instance.validarJwt,
    s3_config_1.uploadMedicoImage.single('imagen'),
    validar_campos_1.default.instance.validarCampos
], medico_1.default.instance.subirImagenMedico);
// Obtener URL firmada de la imagen del médico
router.get('/:rut/imagen', [
    validar_campos_1.default.instance.validarCampos
], medico_1.default.instance.obtenerUrlImagen);
// Eliminar imagen del médico
router.delete('/:rut/imagen', [
    validar_jwt_1.default.instance.validarJwt,
    validar_campos_1.default.instance.validarCampos
], medico_1.default.instance.eliminarImagenMedico);
/**
 * Rutas para información profesional del médico
 */
// Obtener perfil completo del médico (público para pacientes)
router.get('/:rut/perfil', [
    validar_campos_1.default.instance.validarCampos
], medico_1.default.instance.getMedicoPerfil);
// Actualizar información profesional del médico (requiere autenticación)
router.put('/:rut/info-profesional', [
    validar_jwt_1.default.instance.validarJwt,
    validar_campos_1.default.instance.validarCampos
], medico_1.default.instance.actualizarInfoProfesional);
/**
 * Rutas para gestión de documentos del médico (títulos, certificados, etc.)
 */
// Subir documento PDF del médico
router.post('/:rut/documento', [
    validar_jwt_1.default.instance.validarJwt,
    s3_config_1.uploadMedicoDocument.single('documento'),
    validar_campos_1.default.instance.validarCampos
], medico_1.default.instance.subirDocumentoMedico);
// Listar documentos del médico (público para pacientes)
router.get('/:rut/documentos', [
    validar_campos_1.default.instance.validarCampos
], medico_1.default.instance.listarDocumentosMedico);
// Eliminar documento del médico
router.delete('/:rut/documento', [
    validar_jwt_1.default.instance.validarJwt,
    validar_campos_1.default.instance.validarCampos
], medico_1.default.instance.eliminarDocumentoMedico);
exports.default = router;
//# sourceMappingURL=medico.js.map