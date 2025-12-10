"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FRONTEND_URL = exports.BACKEND_URL = exports.NGROK_URL = exports.MERCADOPAGO_ACCESS_TOKEN = exports.HOST = exports.PAYPAL_API = exports.PAYPAL_API_SECRET = exports.PAYPAL_API_CLIENT = exports.SECRET_JWT = exports.PORT = void 0;
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
/**
 * Configuración global de la aplicación usando variables de entorno
 * IMPORTANTE: Todos los secretos deben estar en el archivo .env
 */
// Puerto del servidor
exports.PORT = Number(process.env.PORT) || 8000;
// JWT Secret - CRÍTICO: Debe estar en .env
exports.SECRET_JWT = process.env.JWT_SECRET || (() => {
    console.error('⚠️ ADVERTENCIA: JWT_SECRET no está configurado en .env');
    throw new Error('JWT_SECRET es requerido en las variables de entorno');
})();
// PayPal configuración
exports.PAYPAL_API_CLIENT = process.env.PAYPAL_API_CLIENT;
exports.PAYPAL_API_SECRET = process.env.PAYPAL_API_SECRET;
exports.PAYPAL_API = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';
// URLs dinámicas basadas en entorno
exports.HOST = process.env.BACKEND_URL || `http://localhost:${exports.PORT}/api/paypal`;
// MercadoPago - CRÍTICO: Debe estar en .env
exports.MERCADOPAGO_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN || (() => {
    console.error('⚠️ ADVERTENCIA: MERCADOPAGO_ACCESS_TOKEN no está configurado en .env');
    throw new Error('MERCADOPAGO_ACCESS_TOKEN es requerido en las variables de entorno');
})();
// URLs para webhooks y redirecciones
exports.NGROK_URL = process.env.NGROK_URL;
exports.BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${exports.PORT}`;
exports.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4200';
//# sourceMappingURL=enviorenment.js.map