import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validador personalizado que verifica que el email termine en @gmail.com
 * @returns ValidatorFn que retorna un objeto de error si el email no es de Gmail
 *
 * @example
 * ```typescript
 * this.formulario = this.formBuilder.group({
 *   email: ['', [Validators.required, Validators.email, gmailValidator()]]
 * });
 * ```
 */
export function gmailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    // Si no hay valor, no validamos (deja que Validators.required lo maneje)
    if (!value) {
      return null;
    }

    // Verifica si el email termina con @gmail.com
    const isGmail = value.endsWith('@gmail.com');

    return isGmail ? null : { notGmail: true };
  };
}
