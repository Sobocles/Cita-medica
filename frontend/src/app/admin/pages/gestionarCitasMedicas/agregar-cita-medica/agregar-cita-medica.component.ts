
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { CitaMedicaService } from '../../services/cita-medica.service';
import { CitasResponse } from '../../interface/cita_medica';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { PacienteService } from '../../services/usuario.service';
import { MedicoService } from '../../services/medico.service';
import { TipoCitaService } from '../../services/tipo-cita.service';
import { MedicoResponse } from '../../interface/medicos';
import { UsuariosResponse } from '../../interface/paciente';
import { tipoCitaResponse } from '../../interface/tipoCita';
import { HorarioMedicoService } from '../../services/horario-medico.service';
import { CitasResponsex } from '../../interface/cita_medicaResponse';
import { HorarioClinicaService } from 'src/app/pacientes/services/horario-clinica.service';

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




  constructor(private fb: FormBuilder, private citaMedicaService: CitaMedicaService, private router: Router, private PacienteService: PacienteService, private TipoCitaService: TipoCitaService, private MedicoService: MedicoService, private HorarioMedicoService: HorarioMedicoService, private horarioClinicaService: HorarioClinicaService) { }

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
  this.horarioClinicaService.obtenerHorarioEspecialidades().subscribe(
    (horarios: any) => {
      this.horariosEspecialidades = horarios;
    },
    error => {
      console.error('Error al obtener horarios de especialidades:', error);
    }
  );
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
  
    this.citaMedicaService.crearCitaMedica(nuevaCita).subscribe(
      response => {
        Swal.fire('Exito', 'Cita creada exitosamente!', 'success');
        this.router.navigateByUrl('/gestionar-cita');
      },
      error => {
        // Verifica si el error es específicamente por falta de médicos disponibles
        if (error.error && error.error.msg) {
          Swal.fire('Error', error.error.msg, 'error');
        } else {
          // Mensaje de error genérico si no es por falta de médicos disponibles
          Swal.fire('Error', 'Hubo un error al guardar la cita', 'error');
        }
      }
    );
  }
  
  
  onTipoCitaChange(event: any) {
    if (event.target.value === 'Especialidad médica') {
      this.cargaEspecialidades();
    } else {
      this.onChangeData();  // Llama a onChangeData cuando se selecciona "Consulta general"
    }
  }
  
  formatDate(dateString: string): string {
    const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    const date = new Date(dateString);
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${dayName} ${day} de ${month} del ${year}`;
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

    const selectedDateObj = new Date(this.selectedDate);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Establecer la hora actual a medianoche

    // Verifica si la fecha seleccionada es en el pasado o es hoy
    if (selectedDateObj < currentDate) {
        Swal.fire('Error', 'No puede seleccionar una fecha pasada para la cita o el dia actual.', 'error');
        return; // Detiene la ejecución posterior
    } else if (selectedDateObj.getTime() === currentDate.getTime()) {
        Swal.fire('Advertencia', 'Ha seleccionado el día actual. Verifique la disponibilidad de los médicos para hoy.', 'warning');
    }

    if (this.selectedDate) {
        console.log('ESTa es la fecha selecccionada', this.selectedDate);

        this.HorarioMedicoService.buscarHorarioDisponible(formData).subscribe(
            (response) => {
                this.medicosDisponibles = response.bloques;
                console.log('ARRAY DE MEDICOS DISPONIBLES',this.medicosDisponibles)
                this.medicosDisponibles.forEach((medico) => {
                  console.log('RUT del médico:', medico.rutMedico);
                });
                
           
                if (this.medicosDisponibles.length === 0) {
                  const formattedDate = this.formatDate(this.selectedDate);
                  Swal.fire('Información', `No hay médicos disponibles para el ${formattedDate}, para saber en qué horario trabajan sus médicos consulte sus horarios`, 'info');
              }
            },
            (error) => {
                console.error('Error obteniendo médicos disponibles:', error);
                Swal.fire('Error', 'Error obteniendo médicos disponibles', 'error');
            }
        );
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
