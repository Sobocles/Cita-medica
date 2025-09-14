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
  },
  {
    sequelize: db,
    modelName: 'Medico',
    tableName: 'medicos'
  }
);

export default Medico;