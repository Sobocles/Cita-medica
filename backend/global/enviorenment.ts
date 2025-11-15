import { Secret } from "jsonwebtoken";
import { config } from "dotenv";
config();

/**
 * Configuración global de la aplicación usando variables de entorno
 * IMPORTANTE: Todos los secretos deben estar en el archivo .env
 */

// Puerto del servidor
export const PORT: number = Number(process.env.PORT) || 8000;

// JWT Secret - CRÍTICO: Debe estar en .env
export const SECRET_JWT: Secret = process.env.JWT_SECRET || (() => {
  console.error('⚠️ ADVERTENCIA: JWT_SECRET no está configurado en .env');
  throw new Error('JWT_SECRET es requerido en las variables de entorno');
})();

// PayPal configuración
export const PAYPAL_API_CLIENT = process.env.PAYPAL_API_CLIENT;
export const PAYPAL_API_SECRET = process.env.PAYPAL_API_SECRET;
export const PAYPAL_API = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';

// URLs dinámicas basadas en entorno
export const HOST = process.env.BACKEND_URL || `http://localhost:${PORT}/api/paypal`;

// MercadoPago - CRÍTICO: Debe estar en .env
export const MERCADOPAGO_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN || (() => {
  console.error('⚠️ ADVERTENCIA: MERCADOPAGO_ACCESS_TOKEN no está configurado en .env');
  throw new Error('MERCADOPAGO_ACCESS_TOKEN es requerido en las variables de entorno');
})();

// URLs para webhooks y redirecciones
export const NGROK_URL = process.env.NGROK_URL;
export const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${PORT}`;
export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4200';
