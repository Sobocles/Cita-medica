import { Component } from '@angular/core';
import { TipoCitaService } from 'src/app/admin/pages/services/tipo-cita.service';
import { Tipo_cita, tipoCitaResponse } from 'src/app/admin/pages/interface/tipoCita';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BusquedaMedicoService } from '../../services/busqueda-medico.service';
import { BusquedaMedicoComponent } from '../busqueda-medico/busqueda-medico.component';
import { Bloque, BloquesResponse } from '../interfaces/busqueda-medicos';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { HorarioClinicaService } from '../../services/horario-clinica.service';
import { ErrorHandlerService } from '../../../shared/services/error-handler.service';

@Component({
  selector: 'app-formulario-cita',
  templateUrl: './formulario-cita.component.html',
  styleUrls: ['./formulario-cita.component.scss']
})
export class FormularioCitaComponent {

  tiposCitas: any[] = [];
  ordenDias: string[] = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
  form: FormGroup;
  private _bloques: Bloque[] = [];
  horariosEspecialidades: {[key: string]: string[]} = {};
  private bloquesSubject = new BehaviorSubject<Bloque[]>([]);
  bloques$ = this.bloquesSubject.asObservable();

  constructor(
    private fb: FormBuilder,
    private TipoCitaService: TipoCitaService,
    private BusquedaMedicoService: BusquedaMedicoService,
    private router: Router,
    private HorarioClinicaService: HorarioClinicaService,
    private errorHandler: ErrorHandlerService
  ) {
    this.form = this.fb.group({
      especialidad: [null, Validators.required],
      fecha: [null, Validators.required]
    });
  }

  get bloques(): Bloque[] { // Getter para acceder a los bloques
    return this._bloques;
  }


  ngOnInit(): void {
    this.TipoCitaService.cargaEspecialidades().subscribe({
      next: (response) => {
        console.log('aqui estan las especialidades',response);
        this.tiposCitas = response.especialidades;
        console.log('aqui esta el arreglo de especialidades',this.tiposCitas);
      },
      error: (err) => {
        console.error('Error cargando tipos de cita:', err);
        this.errorHandler.showError(err, 'Error al cargar especialidades');
        this.tiposCitas = [];
      }
    });

    this.HorarioClinicaService.obtenerHorarioEspecialidades().subscribe({
      next: (horarios: any) => {
        console.log('aqui estan los horarios especialidades',horarios);
        this.horariosEspecialidades = horarios;
      },
      error: (err) => {
        console.error('Error al obtener horarios de especialidades:', err);
        this.errorHandler.showError(err, 'Error al cargar horarios de especialidades');
      }
    });
  }
  

  enviarFormulario() {
    const formData = this.form.value;
  
    // Crear un objeto de fecha para la fecha actual
    const fechaActual = new Date();
    fechaActual.setHours(0, 0, 0, 0); // Ajustar la fecha actual a la medianoche
  
    // Crear un objeto de fecha para la fecha seleccionada en la zona horaria local
    const partesFecha = formData.fecha.split('-');
    const fechaSeleccionada = new Date(partesFecha[0], partesFecha[1] - 1, partesFecha[2]);
    fechaSeleccionada.setHours(0, 0, 0, 0); // Ajustar la fecha seleccionada a la medianoche
  
    // Verificar si la fecha seleccionada es anterior a la fecha actual
    if (fechaSeleccionada < fechaActual) {
      this.errorHandler.showValidationError(
        'No puedes seleccionar una fecha anterior a la actual',
        'Fecha no válida'
      );
      return; // Detener la ejecución del método aquí
    }

    // Continuar con el procesamiento si la fecha es válida
    this.BusquedaMedicoService.buscarHorarioDisponible(formData).subscribe({
      next: (resp: BloquesResponse) => {
        this.BusquedaMedicoService.actualizarBloques(resp.bloques);
        this.router.navigate(['/busqueda-medico']);
      },
      error: (err) => {
        this.errorHandler.showError(err, 'Error al buscar horarios disponibles');
      }
    });
  }
  
  
  
  

volverAtras(): void {
  this.router.navigate(['/Agendar-cita']);
}
  

}
