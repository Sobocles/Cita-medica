import { Sequelize } from 'sequelize';

// Determinar el dialecto basado en la variable de entorno
const dialect = (process.env.DB_DIALECT as 'mysql' | 'postgres') || 'mysql';

// Configuración de la base de datos
const dbConfig: any = {
  host: process.env.DB_HOST || 'localhost',
  dialect: dialect,
  port: parseInt(process.env.DB_PORT || (dialect === 'postgres' ? '5432' : '3306')),
  logging: process.env.NODE_ENV === 'production' ? false : console.log,
};

// Para PostgreSQL (Supabase) podemos necesitar SSL
if (dialect === 'postgres' && process.env.DB_SSL === 'true') {
  dbConfig.dialectOptions = {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  };
}

const db = new Sequelize(
  process.env.DB_NAME || 'gestor',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'puppetmaster',
  dbConfig
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