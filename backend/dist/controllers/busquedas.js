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
exports.getTodo = exports.getDocumentosColeccion = void 0;
const busqueda_service_1 = __importDefault(require("../services/busqueda.service"));
const response_helper_1 = __importDefault(require("../helpers/response.helper"));
/**
 * Controlador para manejar búsquedas en diferentes colecciones
 * RESPONSABILIDAD: Solo manejar request/response, delegar lógica al servicio
 *
 * ANTES: 236 líneas con switch gigante y lógica de negocio
 * AHORA: ~50 líneas, solo coordina entre HTTP y servicio
 */
/**
 * Busca documentos en una colección específica
 */
const getDocumentosColeccion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { tabla, busqueda } = req.params;
        console.log('Búsqueda en tabla:', tabla, 'término:', busqueda);
        const data = yield busqueda_service_1.default.buscarEnColeccion(tabla, busqueda);
        return response_helper_1.default.successWithCustomData(res, { citas: data });
    }
    catch (error) {
        console.error('Error en búsqueda por colección:', error);
        if (error.message.includes('no soportada')) {
            return response_helper_1.default.badRequest(res, error.message);
        }
        return response_helper_1.default.serverError(res, 'Error al buscar en la colección', error);
    }
});
exports.getDocumentosColeccion = getDocumentosColeccion;
/**
 * Busca en todas las colecciones (búsqueda global)
 */
const getTodo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { busqueda } = req.params;
        console.log('Búsqueda global:', busqueda);
        const resultados = yield busqueda_service_1.default.buscarTodo(busqueda);
        return response_helper_1.default.successWithCustomData(res, { resultados });
    }
    catch (error) {
        console.error('Error en búsqueda global:', error);
        return response_helper_1.default.serverError(res, 'Error en la búsqueda', error);
    }
});
exports.getTodo = getTodo;
//# sourceMappingURL=busquedas.js.map