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
    // Método para obtener idiomas como array
    getIdiomas() {
        try {
            return this.idiomas ? JSON.parse(this.idiomas) : [];
        }
        catch (error) {
            return [];
        }
    }
    // Método para obtener certificaciones como array
    getCertificaciones() {
        try {
            return this.certificaciones ? JSON.parse(this.certificaciones) : [];
        }
        catch (error) {
            return [];
        }
    }
    // Método para obtener documentos como array de objetos
    getDocumentos() {
        try {
            return this.documentos_s3_keys ? JSON.parse(this.documentos_s3_keys) : [];
        }
        catch (error) {
            return [];
        }
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
    imagen_s3_key: {
        type: sequelize_1.DataTypes.STRING(300),
        allowNull: true,
        comment: 'Key de la imagen del médico en S3 (bucket privado)'
    },
    // ============================================
    // NUEVOS CAMPOS - INFORMACIÓN PROFESIONAL
    // ============================================
    titulo_profesional: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: true,
        comment: 'Título profesional del médico (ej: Médico Cirujano)'
    },
    subespecialidad: {
        type: sequelize_1.DataTypes.STRING(150),
        allowNull: true,
        comment: 'Subespecialidad médica si tiene'
    },
    registro_medico: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: true,
        comment: 'Número de registro profesional'
    },
    universidad: {
        type: sequelize_1.DataTypes.STRING(200),
        allowNull: true,
        comment: 'Universidad de egreso'
    },
    anio_titulacion: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 1950,
            max: new Date().getFullYear()
        },
        comment: 'Año de titulación'
    },
    anios_experiencia: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 0,
            max: 60
        },
        comment: 'Años de experiencia profesional'
    },
    idiomas: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        comment: 'JSON array de idiomas que habla (ej: ["Español", "Inglés"])'
    },
    certificaciones: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        comment: 'JSON array de certificaciones adicionales'
    },
    biografia: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        comment: 'Biografía o descripción del médico (máx 1000 caracteres)'
    },
    documentos_s3_keys: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        comment: 'JSON array de objetos con documentos en S3 [{nombre: string, key: string}]'
    },
}, {
    sequelize: connection_1.default,
    modelName: 'Medico',
    tableName: 'medicos'
});
exports.default = Medico;
//# sourceMappingURL=medico.js.map