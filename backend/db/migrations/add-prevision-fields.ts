import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migración para agregar campos de previsión de salud a la tabla usuarios
 * - tipo_prevision: Fonasa, Isapre o Particular
 * - nombre_isapre: Nombre de la Isapre (solo si aplica)
 * - tramo_fonasa: Tramo de Fonasa A, B, C o D (solo si aplica)
 */

export const up = async (queryInterface: QueryInterface): Promise<void> => {
  console.log('🔧 Agregando campos de previsión de salud a la tabla usuarios...');

  // Agregar columna tipo_prevision
  await queryInterface.addColumn('usuarios', 'tipo_prevision', {
    type: DataTypes.ENUM('Fonasa', 'Isapre', 'Particular'),
    allowNull: true,
    defaultValue: 'Particular',
    comment: 'Sistema de salud del paciente'
  });

  // Agregar columna nombre_isapre
  await queryInterface.addColumn('usuarios', 'nombre_isapre', {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: null,
    comment: 'Nombre de la Isapre (Banmédica, Colmena, Consalud, etc.)'
  });

  // Agregar columna tramo_fonasa
  await queryInterface.addColumn('usuarios', 'tramo_fonasa', {
    type: DataTypes.ENUM('A', 'B', 'C', 'D'),
    allowNull: true,
    defaultValue: null,
    comment: 'Tramo de Fonasa (A, B, C o D)'
  });

  console.log('✅ Campos de previsión agregados correctamente');
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  console.log('🔙 Revirtiendo campos de previsión de salud...');

  await queryInterface.removeColumn('usuarios', 'tipo_prevision');
  await queryInterface.removeColumn('usuarios', 'nombre_isapre');
  await queryInterface.removeColumn('usuarios', 'tramo_fonasa');

  console.log('✅ Campos de previsión eliminados');
};
