// controllers/auth.ts
import { Request, Response } from "express";
import AuthService from '../services/auth.service';
import RolService from '../services/rol.service';
import ApiResponse from '../Utils/api-response';

/**
 * Controlador para manejar la autenticación y autorización de usuarios
 */
export default class Auth {
  private static _instance: Auth;
  private authService: AuthService;
  private rolService: RolService;

  constructor() {
    this.authService = AuthService.instance;
    this.rolService = RolService.instance;
  }

  public static get instance() {
    return this._instance || (this._instance = new Auth());
  }

  /**
   * Endpoint para iniciar sesión
   */
  login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    console.log("AQUI ESTA EL LOGIN!!!!!!!!!!!!");

    try {
      // Autenticar usuario (incluye validación de credenciales, generación de token y menú)
      const resultado = await this.authService.autenticarUsuario(email, password);
      return ApiResponse.success(res, resultado);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al autenticar';
      
      // Determinar código de estado según el mensaje de error
      let statusCode = 500;
      if (errorMessage.includes('inactivo')) statusCode = 403;
      else if (errorMessage.includes('no encontrado')) statusCode = 404;
      else if (errorMessage.includes('no válida')) statusCode = 400;
      
      return ApiResponse.error(res, errorMessage, statusCode);
    }
  };

  /**
   * Endpoint para registrar un nuevo usuario
   */
  registro = async(req: Request, res: Response) => {

    console.log("entro a crear usuario");
    const { email, password, nombre, apellidos, telefono } = req.body;

    try {
      // Verificar si el correo ya está registrado
      if (await this.authService.verificarEmailExistente(email)) {
        return ApiResponse.error(res, 'El correo ya está registrado');
      }

      // Verificar si el teléfono ya está registrado
      if (await this.authService.verificarTelefonoExistente(telefono)) {
        return ApiResponse.error(res, 'El teléfono ya está registrado');
      }

      // Registrar usuario (incluye asignación de rol, generación de token y menú)
      const resultado = await this.authService.registrarUsuario(req.body);

      // Enviar respuesta exitosa
      return ApiResponse.success(res, resultado, 201);
    } catch (error) {
      return ApiResponse.serverError(res, error);
    }
  };

  /**
   * Endpoint para recuperar contraseña
   */
  recuperarPassword = async(req: Request, res: Response) => {
    const { nombre, email } = req.body;

    try {
      const resultado = await this.authService.recuperarPassword(nombre, email);
      return ApiResponse.success(res, resultado);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al recuperar contraseña';
      
      // Determinar código de estado según el mensaje de error
      let statusCode = 400;
      
      return ApiResponse.error(res, errorMessage, statusCode);
    }
  };

  /**
   * Endpoint para revalidar el token
   */
  revalidarToken = async(req: Request | any, res: Response) => {
    console.log('🔄 Iniciando revalidación de token en el backend');
    try {
      const rut = req.rut;
      const rol = req.rol;
      console.log('🔄 Datos extraídos del token JWT:', { rut, rol });
      
      if (!rol) {
        console.error('🔄 Error: Rol no definido en el token');
        return ApiResponse.error(res, 'Rol no definido', 400);
      }
      if (!rut) {
        console.error('🔄 Error: RUT no definido en el token');
        return ApiResponse.error(res, 'RUT no definido', 400);
      }
      console.log('🔄 Llamando a authService.revalidarToken con:', { rut, rol });
      const resultado = await this.authService.revalidarToken(rut, rol);
      console.log('🔄 Resultado de authService.revalidarToken:', resultado);
      return ApiResponse.success(res, resultado);
    } catch (error) {
      console.error('🔄 Error en revalidación de token:', error);
      return ApiResponse.serverError(res, error);
    }
  };
}