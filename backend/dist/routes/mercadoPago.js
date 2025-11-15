"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mercadoPago_1 = require("../controllers/mercadoPago");
const facturas_1 = require("../controllers/facturas");
const validar_campos_1 = __importDefault(require("../middlewares/validar-campos"));
const mercadopago_validators_1 = require("../middlewares/validators/mercadopago.validators");
const router = (0, express_1.Router)();
// Crear orden de pago
router.post('/create-order', [
    ...mercadopago_validators_1.createOrderValidators,
    validar_campos_1.default.instance.validarCampos
], mercadoPago_1.createOrder);
// URLs de retorno de MercadoPago
router.get('/success', (req, res) => res.send('success'));
router.get('/failure', (req, res) => res.send('failure'));
router.get('/pending', (req, res) => res.send('pending'));
// Webhook de MercadoPago (validación opcional ya que viene de MercadoPago)
router.post('/webhook', [
    ...mercadopago_validators_1.webhookValidators,
    validar_campos_1.default.instance.validarCampos
], mercadoPago_1.receiveWebhook);
// Obtener todas las facturas
router.get('/factura', facturas_1.getAllFacturas);
// Obtener una factura por ID
router.get('/factura/:id', [
    ...mercadopago_validators_1.getFacturaValidators,
    validar_campos_1.default.instance.validarCampos
], facturas_1.obtenerFacturaPorId);
exports.default = router;
//# sourceMappingURL=mercadoPago.js.map