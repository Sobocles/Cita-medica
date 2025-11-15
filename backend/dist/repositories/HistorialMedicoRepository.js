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
exports.HistorialMedicoRepository = void 0;
const historial_medico_1 = __importDefault(require("../models/historial_medico"));
class HistorialMedicoRepository {
    findAndCountAll(options) {
        return __awaiter(this, void 0, void 0, function* () {
            return historial_medico_1.default.findAndCountAll(options);
        });
    }
    findByPk(id_historial, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return historial_medico_1.default.findByPk(id_historial, options);
        });
    }
    findOne(options) {
        return __awaiter(this, void 0, void 0, function* () {
            return historial_medico_1.default.findOne(options);
        });
    }
    create(historialData) {
        return __awaiter(this, void 0, void 0, function* () {
            return historial_medico_1.default.create(historialData);
        });
    }
    update(historial, historialData) {
        return __awaiter(this, void 0, void 0, function* () {
            return historial.update(historialData);
        });
    }
    count(options) {
        return __awaiter(this, void 0, void 0, function* () {
            return historial_medico_1.default.count(options);
        });
    }
    /**
     * Actualiza historiales médicos que cumplen con las condiciones especificadas
     */
    updateWhere(where, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return historial_medico_1.default.update(data, { where });
        });
    }
}
exports.HistorialMedicoRepository = HistorialMedicoRepository;
exports.default = new HistorialMedicoRepository();
//# sourceMappingURL=HistorialMedicoRepository.js.map