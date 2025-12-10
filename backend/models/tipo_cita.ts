import { DataTypes, Model } from 'sequelize';
import db from '../db/connection';
import CitaMedica from './cita_medica'; // Asegúrate de que este importe es correcto
import Medico from './medico';

class TipoCita extends Model {
  public idTipoCita!: number;
  public tipo_cita!: string;
  public precio!: number;
  public especialidad_medica!: string;
  public duracion_cita!: number;
  public estado!: string;

  // Precios diferenciados por tipo de previsión
  public precio_fonasa?: number;
  public precio_isapre?: number;
  public precio_particular?: number;

  public medicos?: Medico[];
}

TipoCita.init(
  {
    idTipoCita: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    tipo_cita: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    precio: {
      type: DataTypes.FLOAT, 
      allowNull: false,
    },
    especialidad_medica: {
      type: DataTypes.STRING,
    },
    duracion_cita: {
      type: DataTypes.INTEGER, 
      allowNull: true,
    },
    estado: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'activo' // Estado por defecto es 'activo'
    },
    // Precios diferenciados por tipo de previsión
    precio_fonasa: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Precio para pacientes con Fonasa'
    },
    precio_isapre: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Precio para pacientes con Isapre'
    },
    precio_particular: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Precio para pacientes particulares'
    },
  },
  {
    sequelize: db,
    modelName: 'TipoCita',
    tableName: 'tipocitas'
  }
);

export default TipoCita;
