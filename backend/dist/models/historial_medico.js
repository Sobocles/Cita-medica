"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../db/connection")); // Asegúrate de importar tu conexión a la base de datos
const usuario_1 = __importDefault(require("../models/usuario")); // Importa el modelo de paciente
const medico_1 = __importDefault(require("./medico"));
class HistorialMedico extends sequelize_1.Model {
}
// Define el modelo para el historial médico
HistorialMedico.init({
    id_historial: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    diagnostico: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    medicamento: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    notas: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    fecha_consulta: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    archivo: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    rut_paciente: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        references: {
            model: usuario_1.default,
            key: 'rut'
        }
    },
    rut_medico: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        references: {
            model: medico_1.default,
            key: 'rut'
        }
    },
    estado: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        defaultValue: 'activo' // Valor por defecto es 'activo'
    },
}, {
    sequelize: connection_1.default,
    modelName: 'HistorialMedico', // Nombre de la tabla en la base de datos
});
exports.default = HistorialMedico;
//# sourceMappingURL=historial_medico.js.map