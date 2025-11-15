"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// services/auth.service.ts
const bcrypt_1 = __importDefault(require("bcrypt"));
const jwt_1 = __importDefault(require("../helpers/jwt"));
const emails_1 = __importDefault(require("../helpers/emails"));
const rol_service_1 = __importDefault(require("./rol.service"));
const menu_frontend_1 = require("../helpers/menu-frontend");
const generatePassword = __importStar(require("generate-password"));
const enums_1 = require("../types/enums");
const usuario_repository_1 = __importDefault(require("../repositories/usuario.repository"));
const medico_repository_1 = __importDefault(require("../repositories/medico.repository"));
const rol_repository_1 = __importDefault(require("../repositories/rol.repository"));
const InfoClinicaRepository_1 = __importDefault(require("../repositories/InfoClinicaRepository"));
const rol_1 = __importDefault(require("../models/rol"));
/**
 * Servicio de autenticación que maneja todas las operaciones relacionadas
 * con el registro, login y gestión de credenciales de usuarios.
 */
class AuthService {
    constructor() {
        this.rolService = rol_service_1.default.instance;
    }
    static get instance() {
        return this._instance || (this._instance = new AuthService());
    }
    /**
     * Verifica si un email ya está registrado en el sistema
     * @param email Email a verificar
     * @returns true si el email existe, false si no
     */
    verificarEmailExistente(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const usuarioExistente = yield usuario_repository_1.default.findOne({ where: { email } });
            if (usuarioExistente)
                return true;
            const medicoExistente = yield medico_repository_1.default.findOne({ where: { email } });
            if (medicoExistente)
                return true;
            return false;
        });
    }
    /**
     * Verifica si un teléfono ya está registrado en el sistema
     * @param telefono Teléfono a verificar
     * @returns true si el teléfono existe, false si no
     */
    verificarTelefonoExistente(telefono) {
        return __awaiter(this, void 0, void 0, function* () {
            const usuarioExistente = yield usuario_repository_1.default.findOne({ where: { telefono } });
            if (usuarioExistente)
                return true;
            const medicoExistente = yield medico_repository_1.default.findOne({ where: { telefono } });
            if (medicoExistente)
                return true;
            return false;
        });
    }
    /**
     * Registra un nuevo usuario en el sistema
     * @param userData Datos del usuario a registrar
     * @returns Objeto con el usuario registrado, token JWT y menú según su rol
     */
    registrarUsuario(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("🔍 INICIANDO REGISTRO DE USUARIO");
            console.log("🔍 userData recibido:", userData);
            // ✅ BUSCAR Y ASIGNAR ROL DE USUARIO POR CÓDIGO (OPCIÓN ROBUSTA)
            console.log("🔍 Buscando rol USER_ROLE en la base de datos...");
            const rolUsuario = yield rol_repository_1.default.findByCode('USER_ROLE');
            console.log("🔍 Resultado de búsqueda de rol:", rolUsuario);
            if (!rolUsuario) {
                console.error("❌ Error: Rol USER_ROLE no encontrado");
                throw new Error('Rol de usuario no encontrado en el sistema');
            }
            console.log("✅ Rol encontrado:", { id: rolUsuario.id, codigo: rolUsuario.codigo });
            // Asignar el rolId encontrado
            userData.rolId = rolUsuario.id;
            console.log("✅ rolId asignado a userData:", userData.rolId);
            // Encriptar la contraseña
            const salt = bcrypt_1.default.genSaltSync();
            userData.password = bcrypt_1.default.hashSync(userData.password, salt);
            console.log("---------------AQUI EL USUARIO CON ROLID------------", userData);
            console.log("password encriptado", userData.password);
            console.log("rolId FINAL asignado:", userData.rolId);
            // Crear usuario en la base de datos
            console.log("🔍 Creando usuario en la base de datos...");
            const nuevoUsuario = yield usuario_repository_1.default.create(userData);
            console.log("✅ Usuario creado con rolId:", nuevoUsuario.rolId);
            // Obtener el rol del usuario (ya sabemos que existe)
            const rolCodigo = rolUsuario.codigo;
            console.log("✅ Código de rol para JWT:", rolCodigo);
            // Generar JWT usando el código del rol
            const token = yield jwt_1.default.instance.generarJWT(nuevoUsuario.rut, nuevoUsuario.nombre, nuevoUsuario.apellidos, rolCodigo // Usamos el código del rol
            );
            console.log("✅ JWT generado con rol:", rolCodigo);
            // Obtener menú según el rol
            const menu = (0, menu_frontend_1.getMenuFrontEnd)(rolCodigo);
            // Obtener información de la clínica
            const infoClinica = yield InfoClinicaRepository_1.default.findOne();
            // Datos para devolver (excluir contraseña)
            const usuarioJSON = nuevoUsuario.toJSON();
            // Agregar el rol como propiedad separada para compatibilidad
            usuarioJSON.rol = rolCodigo;
            console.log("✅ Usuario JSON final con rol:", usuarioJSON.rol);
            const { password } = usuarioJSON, usuarioSinPassword = __rest(usuarioJSON, ["password"]);
            return {
                userOrMedico: usuarioSinPassword,
                token,
                menu,
                infoClinica
            };
        });
    }
    /**
     * Autentica a un usuario en el sistema
     * @param email Email del usuario
     * @param password Contraseña del usuario
     * @returns Objeto con el usuario autenticado, token JWT y menú según su rol
     * @throws Error si las credenciales son inválidas o el usuario está inactivo
     */
    autenticarUsuario(email, password) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            // Buscar primero en usuarios
            let entidadAutenticada = null;
            let rolCodigo = '';
            // Intentar autenticar como usuario regular
            const usuario = yield usuario_repository_1.default.findOne({
                where: { email },
                include: [{
                        model: rol_1.default,
                        as: 'rol'
                    }]
            });
            if (usuario) {
                // Verificar si está activo
                if (usuario.estado === 'inactivo') {
                    throw new Error('El usuario está inactivo');
                }
                // Verificar contraseña
                const validPassword = bcrypt_1.default.compareSync(password, usuario.password);
                if (!validPassword) {
                    throw new Error('Contraseña no válida');
                }
                entidadAutenticada = usuario;
                // Convertir el modelo de Sequelize a un objeto plano de JavaScript
                const usuarioJSON = usuario.toJSON();
                // Extraer el código del rol de forma segura
                rolCodigo = ((_a = usuarioJSON.rol) === null || _a === void 0 ? void 0 : _a.codigo) || enums_1.UserRole.USER;
                // Agregar el rol como propiedad directa para compatibilidad con el frontend
                usuarioJSON.rol = rolCodigo;
                entidadAutenticada = usuarioJSON;
            }
            else {
                // Si no es usuario, intentar como médico
                const medico = yield medico_repository_1.default.findOne({ where: { email } });
                if (medico) {
                    // Verificar si está activo
                    if (medico.estado === 'inactivo') {
                        throw new Error('El médico está inactivo');
                    }
                    // Verificar contraseña
                    const validPassword = bcrypt_1.default.compareSync(password, medico.password);
                    if (!validPassword) {
                        throw new Error('Contraseña no válida');
                    }
                    entidadAutenticada = medico.toJSON();
                    rolCodigo = medico.rol || enums_1.UserRole.MEDICO;
                }
                else {
                    // Si no se encontró ni como usuario ni como médico
                    throw new Error('Usuario o médico no encontrado');
                }
            }
            // Generar JWT
            const token = yield jwt_1.default.instance.generarJWT(entidadAutenticada.rut, entidadAutenticada.nombre, entidadAutenticada.apellidos, rolCodigo);
            // Obtener menú según el rol
            const menu = (0, menu_frontend_1.getMenuFrontEnd)(rolCodigo);
            // Obtener información de la clínica
            const infoClinica = yield InfoClinicaRepository_1.default.findOne();
            // Datos para devolver (excluir contraseña)
            const { password: _ } = entidadAutenticada, entidadSinPassword = __rest(entidadAutenticada, ["password"]);
            return {
                userOrMedico: entidadSinPassword,
                token,
                menu,
                infoClinica,
                rol: rolCodigo // Mantener esta propiedad para compatibilidad
            };
        });
    }
    /**
     * Revalida un token JWT existente
     * @param rut RUT del usuario o médico
     * @param rol Rol del usuario o médico
     * @returns Nuevo token JWT y datos del usuario o médico
     * @throws Error si el usuario o médico no existe
     */
    revalidarToken(rut, rol) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            console.log('🔍 Backend AuthService - revalidarToken iniciado con:', { rut, rol });
            let userOrMedico;
            // Buscar según el rol
            if (rol === enums_1.UserRole.USER || rol === enums_1.UserRole.ADMIN) {
                console.log('🔍 Buscando usuario con rut:', rut);
                userOrMedico = yield usuario_repository_1.default.findOne({
                    where: { rut },
                    include: [{
                            model: rol_1.default,
                            as: 'rol'
                        }]
                });
                if (userOrMedico) {
                    console.log('🔍 Usuario encontrado:', userOrMedico.nombre);
                    // Convertir a JSON y asegurarnos de que rol sea una cadena para el frontend
                    const usuarioJSON = userOrMedico.toJSON();
                    console.log('🔍 Usuario JSON antes de procesamiento:', usuarioJSON);
                    // Extraer el código del rol de forma segura
                    const rolCodigo = ((_a = usuarioJSON.rol) === null || _a === void 0 ? void 0 : _a.codigo) || rol;
                    console.log('🔍 Código de rol extraído:', rolCodigo);
                    // Agregar el rol como propiedad directa para compatibilidad
                    usuarioJSON.rol = rolCodigo;
                    userOrMedico = usuarioJSON;
                    console.log('🔍 Usuario JSON después de procesamiento:', userOrMedico);
                }
                else {
                    console.log('🔍 No se encontró usuario con rut:', rut);
                }
            }
            else if (rol === enums_1.UserRole.MEDICO) {
                console.log('🔍 Buscando médico con rut:', rut);
                userOrMedico = yield medico_repository_1.default.findOne({
                    where: { rut },
                    include: [{
                            model: rol_1.default,
                            as: 'rol'
                        }]
                });
                if (userOrMedico) {
                    console.log('🔍 Médico encontrado:', userOrMedico.nombre);
                    const medicoJSON = userOrMedico.toJSON();
                    console.log('🔍 Médico JSON antes de procesamiento:', medicoJSON);
                    // Extraer el código del rol de forma segura
                    const rolCodigo = ((_b = medicoJSON.rol) === null || _b === void 0 ? void 0 : _b.codigo) || rol;
                    console.log('🔍 Código de rol extraído:', rolCodigo);
                    // Agregar el rol como propiedad directa para compatibilidad
                    medicoJSON.rol = rolCodigo;
                    userOrMedico = medicoJSON;
                    console.log('🔍 Médico JSON después de procesamiento:', userOrMedico);
                }
                else {
                    console.log('🔍 No se encontró médico con rut:', rut);
                }
            }
            if (!userOrMedico) {
                console.error('🔍 Error: Usuario o médico no encontrado con rut:', rut);
                throw new Error('Usuario o médico no encontrado');
            }
            // Obtener información de la clínica
            console.log('🔍 Obteniendo información de la clínica');
            const infoClinica = yield InfoClinicaRepository_1.default.findOne();
            // Generar nuevo token
            console.log('🔍 Generando nuevo token para:', { rut, nombre: userOrMedico.nombre, rol });
            const newToken = yield jwt_1.default.instance.generarJWT(userOrMedico.rut, userOrMedico.nombre, userOrMedico.apellidos, rol // Aquí ya recibimos el código del rol, no el ID
            );
            // Obtener menú según el rol
            console.log('🔍 Obteniendo menú para rol:', rol);
            const menu = (0, menu_frontend_1.getMenuFrontEnd)(rol);
            // Excluir contraseña
            const { password } = userOrMedico, userOrMedicoSinPassword = __rest(userOrMedico, ["password"]);
            const resultado = {
                token: newToken,
                userOrMedico: userOrMedicoSinPassword,
                menu,
                infoClinica,
                rol // Incluir explícitamente el rol en la respuesta
            };
            console.log('🔍 Respuesta final de revalidarToken:', {
                token: newToken ? 'Token generado' : 'Error en token',
                userOrMedico: 'Datos procesados',
                menu: menu ? `Menú con ${menu.length} items` : 'Sin menú',
                infoClinica: infoClinica ? 'Información de clínica presente' : 'Sin información de clínica',
                rol
            });
            return resultado;
        });
    }
    /**
     * Recupera la contraseña de un usuario o médico
     * @param nombre Nombre del usuario o médico
     * @param email Email del usuario o médico
     * @returns Mensaje de éxito si se envió el correo
     * @throws Error si no se encuentra el usuario o médico o los datos son incorrectos
     */
    recuperarPassword(nombre, email) {
        return __awaiter(this, void 0, void 0, function* () {
            // Intentar encontrar primero en usuarios
            let entidad = yield usuario_repository_1.default.findOne({ where: { nombre } });
            let esUsuario = true;
            if (!entidad) {
                // Si no es usuario, buscar en médicos
                entidad = yield medico_repository_1.default.findOne({ where: { nombre } });
                esUsuario = false;
                if (!entidad) {
                    throw new Error('El usuario o médico no existe');
                }
            }
            // Verificar si está inactivo
            if (entidad.estado === 'inactivo') {
                throw new Error('El usuario o médico está inactivo y no puede recuperar la contraseña');
            }
            // Verificar email
            if (email !== entidad.email) {
                throw new Error('El email es incorrecto');
            }
            // Generar nueva contraseña
            const password = generatePassword.generate({ length: 10, numbers: true });
            // Encriptar nueva contraseña
            const salt = bcrypt_1.default.genSaltSync();
            const hashedPassword = bcrypt_1.default.hashSync(password, salt);
            // Actualizar contraseña usando el repositorio apropiado
            if (esUsuario) {
                yield usuario_repository_1.default.update(entidad, { password: hashedPassword });
            }
            else {
                yield medico_repository_1.default.update(entidad, { password: hashedPassword });
            }
            // Enviar correo con nueva contraseña
            emails_1.default.instance.enviarEmail(email, nombre, password);
            return {
                msg: `Correo enviado a: ${email} satisfactoriamente`
            };
        });
    }
}
exports.default = AuthService;
//# sourceMappingURL=auth.service.js.map