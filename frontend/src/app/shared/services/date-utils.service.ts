import { Injectable } from '@angular/core';

/**
 * Servicio de utilidades para manejo y formateo de fechas
 */
@Injectable({
  providedIn: 'root'
})
export class DateUtilsService {

  private readonly DIAS = [
    'Domingo', 'Lunes', 'Martes', 'Miércoles',
    'Jueves', 'Viernes', 'Sábado'
  ];

  private readonly MESES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  constructor() { }

  /**
   * Formatea una fecha en formato legible en español
   * @param dateString - String de fecha en formato ISO o compatible con Date()
   * @returns String formateado: "Lunes 15 de Enero del 2025"
   *
   * @example
   * ```typescript
   * const formatted = this.dateUtils.formatDate('2025-01-15');
   * // Retorna: "Lunes 15 de Enero del 2025"
   * ```
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const dayName = this.DIAS[date.getDay()];
    const day = date.getDate();
    const month = this.MESES[date.getMonth()];
    const year = date.getFullYear();

    return `${dayName} ${day} de ${month} del ${year}`;
  }

  /**
   * Verifica si una fecha es anterior al día actual (sin incluir hoy)
   * @param dateString - String de fecha
   * @returns true si la fecha es pasada, false si no
   *
   * @example
   * ```typescript
   * const isPast = this.dateUtils.isPastDate('2020-01-01'); // true
   * ```
   */
  isPastDate(dateString: string): boolean {
    const selectedDate = new Date(dateString);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    return selectedDate < currentDate;
  }

  /**
   * Verifica si una fecha es el día de hoy
   * @param dateString - String de fecha
   * @returns true si la fecha es hoy, false si no
   *
   * @example
   * ```typescript
   * const isToday = this.dateUtils.isToday('2025-01-15');
   * ```
   */
  isToday(dateString: string): boolean {
    const selectedDate = new Date(dateString);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    return selectedDate.getTime() === currentDate.getTime();
  }

  /**
   * Verifica si una fecha es futura (posterior a hoy)
   * @param dateString - String de fecha
   * @returns true si la fecha es futura, false si no
   *
   * @example
   * ```typescript
   * const isFuture = this.dateUtils.isFutureDate('2030-01-01'); // true
   * ```
   */
  isFutureDate(dateString: string): boolean {
    const selectedDate = new Date(dateString);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    return selectedDate > currentDate;
  }

  /**
   * Obtiene el nombre del día de la semana
   * @param dateString - String de fecha
   * @returns Nombre del día en español
   *
   * @example
   * ```typescript
   * const dayName = this.dateUtils.getDayName('2025-01-15'); // "Miércoles"
   * ```
   */
  getDayName(dateString: string): string {
    const date = new Date(dateString);
    return this.DIAS[date.getDay()];
  }

  /**
   * Obtiene el nombre del mes
   * @param dateString - String de fecha
   * @returns Nombre del mes en español
   *
   * @example
   * ```typescript
   * const monthName = this.dateUtils.getMonthName('2025-01-15'); // "Enero"
   * ```
   */
  getMonthName(dateString: string): string {
    const date = new Date(dateString);
    return this.MESES[date.getMonth()];
  }
}
