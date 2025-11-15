import { Router } from 'express';
import { createOrder, receiveWebhook } from '../controllers/mercadoPago';
import { getAllFacturas, obtenerFacturaPorId, eliminarFactura } from '../controllers/facturas';
import validarCampos from '../middlewares/validar-campos';
import {
  createOrderValidators,
  webhookValidators,
  getFacturaValidators
} from '../middlewares/validators/mercadopago.validators';

const router = Router();

// Crear orden de pago
router.post('/create-order', [
  ...createOrderValidators,
  validarCampos.instance.validarCampos
], createOrder);

// URLs de retorno de MercadoPago
router.get('/success', (req, res) => res.send('success'));
router.get('/failure', (req, res) => res.send('failure'));
router.get('/pending', (req, res) => res.send('pending'));

// Webhook de MercadoPago (validación opcional ya que viene de MercadoPago)
router.post('/webhook', [
  ...webhookValidators,
  validarCampos.instance.validarCampos
], receiveWebhook);

// Obtener todas las facturas
router.get('/factura', getAllFacturas);

// Obtener una factura por ID
router.get('/factura/:id', [
  ...getFacturaValidators,
  validarCampos.instance.validarCampos
], obtenerFacturaPorId);

export default router;