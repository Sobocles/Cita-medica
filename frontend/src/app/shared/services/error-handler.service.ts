import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';
import { HttpErrorResponse } from '@angular/common/http';

/**
 * Servicio centralizado para manejo de errores y notificaciones
 *
 * Responsabilidades:
 * - Mostrar mensajes de error estandarizados
 * - Extraer mensajes de errores HTTP
 * - Mostrar mensajes de éxito
 * - Mostrar mensajes de advertencia
 * - Mostrar confirmaciones
 *
 * Este servicio sigue el patrón SRP (Single Responsibility Principle)
 * y proporciona una interfaz consistente para todas las notificaciones
 * de la aplicación.
 */
@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  constructor() { }

  /**
   * Extrae el mensaje de error de diferentes formatos de respuesta HTTP
   *
   * @param error - Error HTTP o cualquier objeto de error
   * @returns Mensaje de error legible para el usuario
   *
   * @example
   * ```typescript
   * const mensaje = this.errorHandler.extractErrorMessage(error);
   * // Retorna: "El correo electrónico ya está registrado"
   * ```
   */
  extractErrorMessage(error: any): string {
    // Si es un HttpErrorResponse
    if (error instanceof HttpErrorResponse) {
      // Intenta obtener el mensaje del backend
      if (error.error?.msg) {
        return error.error.msg;
      }

      // Si no hay mensaje específico, usar el statusText
      if (error.statusText && error.statusText !== 'Unknown Error') {
        return error.statusText;
      }

      // Mensajes por código de estado HTTP
      switch (error.status) {
        case 0:
          return 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
        case 400:
          return 'Solicitud inválida. Verifica los datos ingresados.';
        case 401:
          return 'No autorizado. Por favor inicia sesión nuevamente.';
        case 403:
          return 'No tienes permisos para realizar esta acción.';
        case 404:
          return 'Recurso no encontrado.';
        case 500:
          return 'Error interno del servidor. Inténtalo más tarde.';
        default:
          return `Error ${error.status}: ${error.message || 'Error desconocido'}`;
      }
    }

    // Si es un objeto de error simple con mensaje
    if (error?.error?.msg) {
      return error.error.msg;
    }

    // Si es un string
    if (typeof error === 'string') {
      return error;
    }

    // Si tiene propiedad message
    if (error?.message) {
      return error.message;
    }

    // Fallback genérico
    return 'Ha ocurrido un error inesperado. Por favor intenta nuevamente.';
  }

  /**
   * Muestra un mensaje de error usando SweetAlert2
   *
   * @param error - Error HTTP o mensaje de error
   * @param title - Título del modal (opcional, por defecto "Error")
   *
   * @example
   * ```typescript
   * // Con error HTTP
   * this.errorHandler.showError(error);
   *
   * // Con mensaje personalizado
   * this.errorHandler.showError('No se pudo guardar el registro');
   *
   * // Con título personalizado
   * this.errorHandler.showError(error, 'Error al crear cita');
   * ```
   */
  showError(error: any, title: string = 'Error'): void {
    const mensaje = this.extractErrorMessage(error);

    Swal.fire({
      icon: 'error',
      title: title,
      text: mensaje,
      confirmButtonText: 'Aceptar'
    });
  }

  /**
   * Muestra un mensaje de error relacionado con validación
   *
   * @param mensaje - Mensaje de validación
   * @param title - Título del modal (opcional)
   *
   * @example
   * ```typescript
   * this.errorHandler.showValidationError('El correo electrónico ya está registrado');
   * this.errorHandler.showValidationError('El teléfono debe tener 9 dígitos', 'Validación');
   * ```
   */
  showValidationError(mensaje: string, title: string = 'Error de validación'): void {
    Swal.fire({
      icon: 'error',
      title: title,
      text: mensaje,
      confirmButtonText: 'Aceptar'
    });
  }

  /**
   * Muestra un mensaje de éxito
   *
   * @param mensaje - Mensaje de éxito
   * @param title - Título del modal (opcional, por defecto "Éxito")
   *
   * @example
   * ```typescript
   * this.errorHandler.showSuccess('Usuario creado correctamente');
   * this.errorHandler.showSuccess('Cita actualizada', 'Actualización exitosa');
   * ```
   */
  showSuccess(mensaje: string, title: string = 'Éxito'): void {
    Swal.fire({
      icon: 'success',
      title: title,
      text: mensaje,
      confirmButtonText: 'Aceptar'
    });
  }

  /**
   * Muestra un mensaje de advertencia
   *
   * @param mensaje - Mensaje de advertencia
   * @param title - Título del modal (opcional, por defecto "Advertencia")
   *
   * @example
   * ```typescript
   * this.errorHandler.showWarning('No puede seleccionar una fecha pasada');
   * this.errorHandler.showWarning('El horario seleccionado está ocupado', 'Horario no disponible');
   * ```
   */
  showWarning(mensaje: string, title: string = 'Advertencia'): void {
    Swal.fire({
      icon: 'warning',
      title: title,
      text: mensaje,
      confirmButtonText: 'Aceptar'
    });
  }

  /**
   * Muestra un mensaje informativo
   *
   * @param mensaje - Mensaje informativo
   * @param title - Título del modal (opcional, por defecto "Información")
   *
   * @example
   * ```typescript
   * this.errorHandler.showInfo('No hay citas pendientes para hoy');
   * this.errorHandler.showInfo('El sistema estará en mantenimiento mañana', 'Aviso');
   * ```
   */
  showInfo(mensaje: string, title: string = 'Información'): void {
    Swal.fire({
      icon: 'info',
      title: title,
      text: mensaje,
      confirmButtonText: 'Aceptar'
    });
  }

  /**
   * Muestra un diálogo de confirmación
   *
   * @param mensaje - Mensaje de confirmación
   * @param title - Título del modal (opcional, por defecto "¿Estás seguro?")
   * @param confirmButtonText - Texto del botón de confirmación (opcional, por defecto "Sí, confirmar")
   * @param cancelButtonText - Texto del botón de cancelación (opcional, por defecto "Cancelar")
   * @returns Promise<boolean> - true si el usuario confirmó, false si canceló
   *
   * @example
   * ```typescript
   * const confirmado = await this.errorHandler.showConfirmation(
   *   '¿Deseas eliminar este usuario?',
   *   'Confirmar eliminación'
   * );
   *
   * if (confirmado) {
   *   // Proceder con la eliminación
   * }
   * ```
   */
  async showConfirmation(
    mensaje: string,
    title: string = '¿Estás seguro?',
    confirmButtonText: string = 'Sí, confirmar',
    cancelButtonText: string = 'Cancelar'
  ): Promise<boolean> {
    const result = await Swal.fire({
      icon: 'question',
      title: title,
      text: mensaje,
      showCancelButton: true,
      confirmButtonText: confirmButtonText,
      cancelButtonText: cancelButtonText,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
    });

    return result.isConfirmed;
  }

  /**
   * Muestra un diálogo de confirmación para eliminación
   * Versión especializada de showConfirmation para operaciones de eliminación
   *
   * @param itemName - Nombre del elemento a eliminar
   * @returns Promise<boolean> - true si el usuario confirmó, false si canceló
   *
   * @example
   * ```typescript
   * const confirmado = await this.errorHandler.showDeleteConfirmation('este usuario');
   *
   * if (confirmado) {
   *   // Proceder con la eliminación
   * }
   * ```
   */
  async showDeleteConfirmation(itemName: string = 'este elemento'): Promise<boolean> {
    return this.showConfirmation(
      `Se eliminará ${itemName}. Esta acción no se puede deshacer.`,
      '¿Eliminar?',
      'Sí, eliminar',
      'No, cancelar'
    );
  }

  /**
   * Muestra un mensaje toast (pequeña notificación temporal)
   *
   * @param mensaje - Mensaje a mostrar
   * @param icon - Icono del toast ('success', 'error', 'warning', 'info')
   * @param position - Posición del toast (por defecto 'top-end')
   * @param timer - Duración en milisegundos (por defecto 3000)
   *
   * @example
   * ```typescript
   * this.errorHandler.showToast('Guardado correctamente', 'success');
   * this.errorHandler.showToast('Error al guardar', 'error', 'top-end', 5000);
   * ```
   */
  showToast(
    mensaje: string,
    icon: 'success' | 'error' | 'warning' | 'info' = 'success',
    position: 'top' | 'top-start' | 'top-end' | 'center' | 'center-start' | 'center-end' | 'bottom' | 'bottom-start' | 'bottom-end' = 'top-end',
    timer: number = 3000
  ): void {
    const Toast = Swal.mixin({
      toast: true,
      position: position,
      showConfirmButton: false,
      timer: timer,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });

    Toast.fire({
      icon: icon,
      title: mensaje
    });
  }

  /**
   * Maneja errores específicos de registro/login
   * Detecta automáticamente el tipo de error y muestra el mensaje apropiado
   *
   * @param error - Error HTTP
   *
   * @example
   * ```typescript
   * this.authService.crearUsuario(formData).subscribe({
   *   next: (resp) => { },
   *   error: (err) => this.errorHandler.handleAuthError(err)
   * });
   * ```
   */
  handleAuthError(error: any): void {
    const mensaje = this.extractErrorMessage(error);

    // Detectar errores comunes de autenticación
    if (mensaje.toLowerCase().includes('correo') && mensaje.toLowerCase().includes('registrado')) {
      this.showValidationError(
        'El correo electrónico ya está en uso. Por favor utiliza otro correo o intenta recuperar tu contraseña.',
        'Correo ya registrado'
      );
    } else if (mensaje.toLowerCase().includes('teléfono') && mensaje.toLowerCase().includes('registrado')) {
      this.showValidationError(
        'El número de teléfono ya está en uso. Por favor utiliza otro número.',
        'Teléfono ya registrado'
      );
    } else if (mensaje.toLowerCase().includes('rut') && mensaje.toLowerCase().includes('registrado')) {
      this.showValidationError(
        'El RUT ya está registrado en el sistema.',
        'RUT ya registrado'
      );
    } else if (mensaje.toLowerCase().includes('credenciales') || mensaje.toLowerCase().includes('incorrecta')) {
      this.showError('El correo o la contraseña son incorrectos.', 'Error de autenticación');
    } else if (mensaje.toLowerCase().includes('no encontrado')) {
      this.showError('Usuario o médico no encontrado.', 'Error de autenticación');
    } else {
      // Error genérico
      this.showError(error, 'Error de autenticación');
    }
  }

  /**
   * Maneja errores de validación de formularios
   * Útil para mostrar múltiples errores de validación
   *
   * @param errors - Array de mensajes de error
   * @param title - Título del modal (opcional)
   *
   * @example
   * ```typescript
   * const errores = [
   *   'El correo debe ser de Gmail',
   *   'La fecha debe ser futura',
   *   'El teléfono debe tener 9 dígitos'
   * ];
   * this.errorHandler.handleValidationErrors(errores);
   * ```
   */
  handleValidationErrors(errors: string[], title: string = 'Errores de validación'): void {
    const html = '<ul style="text-align: left;">' +
      errors.map(err => `<li>${err}</li>`).join('') +
      '</ul>';

    Swal.fire({
      icon: 'error',
      title: title,
      html: html,
      confirmButtonText: 'Aceptar'
    });
  }
}
