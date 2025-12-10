import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ErrorHandlerService } from '../services/error-handler.service';
import { Router } from '@angular/router';

/**
 * Interceptor HTTP para manejo global de errores
 *
 * Responsabilidades:
 * - Interceptar todas las respuestas HTTP con errores
 * - Manejar errores de autenticación (401, 403)
 * - Registrar errores en consola para debugging
 * - Delegar manejo de errores a ErrorHandlerService cuando sea apropiado
 *
 * Este interceptor NO muestra mensajes automáticamente para permitir
 * que los componentes manejen errores específicos si lo necesitan.
 * Sin embargo, proporciona un manejo centralizado para errores críticos.
 */
@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {

  constructor(
    private errorHandler: ErrorHandlerService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Logging para debugging
        console.error('❌ HTTP Error interceptado:', {
          url: request.url,
          method: request.method,
          status: error.status,
          statusText: error.statusText,
          message: error.error?.msg || error.message
        });

        // Manejo de errores específicos
        switch (error.status) {
          case 401:
            // No autorizado - Token inválido o expirado
            this.handleUnauthorizedError();
            break;

          case 403:
            // Prohibido - No tiene permisos
            this.handleForbiddenError();
            break;

          case 0:
            // Error de red - Servidor no disponible
            this.handleNetworkError();
            break;

          case 500:
            // Error interno del servidor
            this.handleServerError(error);
            break;

          // Para otros errores, permitir que el componente los maneje
          default:
            // No hacer nada - dejar que el componente maneje el error
            break;
        }

        // Siempre propagar el error para que los componentes puedan manejarlo
        return throwError(() => error);
      })
    );
  }

  /**
   * Maneja errores 401 (No autorizado)
   * Redirige al login y limpia la sesión
   */
  private handleUnauthorizedError(): void {
    console.warn('⚠️ Token inválido o expirado. Redirigiendo al login...');

    // Limpiar localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('menu');

    // Mostrar mensaje y redirigir
    this.errorHandler.showWarning(
      'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
      'Sesión expirada'
    );

    // Redirigir al login
    setTimeout(() => {
      this.router.navigate(['/auth/login']);
    }, 2000);
  }

  /**
   * Maneja errores 403 (Prohibido)
   * El usuario no tiene permisos para acceder a este recurso
   */
  private handleForbiddenError(): void {
    console.warn('⚠️ Acceso prohibido. El usuario no tiene permisos.');

    this.errorHandler.showError(
      'No tienes permisos para realizar esta acción.',
      'Acceso denegado'
    );
  }

  /**
   * Maneja errores de red (status 0)
   * Generalmente ocurre cuando el servidor no está disponible
   */
  private handleNetworkError(): void {
    console.error('❌ Error de conexión con el servidor');

    this.errorHandler.showError(
      'No se pudo conectar con el servidor. Por favor verifica tu conexión a internet.',
      'Error de conexión'
    );
  }

  /**
   * Maneja errores 500 (Error interno del servidor)
   * Muestra un mensaje genérico al usuario
   */
  private handleServerError(error: HttpErrorResponse): void {
    console.error('❌ Error interno del servidor:', error);

    // Solo mostrar mensaje si no hay un mensaje específico del backend
    if (!error.error?.msg) {
      this.errorHandler.showError(
        'Ha ocurrido un error en el servidor. Por favor intenta nuevamente más tarde.',
        'Error del servidor'
      );
    }
    // Si hay mensaje del backend, dejar que el componente lo maneje
  }
}
