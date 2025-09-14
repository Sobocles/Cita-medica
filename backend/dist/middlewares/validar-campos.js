"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
class ValidarCampos {
    constructor() {
        this.validarCampos = (req, res, next) => {
            console.log('🔍 VALIDAR CAMPOS - Body recibido:', JSON.stringify(req.body, null, 2));
            console.log('🔍 VALIDAR CAMPOS - Headers:', req.headers['content-type']);
            const errors = (0, express_validator_1.validationResult)(req);
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
        };
    }
    static get instance() {
        return this._instance || (this._instance = new ValidarCampos());
    }
}
exports.default = ValidarCampos;
//# sourceMappingURL=validar-campos.js.map