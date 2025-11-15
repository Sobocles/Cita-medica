import { Component, OnInit } from '@angular/core';
import { TipoCitaService } from 'src/app/admin/pages/services/tipo-cita.service';
import { HorarioClinicaService } from '../../services/horario-clinica.service';
import { Horario, HorarioClinicaResponse } from '../interfaces/horario_clinicas';
import dayGridPlugin from '@fullcalendar/daygrid';

import { Router } from '@angular/router';
import { CalendarOptions } from 'fullcalendar';
import { InfoClinica } from 'src/app/models/infoClinica';
import { AuthService } from '../../../auth/services/auth.service';
import { ErrorHandlerService } from '../../../shared/services/error-handler.service';
@Component({
  selector: 'app-agendar-cita',
  templateUrl: './agendar-cita.component.html',
  styleUrls: ['./agendar-cita.component.scss']
})
export class AgendarCitaComponent implements OnInit{

  horarioClinicas: Horario [] = [];
  calendarOptions: CalendarOptions;
  public infoClinica!: InfoClinica;

  constructor(
    private TipoCitaService: TipoCitaService,
    private HorarioClinicaService: HorarioClinicaService,
    private router: Router,
    private AuthService: AuthService,
    private errorHandler: ErrorHandlerService
  ){
    this.calendarOptions = {
      plugins: [dayGridPlugin],
      initialView: 'dayGridMonth',
      dateClick: this.handleDateClick.bind(this),
  }
  }

      ngOnInit(): void {
        this.infoClinica = this.AuthService.infoClinica;

        this.HorarioClinicaService.cargarHorarioClinica().subscribe({
          next: (resp: HorarioClinicaResponse) => {
            this.horarioClinicas = resp.horariosClinica;
          },
          error: (err) => {
            this.errorHandler.showError(err, 'Error al cargar horarios de la clínica');
            this.horarioClinicas = [];
          }
        });
  }
  handleDateClick(arg:any) {
    // ... tu código para manejar el clic en la fecha ...
  }

}
