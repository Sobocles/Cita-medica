import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError, map, of, tap } from 'rxjs';
import { environment } from 'src/environment/environment';
import { Usuario } from 'src/app/models/usuario';
import { RegisterForm } from '../interfaces/register-form.register';
import { Paciente } from 'src/app/admin/pages/interface/paciente';
import { Medico } from 'src/app/models/medico';
import { InfoClinica } from 'src/app/models/infoClinica';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public usuario!: Usuario;
  public medico!: Medico;
  public infoClinica!: InfoClinica;

  constructor(private http: HttpClient) {
    this.validarToken()
  }

  get token(): string {
    return localStorage.getItem('token') || '';
  }

  get headers() {
    return { 
      headers: {
        'x-token': this.token //ESTE ES EL GET TOKEN
      }
    }
  }
  
  guardarLocalStorage(token: string, menu: any) {
    localStorage.setItem('token', token);
    localStorage.setItem('menu', JSON.stringify(menu)); //El localStorage solo guarda string por lo tanto hay que convertir el menu (porque es un arreglo de objetos)
  }
  
  login(email: string, password: string) {
    console.log('🔑 Iniciando login con email:', email);
    console.log("HOLAAA");
    const body = { email, password };
    console.log("aqui",body);
    return this.http.post(`${base_url}/login`, body).pipe(
      tap((resp: any) => {
        console.log('🔑 Respuesta completa de login:', resp);
        console.log('🔑 userOrMedico:', resp.userOrMedico);
        console.log('🔑 Rol en respuesta:', resp.userOrMedico?.rol || resp.rol);
        console.log('🔑 Menú recibido:', resp.menu);
        this.guardarLocalStorage(resp.token, resp.menu);
      }),
      catchError(error => {
        console.error('🔑 Error en login:', error);
        return throwError(() => error);
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('menu'); 
  }

  crearUsuario(formData: RegisterForm): Observable<RegisterForm> {
    console.log('Creando usuario con datos:', formData);    
    return this.http.post<RegisterForm>(`${base_url}/login/registro`, formData)
      .pipe(
        tap((resp: any) => {
          console.log('Respuesta de registro exitosa:', resp);
        }),
        catchError(error => {
          console.error('Error en registro de usuario:', error);
          // Extraer el mensaje específico de error si está disponible
          if (error.error && error.error.msg) {
            console.error('Mensaje del servidor:', error.error.msg);
            return throwError(() => new Error(error.error.msg));
          }
          return throwError(() => error);
        })
      );
  }

  validarToken(): Observable<boolean> {
    console.log('⭐ Iniciando validación del token...');
    const token = localStorage.getItem('token');
    console.log('⭐ Token actual:', token ? 'Existe' : 'No existe');
    
    const options = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  
    return this.http.post(`${base_url}/login/revalidarToken`, {}, options).pipe(
      map((resp: any) => {
        console.log('⭐ Respuesta completa de revalidación:', resp);
        this.guardarLocalStorage(resp.token, resp.menu); 
        
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

  recuperarPassword(nombre: string, email: string) {
    const url = `${base_url}/login/RecuperarPassword`;
    const body = { nombre, email };

    return this.http.post<Paciente>(url, body).pipe(
      map((resp: Paciente) => {
        return resp.ok;
      }),
      catchError(err => of(err.error.msg))
    );
  }

  cambiarPassword(rut: string, password: string, newPassword: string) {
    if (localStorage.getItem('token')) {
      const url = `${base_url}/usuarios/cambiarPassword`;
      const headers = new HttpHeaders({
        'authorization': `Bearer ${localStorage.getItem('token')}`
      });
      const options = { headers: headers }
      const body = { rut, password, newPassword }
      
      return this.http.post<any>(url, body, options).pipe(
        map((resp: any) => {
          return resp.ok;
        }),
        catchError(err => of(err.error.msg))
      );
    } else {
      return of(false);
    }
  }

  cambiarPasswordMedico(rut: string, password: string, newPassword: string) {
    if (localStorage.getItem('token')) {
      const url = `${base_url}/medicos/cambiarPassword`;
      const headers = new HttpHeaders({
        'authorization': `Bearer ${localStorage.getItem('token')}`
      });
      const options = { headers: headers }
      const body = { rut, password, newPassword }
      
      return this.http.post<any>(url, body, options).pipe(
        map((resp: any) => {
          return resp.ok;
        }),
        catchError(err => of(err.error.msg))
      );
    } else {
      return of(false);
    }
  }
}