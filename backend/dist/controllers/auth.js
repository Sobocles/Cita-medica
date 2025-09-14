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
const auth_service_1 = __importDefault(require("../services/auth.service"));
const rol_service_1 = __importDefault(require("../services/rol.service"));
const api_response_1 = __importDefault(require("../Utils/api-response"));
/**
 * Controlador para manejar la autenticación y autorización de usuarios
 */
class Auth {
    constructor() {
        /**
         * Endpoint para iniciar sesión
         */
        this.login = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { email, password } = req.body;
            console.log("AQUI ESTA EL LOGIN!!!!!!!!!!!!");
            try {
                // Autenticar usuario (incluye validación de credenciales, generación de token y menú)
                const resultado = yield this.authService.autenticarUsuario(email, password);
                return api_response_1.default.success(res, resultado);
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Error al autenticar';
                // Determinar código de estado según el mensaje de error
                let statusCode = 500;
                if (errorMessage.includes('inactivo'))
                    statusCode = 403;
                else if (errorMessage.includes('no encontrado'))
                    statusCode = 404;
                else if (errorMessage.includes('no válida'))
                    statusCode = 400;
                return api_response_1.default.error(res, errorMessage, statusCode);
            }
        });
        /**
         * Endpoint para registrar un nuevo usuario
         */
        this.registro = (req, res) => __awaiter(this, void 0, void 0, function* () {
            console.log("entro a crear usuario");
            const { email, password, nombre, apellidos, telefono } = req.body;
            try {
                // Verificar si el correo ya está registrado
                if (yield this.authService.verificarEmailExistente(email)) {
                    return api_response_1.default.error(res, 'El correo ya está registrado');
                }
                // Verificar si el teléfono ya está registrado
                if (yield this.authService.verificarTelefonoExistente(telefono)) {
                    return api_response_1.default.error(res, 'El teléfono ya está registrado');
                }
                // Registrar usuario (incluye asignación de rol, generación de token y menú)
                const resultado = yield this.authService.registrarUsuario(req.body);
                // Enviar respuesta exitosa
                return api_response_1.default.success(res, resultado, 201);
            }
            catch (error) {
                return api_response_1.default.serverError(res, error);
            }
        });
        /**
         * Endpoint para recuperar contraseña
         */
        this.recuperarPassword = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { nombre, email } = req.body;
            try {
                const resultado = yield this.authService.recuperarPassword(nombre, email);
                return api_response_1.default.success(res, resultado);
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Error al recuperar contraseña';
                // Determinar código de estado según el mensaje de error
                let statusCode = 400;
                return api_response_1.default.error(res, errorMessage, statusCode);
            }
        });
        /**
         * Endpoint para revalidar el token
         */
        this.revalidarToken = (req, res) => __awaiter(this, void 0, void 0, function* () {
            console.log('🔄 Iniciando revalidación de token en el backend');
            try {
                const rut = req.rut;
                const rol = req.rol;
                console.log('🔄 Datos extraídos del token JWT:', { rut, rol });
                if (!rol) {
                    console.error('🔄 Error: Rol no definido en el token');
                    return api_response_1.default.error(res, 'Rol no definido', 400);
                }
                if (!rut) {
                    console.error('🔄 Error: RUT no definido en el token');
                    return api_response_1.default.error(res, 'RUT no definido', 400);
                }
                console.log('🔄 Llamando a authService.revalidarToken con:', { rut, rol });
                const resultado = yield this.authService.revalidarToken(rut, rol);
                console.log('🔄 Resultado de authService.revalidarToken:', resultado);
                return api_response_1.default.success(res, resultado);
            }
            catch (error) {
                console.error('🔄 Error en revalidación de token:', error);
                return api_response_1.default.serverError(res, error);
            }
        });
        this.authService = auth_service_1.default.instance;
        this.rolService = rol_service_1.default.instance;
    }
    static get instance() {
        return this._instance || (this._instance = new Auth());
    }
}
exports.default = Auth;
//# sourceMappingURL=auth.js.map