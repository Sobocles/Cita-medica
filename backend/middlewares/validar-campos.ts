import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";

export default class ValidarCampos {
    private static _instance: ValidarCampos;

    public static get instance(){
        return this._instance || (this._instance = new ValidarCampos());
    }

validarCampos = (req: Request, res: Response, next: NextFunction) => {
  console.log('🔍 VALIDAR CAMPOS - Body recibido:', JSON.stringify(req.body, null, 2));
  console.log('🔍 VALIDAR CAMPOS - Headers:', req.headers['content-type']);
  
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    console.log('❌ VALIDAR CAMPOS - Errores encontrados:', errors.array());
    return res.status(400).json({
      ok: false,
      msg: 'Datos de entrada no válidos',
      errors: errors.mapped()
    });
  }

  console.log('✅ VALIDAR CAMPOS - Validación exitosa, continuando...');
  next();
}

}