// services/auth.service.ts
import Usuario from '../models/usuario';
import Medico from '../models/medico';
import InfoClinica from '../models/info-clinica';
import bcrypt from 'bcrypt';
import JwtGenerate from '../helpers/jwt';
import Email from '../helpers/emails';
import RolService from './rol.service';
import { getMenuFrontEnd } from '../helpers/menu-frontend';
import * as generatePassword from 'generate-password';
import { UserRole } from '../types/enums';
import Rol from '../models/rol';

/**
 * Servicio de autenticación que maneja todas las operaciones relacionadas
 * con el registro, login y gestión de credenciales de usuarios.
 */
export default class AuthService {
  private static _instance: AuthService;
  private rolService: RolService;

  private constructor() {
    this.rolService = RolService.instance;
  }

  public static get instance() {
    return this._instance || (this._instance = new AuthService());
  }

  /**
   * Verifica si un email ya está registrado en el sistema
   * @param email Email a verificar
   * @returns true si el email existe, false si no
   */
  public async verificarEmailExistente(email: string): Promise<boolean> {
    const usuarioExistente = await Usuario.findOne({ where: { email } });
    if (usuarioExistente) return true;
    
    const medicoExistente = await Medico.findOne({ where: { email } });
    if (medicoExistente) return true;
    
    return false;
  }

  /**
   * Verifica si un teléfono ya está registrado en el sistema
   * @param telefono Teléfono a verificar
   * @returns true si el teléfono existe, false si no
   */
  public async verificarTelefonoExistente(telefono: string): Promise<boolean> {
    const usuarioExistente = await Usuario.findOne({ where: { telefono } });
    if (usuarioExistente) return true;
    
    const medicoExistente = await Medico.findOne({ where: { telefono } });
    if (medicoExistente) return true;
    
    return false;
  }

  /**
   * Registra un nuevo usuario en el sistema
   * @param userData Datos del usuario a registrar
   * @returns Objeto con el usuario registrado, token JWT y menú según su rol
   */
 public async registrarUsuario(userData: any) {
  console.log("🔍 INICIANDO REGISTRO DE USUARIO");
  console.log("🔍 userData recibido:", userData);
  
  // ✅ BUSCAR Y ASIGNAR ROL DE USUARIO POR CÓDIGO (OPCIÓN ROBUSTA)
  console.log("🔍 Buscando rol USER_ROLE en la base de datos...");
  
  const rolUsuario = await Rol.findOne({ where: { codigo: 'USER_ROLE' } });
  console.log("🔍 Resultado de búsqueda de rol:", rolUsuario);
  
  if (!rolUsuario) {
    console.error("❌ Error: Rol USER_ROLE no encontrado");
    throw new Error('Rol de usuario no encontrado en el sistema');
  }
  
  console.log("✅ Rol encontrado:", { id: rolUsuario.id, codigo: rolUsuario.codigo });
  
  // Asignar el rolId encontrado
  userData.rolId = rolUsuario.id;
  console.log("✅ rolId asignado a userData:", userData.rolId);
  
  // Encriptar la contraseña
  const salt = bcrypt.genSaltSync();
  userData.password = bcrypt.hashSync(userData.password, salt);
  
  console.log("---------------AQUI EL USUARIO CON ROLID------------", userData);
  console.log("password encriptado", userData.password);
  console.log("rolId FINAL asignado:", userData.rolId);
  
  // Crear usuario en la base de datos
  console.log("🔍 Creando usuario en la base de datos...");
  const nuevoUsuario = await Usuario.create(userData);
  console.log("✅ Usuario creado con rolId:", nuevoUsuario.rolId);
  
  // Obtener el rol del usuario (ya sabemos que existe)
  const rolCodigo = rolUsuario.codigo;
  console.log("✅ Código de rol para JWT:", rolCodigo);
  
  // Generar JWT usando el código del rol
  const token = await JwtGenerate.instance.generarJWT(
    nuevoUsuario.rut,
    nuevoUsuario.nombre,
    nuevoUsuario.apellidos,
    rolCodigo // Usamos el código del rol
  );
  
  console.log("✅ JWT generado con rol:", rolCodigo);
  
  // Obtener menú según el rol
  const menu = getMenuFrontEnd(rolCodigo);
  
  // Obtener información de la clínica
  const infoClinica = await InfoClinica.findOne();
  
  // Datos para devolver (excluir contraseña)
  const usuarioJSON = nuevoUsuario.toJSON();
  
  // Agregar el rol como propiedad separada para compatibilidad
  usuarioJSON.rol = rolCodigo;
  console.log("✅ Usuario JSON final con rol:", usuarioJSON.rol);
  
  const { password, ...usuarioSinPassword } = usuarioJSON;
  
  return {
    userOrMedico: usuarioSinPassword,
    token,
    menu,
    infoClinica
  };
}
  /**
   * Autentica a un usuario en el sistema
   * @param email Email del usuario
   * @param password Contraseña del usuario
   * @returns Objeto con el usuario autenticado, token JWT y menú según su rol
   * @throws Error si las credenciales son inválidas o el usuario está inactivo
   */
  public async autenticarUsuario(email: string, password: string) {
    // Buscar primero en usuarios
    let entidadAutenticada: any = null;
    let rolCodigo = '';
    
    // Intentar autenticar como usuario regular
    const usuario = await Usuario.findOne({ 
      where: { email },
      include: [{
        model: Rol,
        as: 'rol'
      }]
    });
    
    if (usuario) {
      // Verificar si está activo
      if (usuario.estado === 'inactivo') {
        throw new Error('El usuario está inactivo');
      }
      
      // Verificar contraseña
      const validPassword = bcrypt.compareSync(password, usuario.password);
      if (!validPassword) {
        throw new Error('Contraseña no válida');
      }
      
      entidadAutenticada = usuario;
      
      // Convertir el modelo de Sequelize a un objeto plano de JavaScript
      const usuarioJSON = usuario.toJSON();
      
      // Extraer el código del rol de forma segura
      rolCodigo = usuarioJSON.rol?.codigo || UserRole.USER;
      
      // Agregar el rol como propiedad directa para compatibilidad con el frontend
      usuarioJSON.rol = rolCodigo;
      
      entidadAutenticada = usuarioJSON;
    } else {
      // Si no es usuario, intentar como médico
      const medico = await Medico.findOne({ where: { email } });
      
      if (medico) {
        // Verificar si está activo
        if (medico.estado === 'inactivo') {
          throw new Error('El médico está inactivo');
        }
        
        // Verificar contraseña
        const validPassword = bcrypt.compareSync(password, medico.password);
        if (!validPassword) {
          throw new Error('Contraseña no válida');
        }
        
        entidadAutenticada = medico.toJSON();
        rolCodigo = medico.rol || UserRole.MEDICO;
      } else {
        // Si no se encontró ni como usuario ni como médico
        throw new Error('Usuario o médico no encontrado');
      }
    }
    
    // Generar JWT
    const token = await JwtGenerate.instance.generarJWT(
      entidadAutenticada.rut,
      entidadAutenticada.nombre,
      entidadAutenticada.apellidos,
      rolCodigo
    );
    
    // Obtener menú según el rol
    const menu = getMenuFrontEnd(rolCodigo);
    
    // Obtener información de la clínica
    const infoClinica = await InfoClinica.findOne();
    
    // Datos para devolver (excluir contraseña)
    const { password: _, ...entidadSinPassword } = entidadAutenticada;
    
    return {
      userOrMedico: entidadSinPassword, // Cambiado de "entidad" a "userOrMedico" para compatibilidad con frontend
      token,
      menu,
      infoClinica,
      rol: rolCodigo // Mantener esta propiedad para compatibilidad
    };
  }

  /**
   * Revalida un token JWT existente
   * @param rut RUT del usuario o médico
   * @param rol Rol del usuario o médico
   * @returns Nuevo token JWT y datos del usuario o médico
   * @throws Error si el usuario o médico no existe
   */
  public async revalidarToken(rut: string, rol: string) {
    console.log('🔍 Backend AuthService - revalidarToken iniciado con:', { rut, rol });
    let userOrMedico;
    
    // Buscar según el rol
    if (rol === UserRole.USER || rol === UserRole.ADMIN) {
      console.log('🔍 Buscando usuario con rut:', rut);
      userOrMedico = await Usuario.findOne({ 
        where: { rut },
        include: [{
          model: Rol,
          as: 'rol'
        }]
      });
      
      if (userOrMedico) {
        console.log('🔍 Usuario encontrado:', userOrMedico.nombre);
        // Convertir a JSON y asegurarnos de que rol sea una cadena para el frontend
        const usuarioJSON = userOrMedico.toJSON();
        console.log('🔍 Usuario JSON antes de procesamiento:', usuarioJSON);
        // Extraer el código del rol de forma segura
        const rolCodigo = usuarioJSON.rol?.codigo || rol;
        console.log('🔍 Código de rol extraído:', rolCodigo);
        // Agregar el rol como propiedad directa para compatibilidad
        usuarioJSON.rol = rolCodigo;
        userOrMedico = usuarioJSON;
        console.log('🔍 Usuario JSON después de procesamiento:', userOrMedico);
      } else {
        console.log('🔍 No se encontró usuario con rut:', rut);
      }
    } else if (rol === UserRole.MEDICO) {
      console.log('🔍 Buscando médico con rut:', rut);
      userOrMedico = await Medico.findOne({ 
        where: { rut },
        include: [{
          model: Rol,
          as: 'rol'
        }]
      });
      if (userOrMedico) {
        console.log('🔍 Médico encontrado:', userOrMedico.nombre);
        const medicoJSON = userOrMedico.toJSON();
        console.log('🔍 Médico JSON antes de procesamiento:', medicoJSON);
        // Extraer el código del rol de forma segura
        const rolCodigo = medicoJSON.rol?.codigo || rol;
        console.log('🔍 Código de rol extraído:', rolCodigo);
        // Agregar el rol como propiedad directa para compatibilidad
        medicoJSON.rol = rolCodigo;
        userOrMedico = medicoJSON;
        console.log('🔍 Médico JSON después de procesamiento:', userOrMedico);
      } else {
        console.log('🔍 No se encontró médico con rut:', rut);
      }
    }
    
    if (!userOrMedico) {
      console.error('🔍 Error: Usuario o médico no encontrado con rut:', rut);
      throw new Error('Usuario o médico no encontrado');
    }
    
    // Obtener información de la clínica
    console.log('🔍 Obteniendo información de la clínica');
    const infoClinica = await InfoClinica.findOne();
    
    // Generar nuevo token
    console.log('🔍 Generando nuevo token para:', { rut, nombre: userOrMedico.nombre, rol });
    const newToken = await JwtGenerate.instance.generarJWT(
      userOrMedico.rut,
      userOrMedico.nombre,
      userOrMedico.apellidos,
      rol // Aquí ya recibimos el código del rol, no el ID
    );
    
    // Obtener menú según el rol
    console.log('🔍 Obteniendo menú para rol:', rol);
    const menu = getMenuFrontEnd(rol);
    
    // Excluir contraseña
    const { password, ...userOrMedicoSinPassword } = userOrMedico;
    
    const resultado = {
      token: newToken,
      userOrMedico: userOrMedicoSinPassword,  // Ya está nombrado correctamente para compatibilidad
      menu,
      infoClinica,
      rol // Incluir explícitamente el rol en la respuesta
    };
    
    console.log('🔍 Respuesta final de revalidarToken:', {
      token: newToken ? 'Token generado' : 'Error en token',
      userOrMedico: 'Datos procesados',
      menu: menu ? `Menú con ${menu.length} items` : 'Sin menú',
      infoClinica: infoClinica ? 'Información de clínica presente' : 'Sin información de clínica',
      rol
    });
    
    return resultado;
  }

  /**
   * Recupera la contraseña de un usuario o médico
   * @param nombre Nombre del usuario o médico
   * @param email Email del usuario o médico
   * @returns Mensaje de éxito si se envió el correo
   * @throws Error si no se encuentra el usuario o médico o los datos son incorrectos
   */
  public async recuperarPassword(nombre: string, email: string) {
    // Intentar encontrar primero en usuarios
    let entidad: any = await Usuario.findOne({ where: { nombre } });
    
    if (!entidad) {
      // Si no es usuario, buscar en médicos
      entidad = await Medico.findOne({ where: { nombre } });
      
      if (!entidad) {
        throw new Error('El usuario o médico no existe');
      }
    }
    
    // Verificar si está inactivo
    if (entidad.estado === 'inactivo') {
      throw new Error('El usuario o médico está inactivo y no puede recuperar la contraseña');
    }
    
    // Verificar email
    if (email !== entidad.email) {
      throw new Error('El email es incorrecto');
    }
    
    // Generar nueva contraseña
    const password = generatePassword.generate({ length: 10, numbers: true });
    
    // Encriptar nueva contraseña
    const salt = bcrypt.genSaltSync();
    entidad.password = bcrypt.hashSync(password, salt);
    
    // Guardar cambios
    await entidad.save();
    
    // Enviar correo con nueva contraseña
    Email.instance.enviarEmail(email, nombre, password);
    
    return {
      msg: `Correo enviado a: ${email} satisfactoriamente`
    };
  }
}