"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeData = void 0;
const rol_1 = __importDefault(require("../models/rol"));
const usuario_1 = __importDefault(require("../models/usuario"));
const connection_1 = __importDefault(require("../db/connection")); // Añadido
const enums_1 = require("../types/enums");
const bcrypt_1 = __importDefault(require("bcrypt"));
const sequelize_1 = require("sequelize"); // Añadido
/**
 * Inicializa los datos básicos necesarios para el funcionamiento de la aplicación
 * como roles, usuario administrador por defecto, etc.
 */
function initializeData() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Inicializando datos básicos...');
        try {
            // 1. Inicializar roles
            yield initializeRoles();
            // 2. Migración de tabla médicos (debe ejecutarse antes de crear usuarios)
            yield migrateMedicosTable();
            // 3. Migración de campos de previsión (debe ejecutarse antes de crear usuarios)
            yield migratePrevisionFields();
            // 4. Migración de estado de previsión
            yield migrateEstadoPrevision();
            // 5. Migración de precios diferenciados
            yield migratePreciosDiferenciados();
            // 6. Migración de validación de previsión en usuarios
            yield migrateValidacionPrevisionUsuarios();
            // 7. Migración de campos de descuentos en citas médicas
            yield migrateDescuentosCitaMedica();
            // 8. Inicializar usuario admin por defecto (después de las migraciones)
            yield initializeAdminUser();
            console.log('Datos básicos inicializados correctamente');
        }
        catch (error) {
            console.error('Error al inicializar datos básicos:', error);
            throw error;
        }
    });
}
exports.initializeData = initializeData;
/**
 * Inicializa los roles básicos del sistema
 */
/**
 * Inicializa los roles básicos del sistema
 * ORDEN CORREGIDO para coincidir con la base de datos actual
 */
function initializeRoles() {
    return __awaiter(this, void 0, void 0, function* () {
        // ✅ ORDEN CORREGIDO: Debe coincidir con el orden de inserción en la migración
        const basicRoles = [
            {
                nombre: 'Administrador',
                codigo: enums_1.UserRole.ADMIN,
                descripcion: 'Acceso completo a todas las funciones del sistema'
            },
            {
                nombre: 'Médico',
                codigo: enums_1.UserRole.MEDICO,
                descripcion: 'Acceso a funciones de gestión médica'
            },
            {
                nombre: 'Usuario',
                codigo: enums_1.UserRole.USER,
                descripcion: 'Acceso básico para pacientes'
            }
        ];
        // Crear roles si no existen
        for (const roleData of basicRoles) {
            const existingRole = yield rol_1.default.findOne({ where: { codigo: roleData.codigo } });
            if (!existingRole) {
                yield rol_1.default.create(roleData);
                console.log(`Rol ${roleData.nombre} creado correctamente`);
            }
        }
    });
}
/**
 * Inicializa el usuario administrador por defecto
 */
function initializeAdminUser() {
    return __awaiter(this, void 0, void 0, function* () {
        // Buscar el rol de administrador
        const adminRole = yield rol_1.default.findOne({ where: { codigo: enums_1.UserRole.ADMIN } });
        if (!adminRole) {
            throw new Error('No se pudo encontrar el rol de administrador');
        }
        // Verificar si ya existe un usuario administrador
        const existingAdmin = yield usuario_1.default.findOne({
            include: [{
                    model: rol_1.default,
                    as: 'rol',
                    where: { codigo: enums_1.UserRole.ADMIN }
                }],
            limit: 1
        });
        if (!existingAdmin) {
            // Crear usuario administrador por defecto
            const salt = bcrypt_1.default.genSaltSync();
            const adminData = {
                rut: 'ADMIN-001',
                nombre: 'Admin',
                apellidos: 'Sistema',
                email: 'admin@sistema.com',
                password: bcrypt_1.default.hashSync('admin123', salt),
                fecha_nacimiento: new Date('1990-01-01'),
                telefono: '123456789',
                direccion: 'Dirección de Administración',
                rolId: adminRole.id,
                estado: 'activo'
            };
            yield usuario_1.default.create(adminData);
            console.log('Usuario administrador creado correctamente');
        }
    });
}
function migrateMedicosTable() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Verificar si la columna rolId ya existe en la tabla medicos
            const columns = yield connection_1.default.query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'medicos' AND COLUMN_NAME = 'rolId'", { type: sequelize_1.QueryTypes.SELECT });
            // Si la columna no existe, añadirla
            if (columns.length === 0) {
                console.log('Añadiendo columna rolId a la tabla medicos...');
                // 1. Añadir columna rolId con valor NULL permitido inicialmente
                yield connection_1.default.query("ALTER TABLE medicos ADD COLUMN rolId INT NULL");
                // 2. Obtener el ID del rol MEDICO_ROLE
                const medicoRol = yield rol_1.default.findOne({ where: { codigo: enums_1.UserRole.MEDICO } });
                const medicoRolId = medicoRol ? medicoRol.id : 3; // Valor por defecto: 3
                // 3. Actualizar todos los registros existentes con el rolId correcto
                yield connection_1.default.query(`UPDATE medicos SET rolId = ${medicoRolId} WHERE rolId IS NULL`);
                // 4. Hacer la columna NOT NULL y agregar la restricción de clave foránea
                yield connection_1.default.query(`
          ALTER TABLE medicos
          MODIFY COLUMN rolId INT NOT NULL,
          ADD CONSTRAINT fk_medico_rol FOREIGN KEY (rolId) REFERENCES roles(id)
        `);
                console.log('Migración de la tabla medicos completada correctamente');
            }
            else {
                console.log('La columna rolId ya existe en la tabla medicos, omitiendo migración');
            }
        }
        catch (error) {
            console.error('Error durante la migración de la tabla medicos:', error);
            throw error;
        }
    });
}
/**
 * Migración para agregar campos de previsión de salud (Fonasa/Isapre)
 */
function migratePrevisionFields() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Verificar si la columna tipo_prevision ya existe
            const columns = yield connection_1.default.query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'usuarios' AND COLUMN_NAME = 'tipo_prevision'", { type: sequelize_1.QueryTypes.SELECT });
            // Si la columna no existe, añadir los campos
            if (columns.length === 0) {
                console.log('🔧 Añadiendo campos de previsión de salud a la tabla usuarios...');
                // Añadir columna tipo_prevision
                yield connection_1.default.query(`
        ALTER TABLE usuarios
        ADD COLUMN tipo_prevision ENUM('Fonasa', 'Isapre', 'Particular')
        DEFAULT 'Particular'
        COMMENT 'Sistema de salud del paciente'
      `);
                // Añadir columna nombre_isapre
                yield connection_1.default.query(`
        ALTER TABLE usuarios
        ADD COLUMN nombre_isapre VARCHAR(100) NULL
        COMMENT 'Nombre de la Isapre (Banmédica, Colmena, Consalud, etc.)'
      `);
                // Añadir columna tramo_fonasa
                yield connection_1.default.query(`
        ALTER TABLE usuarios
        ADD COLUMN tramo_fonasa ENUM('A', 'B', 'C', 'D') NULL
        COMMENT 'Tramo de Fonasa (A, B, C o D)'
      `);
                console.log('✅ Campos de previsión agregados correctamente');
            }
            else {
                console.log('ℹ️  Los campos de previsión ya existen en la tabla usuarios, omitiendo migración');
            }
        }
        catch (error) {
            console.error('❌ Error durante la migración de campos de previsión:', error);
            throw error;
        }
    });
}
/**
 * Migración para agregar estado de validación de previsión
 */
function migrateEstadoPrevision() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Verificar si la columna estado_prevision ya existe
            const columns = yield connection_1.default.query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'usuarios' AND COLUMN_NAME = 'estado_prevision'", { type: sequelize_1.QueryTypes.SELECT });
            if (columns.length === 0) {
                console.log('🔧 Añadiendo campos de estado de previsión a la tabla usuarios...');
                // Añadir columna estado_prevision
                yield connection_1.default.query(`
        ALTER TABLE usuarios
        ADD COLUMN estado_prevision ENUM('NO_VALIDADO', 'VALIDADO', 'RECHAZADO', 'NO_APLICA')
        DEFAULT 'NO_VALIDADO'
        COMMENT 'Estado de validación de la previsión de salud'
      `);
                // Añadir columna fecha_validacion
                yield connection_1.default.query(`
        ALTER TABLE usuarios
        ADD COLUMN fecha_validacion DATETIME NULL
        COMMENT 'Fecha en que se validó la previsión'
      `);
                // Añadir columna validado_por
                yield connection_1.default.query(`
        ALTER TABLE usuarios
        ADD COLUMN validado_por VARCHAR(50) NULL
        COMMENT 'RUT del admin que validó'
      `);
                // Añadir columna observaciones_validacion
                yield connection_1.default.query(`
        ALTER TABLE usuarios
        ADD COLUMN observaciones_validacion TEXT NULL
        COMMENT 'Observaciones sobre la validación'
      `);
                // Actualizar usuarios existentes: si tienen Particular, marcar como NO_APLICA
                yield connection_1.default.query(`
        UPDATE usuarios
        SET estado_prevision = 'NO_APLICA'
        WHERE tipo_prevision = 'Particular' OR tipo_prevision IS NULL
      `);
                console.log('✅ Campos de estado de previsión agregados correctamente');
            }
            else {
                console.log('ℹ️  Los campos de estado de previsión ya existen en la tabla usuarios, omitiendo migración');
            }
        }
        catch (error) {
            console.error('❌ Error durante la migración de estado de previsión:', error);
            throw error;
        }
    });
}
/**
 * Migración para agregar precios diferenciados según previsión
 */
function migratePreciosDiferenciados() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Verificar si la columna precio_fonasa ya existe
            const columns = yield connection_1.default.query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'tipocitas' AND COLUMN_NAME = 'precio_fonasa'", { type: sequelize_1.QueryTypes.SELECT });
            // Si la columna no existe, añadir los campos
            if (columns.length === 0) {
                console.log('🔧 Añadiendo campos de precios diferenciados a la tabla tipocitas...');
                // Añadir columna precio_fonasa
                yield connection_1.default.query(`
        ALTER TABLE tipocitas
        ADD COLUMN precio_fonasa DECIMAL(10, 2) NULL
        COMMENT 'Precio para pacientes con Fonasa'
      `);
                // Añadir columna precio_isapre
                yield connection_1.default.query(`
        ALTER TABLE tipocitas
        ADD COLUMN precio_isapre DECIMAL(10, 2) NULL
        COMMENT 'Precio para pacientes con Isapre'
      `);
                // Añadir columna precio_particular
                yield connection_1.default.query(`
        ALTER TABLE tipocitas
        ADD COLUMN precio_particular DECIMAL(10, 2) NULL
        COMMENT 'Precio para pacientes particulares'
      `);
                // Copiar el precio actual a precio_particular para mantener compatibilidad
                yield connection_1.default.query(`
        UPDATE tipocitas
        SET precio_particular = precio,
            precio_fonasa = precio * 0.7,
            precio_isapre = precio * 0.85
        WHERE precio_particular IS NULL
      `);
                console.log('✅ Campos de precios diferenciados agregados correctamente');
                console.log('ℹ️  Precios por defecto: Fonasa=70%, Isapre=85%, Particular=100%');
            }
            else {
                console.log('ℹ️  Los campos de precios diferenciados ya existen en la tabla tipocitas, omitiendo migración');
            }
        }
        catch (error) {
            console.error('❌ Error durante la migración de precios diferenciados:', error);
            throw error;
        }
    });
}
/**
 * Migración para agregar campos de validación de previsión en usuarios
 */
function migrateValidacionPrevisionUsuarios() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Verificar si la columna prevision_validada ya existe
            const columns = yield connection_1.default.query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'usuarios' AND COLUMN_NAME = 'prevision_validada'", { type: sequelize_1.QueryTypes.SELECT });
            if (columns.length === 0) {
                console.log('🔧 Añadiendo campos de validación de previsión a la tabla usuarios...');
                // Añadir columna prevision_validada
                yield connection_1.default.query(`
        ALTER TABLE usuarios
        ADD COLUMN prevision_validada TINYINT(1) NOT NULL DEFAULT 0
        COMMENT 'Indica si el paciente ha validado su previsión presencialmente con documentos'
      `);
                // Añadir columna fecha_validacion_prevision
                yield connection_1.default.query(`
        ALTER TABLE usuarios
        ADD COLUMN fecha_validacion_prevision DATETIME NULL
        COMMENT 'Fecha en que se validó la previsión presencialmente'
      `);
                console.log('✅ Campos de validación de previsión agregados a usuarios correctamente');
            }
            else {
                console.log('ℹ️  Los campos de validación de previsión ya existen en la tabla usuarios, omitiendo migración');
            }
        }
        catch (error) {
            console.error('❌ Error durante la migración de validación de previsión en usuarios:', error);
            throw error;
        }
    });
}
/**
 * Migración para agregar campos de descuentos en citas médicas
 */
function migrateDescuentosCitaMedica() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Verificar si la columna precio_original ya existe
            const columns = yield connection_1.default.query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'citamedicas' AND COLUMN_NAME = 'precio_original'", { type: sequelize_1.QueryTypes.SELECT });
            if (columns.length === 0) {
                console.log('🔧 Añadiendo campos de descuentos y validación a la tabla citamedicas...');
                // Añadir columnas de precios
                yield connection_1.default.query(`
        ALTER TABLE citamedicas
        ADD COLUMN precio_original DECIMAL(10, 2) NULL
        COMMENT 'Precio original sin descuento (precio particular)'
      `);
                yield connection_1.default.query(`
        ALTER TABLE citamedicas
        ADD COLUMN precio_final DECIMAL(10, 2) NULL
        COMMENT 'Precio final que el paciente pagó (con descuento si aplica)'
      `);
                yield connection_1.default.query(`
        ALTER TABLE citamedicas
        ADD COLUMN tipo_prevision_aplicada ENUM('Fonasa', 'Isapre', 'Particular') NULL
        COMMENT 'Tipo de previsión que se aplicó para esta cita'
      `);
                yield connection_1.default.query(`
        ALTER TABLE citamedicas
        ADD COLUMN descuento_aplicado DECIMAL(10, 2) NULL DEFAULT 0
        COMMENT 'Monto del descuento aplicado en pesos chilenos'
      `);
                yield connection_1.default.query(`
        ALTER TABLE citamedicas
        ADD COLUMN porcentaje_descuento DECIMAL(5, 2) NULL DEFAULT 0
        COMMENT 'Porcentaje de descuento aplicado (0-100)'
      `);
                // Añadir columnas de validación de previsión
                yield connection_1.default.query(`
        ALTER TABLE citamedicas
        ADD COLUMN requiere_validacion_prevision TINYINT(1) NOT NULL DEFAULT 0
        COMMENT 'Indica si el paciente debe traer documentos de previsión'
      `);
                yield connection_1.default.query(`
        ALTER TABLE citamedicas
        ADD COLUMN prevision_validada TINYINT(1) NOT NULL DEFAULT 0
        COMMENT 'Indica si se validó la previsión presencialmente'
      `);
                yield connection_1.default.query(`
        ALTER TABLE citamedicas
        ADD COLUMN diferencia_pagada_efectivo DECIMAL(10, 2) NULL DEFAULT 0
        COMMENT 'Diferencia pagada en efectivo si no presentó documentos'
      `);
                yield connection_1.default.query(`
        ALTER TABLE citamedicas
        ADD COLUMN observaciones_validacion TEXT NULL
        COMMENT 'Observaciones sobre la validación de previsión'
      `);
                console.log('✅ Campos de descuentos y validación agregados a citamedicas correctamente');
            }
            else {
                console.log('ℹ️  Los campos de descuentos ya existen en la tabla citamedicas, omitiendo migración');
            }
        }
        catch (error) {
            console.error('❌ Error durante la migración de descuentos en citamedicas:', error);
            throw error;
        }
    });
}
//# sourceMappingURL=initializer.js.map