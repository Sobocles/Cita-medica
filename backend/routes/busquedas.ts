import { Router } from 'express';
import { getDocumentosColeccion, getTodo } from '../controllers/busquedas';
import ValidarJwt from '../middlewares/validar-jwt';
import validarCampos from '../middlewares/validar-campos';
import {
  busquedaGeneralValidators,
  busquedaColeccionValidators
} from '../middlewares/validators/busqueda.validators';

const router = Router();

// Búsqueda general en todas las tablas
router.get('/:busqueda', [
  ...busquedaGeneralValidators,
  validarCampos.instance.validarCampos
], getTodo);

// Búsqueda en una tabla específica
router.get('/coleccion/:tabla/:busqueda', [
  ...busquedaColeccionValidators,
  validarCampos.instance.validarCampos
], getDocumentosColeccion);

export default router;