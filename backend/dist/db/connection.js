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
exports.syncDatabase = void 0;
const sequelize_1 = require("sequelize");
const db = new sequelize_1.Sequelize(process.env.DB_NAME || 'gestor', process.env.DB_USER || 'root', process.env.DB_PASSWORD || 'puppetmaster', {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    port: parseInt(process.env.DB_PORT || '3306')
});
// Sincronizar modelos con la base de datos
const syncDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield db.sync({ force: false }); // Usar {force: true} solo en desarrollo, elimina tablas existentes
        console.log('Tablas sincronizadas correctamente');
    }
    catch (error) {
        console.error('Error al sincronizar tablas:', error);
    }
});
exports.syncDatabase = syncDatabase;
exports.default = db;
//# sourceMappingURL=connection.js.map