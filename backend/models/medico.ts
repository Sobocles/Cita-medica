// models/medico.ts
import { DataTypes, Model } from 'sequelize';
import db from '../db/connection';
import Rol from './rol';

class Medico extends Model {
  public rut!: string;
  public nombre!: string;
  public apellidos!: string;
  public email!: string;
  public telefono!: string;
  public direccion!: string;
  public foto!: string;
  public nacionalidad!: string;
  public especialidad_medica!: string;
  public password!: string;
  public rolId!: number;  // Campo real en la BD que relaciona con Rol
  public rol?: any;       // Propiedad virtual para compatibilidad
  public estado!: string;
  public imagen_s3_key?: string; // Key de S3 para la imagen de perfil (bucket privado)

  // ============================================
  // NUEVOS CAMPOS - INFORMACIÓN PROFESIONAL
  // ============================================
  public titulo_profesional?: string;    // Ej: "Médico Cirujano"
  public subespecialidad?: string;       // Ej: "Cardiología Intervencionista"
  public registro_medico?: string;       // Número de registro profesional
  public universidad?: string;           // Universidad de egreso
  public anio_titulacion?: number;       // Año de titulación
  public anios_experiencia?: number;     // Años de experiencia profesional
  public idiomas?: string;               // JSON string de array ["Español", "Inglés"]
  public certificaciones?: string;       // JSON string de array de certificaciones
  public biografia?: string;             // Texto sobre el médico (máx 1000 caracteres)
  public documentos_s3_keys?: string;    // JSON string de array con keys de S3 para documentos

  // Método para obtener el código del rol de manera segura
  public getRolCodigo(): string {
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
  public getIdiomas(): string[] {
    try {
      return this.idiomas ? JSON.parse(this.idiomas) : [];
    } catch (error) {
      return [];
    }
  }

  // Método para obtener certificaciones como array
  public getCertificaciones(): string[] {
    try {
      return this.certificaciones ? JSON.parse(this.certificaciones) : [];
    } catch (error) {
      return [];
    }
  }

  // Método para obtener documentos como array de objetos
  public getDocumentos(): Array<{nombre: string, key: string}> {
    try {
      return this.documentos_s3_keys ? JSON.parse(this.documentos_s3_keys) : [];
    } catch (error) {
      return [];
    }
  }
}

Medico.init(
  {
    rut: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    apellidos: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    telefono: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    direccion: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    foto: {
      type: DataTypes.STRING,
    },
    nacionalidad: {
      type: DataTypes.STRING,
    },
    especialidad_medica: {
      type: DataTypes.STRING,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    rolId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Rol,
        key: 'id'
      },
      defaultValue: 2 // ID del rol MEDICO_ROLE (asumiendo que es 3)
    },
    estado: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'activo'
    },
    imagen_s3_key: {
      type: DataTypes.STRING(300),
      allowNull: true,
      comment: 'Key de la imagen del médico en S3 (bucket privado)'
    },

    // ============================================
    // NUEVOS CAMPOS - INFORMACIÓN PROFESIONAL
    // ============================================
    titulo_profesional: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Título profesional del médico (ej: Médico Cirujano)'
    },
    subespecialidad: {
      type: DataTypes.STRING(150),
      allowNull: true,
      comment: 'Subespecialidad médica si tiene'
    },
    registro_medico: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Número de registro profesional'
    },
    universidad: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: 'Universidad de egreso'
    },
    anio_titulacion: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1950,
        max: new Date().getFullYear()
      },
      comment: 'Año de titulación'
    },
    anios_experiencia: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 60
      },
      comment: 'Años de experiencia profesional'
    },
    idiomas: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'JSON array de idiomas que habla (ej: ["Español", "Inglés"])'
    },
    certificaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'JSON array de certificaciones adicionales'
    },
    biografia: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Biografía o descripción del médico (máx 1000 caracteres)'
    },
    documentos_s3_keys: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'JSON array de objetos con documentos en S3 [{nombre: string, key: string}]'
    },
  },
  {
    sequelize: db,
    modelName: 'Medico',
    tableName: 'medicos'
  }
);

export default Medico;