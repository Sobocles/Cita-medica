
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { CitaMedicaService } from '../../services/cita-medica.service';
import { CitasResponse } from '../../interface/cita_medica';
import { Router } from '@angular/router';
import { PacienteService } from '../../services/usuario.service';
import { MedicoService } from '../../services/medico.service';
import { TipoCitaService } from '../../services/tipo-cita.service';
import { MedicoResponse } from '../../interface/medicos';
import { UsuariosResponse } from '../../interface/paciente';
import { tipoCitaResponse } from '../../interface/tipoCita';
import { HorarioMedicoService } from '../../services/horario-medico.service';
import { CitasResponsex } from '../../interface/cita_medicaResponse';
import { HorarioClinicaService } from 'src/app/pacientes/services/horario-clinica.service';
import { DateUtilsService } from 'src/app/shared/services/date-utils.service';
import { ErrorHandlerService } from '../../../../shared/services/error-handler.service';

export interface Especialidad {
  especialidad_medica: string;
}


@Component({
  selector: 'app-agregar-cita-medica',
  templateUrl: './agregar-cita-medica.component.html',
  styleUrls: ['./agregar-cita-medica.component.scss']
})
export class AgregarCitaMedicaComponent implements OnInit {

     ordenDias: string[] = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
     horariosEspecialidades: {[key: string]: string[]} = {};
  
        motivo: string = '';
        formulario!: FormGroup;
        public pacientes: any[] = [];
      public medicos: any[] = [];
      public tiposCita: any[] = [];
      horaInicio: string = '';
      horaFin: string = '';

      tiposCitax = ['Consulta general', 'Especialidad médica'];
      selectedTipoCita!: string;
      especialidades: Especialidad[] = [];
      selectedEspecialidad: string = '';  

      selectedDate!: string; 
        
      medicosDisponibles: any[] = [];
      selectedMedico: any;
      selectedPaciente: string = ''; 
      idTipo!: number;




  constructor(
    private fb: FormBuilder,
    private citaMedicaService: CitaMedicaService,
    private router: Router,
    private PacienteService: PacienteService,
    private TipoCitaService: TipoCitaService,
    private MedicoService: MedicoService,
    private HorarioMedicoService: HorarioMedicoService,
    private horarioClinicaService: HorarioClinicaService,
    private dateUtils: DateUtilsService,
    private errorHandler: ErrorHandlerService
  ) { }

  ngOnInit(): void {
    this.formulario= this.fb.group({
      motivo: ['', [Validators.required]],
      rut_paciente: ['', [Validators.required]],
      rut_medico: ['', [Validators.required]],
      fecha: ['', [Validators.required]],
      hora_inicio: ['', [Validators.required]],
      hora_fin: ['', [Validators.required]],
      estado: ['', [Validators.required]],
      descripcion: ['', [Validators.required]],
      idTipoCita: ['', [Validators.required]],
    });
    this.selectedMedico = {};
   this.cargaMedicos();
   this.cargaPacientes();
    this.cargaTipocita();
    this.cargaEspecialidades();
    this.cargarDisponibilidad();
    
  }

   cargarDisponibilidad() {
  this.horarioClinicaService.obtenerHorarioEspecialidades().subscribe({
    next: (horarios: any) => {
      this.horariosEspecialidades = horarios;
    },
    error: (err) => {
      console.error('Error al obtener horarios de especialidades:', err);
      this.errorHandler.showError(err, 'Error al cargar horarios de especialidades');
    }
  });
   }
  onMedicoSelected(event: any): void {
   
    console.log('AQUI ESTA EL MEDICO SELECCIONADO',this.selectedMedico);
    if (this.selectedMedico) {
      this.horaInicio = this.selectedMedico.hora_inicio;
      this.horaFin = this.selectedMedico.hora_fin;
      this.idTipo = this.selectedMedico.idTipoCita;
    }
  }
  irAGestionarHorarios() {
    this.router.navigate(['/gestionar-horarios-medicos']);
  }
  


  guardarCita() {
    const nuevaCita: CitasResponsex = {
      cita: {
        idCita: 0,
        motivo: this.motivo,
        fecha: this.selectedDate,
        hora_inicio: this.horaInicio,
        hora_fin: this.horaFin,
        rut_paciente: this.selectedPaciente,
        rut_medico: this.selectedMedico.rutMedico,
        tipo_cita: this.selectedTipoCita,
        idTipoCita: this.idTipo,
        estado: 'en_curso'
      }
    };
    console.log('aqui esta la nueva cita',nuevaCita);

    this.citaMedicaService.crearCitaMedica(nuevaCita).subscribe({
      next: (response) => {
        this.errorHandler.showSuccess('Cita creada exitosamente', '¡Éxito!');
        this.router.navigateByUrl('/gestionar-cita');
      },
      error: (err) => {
        this.errorHandler.showError(err, 'Error al guardar la cita');
      }
    });
  }
  
  
  onTipoCitaChange(event: any) {
    if (event.target.value === 'Especialidad médica') {
      this.cargaEspecialidades();
    } else {
      this.onChangeData();  // Llama a onChangeData cuando se selecciona "Consulta general"
    }
  }

  formularioValido(): boolean {
  return this.selectedPaciente && this.selectedEspecialidad &&
         this.selectedDate && this.selectedMedico && this.selectedMedico.rutMedico;
}



  onChangeData() {
    console.log('onChangeData fue llamada');
    console.log('selectedEspecialidad:', this.selectedEspecialidad);
    console.log('selectedDate aqui esta la fecha seleccionada:', this.selectedDate);
    console.log('selectedMedico', this.selectedMedico);
  
    this.motivo = this.selectedEspecialidad;
    this.medicosDisponibles = [];
  
    let formData: any = {
        fecha: this.selectedDate,
        especialidad: this.motivo
    };

    console.log('este es el motivo', this.motivo);

    // Validar fecha usando DateUtilsService
    if (this.dateUtils.isPastDate(this.selectedDate)) {
        this.errorHandler.showValidationError(
          'No puede seleccionar una fecha pasada para la cita',
          'Fecha no válida'
        );
        return; // Detiene la ejecución posterior
    } else if (this.dateUtils.isToday(this.selectedDate)) {
        this.errorHandler.showWarning(
          'Ha seleccionado el día actual. Verifique la disponibilidad de los médicos para hoy',
          'Advertencia'
        );
    }

    if (this.selectedDate) {
        console.log('ESTa es la fecha selecccionada', this.selectedDate);

        this.HorarioMedicoService.buscarHorarioDisponible(formData).subscribe({
            next: (response) => {
                this.medicosDisponibles = response.bloques;
                console.log('ARRAY DE MEDICOS DISPONIBLES',this.medicosDisponibles)
                this.medicosDisponibles.forEach((medico) => {
                  console.log('RUT del médico:', medico.rutMedico);
                });

                if (this.medicosDisponibles.length === 0) {
                  const formattedDate = this.dateUtils.formatDate(this.selectedDate);
                  this.errorHandler.showInfo(
                    `No hay médicos disponibles para el ${formattedDate}, para saber en qué horario trabajan sus médicos consulte sus horarios`,
                    'Información'
                  );
              }
            },
            error: (err) => {
                console.error('Error obteniendo médicos disponibles:', err);
                this.errorHandler.showError(err, 'Error al obtener médicos disponibles');
            }
        });
    }
}

  





  cargaEspecialidades() {
    this.TipoCitaService.cargaEspecialidades().subscribe(data => {
      console.log(data)
      this.especialidades = data.especialidades;
    });
  }



  cargaMedicos() {
    this.MedicoService.cargarMedicos()
      .subscribe((response: MedicoResponse) => { 
        this.medicos = response.medicos; 

      });
  }

  cargaTipocita() {
    this.TipoCitaService.cargaTipocita()
      .subscribe((response: tipoCitaResponse) => {
        console.log('aqui estan los pacientes que se cargan',response);
        this.tiposCita = response.tipo_cita; // Asigna el arreglo tipo_cita de la respuesta a tiposCitas

      });
  }

  cargaPacientes() {
    this.PacienteService.cargarAllPacientes()
      .subscribe((response: UsuariosResponse) => { 
        console.log('aqui esta la respuesta',response);
        this.pacientes = response.usuarios // Asignar la propiedad 'medicos' de la respuesta al arreglo 'medicos'
        console.log('aqui estan los pacientes',this.pacientes);
      });
  }

}
