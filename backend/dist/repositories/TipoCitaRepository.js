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
exports.TipoCitaRepository = void 0;
const sequelize_1 = require("sequelize");
const tipo_cita_1 = __importDefault(require("../models/tipo_cita"));
/**
 * Repositorio para manejar el acceso a datos de tipos de cita
 */
class TipoCitaRepository {
    /**
     * Busca y cuenta todos los tipos de cita con opciones
     */
    findAndCountAll(options) {
        return __awaiter(this, void 0, void 0, function* () {
            return tipo_cita_1.default.findAndCountAll(options);
        });
    }
    /**
     * Busca un tipo de cita por su ID
     */
    findByPk(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return tipo_cita_1.default.findByPk(id);
        });
    }
    /**
     * Busca un tipo de cita con opciones específicas
     */
    findOne(options) {
        return __awaiter(this, void 0, void 0, function* () {
            return tipo_cita_1.default.findOne(options);
        });
    }
    /**
     * Busca todos los tipos de cita con opciones específicas
     */
    findAll(options) {
        return __awaiter(this, void 0, void 0, function* () {
            return tipo_cita_1.default.findAll(options);
        });
    }
    /**
     * Crea un nuevo tipo de cita
     */
    create(tipoCitaData) {
        return __awaiter(this, void 0, void 0, function* () {
            return tipo_cita_1.default.create(tipoCitaData);
        });
    }
    /**
     * Actualiza un tipo de cita por su ID
     */
    update(id, tipoCitaData) {
        return __awaiter(this, void 0, void 0, function* () {
            const tipoCita = yield tipo_cita_1.default.findByPk(id);
            if (!tipoCita)
                return null;
            return tipoCita.update(tipoCitaData);
        });
    }
    /**
     * Desactiva un tipo de cita (soft delete)
     */
    desactivar(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const tipoCita = yield tipo_cita_1.default.findByPk(id);
            if (!tipoCita)
                return null;
            return tipoCita.update({ estado: 'inactivo' });
        });
    }
    /**
     * Obtiene todas las especialidades médicas activas únicas
     * Agrupa por especialidad_medica
     */
    findActiveEspecialidades() {
        return __awaiter(this, void 0, void 0, function* () {
            return tipo_cita_1.default.findAll({
                attributes: ['especialidad_medica'],
                where: {
                    especialidad_medica: { [sequelize_1.Op.ne]: null },
                    estado: 'activo'
                },
                group: ['especialidad_medica'],
                order: [['especialidad_medica', 'ASC']]
            });
        });
    }
    /**
     * Obtiene las especialidades médicas como un array de strings
     */
    getEspecialidadesArray() {
        return __awaiter(this, void 0, void 0, function* () {
            const tipos = yield tipo_cita_1.default.findAll({
                attributes: ['especialidad_medica'],
                where: {
                    especialidad_medica: { [sequelize_1.Op.ne]: null },
                    estado: 'activo'
                },
                group: ['especialidad_medica']
            });
            return tipos.map(tipo => tipo.especialidad_medica).filter(Boolean);
        });
    }
    /**
     * Cuenta tipos de cita con opciones específicas
     */
    count(options) {
        return __awaiter(this, void 0, void 0, function* () {
            return tipo_cita_1.default.count(options);
        });
    }
}
exports.TipoCitaRepository = TipoCitaRepository;
exports.default = new TipoCitaRepository();
//# sourceMappingURL=TipoCitaRepository.js.map