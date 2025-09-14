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
  },
  {
    sequelize: db,
    modelName: 'CitaMedica',
    tableName: 'citamedicas'  
  }
);

export default CitaMedica;