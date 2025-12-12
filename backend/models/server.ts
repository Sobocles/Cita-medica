import express, { Application } from 'express';
import userRoutes from '../routes/usuario';
import loginRoutes from '../routes/auth';
import medicoRoutes from '../routes/medico';
import historialRoutes from '../routes/historial_medico'
import horarioRoutes from '../routes/horario_medico'
import citaMedicaRoutes from '../routes/cita_medica'
import tipo_cita from '../routes/tipo_cita'
import busquedaRoute from '../routes/busquedas'
import HorarioClinicaRoutes from '../routes/horario_clinica';
import busqueda_citaRoutes from '../routes/busqueda_cita'
import mercadoPagoRoutes from '../routes/mercadoPago'


import cors from 'cors';
import db from '../db/connection';
import { PORT } from '../global/enviorenment';


class Server {
    private app: Application;
  
    private apiPaths = {
        usuarios: '/api/usuarios',
        login: '/api/login', // Ruta para el login
        medicos: '/api/medicos',
        historial_medico: '/api/historial',
        horario_laboral: '/api/horario_medico',
        cita_medica: '/api/cita_medica',
        tipo_cita: '/api/tipo_cita',
        busqueda: '/api/busqueda',
        horario_clinica: '/api/horario_clinica',
        busqueda_cita: '/api/busqueda_cita',
        paypal: '/api/paypal',
        mercadoPago: '/api/mercadoPago',
     
    };


    constructor() {
        this.app = express();
      
        
        //Metodos iniciales
        this.dbConnection();
        this.middlewares();
        this.routes();
    }

    async dbConnection() {
        try {
            await db.authenticate();
            console.log('Database online');
        } catch (error) {
            throw new Error(String(error));
        }
    }

    middlewares() {
        // CORS - Configuración dinámica basada en el entorno
        const allowedOrigins = process.env.NODE_ENV === 'production'
            ? [process.env.FRONTEND_URL || 'https://your-app.vercel.app']
            : ['http://localhost:4200', 'http://localhost:4201'];

        this.app.use(cors({
            origin: (origin, callback) => {
                // Permitir solicitudes sin origin (como Postman) en desarrollo
                if (!origin && process.env.NODE_ENV !== 'production') {
                    return callback(null, true);
                }

                if (!origin || allowedOrigins.includes(origin)) {
                    callback(null, true);
                } else {
                    callback(new Error('Not allowed by CORS'));
                }
            },
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
            credentials: true,
            optionsSuccessStatus: 200
        }));

        // Lectura del body
        this.app.use(express.json());

        // Carpeta Pública
        this.app.use(express.static('public'));
    }


    routes() {
        //app.use( '/api/usuarios', require('./routes/usuarios') );
        this.app.use(this.apiPaths.usuarios, userRoutes);
        this.app.use(this.apiPaths.login, loginRoutes)
        this.app.use(this.apiPaths.medicos, medicoRoutes)
        this.app.use(this.apiPaths.historial_medico, historialRoutes)
        this.app.use(this.apiPaths.horario_laboral, horarioRoutes )
        this.app.use(this.apiPaths.cita_medica, citaMedicaRoutes )
        this.app.use(this.apiPaths.tipo_cita, tipo_cita )
        this.app.use(this.apiPaths.busqueda, busquedaRoute )
        this.app.use(this.apiPaths.horario_clinica, HorarioClinicaRoutes  )
        this.app.use(this.apiPaths.busqueda_cita, busqueda_citaRoutes  )
        this.app.use(this.apiPaths.mercadoPago, mercadoPagoRoutes  )
    
    }

    listen() {
        this.app.listen( PORT, () => {
            console.log('Servidor corriendo en puerto '+ PORT);
        } )
    }
}

export default Server;