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
const medico_service_1 = __importDefault(require("../services/medico.service"));
const jwt_1 = __importDefault(require("../helpers/jwt"));
const enums_1 = require("../types/enums");
class MedicosController {
    static get instance() {
        return this._instance || (this._instance = new MedicosController());
    }
    getMedicos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const desde = Number(req.query.desde) || 0;
            try {
                const result = yield medico_service_1.default.getPaginatedMedicos(desde);
                res.json({
                    ok: true,
                    medicos: result.medicos,
                    total: result.total
                });
            }
            catch (error) {
                console.error('Error al obtener los médicos:', error);
                res.status(500).json({ msg: 'Error en el servidor' });
            }
        });
    }
    getMedicosEspecialidad(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const medicos = yield medico_service_1.default.getMedicosByEspecialidad();
                res.json({
                    ok: true,
                    medicos
                });
            }
            catch (error) {
                console.error('Error al obtener médicos por especialidad:', error);
                res.status(500).json({ ok: false, msg: 'Error en el servidor' });
            }
        });
    }
    getAllMedicos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield medico_service_1.default.getAllMedicos();
                res.json({
                    ok: true,
                    medicos: result.medicos,
                    total: result.total
                });
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ msg: 'Error en el servidor' });
            }
        });
    }
    getMedico(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                const medico = yield medico_service_1.default.getMedicoById(id);
                if (!medico) {
                    return res.status(404).json({ ok: false, msg: 'Médico no encontrado' });
                }
                res.json({ ok: true, medico });
            }
            catch (error) {
                console.log(error);
                res.status(500).json({ ok: false, msg: 'Hable con el administrador' });
            }
        });
    }
    crearMedico(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const medico = yield medico_service_1.default.createMedico(req.body);
                // Para el token, necesitamos el rol como string
                const medicoJSON = medico.toJSON();
                const rol = ((_a = medicoJSON.rol) === null || _a === void 0 ? void 0 : _a.codigo) || enums_1.UserRole.MEDICO;
                // Generar JWT
                const token = yield jwt_1.default.instance.generarJWT(medico.rut, medico.nombre, medico.apellidos, rol);
                res.json({
                    ok: true,
                    medico: medicoJSON,
                    token
                });
            }
            catch (error) {
                res.status(400).json({ ok: false, msg: error.message });
            }
        });
    }
    putMedico(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { rut } = req.params;
            try {
                const medico = yield medico_service_1.default.updateMedico(rut, req.body);
                if (!medico) {
                    return res.status(404).json({ ok: false, msg: 'Médico no encontrado' });
                }
                // Procesar para respuesta
                const medicoJSON = medico.toJSON();
                if (medicoJSON.rol && medicoJSON.rol.codigo) {
                    medicoJSON.rol = medicoJSON.rol.codigo;
                }
                res.json({ ok: true, medico: medicoJSON });
            }
            catch (error) {
                res.status(400).json({ ok: false, msg: error.message });
            }
        });
    }
    deleteMedico(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { rut } = req.params;
            try {
                yield medico_service_1.default.deleteMedico(rut);
                res.json({ ok: true, msg: 'Médico eliminado correctamente' });
            }
            catch (error) {
                res.status(400).json({ ok: false, msg: error.message });
            }
        });
    }
    cambiarPasswordMedico(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { rut, password, newPassword } = req.body;
            try {
                yield medico_service_1.default.changePassword(rut, password, newPassword);
                res.json({ ok: true, msg: 'Contraseña actualizada correctamente' });
            }
            catch (error) {
                res.status(400).json({ ok: false, msg: error.message });
            }
        });
    }
}
exports.default = MedicosController;
//# sourceMappingURL=medico.js.map