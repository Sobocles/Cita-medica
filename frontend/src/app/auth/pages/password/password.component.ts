import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ErrorHandlerService } from 'src/app/shared/services/error-handler.service';

@Component({
  selector: 'app-password',
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.scss']
})
export class PasswordComponent {
  

  recoveryForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private errorHandler: ErrorHandlerService
  ) {
    this.recoveryForm = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
  }

  recuperarPassword() {
    const { email, nombre } = this.recoveryForm.value;

    this.authService.recuperarPassword(nombre, email).subscribe({
      next: (ok) => {
        if (ok === true) {
          // Usar ErrorHandlerService para mostrar éxito
          this.errorHandler.showSuccess(
            `Se ha enviado un correo a la dirección ${email}`,
            'Recuperación de Contraseña'
          );
        } else {
          // Usar ErrorHandlerService para mostrar error
          this.errorHandler.showError(ok as string);
        }
      },
      error: (err) => {
        // Usar ErrorHandlerService para manejar errores HTTP
        this.errorHandler.showError(err);
      }
    });
  }
}
