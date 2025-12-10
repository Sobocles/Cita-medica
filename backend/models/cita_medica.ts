// cita_medica.ts
import { Model, DataTypes, Association } from 'sequelize';
import db from '../db/connection';
import TipoCita from './tipo_cita';
import Medico from './medico';
import Usuario from './usuario';

export interface CitaMedicaAttributes {
  idCita?: number;
  motivo: string;
  rut_paciente: string;
  rut_medico: string;
  fecha: Date;
  hora_inicio: string;
  hora_fin: string;
  estado: string;
  descripcion?: string;
  idTipoCita?: number;
  estado_actividad?: string;
  tipoCita?: TipoCita;

  // Campos de precios y descuentos
  precio_original?: number;
  precio_final?: number;
  tipo_prevision_aplicada?: 'Fonasa' | 'Isapre' | 'Particular';
  descuento_aplicado?: number;
  porcentaje_descuento?: number;

  // Campos de validación de previsión
  requiere_validacion_prevision?: boolean;
  prevision_validada?: boolean;
  diferencia_pagada_efectivo?: number;
  observaciones_validacion?: string;
}

export class CitaMedica extends Model<CitaMedicaAttributes> {
  public idCita!: number;
  public motivo!: string;
  public rut_paciente!: string;
  public rut_medico!: string;
  public fecha!: Date;
  public hora_inicio!: string;
  public hora_fin!: string;
  public estado!: string;
  public descripcion?: string;
  public idTipoCita?: number;
  public estado_actividad!: string;
  public tipoCita?: TipoCita;

  // Campos de precios y descuentos
  public precio_original?: number;
  public precio_final?: number;
  public tipo_prevision_aplicada?: 'Fonasa' | 'Isapre' | 'Particular';
  public descuento_aplicado?: number;
  public porcentaje_descuento?: number;

  // Campos de validación de previsión
  public requiere_validacion_prevision?: boolean;
  public prevision_validada?: boolean;
  public diferencia_pagada_efectivo?: number;
  public observaciones_validacion?: string;

  // Asociaciones
  public readonly medico?: Medico;
  public readonly paciente?: Usuario;

  public static associations: {
    medico: Association<CitaMedica, Medico>;
    paciente: Association<CitaMedica, Usuario>;
  };
}

CitaMedica.init(
  {
    idCita: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    motivo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    rut_paciente: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'usuarios',  // ✅ Cambiado a minúscula
        key: 'rut',
      },
    },
    rut_medico: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'medicos',   // ✅ Cambiado a minúscula
        key: 'rut',
      },
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    hora_inicio: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    hora_fin: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    estado: {
      type: DataTypes.ENUM('en_curso', 'terminado', 'no_asistio','pagado','no_pagado','cancelada'),
      allowNull: false,
      defaultValue: 'en_curso',
    },
    descripcion: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    idTipoCita: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'tipocitas',  // ✅ Ya está correcto
        key: 'idTipoCita',
      }
    },
    estado_actividad: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'activo'
    },

    // Campos de precios y descuentos
    precio_original: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Precio original sin descuento (precio particular)'
    },
    precio_final: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Precio final que el paciente pagó (con descuento si aplica)'
    },
    tipo_prevision_aplicada: {
      type: DataTypes.ENUM('Fonasa', 'Isapre', 'Particular'),
      allowNull: true,
      comment: 'Tipo de previsión que se aplicó para esta cita'
    },
    descuento_aplicado: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
      comment: 'Monto del descuento aplicado en pesos chilenos'
    },
    porcentaje_descuento: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      defaultValue: 0,
      comment: 'Porcentaje de descuento aplicado (0-100)'
    },

    // Campos de validación de previsión
    requiere_validacion_prevision: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indica si el paciente debe traer documentos de previsión'
    },
    prevision_validada: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indica si se validó la previsión presencialmente'
    },
    diferencia_pagada_efectivo: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
      comment: 'Diferencia pagada en efectivo si no presentó documentos'
    },
    observaciones_validacion: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observaciones sobre la validación de previsión'
    },
  },
  {
    sequelize: db,
    modelName: 'CitaMedica',
    tableName: 'citamedicas'  
  }
);

export default CitaMedica;