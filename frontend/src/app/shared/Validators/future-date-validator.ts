import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validador personalizado que verifica que una fecha sea futura (no pasada ni hoy)
 * @param allowToday - Si es true, permite el día de hoy. Por defecto es false.
 * @returns ValidatorFn que retorna un objeto de error si la fecha es pasada
 *
 * @example
 * ```typescript
 * // No permite el día de hoy
 * this.formulario = this.formBuilder.group({
 *   fecha: ['', [Validators.required, futureDateValidator()]]
 * });
 *
 * // Permite el día de hoy
 * this.formulario = this.formBuilder.group({
 *   fecha: ['', [Validators.required, futureDateValidator(true)]]
 * });
 * ```
 */
export function futureDateValidator(allowToday: boolean = false): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    // Si no hay valor, no validamos (deja que Validators.required lo maneje)
    if (!value) {
      return null;
    }

    const selectedDate = new Date(value);
    const currentDate = new Date();

    // Establecer ambas fechas a medianoche para comparación correcta
    selectedDate.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);

    // Verifica si la fecha seleccionada es en el pasado
    if (selectedDate < currentDate) {
      return { pastDate: { value: control.value } };
    }

    // Si no se permite hoy y la fecha es hoy
    if (!allowToday && selectedDate.getTime() === currentDate.getTime()) {
      return { todayNotAllowed: { value: control.value } };
    }

    return null;
  };
}

/**
 * Validador personalizado que verifica que una fecha esté dentro de un rango específico
 * @param minDays - Número mínimo de días desde hoy (puede ser negativo para permitir fechas pasadas)
 * @param maxDays - Número máximo de días desde hoy
 * @returns ValidatorFn que retorna un objeto de error si la fecha está fuera del rango
 *
 * @example
 * ```typescript
 * // Permite fechas entre mañana y 90 días en el futuro
 * this.formulario = this.formBuilder.group({
 *   fecha: ['', [Validators.required, dateRangeValidator(1, 90)]]
 * });
 * ```
 */
export function dateRangeValidator(minDays: number = 0, maxDays: number = 365): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null;
    }

    const selectedDate = new Date(value);
    const currentDate = new Date();

    selectedDate.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);

    const minDate = new Date(currentDate);
    minDate.setDate(minDate.getDate() + minDays);

    const maxDate = new Date(currentDate);
    maxDate.setDate(maxDate.getDate() + maxDays);

    if (selectedDate < minDate) {
      return {
        dateTooEarly: {
          value: control.value,
          minDate: minDate.toISOString().split('T')[0]
        }
      };
    }

    if (selectedDate > maxDate) {
      return {
        dateTooLate: {
          value: control.value,
          maxDate: maxDate.toISOString().split('T')[0]
        }
      };
    }

    return null;
  };
}
