"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const busqueda_cita_1 = require("../controllers/busqueda_cita");
const router = (0, express_1.Router)();
router.post('/', busqueda_cita_1.buscarmedico);
exports.default = router;
//# sourceMappingURL=busqueda_cita.js.map