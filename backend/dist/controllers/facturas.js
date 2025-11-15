"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.eliminarFactura = eliminarFactura;
exports.getAllFacturas = getAllFacturas;
exports.obtenerFacturaPorId = obtenerFacturaPorId;
const factura_1 = __importDefault(require("../models/factura"));
const cita_medica_1 = __importDefault(require("../models/cita_medica"));
const usuario_1 = __importDefault(require("../models/usuario"));
const medico_1 = __importDefault(require("../models/medico"));
function eliminarFactura(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id } = req.params;
        try {
            const factura = yield factura_1.default.findByPk(id);
            if (!factura) {
                return res.status(404).json({
                    ok: false,
                    mensaje: 'Factura no encontrada'
                });
            }
            // Cambiar el estado de la factura a 'inactivo'
            factura.estado = 'inactivo';
            yield factura.save();
            res.json({
                ok: true,
                mensaje: 'Factura actualizada a inactivo con éxito'
            });
        }
        catch (error) {
            console.error('Error al actualizar el estado de la factura:', error);
            res.status(500).json({
                ok: false,
                mensaje: 'Error interno del servidor'
            });
        }
    });
}
;
function getAllFacturas(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Parámetros de paginación
            const desde = Number(req.query.desde) || 0;
            const limite = 5;
            // Contar el total de facturas
            const totalFacturas = yield factura_1.default.count();
            // Obtener las facturas con paginación
            const facturas = yield factura_1.default.findAll({
                include: [{
                        model: cita_medica_1.default,
                        as: 'citaMedica',
                        include: [
                            {
                                model: usuario_1.default,
                                as: 'paciente',
                                attributes: ['rut', 'nombre', 'apellidos']
                            },
                            {
                                model: medico_1.default,
                                as: 'medico',
                                attributes: ['rut', 'nombre', 'apellidos']
                            }
                        ],
                        attributes: ['motivo']
                    }],
                attributes: ['id_factura', 'payment_method_id', 'transaction_amount', 'monto_pagado', 'fecha_pago'],
                offset: desde,
                limit: limite
            });
            if (!facturas || facturas.length === 0) {
                return res.status(404).json({ message: 'No se encontraron facturas' });
            }
            // Formatear las facturas para la respuesta
            const facturasFormateadas = facturas.map(factura => {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
                return ({
                    id_factura: factura.id_factura,
                    payment_method_id: factura.payment_method_id,
                    transaction_amount: factura.transaction_amount,
                    monto_pagado: factura.monto_pagado,
                    fecha_pago: factura.fecha_pago,
                    citaMedica: {
                        motivo: (_a = factura.citaMedica) === null || _a === void 0 ? void 0 : _a.motivo,
                        paciente: {
                            rut: (_c = (_b = factura.citaMedica) === null || _b === void 0 ? void 0 : _b.paciente) === null || _c === void 0 ? void 0 : _c.rut,
                            nombre: (_e = (_d = factura.citaMedica) === null || _d === void 0 ? void 0 : _d.paciente) === null || _e === void 0 ? void 0 : _e.nombre,
                            apellidos: (_g = (_f = factura.citaMedica) === null || _f === void 0 ? void 0 : _f.paciente) === null || _g === void 0 ? void 0 : _g.apellidos
                        },
                        medico: {
                            rut: (_j = (_h = factura.citaMedica) === null || _h === void 0 ? void 0 : _h.medico) === null || _j === void 0 ? void 0 : _j.rut,
                            nombre: (_l = (_k = factura.citaMedica) === null || _k === void 0 ? void 0 : _k.medico) === null || _l === void 0 ? void 0 : _l.nombre,
                            apellidos: (_o = (_m = factura.citaMedica) === null || _m === void 0 ? void 0 : _m.medico) === null || _o === void 0 ? void 0 : _o.apellidos
                        }
                    }
                });
            });
            // Enviar la respuesta
            res.json({
                ok: true,
                facturas: facturasFormateadas,
                total: totalFacturas
            });
        }
        catch (error) {
            console.error('Error al obtener las facturas:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    });
}
function obtenerFacturaPorId(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
        const id = req.params.id;
        const idfactura = parseInt(id);
        try {
            const factura = yield factura_1.default.findByPk(idfactura, {
                include: [{
                        model: cita_medica_1.default,
                        as: 'citaMedica',
                        include: [
                            {
                                model: usuario_1.default,
                                as: 'paciente',
                                attributes: ['rut', 'nombre', 'apellidos']
                            },
                            {
                                model: medico_1.default,
                                as: 'medico',
                                attributes: ['rut', 'nombre', 'apellidos']
                            }
                        ],
                        attributes: ['motivo']
                    }],
                attributes: ['id_factura', 'payment_method_id', 'transaction_amount', 'monto_pagado', 'fecha_pago']
            });
            if (!factura) {
                return res.status(404).json({
                    ok: false,
                    mensaje: 'Factura no encontrada'
                });
            }
            // Crear un objeto con la información detallada de la factura
            const facturaInfo = {
                idFactura: factura.id_factura,
                rutPaciente: (_b = (_a = factura.citaMedica) === null || _a === void 0 ? void 0 : _a.paciente) === null || _b === void 0 ? void 0 : _b.rut,
                nombrePaciente: (_d = (_c = factura.citaMedica) === null || _c === void 0 ? void 0 : _c.paciente) === null || _d === void 0 ? void 0 : _d.nombre,
                apellidosPaciente: (_f = (_e = factura.citaMedica) === null || _e === void 0 ? void 0 : _e.paciente) === null || _f === void 0 ? void 0 : _f.apellidos,
                motivoCita: (_g = factura.citaMedica) === null || _g === void 0 ? void 0 : _g.motivo,
                rutMedico: (_j = (_h = factura.citaMedica) === null || _h === void 0 ? void 0 : _h.medico) === null || _j === void 0 ? void 0 : _j.rut,
                nombreMedico: (_l = (_k = factura.citaMedica) === null || _k === void 0 ? void 0 : _k.medico) === null || _l === void 0 ? void 0 : _l.nombre,
                apellidosMedico: (_o = (_m = factura.citaMedica) === null || _m === void 0 ? void 0 : _m.medico) === null || _o === void 0 ? void 0 : _o.apellidos,
                paymentMethodId: factura.payment_method_id,
                transactionAmount: factura.transaction_amount,
                montoPagado: factura.monto_pagado,
                fecha_pago: factura.fecha_pago
            };
            res.json({
                ok: true,
                factura: facturaInfo
            });
        }
        catch (error) {
            console.error('Error al obtener la factura:', error);
            res.status(500).json({
                ok: false,
                mensaje: 'Error interno del servidor'
            });
        }
    });
}
;
//# sourceMappingURL=facturas.js.map