"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CitaMedica = void 0;
// cita_medica.ts
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../db/connection"));
class CitaMedica extends sequelize_1.Model {
}
exports.CitaMedica = CitaMedica;
CitaMedica.init({
    idCita: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    motivo: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    rut_paciente: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        references: {
            model: 'usuarios',
            key: 'rut',
        },
    },
    rut_medico: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        references: {
            model: 'medicos',
            key: 'rut',
        },
    },
    fecha: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    hora_inicio: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    hora_fin: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    estado: {
        type: sequelize_1.DataTypes.ENUM('en_curso', 'terminado', 'no_asistio', 'pagado', 'no_pagado', 'cancelada'),
        allowNull: false,
        defaultValue: 'en_curso',
    },
    descripcion: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    idTipoCita: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'tipocitas',
            key: 'idTipoCita',
        }
    },
    estado_actividad: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        defaultValue: 'activo'
    },
}, {
    sequelize: connection_1.default,
    modelName: 'CitaMedica',
    tableName: 'citamedicas'
});
exports.default = CitaMedica;
//# sourceMappingURL=cita_medica.js.map