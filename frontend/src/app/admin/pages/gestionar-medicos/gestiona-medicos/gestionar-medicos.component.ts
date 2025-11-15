import { Component, OnInit } from '@angular/core';
import { Medico, MedicoResponse } from '../../interface/medicos';
import { MedicoService } from '../../services/medico.service';
import { Router } from '@angular/router';
import { BusquedasService } from '../../services/busquedas.service';
import { ErrorHandlerService } from '../../../../shared/services/error-handler.service';



@Component({
  selector: 'app-gestionar-medicos',
  templateUrl: './gestionar-medicos.component.html',
  styleUrls: ['./gestionar-medicos.component.scss']
})


export class GestionarMedicosComponent implements OnInit {

  public medicos: Medico[] = [];
  public desde: number = 0;
  public totalUsuarios: number = 0;

 

  constructor(
    private MedicoService: MedicoService,
    private router: Router,
    private BusquedasService: BusquedasService,
    private errorHandler: ErrorHandlerService
  ){}

  ngOnInit(){
    this.cargaMedicos();
  }

  cargaMedicos() {
    this.MedicoService.cargarMedicos(this.desde)
      .subscribe({
        next: (response: MedicoResponse) => {
          this.totalUsuarios = response.total;
          this.medicos = response.medicos;
        },
        error: (err) => {
          this.errorHandler.showError(err, 'Error al cargar médicos');
          this.medicos = [];
        }
      });
  }

  

  async borrarMedico(medico: Medico) {
    const confirmado = await this.errorHandler.showConfirmation(
      '¿Borrar médico?',
      `Está a punto de eliminar a ${medico.nombre}. Tenga en cuenta que se eliminarán los horarios y las citas en las que el médico esté involucrado. Solo se eliminarán las citas en estado "terminado", por lo que las citas que ya fueron pagadas o están en curso seguirán activas. Por favor, asegúrese de contar con un médico suplente para atender estas citas o comuníquese con sus pacientes.`,
      'Sí, borrarlo',
      'Cancelar'
    );

    if (!confirmado) return;

    this.MedicoService.borrarMedico(medico.rut).subscribe({
      next: (resp) => {
        this.errorHandler.showSuccess(
          `${medico.nombre} fue eliminado correctamente`,
          'Médico borrado'
        );
        this.cargaMedicos();
      },
      error: (err) => {
        this.errorHandler.showError(err, 'Error al eliminar médico');
      }
    });
  }

  editarMedico(medico: Medico) {
    console.log('este medico',medico);
    this.router.navigate(['/editar-medico', medico.rut]);
  }

  cambiarPagina(nuevoOffset: number) {
        console.log("valor", nuevoOffset);
        this.desde = nuevoOffset;
        console.log(this.desde);

        if( this.desde < 0){ 
          this.desde = 0;
        } else if( this.desde >= this.totalUsuarios ){ 
          this.desde -= nuevoOffset;
        }
        this.cargaMedicos(); 
      }

      

  buscar(termino: string): void {
    if (termino.length === 0) {
      this.cargaMedicos();
      return; // Termina la ejecución si no hay término a buscar
    }

    this.BusquedasService.buscar('medicos', termino).subscribe({
      next: (resp: any) => {
        console.log(resp);
        this.medicos = resp;
      },
      error: (err) => {
        this.errorHandler.showError(err, 'Error al buscar médicos');
        this.medicos = [];
      }
    });
  }


}
