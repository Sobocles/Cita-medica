import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, catchError, map } from 'rxjs';
import { environment } from 'src/environment/environment';
import { TokenService } from './token.service';

const base_url = environment.base_url;

/**
 * Servicio especializado en operaciones relacionadas con contraseñas
 *
 * Responsabilidades:
 * - Recuperación de contraseñas
 * - Cambio de contraseñas para usuarios
 * - Cambio de contraseñas para médicos
 *
 * Este servicio sigue el patrón SRP (Single Responsibility Principle)
 */
@Injectable({
  providedIn: 'root'
})
export class PasswordService {

  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) { }

  /**
   * Solicita la recuperación de contraseña para un usuario o médico
   * Envía un correo con una nueva contraseña generada
   *
   * @param nombre - Nombre del usuario o médico
   * @param email - Email del usuario o médico
   * @returns Observable<boolean | string> - true si fue exitoso, mensaje de error si falló
   *
   * @example
   * ```typescript
   * this.passwordService.recuperarPassword('Juan', 'juan@gmail.com')
   *   .subscribe(result => {
   *     if (result === true) {
   *       console.log('Email enviado');
   *     } else {
   *       console.error('Error:', result);
   *     }
   *   });
   * ```
   */
  recuperarPassword(nombre: string, email: string): Observable<boolean | string> {
    const url = `${base_url}/login/RecuperarPassword`;
    const body = { nombre, email };

    return this.http.post<any>(url, body).pipe(
      map((resp: any) => resp.ok),
      catchError(err => of(err.error?.msg || 'Error al recuperar contraseña'))
    );
  }

  /**
   * Cambia la contraseña de un usuario (no médico)
   *
   * @param rut - RUT del usuario
   * @param password - Contraseña actual
   * @param newPassword - Nueva contraseña
   * @returns Observable<boolean | string> - true si fue exitoso, mensaje de error si falló
   *
   * @example
   * ```typescript
   * this.passwordService.cambiarPasswordUsuario('12345678-9', 'oldPass', 'newPass')
   *   .subscribe(result => {
   *     if (result === true) {
   *       Swal.fire('Éxito', 'Contraseña actualizada', 'success');
   *     } else {
   *       Swal.fire('Error', result, 'error');
   *     }
   *   });
   * ```
   */
  cambiarPasswordUsuario(
    rut: string,
    password: string,
    newPassword: string
  ): Observable<boolean | string> {
    if (!this.tokenService.hasToken()) {
      return of('No hay sesión activa');
    }

    const url = `${base_url}/usuarios/cambiarPassword`;
    const body = { rut, password, newPassword };
    const options = this.tokenService.getBearerHeaders();

    return this.http.post<any>(url, body, options).pipe(
      map((resp: any) => resp.ok),
      catchError(err => of(err.error?.msg || 'Error al cambiar contraseña'))
    );
  }

  /**
   * Cambia la contraseña de un médico
   *
   * @param rut - RUT del médico
   * @param password - Contraseña actual
   * @param newPassword - Nueva contraseña
   * @returns Observable<boolean | string> - true si fue exitoso, mensaje de error si falló
   *
   * @example
   * ```typescript
   * this.passwordService.cambiarPasswordMedico('12345678-9', 'oldPass', 'newPass')
   *   .subscribe(result => {
   *     if (result === true) {
   *       Swal.fire('Éxito', 'Contraseña actualizada', 'success');
   *     } else {
   *       Swal.fire('Error', result, 'error');
   *     }
   *   });
   * ```
   */
  cambiarPasswordMedico(
    rut: string,
    password: string,
    newPassword: string
  ): Observable<boolean | string> {
    if (!this.tokenService.hasToken()) {
      return of('No hay sesión activa');
    }

    const url = `${base_url}/medicos/cambiarPassword`;
    const body = { rut, password, newPassword };
    const options = this.tokenService.getBearerHeaders();

    return this.http.post<any>(url, body, options).pipe(
      map((resp: any) => resp.ok),
      catchError(err => of(err.error?.msg || 'Error al cambiar contraseña'))
    );
  }

  /**
   * Cambia la contraseña según el tipo de usuario (usuario o médico)
   * Método de conveniencia que detecta automáticamente si es médico o usuario
   *
   * @param rut - RUT del usuario o médico
   * @param password - Contraseña actual
   * @param newPassword - Nueva contraseña
   * @param esMedico - true si es médico, false si es usuario
   * @returns Observable<boolean | string> - true si fue exitoso, mensaje de error si falló
   *
   * @example
   * ```typescript
   * const esMedico = this.authService.medico !== undefined;
   * this.passwordService.cambiarPassword(rut, oldPass, newPass, esMedico)
   *   .subscribe(result => {
   *     // Manejar resultado
   *   });
   * ```
   */
  cambiarPassword(
    rut: string,
    password: string,
    newPassword: string,
    esMedico: boolean
  ): Observable<boolean | string> {
    return esMedico
      ? this.cambiarPasswordMedico(rut, password, newPassword)
      : this.cambiarPasswordUsuario(rut, password, newPassword);
  }
}
