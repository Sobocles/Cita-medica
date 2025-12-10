import Rol from '../models/rol';
import Usuario from '../models/usuario';
import db from '../db/connection';  // Añadido
import { UserRole } from '../types/enums';
import bcrypt from 'bcrypt';
import { QueryTypes } from 'sequelize';  // Añadido

/**
 * Inicializa los datos básicos necesarios para el funcionamiento de la aplicación
 * como roles, usuario administrador por defecto, etc.
 */
export async function initializeData() {
  console.log('Inicializando datos básicos...');

  try {
    // 1. Inicializar roles
    await initializeRoles();

    // 2. Migración de tabla médicos (debe ejecutarse antes de crear usuarios)
    await migrateMedicosTable();

    // 3. Migración de campos de previsión (debe ejecutarse antes de crear usuarios)
    await migratePrevisionFields();

    // 4. Migración de estado de previsión
    await migrateEstadoPrevision();

    // 5. Migración de precios diferenciados
    await migratePreciosDiferenciados();

    // 6. Migración de validación de previsión en usuarios
    await migrateValidacionPrevisionUsuarios();

    // 7. Migración de campos de descuentos en citas médicas
    await migrateDescuentosCitaMedica();

    // 8. Inicializar usuario admin por defecto (después de las migraciones)
    await initializeAdminUser();

    console.log('Datos básicos inicializados correctamente');
  } catch (error) {
    console.error('Error al inicializar datos básicos:', error);
    throw error;
  }
}

/**
 * Inicializa los roles básicos del sistema
 */
/**
 * Inicializa los roles básicos del sistema
 * ORDEN CORREGIDO para coincidir con la base de datos actual
 */
async function initializeRoles() {
  // ✅ ORDEN CORREGIDO: Debe coincidir con el orden de inserción en la migración
  const basicRoles = [
    {
      nombre: 'Administrador',
      codigo: UserRole.ADMIN,      // 1. ADMIN_ROLE (id: 1)
      descripcion: 'Acceso completo a todas las funciones del sistema'
    },
    {
      nombre: 'Médico',
      codigo: UserRole.MEDICO,     // 2. MEDICO_ROLE (id: 2) ✅
      descripcion: 'Acceso a funciones de gestión médica'
    },
    {
      nombre: 'Usuario',
      codigo: UserRole.USER,       // 3. USER_ROLE (id: 3) ✅
      descripcion: 'Acceso básico para pacientes'
    }
  ];
  
  // Crear roles si no existen
  for (const roleData of basicRoles) {
    const existingRole = await Rol.findOne({ where: { codigo: roleData.codigo } });
    if (!existingRole) {
      await Rol.create(roleData);
      console.log(`Rol ${roleData.nombre} creado correctamente`);
    }
  }
}


/**
 * Inicializa el usuario administrador por defecto
 */
async function initializeAdminUser() {
  // Buscar el rol de administrador
  const adminRole = await Rol.findOne({ where: { codigo: UserRole.ADMIN } });
  
  if (!adminRole) {
    throw new Error('No se pudo encontrar el rol de administrador');
  }
  
  // Verificar si ya existe un usuario administrador
  const existingAdmin = await Usuario.findOne({
    include: [{
      model: Rol,
      as: 'rol',
      where: { codigo: UserRole.ADMIN }
    }],
    limit: 1
  });
  
  if (!existingAdmin) {
    // Crear usuario administrador por defecto
    const salt = bcrypt.genSaltSync();
    const adminData = {
      rut: 'ADMIN-001',
      nombre: 'Admin',
      apellidos: 'Sistema',
      email: 'admin@sistema.com',
      password: bcrypt.hashSync('admin123', salt),
      fecha_nacimiento: new Date('1990-01-01'),
      telefono: '123456789',
      direccion: 'Dirección de Administración',
      rolId: adminRole.id, // Usar el ID del rol, no el código
      estado: 'activo'
    };
    
    await Usuario.create(adminData);
    console.log('Usuario administrador creado correctamente');
  }
}

async function migrateMedicosTable() {
    try {
      // Verificar si la columna rolId ya existe en la tabla medicos
      const columns = await db.query(
        "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'medicos' AND COLUMN_NAME = 'rolId'",
        { type: QueryTypes.SELECT }
      );

      // Si la columna no existe, añadirla
      if (columns.length === 0) {
        console.log('Añadiendo columna rolId a la tabla medicos...');

        // 1. Añadir columna rolId con valor NULL permitido inicialmente
        await db.query("ALTER TABLE medicos ADD COLUMN rolId INT NULL");

        // 2. Obtener el ID del rol MEDICO_ROLE
        const medicoRol = await Rol.findOne({ where: { codigo: UserRole.MEDICO } });
        const medicoRolId = medicoRol ? medicoRol.id : 3; // Valor por defecto: 3

        // 3. Actualizar todos los registros existentes con el rolId correcto
        await db.query(`UPDATE medicos SET rolId = ${medicoRolId} WHERE rolId IS NULL`);

        // 4. Hacer la columna NOT NULL y agregar la restricción de clave foránea
        await db.query(`
          ALTER TABLE medicos
          MODIFY COLUMN rolId INT NOT NULL,
          ADD CONSTRAINT fk_medico_rol FOREIGN KEY (rolId) REFERENCES roles(id)
        `);

        console.log('Migración de la tabla medicos completada correctamente');
      } else {
        console.log('La columna rolId ya existe en la tabla medicos, omitiendo migración');
      }
    } catch (error) {
      console.error('Error durante la migración de la tabla medicos:', error);
      throw error;
    }
  }

/**
 * Migración para agregar campos de previsión de salud (Fonasa/Isapre)
 */
async function migratePrevisionFields() {
  try {
    // Verificar si la columna tipo_prevision ya existe
    const columns = await db.query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'usuarios' AND COLUMN_NAME = 'tipo_prevision'",
      { type: QueryTypes.SELECT }
    );

    // Si la columna no existe, añadir los campos
    if (columns.length === 0) {
      console.log('🔧 Añadiendo campos de previsión de salud a la tabla usuarios...');

      // Añadir columna tipo_prevision
      await db.query(`
        ALTER TABLE usuarios
        ADD COLUMN tipo_prevision ENUM('Fonasa', 'Isapre', 'Particular')
        DEFAULT 'Particular'
        COMMENT 'Sistema de salud del paciente'
      `);

      // Añadir columna nombre_isapre
      await db.query(`
        ALTER TABLE usuarios
        ADD COLUMN nombre_isapre VARCHAR(100) NULL
        COMMENT 'Nombre de la Isapre (Banmédica, Colmena, Consalud, etc.)'
      `);

      // Añadir columna tramo_fonasa
      await db.query(`
        ALTER TABLE usuarios
        ADD COLUMN tramo_fonasa ENUM('A', 'B', 'C', 'D') NULL
        COMMENT 'Tramo de Fonasa (A, B, C o D)'
      `);

      console.log('✅ Campos de previsión agregados correctamente');
    } else {
      console.log('ℹ️  Los campos de previsión ya existen en la tabla usuarios, omitiendo migración');
    }
  } catch (error) {
    console.error('❌ Error durante la migración de campos de previsión:', error);
    throw error;
  }
}

/**
 * Migración para agregar estado de validación de previsión
 */
async function migrateEstadoPrevision() {
  try {
    // Verificar si la columna estado_prevision ya existe
    const columns = await db.query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'usuarios' AND COLUMN_NAME = 'estado_prevision'",
      { type: QueryTypes.SELECT }
    );

    if (columns.length === 0) {
      console.log('🔧 Añadiendo campos de estado de previsión a la tabla usuarios...');

      // Añadir columna estado_prevision
      await db.query(`
        ALTER TABLE usuarios
        ADD COLUMN estado_prevision ENUM('NO_VALIDADO', 'VALIDADO', 'RECHAZADO', 'NO_APLICA')
        DEFAULT 'NO_VALIDADO'
        COMMENT 'Estado de validación de la previsión de salud'
      `);

      // Añadir columna fecha_validacion
      await db.query(`
        ALTER TABLE usuarios
        ADD COLUMN fecha_validacion DATETIME NULL
        COMMENT 'Fecha en que se validó la previsión'
      `);

      // Añadir columna validado_por
      await db.query(`
        ALTER TABLE usuarios
        ADD COLUMN validado_por VARCHAR(50) NULL
        COMMENT 'RUT del admin que validó'
      `);

      // Añadir columna observaciones_validacion
      await db.query(`
        ALTER TABLE usuarios
        ADD COLUMN observaciones_validacion TEXT NULL
        COMMENT 'Observaciones sobre la validación'
      `);

      // Actualizar usuarios existentes: si tienen Particular, marcar como NO_APLICA
      await db.query(`
        UPDATE usuarios
        SET estado_prevision = 'NO_APLICA'
        WHERE tipo_prevision = 'Particular' OR tipo_prevision IS NULL
      `);

      console.log('✅ Campos de estado de previsión agregados correctamente');
    } else {
      console.log('ℹ️  Los campos de estado de previsión ya existen en la tabla usuarios, omitiendo migración');
    }
  } catch (error) {
    console.error('❌ Error durante la migración de estado de previsión:', error);
    throw error;
  }
}

/**
 * Migración para agregar precios diferenciados según previsión
 */
async function migratePreciosDiferenciados() {
  try {
    // Verificar si la columna precio_fonasa ya existe
    const columns = await db.query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'tipocitas' AND COLUMN_NAME = 'precio_fonasa'",
      { type: QueryTypes.SELECT }
    );

    // Si la columna no existe, añadir los campos
    if (columns.length === 0) {
      console.log('🔧 Añadiendo campos de precios diferenciados a la tabla tipocitas...');

      // Añadir columna precio_fonasa
      await db.query(`
        ALTER TABLE tipocitas
        ADD COLUMN precio_fonasa DECIMAL(10, 2) NULL
        COMMENT 'Precio para pacientes con Fonasa'
      `);

      // Añadir columna precio_isapre
      await db.query(`
        ALTER TABLE tipocitas
        ADD COLUMN precio_isapre DECIMAL(10, 2) NULL
        COMMENT 'Precio para pacientes con Isapre'
      `);

      // Añadir columna precio_particular
      await db.query(`
        ALTER TABLE tipocitas
        ADD COLUMN precio_particular DECIMAL(10, 2) NULL
        COMMENT 'Precio para pacientes particulares'
      `);

      // Copiar el precio actual a precio_particular para mantener compatibilidad
      await db.query(`
        UPDATE tipocitas
        SET precio_particular = precio,
            precio_fonasa = precio * 0.7,
            precio_isapre = precio * 0.85
        WHERE precio_particular IS NULL
      `);

      console.log('✅ Campos de precios diferenciados agregados correctamente');
      console.log('ℹ️  Precios por defecto: Fonasa=70%, Isapre=85%, Particular=100%');
    } else {
      console.log('ℹ️  Los campos de precios diferenciados ya existen en la tabla tipocitas, omitiendo migración');
    }
  } catch (error) {
    console.error('❌ Error durante la migración de precios diferenciados:', error);
    throw error;
  }
}

/**
 * Migración para agregar campos de validación de previsión en usuarios
 */
async function migrateValidacionPrevisionUsuarios() {
  try {
    // Verificar si la columna prevision_validada ya existe
    const columns = await db.query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'usuarios' AND COLUMN_NAME = 'prevision_validada'",
      { type: QueryTypes.SELECT }
    );

    if (columns.length === 0) {
      console.log('🔧 Añadiendo campos de validación de previsión a la tabla usuarios...');

      // Añadir columna prevision_validada
      await db.query(`
        ALTER TABLE usuarios
        ADD COLUMN prevision_validada TINYINT(1) NOT NULL DEFAULT 0
        COMMENT 'Indica si el paciente ha validado su previsión presencialmente con documentos'
      `);

      // Añadir columna fecha_validacion_prevision
      await db.query(`
        ALTER TABLE usuarios
        ADD COLUMN fecha_validacion_prevision DATETIME NULL
        COMMENT 'Fecha en que se validó la previsión presencialmente'
      `);

      console.log('✅ Campos de validación de previsión agregados a usuarios correctamente');
    } else {
      console.log('ℹ️  Los campos de validación de previsión ya existen en la tabla usuarios, omitiendo migración');
    }
  } catch (error) {
    console.error('❌ Error durante la migración de validación de previsión en usuarios:', error);
    throw error;
  }
}

/**
 * Migración para agregar campos de descuentos en citas médicas
 */
async function migrateDescuentosCitaMedica() {
  try {
    // Verificar si la columna precio_original ya existe
    const columns = await db.query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'citamedicas' AND COLUMN_NAME = 'precio_original'",
      { type: QueryTypes.SELECT }
    );

    if (columns.length === 0) {
      console.log('🔧 Añadiendo campos de descuentos y validación a la tabla citamedicas...');

      // Añadir columnas de precios
      await db.query(`
        ALTER TABLE citamedicas
        ADD COLUMN precio_original DECIMAL(10, 2) NULL
        COMMENT 'Precio original sin descuento (precio particular)'
      `);

      await db.query(`
        ALTER TABLE citamedicas
        ADD COLUMN precio_final DECIMAL(10, 2) NULL
        COMMENT 'Precio final que el paciente pagó (con descuento si aplica)'
      `);

      await db.query(`
        ALTER TABLE citamedicas
        ADD COLUMN tipo_prevision_aplicada ENUM('Fonasa', 'Isapre', 'Particular') NULL
        COMMENT 'Tipo de previsión que se aplicó para esta cita'
      `);

      await db.query(`
        ALTER TABLE citamedicas
        ADD COLUMN descuento_aplicado DECIMAL(10, 2) NULL DEFAULT 0
        COMMENT 'Monto del descuento aplicado en pesos chilenos'
      `);

      await db.query(`
        ALTER TABLE citamedicas
        ADD COLUMN porcentaje_descuento DECIMAL(5, 2) NULL DEFAULT 0
        COMMENT 'Porcentaje de descuento aplicado (0-100)'
      `);

      // Añadir columnas de validación de previsión
      await db.query(`
        ALTER TABLE citamedicas
        ADD COLUMN requiere_validacion_prevision TINYINT(1) NOT NULL DEFAULT 0
        COMMENT 'Indica si el paciente debe traer documentos de previsión'
      `);

      await db.query(`
        ALTER TABLE citamedicas
        ADD COLUMN prevision_validada TINYINT(1) NOT NULL DEFAULT 0
        COMMENT 'Indica si se validó la previsión presencialmente'
      `);

      await db.query(`
        ALTER TABLE citamedicas
        ADD COLUMN diferencia_pagada_efectivo DECIMAL(10, 2) NULL DEFAULT 0
        COMMENT 'Diferencia pagada en efectivo si no presentó documentos'
      `);

      await db.query(`
        ALTER TABLE citamedicas
        ADD COLUMN observaciones_validacion TEXT NULL
        COMMENT 'Observaciones sobre la validación de previsión'
      `);

      console.log('✅ Campos de descuentos y validación agregados a citamedicas correctamente');
    } else {
      console.log('ℹ️  Los campos de descuentos ya existen en la tabla citamedicas, omitiendo migración');
    }
  } catch (error) {
    console.error('❌ Error durante la migración de descuentos en citamedicas:', error);
    throw error;
  }
}