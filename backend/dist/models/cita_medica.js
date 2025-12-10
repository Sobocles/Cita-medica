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
    // Campos de precios y descuentos
    precio_original: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Precio original sin descuento (precio particular)'
    },
    precio_final: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Precio final que el paciente pagó (con descuento si aplica)'
    },
    tipo_prevision_aplicada: {
        type: sequelize_1.DataTypes.ENUM('Fonasa', 'Isapre', 'Particular'),
        allowNull: true,
        comment: 'Tipo de previsión que se aplicó para esta cita'
    },
    descuento_aplicado: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
        comment: 'Monto del descuento aplicado en pesos chilenos'
    },
    porcentaje_descuento: {
        type: sequelize_1.DataTypes.DECIMAL(5, 2),
        allowNull: true,
        defaultValue: 0,
        comment: 'Porcentaje de descuento aplicado (0-100)'
    },
    // Campos de validación de previsión
    requiere_validacion_prevision: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica si el paciente debe traer documentos de previsión'
    },
    prevision_validada: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica si se validó la previsión presencialmente'
    },
    diferencia_pagada_efectivo: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
        comment: 'Diferencia pagada en efectivo si no presentó documentos'
    },
    observaciones_validacion: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        comment: 'Observaciones sobre la validación de previsión'
    },
}, {
    sequelize: connection_1.default,
    modelName: 'CitaMedica',
    tableName: 'citamedicas'
});
exports.default = CitaMedica;
//# sourceMappingURL=cita_medica.js.map