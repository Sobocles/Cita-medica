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
exports.getPacientesConCitasPagadasYEnCursoYterminado = exports.getPacientesConCitasPagadasYEnCurso = exports.cambiarPassword = exports.deleteUsuario = exports.putUsuario = exports.getUsuario = exports.CrearUsuario = exports.getAllUsuarios = exports.getUsuarios = void 0;
const usuario_service_1 = __importDefault(require("../services/usuario.service"));
const usuario_repository_1 = __importDefault(require("../repositories/usuario.repository"));
const getUsuarios = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const desde = Number(req.query.desde) || 0;
    try {
        const result = yield usuario_service_1.default.getPaginatedUsers(desde);
        res.json(result);
    }
    catch (error) {
        res.status(500).send('Error interno del servidor');
    }
});
exports.getUsuarios = getUsuarios;
const getAllUsuarios = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pacientes = yield usuario_service_1.default.getAllPatients();
        res.json({
            ok: true,
            usuarios: pacientes,
            total: pacientes.length
        });
    }
    catch (error) {
        res.status(500).send('Error interno del servidor');
    }
});
exports.getAllUsuarios = getAllUsuarios;
const CrearUsuario = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("ENTRO EN CREAR USUARIO");
    try {
        const user = yield usuario_service_1.default.createUser(req.body);
        res.json({
            ok: true,
            usuario: user
        });
        console.log("Usuario creado");
    }
    catch (error) {
        res.status(400).json({
            ok: false,
            msg: error.message
        });
    }
});
exports.CrearUsuario = CrearUsuario;
const getUsuario = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const usuario = yield usuario_repository_1.default.findById(id);
        if (!usuario) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }
        res.json(usuario);
    }
    catch (error) {
        res.status(500).send('Error interno del servidor');
    }
});
exports.getUsuario = getUsuario;
const putUsuario = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const usuario = yield usuario_service_1.default.updateUser(id, req.body);
        if (!usuario) {
            return res.status(404).json({ ok: false, msg: 'Usuario no encontrado' });
        }
        res.json({ usuario });
    }
    catch (error) {
        res.status(400).json({ ok: false, msg: error.message });
    }
});
exports.putUsuario = putUsuario;
const deleteUsuario = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        yield usuario_service_1.default.deleteUser(id);
        res.json({ msg: 'Usuario eliminado correctamente' });
    }
    catch (error) {
        res.status(400).json({ ok: false, msg: error.message });
    }
});
exports.deleteUsuario = deleteUsuario;
const cambiarPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { rut, password, newPassword } = req.body;
    try {
        yield usuario_service_1.default.changePassword(rut, password, newPassword);
        res.json({ ok: true, msg: 'Contraseña actualizada correctamente' });
    }
    catch (error) {
        res.status(400).json({ ok: false, msg: error.message });
    }
});
exports.cambiarPassword = cambiarPassword;
const getPacientesConCitasPagadasYEnCurso = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { rut_medico } = req.params;
    try {
        const pacientes = yield usuario_service_1.default.getPatientsWithAppointments(rut_medico, ['en_curso', 'pagado', 'terminado']);
        res.json({
            ok: true,
            usuarios: pacientes,
            total: pacientes.length
        });
    }
    catch (error) {
        res.status(500).send('Error interno del servidor');
    }
});
exports.getPacientesConCitasPagadasYEnCurso = getPacientesConCitasPagadasYEnCurso;
const getPacientesConCitasPagadasYEnCursoYterminado = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { rut_medico } = req.params;
    try {
        const pacientes = yield usuario_service_1.default.getPatientsWithAppointments(rut_medico, ['en_curso', 'pagado', 'terminado']);
        res.json({
            ok: true,
            usuarios: pacientes,
            total: pacientes.length
        });
    }
    catch (error) {
        res.status(500).send('Error interno del servidor');
    }
});
exports.getPacientesConCitasPagadasYEnCursoYterminado = getPacientesConCitasPagadasYEnCursoYterminado;
// Controladores para las consultas específicas de pacientes...
//# sourceMappingURL=usuario.js.map