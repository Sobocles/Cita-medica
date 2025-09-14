import { Sequelize } from 'sequelize';

const db = new Sequelize(
  process.env.DB_NAME || 'gestor',
  process.env.DB_USER || 'root', 
  process.env.DB_PASSWORD || 'puppetmaster',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    port: parseInt(process.env.DB_PORT || '3306')
  }
);



// Sincronizar modelos con la base de datos
export const syncDatabase = async () => {
    try {
        await db.sync({ force: false }); // Usar {force: true} solo en desarrollo, elimina tablas existentes
        console.log('Tablas sincronizadas correctamente');
    } catch (error) {
        console.error('Error al sincronizar tablas:', error);
    }
};

export default db;