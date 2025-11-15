"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const busquedas_1 = require("../controllers/busquedas");
const validar_campos_1 = __importDefault(require("../middlewares/validar-campos"));
const busqueda_validators_1 = require("../middlewares/validators/busqueda.validators");
const router = (0, express_1.Router)();
// Búsqueda general en todas las tablas
router.get('/:busqueda', [
    ...busqueda_validators_1.busquedaGeneralValidators,
    validar_campos_1.default.instance.validarCampos
], busquedas_1.getTodo);
// Búsqueda en una tabla específica
router.get('/coleccion/:tabla/:busqueda', [
    ...busqueda_validators_1.busquedaColeccionValidators,
    validar_campos_1.default.instance.validarCampos
], busquedas_1.getDocumentosColeccion);
exports.default = router;
//# sourceMappingURL=busquedas.js.map