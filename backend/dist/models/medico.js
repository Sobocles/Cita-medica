"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// models/medico.ts
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../db/connection"));
const rol_1 = __importDefault(require("./rol"));
class Medico extends sequelize_1.Model {
    // Método para obtener el código del rol de manera segura
    getRolCodigo() {
        // Si rol es un objeto con propiedad codigo (relación cargada)
        if (this.rol && typeof this.rol === 'object' && this.rol.codigo) {
            return this.rol.codigo;
        }
        // Si rol es directamente una cadena (compatibilidad con código anterior)
        if (this.rol && typeof this.rol === 'string') {
            return this.rol;
        }
        // Valor por defecto
        return 'MEDICO_ROLE';
    }
}
Medico.init({
    rut: {
        type: sequelize_1.DataTypes.STRING,
        primaryKey: true,
    },
    nombre: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    apellidos: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    telefono: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    direccion: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    foto: {
        type: sequelize_1.DataTypes.STRING,
    },
    nacionalidad: {
        type: sequelize_1.DataTypes.STRING,
    },
    especialidad_medica: {
        type: sequelize_1.DataTypes.STRING,
    },
    password: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    rolId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: rol_1.default,
            key: 'id'
        },
        defaultValue: 2 // ID del rol MEDICO_ROLE (asumiendo que es 3)
    },
    estado: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        defaultValue: 'activo'
    },
}, {
    sequelize: connection_1.default,
    modelName: 'Medico',
    tableName: 'medicos'
});
exports.default = Medico;
//# sourceMappingURL=medico.js.map