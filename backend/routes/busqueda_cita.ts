import { Router } from 'express';
import Historial_Medico from '../controllers/historial_medico';

import { check } from 'express-validator';
import validarCampos from '../middlewares/validar-campos';
import { buscarmedico } from '../controllers/busqueda_cita';
import ValidarJwt from '../middlewares/validar-jwt';

const router = Router();


router.post(
    '/', 
    buscarmedico
  );


 export default router;
