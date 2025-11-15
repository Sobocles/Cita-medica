/**
 * Helper para operaciones con tiempo
 * RESPONSABILIDAD: Conversiones y cálculos de tiempo
 */

/**
 * Convierte una hora en formato HH:MM a minutos desde medianoche
 * @example timeToMinutes("14:30") // 870
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Convierte minutos desde medianoche a formato HH:MM
 * @example minutesToTime(870) // "14:30"
 */
export function minutesToTime(minutes: number): string {
  const hh = Math.floor(minutes / 60).toString().padStart(2, '0');
  const mm = (minutes % 60).toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

/**
 * Convierte número de día (0-6) a nombre del día en español
 * @example numberToDay(1) // "lunes"
 */
export function numberToDay(dayNumber: number): string {
  const days = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  return days[dayNumber];
}

/**
 * Convierte nombre de día a número (0-6)
 * @example dayToNumber("lunes") // 1
 */
export function dayToNumber(dayName: string): number {
  const days = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  return days.indexOf(dayName.toLowerCase());
}

/**
 * Obtiene los minutos actuales desde medianoche
 */
export function getCurrentMinutes(): number {
  const ahora = new Date();
  return ahora.getHours() * 60 + ahora.getMinutes();
}

/**
 * Verifica si una hora está dentro de un rango
 */
export function isTimeInRange(time: string, start: string, end: string): boolean {
  const timeMinutes = timeToMinutes(time);
  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);
  return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
}

/**
 * Array de días de la semana en orden
 */
export const DIAS_SEMANA = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'] as const;

export type DiaSemana = typeof DIAS_SEMANA[number];
