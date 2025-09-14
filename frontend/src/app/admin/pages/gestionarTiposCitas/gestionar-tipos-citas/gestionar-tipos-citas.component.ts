import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TipoCitaService } from '../../services/tipo-cita.service';
import { Medico } from '../../interface/medicos';
import { Tipo_cita, tipoCitaResponse } from '../../interface/tipoCita';
import Swal from 'sweetalert2';
import { BusquedasService } from '../../services/busquedas.service';

@Component({
  selector: 'app-gestionar-tipos-citas',
  templateUrl: './gestionar-tipos-citas.component.html',
  styleUrls: ['./gestionar-tipos-citas.component.scss']
})
export class GestionarTiposCitasComponent implements OnInit{

  public tiposCitas: Tipo_cita[] = [];
  public desde: number = 0;
  public totalTipoCitas: number = 0;

  constructor(private TipoCitaService: TipoCitaService, private router: Router, private BusquedasService: BusquedasService){}

  ngOnInit(): void {
    this.cargaTipocita()
  }
  cargaTipocita() {
    this.TipoCitaService.cargaTipocita(this.desde)
      .subscribe((response: tipoCitaResponse) => {
        console.log('AQUI ESTA LA RESPUESTA COMPLETA',response);
        this.tiposCitas = response.tipo_cita; // Asigna el arreglo tipo_cita de la respuesta a tiposCitas
        console.log('AQUI ESTAN LOS TIPOS CITAS',this.tiposCitas);
        this.totalTipoCitas = response.total;

      });
  }

  borrarTipoCita( tipocita: Tipo_cita ) {

    Swal.fire({
      title: '¿Borrar tipo de cita?',
      text: `Esta seguro que desea eliminar este tipo cita? si elimina este tipo cita con su especialidad se borraran todos los horarios medicos, medico y citas que tengan esa especialidad (solo se borraran las cita  en estado terminado), si desea solo cambiar la especialidad de un medico en particular o solo eliminar un medico que atienda esa especialidad  puede hacerlo desde la seccion de gestionar medicos`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Si, borrarlo'
    }).then((result) => {
      if (result.value) {
        
        this.TipoCitaService.borrarTipoCita(tipocita.idTipoCita)
          .subscribe( resp => {
            console.log('aqui esta la respuesta',resp);
            this.cargaTipocita()
            Swal.fire(
              'Tipo de cita borrado',
              `Tipo Cita ${ tipocita.idTipoCita } fue eliminado correctamente`,
              'success'
            );
            
          });

      }
    })

    

  }

  buscar(termino: string): void {
    if (termino.length === 0) {
      this.cargaTipocita(); // Recargar los datos originales
      return;
    }
  
    this.BusquedasService.buscar('tipo_cita', termino)
      .subscribe((resp: Tipo_cita[]) => {
        this.tiposCitas = resp;
      });  
  }
  

    editarTipoCita( tipoCita:any ){
     this.router.navigate(['/editar-tipoCita', tipoCita.idTipoCita]);
    }


    cambiarPagina(nuevoOffset: number) {

      this.desde = nuevoOffset;

      if( this.desde < 0){
        this.desde = 0;
      } else if( this.desde >= this.totalTipoCitas ){ 
        this.desde -= nuevoOffset;
      }
      this.cargaTipocita();

    }







}
