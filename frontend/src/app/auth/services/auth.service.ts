import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError, map, of, tap } from 'rxjs';
import { environment } from 'src/environment/environment';
import { Usuario } from 'src/app/models/usuario';
import { RegisterForm } from '../interfaces/register-form.register';
import { Medico } from 'src/app/models/medico';
import { InfoClinica } from 'src/app/models/infoClinica';
import { TokenService } from 'src/app/shared/services/token.service';
import { PasswordService } from 'src/app/shared/services/password.service';

const base_url = environment.base_url;

/**
 * Servicio de autenticación refactorizado
 *
 * Responsabilidades:
 * - Login de usuarios y médicos
 * - Registro de nuevos usuarios
 * - Logout
 * - Validación de tokens
 * - Gestión del estado de usuario/médico autenticado
 *
 * Delega a:
 * - TokenService: Manejo de tokens y localStorage
 * - PasswordService: Recuperación y cambio de contraseñas
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public usuario!: Usuario;
  public medico!: Medico;
  public infoClinica!: InfoClinica;

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
    public passwordService: PasswordService
  ) {
    this.validarToken()
  }

  /**
   * Getter para acceder al token
   * Delega a TokenService
   */
  get token(): string {
    return this.tokenService.getToken();
  }

  /**
   * Getter para headers con token
   * Delega a TokenService
   */
  get headers() {
    return this.tokenService.getAuthHeaders();
  }
  
  /**
   * Inicia sesión con email y contraseña
   * @param email - Email del usuario o médico
   * @param password - Contraseña
   * @returns Observable con la respuesta del servidor
   */
  login(email: string, password: string) {
    console.log('🔑 Iniciando login con email:', email);
    const body = { email, password };

    return this.http.post(`${base_url}/login`, body).pipe(
      tap((resp: any) => {
        console.log('🔑 Respuesta completa de login:', resp);
        console.log('🔑 userOrMedico:', resp.userOrMedico);
        console.log('🔑 Rol en respuesta:', resp.userOrMedico?.rol || resp.rol);
        console.log('🔑 Menú recibido:', resp.menu);

        // Delegar guardado de sesión a TokenService
        this.tokenService.saveSession(resp.token, resp.menu);
      }),
      catchError(error => {
        console.error('🔑 Error en login:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Cierra la sesión del usuario
   * Limpia token y menú del localStorage
   */
  logout() {
    this.tokenService.clearSession();
  }

  /**
   * Registra un nuevo usuario en el sistema
   * @param formData - Datos del formulario de registro
   * @returns Observable con la respuesta del servidor
   */
  crearUsuario(formData: RegisterForm): Observable<RegisterForm> {
    console.log('Creando usuario con datos:', formData);

    return this.http.post<RegisterForm>(`${base_url}/login/registro`, formData)
      .pipe(
        tap((resp: any) => {
          console.log('Respuesta de registro exitosa:', resp);
        }),
        catchError(error => {
          console.error('Error en registro de usuario:', error);
          console.error('Mensaje del servidor:', error.error?.msg || 'Error desconocido');
          return throwError(() => error);
        })
      );
  }

  /**
   * Valida el token JWT actual y recarga la sesión
   * @returns Observable<boolean> - true si el token es válido, false si no
   */
  validarToken(): Observable<boolean> {
    console.log('⭐ Iniciando validación del token...');
    const token = this.tokenService.getToken();
    console.log('⭐ Token actual:', token ? 'Existe' : 'No existe');

    if (!token) {
      return of(false);
    }

    const options = this.tokenService.getBearerHeaders();

    return this.http.post(`${base_url}/login/revalidarToken`, {}, options).pipe(
      map((resp: any) => {
        console.log('⭐ Respuesta completa de revalidación:', resp);

        // Delegar guardado de sesión a TokenService
        this.tokenService.saveSession(resp.token, resp.menu); 
        
        if (!resp.userOrMedico) {
          console.error('❌ Error: userOrMedico no está definido en la respuesta');
          return false;
        }
        
        // Obtener el rol de cualquiera de las dos fuentes posibles
        const rolUsuario = resp.userOrMedico.rol || resp.rol;
        console.log('⭐ Rol obtenido en validarToken:', rolUsuario);
        console.log('⭐ Tipo de dato de rol:', typeof rolUsuario);
        
        // Obtener datos del usuario
        const { rut, nombre, apellidos } = resp.userOrMedico;
        console.log('⭐ Datos extraídos de userOrMedico:', { rut, nombre, apellidos });
        
        // Comprueba si existe información de la clínica antes de crear una instancia
        if (resp.infoClinica) {
          const { nombreClinica, direccion, telefono, email } = resp.infoClinica;
          this.infoClinica = new InfoClinica(nombreClinica, direccion, telefono, email);
          console.log('⭐ infoClinica creada:', this.infoClinica);
        } else {
          console.log('⭐ No hay datos de infoClinica');
        }
  
        // Comprobamos el rol para determinar si instanciamos un Usuario o un Medico
        if (rolUsuario === 'MEDICO_ROLE') {
          console.log('⭐ Creando instancia de médico con datos:', { nombre, apellidos, rolUsuario, rut });
          this.medico = new Medico(nombre, apellidos, rolUsuario, rut);
          console.log('⭐ Médico autenticado:', this.medico);
          // Asegúrate de que usuario sea null/undefined para evitar confusiones
       
          console.log('⭐ Variable usuario limpiada:', this.usuario);
        } else { 
          console.log('⭐ Creando instancia de usuario con datos:', { nombre, apellidos, rolUsuario, rut });
          this.usuario = new Usuario(nombre, apellidos, rolUsuario, rut);
          console.log('⭐ Usuario autenticado:', this.usuario);
          // Asegúrate de que medico sea null/undefined para evitar confusiones

          console.log('⭐ Variable medico limpiada:', this.medico);
        }
  
        return true;
      }),
      catchError((error) => {
        console.error('❌ Error en validación de token:', error);
        if (error.status) {
          console.error('❌ Estado HTTP:', error.status);
        }
        if (error.error) {
          console.error('❌ Mensaje de error:', error.error);
        }
        return of(false);
      })
    );
  }

  /**
   * @deprecated Usa passwordService.recuperarPassword() en su lugar
   * Este método se mantiene por compatibilidad con código existente
   */
  recuperarPassword(nombre: string, email: string) {
    return this.passwordService.recuperarPassword(nombre, email);
  }

  /**
   * @deprecated Usa passwordService.cambiarPasswordUsuario() en su lugar
   * Este método se mantiene por compatibilidad con código existente
   */
  cambiarPassword(rut: string, password: string, newPassword: string) {
    return this.passwordService.cambiarPasswordUsuario(rut, password, newPassword);
  }

  /**
   * @deprecated Usa passwordService.cambiarPasswordMedico() en su lugar
   * Este método se mantiene por compatibilidad con código existente
   */
  cambiarPasswordMedico(rut: string, password: string, newPassword: string) {
    return this.passwordService.cambiarPasswordMedico(rut, password, newPassword);
  }
}