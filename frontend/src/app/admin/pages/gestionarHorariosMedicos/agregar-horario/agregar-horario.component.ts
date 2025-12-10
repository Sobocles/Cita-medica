import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HorarioMedicoService } from '../../services/horario-medico.service';
import { MedicoService } from '../../services/medico.service';
import { ErrorHandlerService } from '../../../../shared/services/error-handler.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-agregar-horario-medico',
  templateUrl: './agregar-horario.component.html',
  styleUrls: ['./agregar-horario.component.scss']
})
export class AgregarHorarioMedicoComponent implements OnInit {
  horarioMedicoForm: FormGroup;
  isEditMode: boolean = false;
  horarioId: number | null = null;
  medicos: any[] = [];

  // Lista de días disponibles
  diasSemana = [
    { valor: 'lunes', nombre: 'Lunes', seleccionado: false },
    { valor: 'martes', nombre: 'Martes', seleccionado: false },
    { valor: 'miercoles', nombre: 'Miércoles', seleccionado: false },
    { valor: 'jueves', nombre: 'Jueves', seleccionado: false },
    { valor: 'viernes', nombre: 'Viernes', seleccionado: false },
    { valor: 'sabado', nombre: 'Sábado', seleccionado: false },
    { valor: 'domingo', nombre: 'Domingo', seleccionado: false }
  ];

  creandoHorarios: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private HorarioMedicoService: HorarioMedicoService,
    private MedicoService: MedicoService,
    private errorHandler: ErrorHandlerService
  ) {
    // Configuramos el formulario con sus validaciones
    // En modo creación, diaSemana no es requerido porque usamos checkboxes
    // En modo edición, sí es requerido porque usamos select
    this.horarioMedicoForm = this.fb.group({
      idHorario: [''],
      diaSemana: [''], // No required por defecto, se validará manualmente
      horaInicio: ['', [Validators.required, Validators.pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)]],
      horaFinalizacion: ['', [Validators.required, Validators.pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)]],
      inicio_colacion: ['', Validators.required],
      fin_colacion: ['', Validators.required],
      rut_medico: ['', Validators.required]
    }, { validators: this.horarioColacionValidator() });
  }

  // Validador a nivel de formulario para horarios
  horarioColacionValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!(control instanceof FormGroup)) return null;

      const inicio = control.get('horaInicio')?.value;
      const fin = control.get('horaFinalizacion')?.value;
      const inicioColacion = control.get('inicio_colacion')?.value;
      const finColacion = control.get('fin_colacion')?.value;

      if (inicio && fin && inicio >= fin) {
        return { horarioLaboralInvalido: true };
      }
      if (inicio && fin && inicioColacion && finColacion) {
        if (inicio > inicioColacion || finColacion > fin) {
          return { horarioColacionFuera: true };
        }
        if (inicioColacion >= finColacion) {
          return { colacionInvalida: true };
        }
      }
      return null;
    };
  }

  ngOnInit(): void {
    // Cargar la lista de médicos para el select
    this.MedicoService.cargarMedicos().subscribe({
      next: (response: any) => {
        this.medicos = response.medicos;
      },
      error: (error) => {
        this.errorHandler.showError(error, 'Error al cargar médicos');
      }
    });

    // Suscribirse a los parámetros de la ruta para determinar si estamos en modo edición
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.horarioId = +params['id'];
        // En modo edición, diaSemana es requerido
        this.horarioMedicoForm.get('diaSemana')?.setValidators([Validators.required]);
        this.horarioMedicoForm.get('diaSemana')?.updateValueAndValidity();

        // Cargar el horario existente para editarlo
        this.HorarioMedicoService.obtenerHorarioPorId(this.horarioId).subscribe({
          next: (response: any) => {
            const horario = response.horario;
            this.horarioMedicoForm.patchValue({
              idHorario: horario.idHorario,
              diaSemana: horario.diaSemana,
              horaInicio: horario.horaInicio,
              horaFinalizacion: horario.horaFinalizacion,
              inicio_colacion: horario.inicio_colacion,
              fin_colacion: horario.fin_colacion,
              rut_medico: horario.rutMedico
            });
          },
          error: (error) => {
            this.errorHandler.showError(error, 'Error al cargar el horario');
          }
        });
      } else {
        this.isEditMode = false;
      }
    });
  }

  /**
   * Obtiene los días seleccionados
   */
  getDiasSeleccionados(): string[] {
    return this.diasSemana
      .filter(dia => dia.seleccionado)
      .map(dia => dia.valor);
  }

  /**
   * Alterna la selección de un día
   */
  toggleDia(dia: any): void {
    dia.seleccionado = !dia.seleccionado;
  }

  /**
   * Selecciona o deselecciona todos los días
   */
  toggleTodos(): void {
    const todosMarcados = this.diasSemana.every(dia => dia.seleccionado);
    this.diasSemana.forEach(dia => dia.seleccionado = !todosMarcados);
  }

  /**
   * Verifica si todos los días están seleccionados
   */
  todosMarcados(): boolean {
    return this.diasSemana.every(dia => dia.seleccionado);
  }

  onSubmit(): void {
    // Validación básica del formulario
    if (this.horarioMedicoForm.invalid) {
      this.errorHandler.showValidationError('Complete todos los campos obligatorios');
      return;
    }

    if (this.isEditMode) {
      // Modo edición: funciona igual que antes
      const formData = { ...this.horarioMedicoForm.value };
      this.HorarioMedicoService.editarHorario(formData).subscribe({
        next: (response) => {
          this.errorHandler.showSuccess('Horario editado exitosamente', 'Éxito');
          this.router.navigateByUrl('/ad/gestionar-horarios-medicos');
        },
        error: (error) => {
          this.errorHandler.showError(error, 'Error al editar el horario');
        }
      });
    } else {
      // Modo creación: verificar que al menos un día esté seleccionado
      const diasSeleccionados = this.getDiasSeleccionados();

      if (diasSeleccionados.length === 0) {
        this.errorHandler.showValidationError('Debe seleccionar al menos un día de la semana');
        return;
      }

      // Crear un horario por cada día seleccionado
      this.creandoHorarios = true;
      const observables = diasSeleccionados.map(dia => {
        const formData = {
          ...this.horarioMedicoForm.value,
          diaSemana: dia
        };
        delete formData.idHorario;
        return this.HorarioMedicoService.crearHorario(formData);
      });

      // Ejecutar todas las peticiones en paralelo
      forkJoin(observables).subscribe({
        next: (responses) => {
          this.creandoHorarios = false;
          const cantidad = diasSeleccionados.length;
          const mensaje = cantidad === 1
            ? 'Horario creado exitosamente'
            : `${cantidad} horarios creados exitosamente`;

          this.errorHandler.showSuccess(mensaje, 'Éxito');
          this.router.navigateByUrl('/ad/gestionar-horarios-medicos');
        },
        error: (error) => {
          this.creandoHorarios = false;
          this.errorHandler.showError(error, 'Error al crear los horarios');
        }
      });
    }
  }

  regresar(): void {
    this.router.navigateByUrl('/ad/gestionar-horarios-medicos');
  }
}
