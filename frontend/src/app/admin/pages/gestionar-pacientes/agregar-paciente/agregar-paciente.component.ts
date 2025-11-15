import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PacienteService } from '../../services/usuario.service';
import { Router } from '@angular/router';
import { rutValidator } from 'src/app/shared/Validators/rut-validator';
import { passwordStrengthValidator } from 'src/app/shared/Validators/password-strength-validator';
import { phoneValidator } from 'src/app/shared/Validators/phone-validator';
import { gmailValidator } from 'src/app/shared/Validators/gmail-validator';
import { ErrorHandlerService } from '../../../../shared/services/error-handler.service';

@Component({
  selector: 'app-agregar-paciente',
  templateUrl: './agregar-paciente.component.html',
  styleUrls: ['./agregar-paciente.component.scss']
})
export class AgregarPacienteComponent {

  formulario: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private PacienteService: PacienteService,
    private router: Router,
    private errorHandler: ErrorHandlerService
  ) {
    this.formulario = this.formBuilder.group({
      rut: ['', [Validators.required, rutValidator()]],
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      password: ['', [Validators.required, passwordStrengthValidator()]],
      email: ['', [Validators.required, Validators.email, gmailValidator()]],
      fecha_nacimiento: ['', Validators.required],
      telefono: ['', [Validators.required, phoneValidator()]],
      direccion: ['', Validators.required],
    });
  }


  crearPaciente() {
    if (this.formulario.invalid) {
      // Marca todos los controles del formulario como tocados
      this.formulario.markAllAsTouched();
      this.errorHandler.showValidationError(
        'Por favor completa todos los campos requeridos correctamente',
        'Formulario inválido'
      );
      return;
    }

    const formData = this.formulario.value;
    console.log(formData);

    this.PacienteService.crearPaciente(formData).subscribe({
      next: (respuesta: any) => {
        this.errorHandler.showSuccess(
          'El paciente ha sido creado con éxito',
          '¡Éxito!'
        );
        this.router.navigate(['/gestionar-pacientes']);
      },
      error: (err) => {
        this.errorHandler.showError(err, 'Error al crear paciente');
      }
    });
  }
  
  

}
