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
const express_1 = __importDefault(require("express"));
const usuario_1 = __importDefault(require("../routes/usuario"));
const auth_1 = __importDefault(require("../routes/auth"));
const medico_1 = __importDefault(require("../routes/medico"));
const historial_medico_1 = __importDefault(require("../routes/historial_medico"));
const horario_medico_1 = __importDefault(require("../routes/horario_medico"));
const cita_medica_1 = __importDefault(require("../routes/cita_medica"));
const tipo_cita_1 = __importDefault(require("../routes/tipo_cita"));
const busquedas_1 = __importDefault(require("../routes/busquedas"));
const horario_clinica_1 = __importDefault(require("../routes/horario_clinica"));
const busqueda_cita_1 = __importDefault(require("../routes/busqueda_cita"));
const mercadoPago_1 = __importDefault(require("../routes/mercadoPago"));
const cors_1 = __importDefault(require("cors"));
const connection_1 = __importDefault(require("../db/connection"));
const enviorenment_1 = require("../global/enviorenment");
class Server {
    constructor() {
        this.apiPaths = {
            usuarios: '/api/usuarios',
            login: '/api/login',
            medicos: '/api/medicos',
            historial_medico: '/api/historial',
            horario_laboral: '/api/horario_medico',
            cita_medica: '/api/cita_medica',
            tipo_cita: '/api/tipo_cita',
            busqueda: '/api/busqueda',
            horario_clinica: '/api/horario_clinica',
            busqueda_cita: '/api/busqueda_cita',
            paypal: '/api/paypal',
            mercadoPago: '/api/mercadoPago',
        };
        this.app = (0, express_1.default)();
        //Metodos iniciales
        this.dbConnection();
        this.middlewares();
        this.routes();
    }
    dbConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield connection_1.default.authenticate();
                console.log('Database online');
            }
            catch (error) {
                throw new Error(String(error));
            }
        });
    }
    middlewares() {
        // CORS
        this.app.use((0, cors_1.default)({
            origin: '*',
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
            credentials: true
        }));
        // Lectura del body
        this.app.use(express_1.default.json());
        // Carpeta Pública
        this.app.use(express_1.default.static('public'));
    }
    routes() {
        //app.use( '/api/usuarios', require('./routes/usuarios') );
        this.app.use(this.apiPaths.usuarios, usuario_1.default);
        this.app.use(this.apiPaths.login, auth_1.default);
        this.app.use(this.apiPaths.medicos, medico_1.default);
        this.app.use(this.apiPaths.historial_medico, historial_medico_1.default);
        this.app.use(this.apiPaths.horario_laboral, horario_medico_1.default);
        this.app.use(this.apiPaths.cita_medica, cita_medica_1.default);
        this.app.use(this.apiPaths.tipo_cita, tipo_cita_1.default);
        this.app.use(this.apiPaths.busqueda, busquedas_1.default);
        this.app.use(this.apiPaths.horario_clinica, horario_clinica_1.default);
        this.app.use(this.apiPaths.busqueda_cita, busqueda_cita_1.default);
        this.app.use(this.apiPaths.mercadoPago, mercadoPago_1.default);
    }
    listen() {
        this.app.listen(enviorenment_1.PORT, () => {
            console.log('Servidor corriendo en puerto ' + enviorenment_1.PORT);
        });
    }
}
exports.default = Server;
//# sourceMappingURL=server.js.map