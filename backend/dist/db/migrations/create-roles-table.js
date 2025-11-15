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
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
// BACKEND/db/migrations/create-roles-table.ts
/**
 * Este archivo debe ejecutarse para crear la tabla de roles
 * y migrar los roles existentes de la tabla usuarios
 */
const sequelize_1 = require("sequelize");
function up(queryInterface) {
    return __awaiter(this, void 0, void 0, function* () {
        // Crear la tabla de roles
        yield queryInterface.createTable('roles', {
            id: {
                type: sequelize_1.DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            nombre: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false
            },
            codigo: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            descripcion: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true
            },
            estado: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
                defaultValue: 'activo'
            },
            createdAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
                defaultValue: sequelize_1.DataTypes.NOW
            },
            updatedAt: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
                defaultValue: sequelize_1.DataTypes.NOW
            }
        });
        // Insertar los roles básicos del sistema
        yield queryInterface.bulkInsert('roles', [
            {
                nombre: 'Administrador',
                codigo: 'ADMIN_ROLE',
                descripcion: 'Acceso completo al sistema',
                estado: 'activo',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                nombre: 'Usuario',
                codigo: 'USER_ROLE',
                descripcion: 'Acceso básico para pacientes',
                estado: 'activo',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                nombre: 'Médico',
                codigo: 'MEDICO_ROLE',
                descripcion: 'Acceso para profesionales médicos',
                estado: 'activo',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);
    });
}
exports.up = up;
function down(queryInterface) {
    return __awaiter(this, void 0, void 0, function* () {
        yield queryInterface.dropTable('roles');
    });
}
exports.down = down;
//# sourceMappingURL=create-roles-table.js.map