"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// models/usuario.ts
const sequelize_1 = require("sequelize");
const connection_1 = __importDefault(require("../db/connection"));
const rol_1 = __importDefault(require("./rol"));
class Usuario extends sequelize_1.Model {
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
        return 'USER_ROLE';
    }
}
Usuario.init({
    rut: {
        type: sequelize_1.DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
    },
    nombre: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    apellidos: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    password: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    fecha_nacimiento: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    telefono: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    direccion: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    rolId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: rol_1.default,
            key: 'id'
        },
        defaultValue: 3 // Por defecto, ID del rol 'Usuario' (USER_ROLE)
    },
    estado: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        defaultValue: 'activo'
    },
}, {
    sequelize: connection_1.default,
    modelName: 'Usuario',
    tableName: 'usuarios',
});
exports.default = Usuario;
//# sourceMappingURL=usuario.js.map