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

  // Listas de Isapres en Chile
  isapres = [
    'Banmédica',
    'Colmena',
    'Consalud',
    'CruzBlanca',
    'Nueva Masvida',
    'Vida Tres',
    'Fundación Banco Estado',
    'Otra'
  ];

  // Tramos de Fonasa
  tramosFonasa = ['A', 'B', 'C', 'D'];

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

      // Campos de previsión
      tipo_prevision: ['Particular', Validators.required],
      nombre_isapre: [''],
      tramo_fonasa: ['']
    });
  }

  /**
   * Retorna true si el tipo de previsión es Isapre
   */
  get esIsapre(): boolean {
    return this.formulario.get('tipo_prevision')?.value === 'Isapre';
  }

  /**
   * Retorna true si el tipo de previsión es Fonasa
   */
  get esFonasa(): boolean {
    return this.formulario.get('tipo_prevision')?.value === 'Fonasa';
  }

  /**
   * Se ejecuta cuando cambia el tipo de previsión
   * Limpia los campos que no corresponden
   */
  onTipoPrevisionChange(): void {
    const tipoPrevision = this.formulario.get('tipo_prevision')?.value;

    if (tipoPrevision !== 'Isapre') {
      this.formulario.patchValue({ nombre_isapre: '' });
    }

    if (tipoPrevision !== 'Fonasa') {
      this.formulario.patchValue({ tramo_fonasa: '' });
    }
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
