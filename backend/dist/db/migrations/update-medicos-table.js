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
exports.up = up;
exports.down = down;
// db/migrations/update-medicos-table.ts
/**
 * Este archivo debe ejecutarse para actualizar la tabla de médicos
 * y migrar los roles existentes a la relación con la tabla roles
 */
const sequelize_1 = require("sequelize");
const enums_1 = require("../../types/enums");
function up(queryInterface, sequelize) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // 1. Añadir la nueva columna rolId a la tabla medicos
            yield queryInterface.addColumn('medicos', 'rolId', {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'roles',
                    key: 'id'
                }
            });
            console.log('Columna rolId añadida a la tabla medicos');
            // 2. Actualizar la columna rolId basándose en los valores actuales de la columna rol
            // Primero, necesitamos obtener los ids de cada rol
            const rolesResult = yield sequelize.query(`SELECT id, codigo FROM roles`, { type: sequelize_1.QueryTypes.SELECT });
            const roles = rolesResult;
            console.log('Roles obtenidos:', roles);
            // Mapear los códigos de rol a sus ids
            const rolIdMap = {};
            roles.forEach(role => {
                rolIdMap[role.codigo] = role.id;
            });
            console.log('Mapa de roles:', rolIdMap);
            // ID predeterminado para médicos (asumiendo que MEDICO_ROLE tiene id 3)
            const medicoRolId = rolIdMap[enums_1.UserRole.MEDICO] || 3;
            console.log('ID del rol MEDICO_ROLE:', medicoRolId);
            // Actualizar los médicos que tienen rol 'MEDICO_ROLE'
            yield sequelize.query(`
      UPDATE medicos 
      SET rolId = ${medicoRolId}
      WHERE rol = 'MEDICO_ROLE' OR rol IS NULL
    `, { type: sequelize_1.QueryTypes.UPDATE });
            console.log('Médicos actualizados con el rolId correcto');
            // 3. Hacer que la columna rolId sea NOT NULL
            yield queryInterface.changeColumn('medicos', 'rolId', {
                type: sequelize_1.DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'roles',
                    key: 'id'
                }
            });
            console.log('Columna rolId actualizada a NOT NULL');
            // 4. Opcional: Eliminar la columna rol (sólo si estás seguro de que ya no se necesita)
            // await queryInterface.removeColumn('medicos', 'rol');
            // console.log('Columna rol eliminada de la tabla medicos');
            console.log('Migración completada exitosamente');
        }
        catch (error) {
            console.error('Error durante la migración:', error);
            throw error;
        }
    });
}
function down(queryInterface, sequelize) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Si se eliminó la columna rol, volverla a añadir
            yield queryInterface.addColumn('medicos', 'rol', {
                type: sequelize_1.DataTypes.STRING,
                allowNull: true,
                defaultValue: 'MEDICO_ROLE'
            });
            console.log('Columna rol restaurada en la tabla medicos');
            // Restaurar los valores en la columna rol basándose en rolId
            const rolesResult = yield sequelize.query(`SELECT id, codigo FROM roles`, { type: sequelize_1.QueryTypes.SELECT });
            const roles = rolesResult;
            console.log('Roles obtenidos para restauración:', roles);
            // Para cada rol, actualizar los médicos correspondientes
            for (const role of roles) {
                yield sequelize.query(`
        UPDATE medicos
        SET rol = '${role.codigo}'
        WHERE rolId = ${role.id}
      `, { type: sequelize_1.QueryTypes.UPDATE });
                console.log(`Médicos con rolId ${role.id} actualizados a rol ${role.codigo}`);
            }
            // Eliminar la columna rolId
            yield queryInterface.removeColumn('medicos', 'rolId');
            console.log('Columna rolId eliminada de la tabla medicos');
            console.log('Reversión de migración completada exitosamente');
        }
        catch (error) {
            console.error('Error durante la reversión de la migración:', error);
            throw error;
        }
    });
}
//# sourceMappingURL=update-medicos-table.js.map