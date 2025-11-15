import { Component } from '@angular/core';
import { Historial, HistorialResponse } from '../historial';
import { HistorialService } from '../services/historial.service';
import { AuthService } from 'src/app/auth/services/auth.service';
import { Router } from '@angular/router';
import { BusquedasService } from '../../admin/pages/services/busquedas.service';
import { ErrorHandlerService } from '../../shared/services/error-handler.service';

@Component({
  selector: 'app-gestionar-historiales',
  templateUrl: './gestionar-historiales.component.html',
  styleUrls: ['./gestionar-historiales.component.scss']
})
export class GestionarHistorialesComponent {
  
  public historiales: any[] = [];
  historialMedico: Historial[] = []; 
  public desde: number = 0;
  public totalHistoriales: number = 0;

  constructor(
    private HistorialService: HistorialService,
    private authservice: AuthService,
    private router: Router,
    private BusquedasService: BusquedasService,
    private errorHandler: ErrorHandlerService
  ){}

  ngOnInit() {
    if (this.authservice.medico && this.authservice.medico.rut) { 
        const rutMedico = this.authservice.medico.rut;
        this.cargarHistorialMedico(rutMedico);
    } else {
        console.error("RUT del medico no definido o medico no autenticado");
    }
}

buscar(termino: string): void {
  console.log(termino);
  if (termino.length === 0) {
    this.cargarHistorialMedico(this.authservice.medico.rut); // Recargar todos los pacientes si la búsqueda está vacía
    return;
  }

  this.BusquedasService.buscar('historiales', termino).subscribe({
    next: (resp) => {
      this.historiales = resp.citas; // Asignar los resultados de la búsqueda
    },
    error: (err) => {
      this.errorHandler.showError(err, 'Error al buscar historiales');
      this.historiales = [];
    }
  });
}

cambiarPagina( valor: number ) { 
  this.desde +=valor;

  if( this.desde < 0){ 
    this.desde = 0;
  } else if( this.desde >= this.totalHistoriales ){ 
    this.desde -= valor;
  }
  this.cargarHistorialMedico(this.authservice.medico.rut);
}

cargarHistorialMedico(rut: string): void {
    this.HistorialService.obtenerHistorialPorIdMedico(rut, this.desde).subscribe({
      next: (resp: any) => {
        this.historiales = resp.historiales;
        console.log('aqui el arreglo de historiales',this.historiales);
        this.totalHistoriales = resp.total;
      },
      error: (err) => {
        console.error('Error al cargar historiales:', err);
        this.errorHandler.showError(err, 'Error al cargar historiales');
        this.historiales = [];
      }
    });
  }

  editarHistorial(historial: any) {
    console.log('este historial',historial);
    this.router.navigate(['/editar-historial', historial.id_historial]);
  }

  async borrarHistorial(historial: any) {
    const confirmado = await this.errorHandler.showConfirmation(
      '¿Borrar Historial?',
      `Está a punto de borrar el historial número ${historial.id_historial}. ¿Está seguro que desea borrarlo?`,
      'Sí, borrarlo',
      'Cancelar'
    );

    if (!confirmado) return;

    this.HistorialService.borrarHistorial(historial.id_historial).subscribe({
      next: (resp) => {
        this.errorHandler.showSuccess(
          `El historial ${historial.id_historial} fue eliminado correctamente`,
          'Historial borrado'
        );
        this.cargarHistorialMedico(this.authservice.medico.rut);
      },
      error: (err) => {
        this.errorHandler.showError(err, 'Error al eliminar historial');
      }
    });
  }
}
