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
exports.buscarmedico = void 0;
const busqueda_cita_service_1 = __importDefault(require("../services/busqueda-cita.service"));
const response_helper_1 = __importDefault(require("../helpers/response.helper"));
/**
 * Controlador para búsqueda de médicos y horarios disponibles
 * RESPONSABILIDAD: Solo manejar request/response, delegar lógica al servicio
 *
 * ANTES: 272 líneas con funciones auxiliares y lógica compleja
 * AHORA: ~30 líneas, solo coordina entre HTTP y servicio
 */
/**
 * Busca médicos disponibles para una especialidad y fecha específica
 * Retorna bloques de tiempo disponibles para agendar citas
 */
const buscarmedico = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { especialidad, fecha } = req.body;
        const bloques = yield busqueda_cita_service_1.default.buscarMedicosDisponibles(especialidad, fecha);
        return response_helper_1.default.successWithCustomData(res, { bloques });
    }
    catch (error) {
        console.error('Error al buscar médico:', error);
        if (error.message === 'Tipo de cita no encontrado') {
            return response_helper_1.default.notFound(res, error.message);
        }
        if (error.message.includes('no proporcionados correctamente')) {
            return response_helper_1.default.badRequest(res, error.message);
        }
        return response_helper_1.default.serverError(res, 'Error al buscar médicos disponibles', error);
    }
});
exports.buscarmedico = buscarmedico;
//# sourceMappingURL=busqueda_cita.js.map