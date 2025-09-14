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
    
    // 2. Inicializar usuario admin por defecto (si no existe)
    await initializeAdminUser();

     await migrateMedicosTable();
    
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