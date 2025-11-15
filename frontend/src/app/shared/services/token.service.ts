import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';

/**
 * Servicio especializado en el manejo de tokens JWT y localStorage
 *
 * Responsabilidades:
 * - Gestión de tokens en localStorage
 * - Gestión de menú en localStorage
 * - Generación de headers con token
 *
 * Este servicio sigue el patrón SRP (Single Responsibility Principle)
 */
@Injectable({
  providedIn: 'root'
})
export class TokenService {

  private readonly TOKEN_KEY = 'token';
  private readonly MENU_KEY = 'menu';

  constructor() { }

  /**
   * Obtiene el token JWT del localStorage
   * @returns Token JWT o string vacío si no existe
   */
  getToken(): string {
    return localStorage.getItem(this.TOKEN_KEY) || '';
  }

  /**
   * Guarda el token JWT en localStorage
   * @param token - Token JWT a guardar
   */
  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Elimina el token del localStorage
   */
  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  /**
   * Verifica si existe un token en localStorage
   * @returns true si existe token, false si no
   */
  hasToken(): boolean {
    return !!this.getToken();
  }

  /**
   * Obtiene el menú del localStorage
   * @returns Array de menú o null si no existe
   */
  getMenu(): any[] | null {
    const menu = localStorage.getItem(this.MENU_KEY);
    return menu ? JSON.parse(menu) : null;
  }

  /**
   * Guarda el menú en localStorage
   * @param menu - Array de elementos del menú
   */
  setMenu(menu: any[]): void {
    localStorage.setItem(this.MENU_KEY, JSON.stringify(menu));
  }

  /**
   * Elimina el menú del localStorage
   */
  removeMenu(): void {
    localStorage.removeItem(this.MENU_KEY);
  }

  /**
   * Guarda token y menú en localStorage
   * @param token - Token JWT
   * @param menu - Array de elementos del menú
   *
   * @example
   * ```typescript
   * this.tokenService.saveSession(response.token, response.menu);
   * ```
   */
  saveSession(token: string, menu: any[]): void {
    this.setToken(token);
    this.setMenu(menu);
  }

  /**
   * Limpia toda la sesión (token y menú)
   * Útil para logout
   */
  clearSession(): void {
    this.removeToken();
    this.removeMenu();
  }

  /**
   * Genera headers HTTP con el token de autenticación
   * Útil para requests que requieren autenticación
   * @returns Objeto con headers configurados
   *
   * @example
   * ```typescript
   * this.http.get(url, this.tokenService.getAuthHeaders())
   * ```
   */
  getAuthHeaders(): { headers: HttpHeaders } {
    return {
      headers: new HttpHeaders({
        'x-token': this.getToken()
      })
    };
  }

  /**
   * Genera headers HTTP con Authorization Bearer
   * @returns Objeto con headers configurados
   *
   * @example
   * ```typescript
   * this.http.post(url, body, this.tokenService.getBearerHeaders())
   * ```
   */
  getBearerHeaders(): { headers: HttpHeaders } {
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.getToken()}`
      })
    };
  }
}
