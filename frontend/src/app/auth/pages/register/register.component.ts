import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { rutValidator } from 'src/app/shared/Validators/rut-validator';
import { phoneValidator } from 'src/app/shared/Validators/phone-validator';
import { passwordStrengthValidator } from 'src/app/shared/Validators/password-strength-validator';
import { ErrorHandlerService } from 'src/app/shared/services/error-handler.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  miFormulario: FormGroup;

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
    private fb: FormBuilder,
    private AuthService: AuthService,
    private router: Router,
    private errorHandler: ErrorHandlerService
  ) {
    this.miFormulario = this.fb.group({
      rut: ['', [Validators.required, rutValidator()]],
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), passwordStrengthValidator()]],
      fecha_nacimiento: ['', [Validators.required]],
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
    return this.miFormulario.get('tipo_prevision')?.value === 'Isapre';
  }

  /**
   * Retorna true si el tipo de previsión es Fonasa
   */
  get esFonasa(): boolean {
    return this.miFormulario.get('tipo_prevision')?.value === 'Fonasa';
  }

  /**
   * Se ejecuta cuando cambia el tipo de previsión
   * Limpia los campos que no corresponden
   */
  onTipoPrevisionChange(): void {
    const tipoPrevision = this.miFormulario.get('tipo_prevision')?.value;

    if (tipoPrevision !== 'Isapre') {
      this.miFormulario.patchValue({ nombre_isapre: '' });
    }

    if (tipoPrevision !== 'Fonasa') {
      this.miFormulario.patchValue({ tramo_fonasa: '' });
    }
  }
  
  ngOnInit(): void {
  }
  
  // Métodos para verificar requisitos de contraseña individualmente
  hasUpperCase(): boolean {
    const value = this.miFormulario.get('password')?.value;
    return !!value && /[A-Z]+/.test(value);
  }
  
  hasNumber(): boolean {
    const value = this.miFormulario.get('password')?.value;
    return !!value && /[0-9]+/.test(value);
  }
  
  hasSpecialChar(): boolean {
    const value = this.miFormulario.get('password')?.value;
    return !!value && /[.,'!@#$%^&*()_+-]+/.test(value);
  }
  
  hasMinLength(): boolean {
    const value = this.miFormulario.get('password')?.value;
    return !!value && value.length >= 6;
  }
  
  validarMayorDeEdad(edadMinima: number): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
      const valor = control.value;
      const hoy = new Date();
      const fechaNacimiento = new Date(valor);
      let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
      const m = hoy.getMonth() - fechaNacimiento.getMonth();
 
      if (m < 0 || (m === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
        edad--;
      }
 
      return edad >= edadMinima ? null : {'menorDeEdad': {value: control.value}};
    };
  }
  
  registrar() {
    if (this.miFormulario.invalid) {
      this.miFormulario.markAllAsTouched();

      // Usar ErrorHandlerService para mostrar advertencia
      this.errorHandler.showWarning(
        'Por favor, complete todos los campos requeridos correctamente.',
        'Formulario incompleto'
      );
      return;
    }
 
    const formData = this.miFormulario.value;
 
    this.AuthService.crearUsuario(formData).subscribe({
      next: (respuesta) => {
        Swal.fire({
          icon: 'success',
          title: '¡Registro completado!',
          text: 'Te has registrado exitosamente, ya puedes ingresar a tu cuenta.',
          confirmButtonText: 'Aceptar'
        }).then((result) => {
          if (result.isConfirmed) {
            this.router.navigateByUrl('/');
          }
        });
      },
      error: (err) => {
        // Usar ErrorHandlerService para manejo centralizado de errores de autenticación
        this.errorHandler.handleAuthError(err);
      }
    });
  }
}