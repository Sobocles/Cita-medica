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
exports.initializeData = initializeData;
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
            // 2. Inicializar usuario admin por defecto (si no existe)
            yield initializeAdminUser();
            yield migrateMedicosTable();
            console.log('Datos básicos inicializados correctamente');
        }
        catch (error) {
            console.error('Error al inicializar datos básicos:', error);
            throw error;
        }
    });
}
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
                codigo: enums_1.UserRole.ADMIN, // 1. ADMIN_ROLE (id: 1)
                descripcion: 'Acceso completo a todas las funciones del sistema'
            },
            {
                nombre: 'Médico',
                codigo: enums_1.UserRole.MEDICO, // 2. MEDICO_ROLE (id: 2) ✅
                descripcion: 'Acceso a funciones de gestión médica'
            },
            {
                nombre: 'Usuario',
                codigo: enums_1.UserRole.USER, // 3. USER_ROLE (id: 3) ✅
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
                rolId: adminRole.id, // Usar el ID del rol, no el código
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
//# sourceMappingURL=initializer.js.map