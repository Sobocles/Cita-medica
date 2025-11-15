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
exports.citaController = void 0;
const Cita_service_1 = __importDefault(require("../services/Cita.service"));
class CitaController {
    getCitas(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const desde = Number(req.query.desde) || 0;
                const limite = Number(req.query.limite) || 5;
                const resultado = yield Cita_service_1.default.getCitas(desde, limite);
                res.json({
                    ok: true,
                    citas: resultado.citas,
                    total: resultado.total
                });
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    }
    getCitasMedico(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { rut_medico } = req.params;
                const desde = Number(req.query.desde) || 0;
                const limite = Number(req.query.limite) || 5;
                const { count, citas } = yield Cita_service_1.default.getCitasMedico(rut_medico, desde, limite);
                if (!citas.length) {
                    return res.status(404).json({
                        ok: false,
                        msg: 'No se encontraron citas activas para este médico',
                    });
                }
                res.json({
                    ok: true,
                    citas,
                    total: count
                });
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    }
    getCitasPaciente(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { rut_paciente } = req.params;
                const desde = Number(req.query.desde) || 0;
                const limite = Number(req.query.limite) || 5;
                const { count, citas } = yield Cita_service_1.default.getCitasPaciente(rut_paciente, desde, limite);
                if (!citas.length) {
                    return res.status(404).json({
                        ok: false,
                        msg: 'No se encontraron citas activas para este paciente',
                    });
                }
                res.json({
                    ok: true,
                    citas,
                    total: count
                });
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    }
    getCitaFactura(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const idCita = parseInt(req.params.idCita);
                if (!idCita)
                    return res.status(400).json({ error: 'ID inválido' });
                const cita = yield Cita_service_1.default.getCitaFactura(idCita);
                if (!cita)
                    return res.status(404).json({ error: 'Cita no encontrada' });
                res.json({
                    ok: true,
                    cita
                });
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    }
    crearCita(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const cita = yield Cita_service_1.default.crearCita(req.body);
                res.status(201).json({
                    ok: true,
                    cita
                });
            }
            catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    }
    crearCitaPaciente(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const cita = yield Cita_service_1.default.crearCitaPaciente(req.body);
                res.status(201).json({
                    ok: true,
                    cita: { idCita: cita.idCita }
                });
            }
            catch (error) {
                res.status(400).json({
                    ok: false,
                    mensaje: error.message
                });
            }
        });
    }
    putCita(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(req.params.id);
                const cita = yield Cita_service_1.default.actualizarCita(id, req.body);
                res.json({
                    ok: true,
                    msg: 'Cita actualizada correctamente',
                    cita
                });
            }
            catch (error) {
                const status = error.message === 'Cita no encontrada' ? 404 : 500;
                res.status(status).json({ error: error.message });
            }
        });
    }
    deleteCita(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(req.params.id);
                yield Cita_service_1.default.eliminarCita(id);
                res.json({ msg: 'Cita actualizada a inactivo correctamente' });
            }
            catch (error) {
                const status = error.message === 'Cita no encontrada' ? 404 : 500;
                res.status(status).json({ error: error.message });
            }
        });
    }
}
exports.default = CitaController;
exports.citaController = new CitaController();
//# sourceMappingURL=CitaController.js.map