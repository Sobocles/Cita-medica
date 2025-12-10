import { Component, OnInit } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { BusquedasService } from '../../services/busquedas.service';
import { CitaMedica, CitasResponse } from '../../interface/cita_medica';
import { CitaMedicaService } from '../../services/cita-medica.service';
import { ErrorHandlerService } from '../../../../shared/services/error-handler.service';

@Component({
  selector: 'app-gestionar-citas-medicas',
  templateUrl: './gestionar-citas-medicas.component.html',
  styleUrls: ['./gestionar-citas-medicas.component.scss'],
  animations: [
    trigger('slideDown', [
      transition(':enter', [
        style({ height: '0', opacity: 0, overflow: 'hidden' }),
        animate('300ms ease-out', style({ height: '*', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ height: '0', opacity: 0, overflow: 'hidden' }))
      ])
    ])
  ]
})
export class GestionarCitasMedicasComponent implements OnInit {

  public citas: CitaMedica[] = [];
  public citasFiltradas: CitaMedica[] = [];
  public todasLasCitas: CitaMedica[] = []; // Para mantener todas las citas en memoria
  public desde: number = 0;
  public mostrarEspecialidad: boolean = false;
  public totalCitas: number = 0;

  // Sistema de filtros
  public mostrarFiltros: boolean = false;
  public filtros = {
    estado: '',
    especialidad: '',
    fechaDesde: '',
    fechaHasta: '',
    busqueda: ''
  };

  // Listas para los selects
  public estadosDisponibles: string[] = ['en_curso', 'terminado', 'no_asistio', 'pagado', 'no_pagado', 'cancelada'];
  public especialidadesDisponibles: string[] = [];

  // Ordenamiento
  public ordenActual = {
    columna: '',
    direccion: 'asc' as 'asc' | 'desc'
  };

  constructor(
    private BusquedasService: BusquedasService,
    private CitaMedicaService: CitaMedicaService,
    private errorHandler: ErrorHandlerService
  ) {}

  ngOnInit(): void {
    this.cargarCitas();
  }

  /**
   * Busca citas por texto (paciente o médico)
   */
  buscar(termino: string): void {
    this.filtros.busqueda = termino;

    if (termino.length === 0) {
      this.aplicarFiltros();
      return;
    }

    this.BusquedasService.buscar('cita_medica', termino).subscribe({
      next: (resp: any) => {
        this.todasLasCitas = resp.citas;
        this.aplicarFiltros();
      },
      error: (err) => {
        this.errorHandler.showError(err, 'Error al buscar citas');
      }
    });
  }

  /**
   * Alterna la visibilidad del panel de filtros
   */
  toggleFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  /**
   * Aplica todos los filtros activos
   */
  aplicarFiltros(): void {
    let resultado = [...this.todasLasCitas];

    // Filtro por estado
    if (this.filtros.estado) {
      resultado = resultado.filter(cita => cita.estado === this.filtros.estado);
    }

    // Filtro por especialidad
    if (this.filtros.especialidad) {
      resultado = resultado.filter(cita =>
        cita.tipoCita?.especialidad_medica === this.filtros.especialidad
      );
    }

    // Filtro por rango de fechas
    if (this.filtros.fechaDesde) {
      const fechaDesde = new Date(this.filtros.fechaDesde);
      resultado = resultado.filter(cita => new Date(cita.fecha) >= fechaDesde);
    }

    if (this.filtros.fechaHasta) {
      const fechaHasta = new Date(this.filtros.fechaHasta);
      resultado = resultado.filter(cita => new Date(cita.fecha) <= fechaHasta);
    }

    this.citasFiltradas = resultado;
    this.citas = resultado;
    this.totalCitas = resultado.length;
  }

  /**
   * Limpia todos los filtros
   */
  limpiarFiltros(): void {
    this.filtros = {
      estado: '',
      especialidad: '',
      fechaDesde: '',
      fechaHasta: '',
      busqueda: ''
    };
    this.cargarCitas();
  }

  /**
   * Obtiene los filtros activos para mostrar como chips
   */
  getFiltrosActivos(): { key: string, label: string, valor: string }[] {
    const activos: { key: string, label: string, valor: string }[] = [];

    if (this.filtros.estado) {
      activos.push({
        key: 'estado',
        label: 'Estado',
        valor: this.getNombreEstado(this.filtros.estado)
      });
    }

    if (this.filtros.especialidad) {
      activos.push({
        key: 'especialidad',
        label: 'Especialidad',
        valor: this.filtros.especialidad
      });
    }

    if (this.filtros.fechaDesde) {
      activos.push({
        key: 'fechaDesde',
        label: 'Desde',
        valor: new Date(this.filtros.fechaDesde).toLocaleDateString()
      });
    }

    if (this.filtros.fechaHasta) {
      activos.push({
        key: 'fechaHasta',
        label: 'Hasta',
        valor: new Date(this.filtros.fechaHasta).toLocaleDateString()
      });
    }

    return activos;
  }

  /**
   * Elimina un filtro específico
   */
  eliminarFiltro(key: string): void {
    (this.filtros as any)[key] = '';
    this.aplicarFiltros();
  }

  /**
   * Obtiene el nombre legible del estado
   */
  getNombreEstado(estado: string): string {
    const nombres: any = {
      'en_curso': 'En Curso',
      'terminado': 'Terminado',
      'no_asistio': 'No Asistió',
      'pagado': 'Pagado',
      'no_pagado': 'No Pagado',
      'cancelada': 'Cancelada'
    };
    return nombres[estado] || estado;
  }

  /**
   * Ordena por columna
   */
  ordenarPor(columna: string): void {
    if (this.ordenActual.columna === columna) {
      // Si ya está ordenado por esta columna, cambiar dirección
      this.ordenActual.direccion = this.ordenActual.direccion === 'asc' ? 'desc' : 'asc';
    } else {
      this.ordenActual.columna = columna;
      this.ordenActual.direccion = 'asc';
    }

    this.citas.sort((a, b) => {
      let valorA: any;
      let valorB: any;

      switch (columna) {
        case 'idCita':
          valorA = a.idCita;
          valorB = b.idCita;
          break;
        case 'fecha':
          valorA = new Date(a.fecha).getTime();
          valorB = new Date(b.fecha).getTime();
          break;
        case 'paciente':
          valorA = `${a.paciente.nombre} ${a.paciente.apellidos}`.toLowerCase();
          valorB = `${b.paciente.nombre} ${b.paciente.apellidos}`.toLowerCase();
          break;
        case 'medico':
          valorA = `${a.medico.nombre} ${a.medico.apellidos}`.toLowerCase();
          valorB = `${b.medico.nombre} ${b.medico.apellidos}`.toLowerCase();
          break;
        case 'estado':
          valorA = a.estado.toLowerCase();
          valorB = b.estado.toLowerCase();
          break;
        default:
          return 0;
      }

      if (valorA < valorB) return this.ordenActual.direccion === 'asc' ? -1 : 1;
      if (valorA > valorB) return this.ordenActual.direccion === 'asc' ? 1 : -1;
      return 0;
    });
  }

  /**
   * Obtiene el icono de ordenamiento para una columna
   */
  getIconoOrden(columna: string): string {
    if (this.ordenActual.columna !== columna) return 'bi-arrow-down-up';
    return this.ordenActual.direccion === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down';
  }
    

/**
   * Borra una cita médica
   */
  async borrarCita(cita: any) {
    const confirmado = await this.errorHandler.showDeleteConfirmation(
      `¿Está seguro que desea eliminar la cita #${cita.idCita}?`
    );

    if (!confirmado) return;

    this.CitaMedicaService.borrarCitaMedica(cita.idCita).subscribe({
      next: (resp) => {
        this.errorHandler.showSuccess(
          `Cita #${cita.idCita} eliminada correctamente`,
          'Cita borrada'
        );
        this.cargarCitas();
      },
      error: (err) => {
        this.errorHandler.showError(err, 'Error al eliminar cita');
      }
    });
  }

  /**
   * Carga todas las citas médicas
   */
  cargarCitas() {
    this.CitaMedicaService.cargarCitaMedica(this.desde).subscribe({
      next: (response: CitasResponse) => {
        this.totalCitas = response.total ?? response.citas.length;
        this.citas = response.citas;
        this.todasLasCitas = response.citas;
        this.citasFiltradas = response.citas;

        // Extraer especialidades únicas para el filtro
        const especialidades = new Set<string>();
        response.citas.forEach(cita => {
          if (cita.tipoCita?.especialidad_medica) {
            especialidades.add(cita.tipoCita.especialidad_medica);
          }
        });
        this.especialidadesDisponibles = Array.from(especialidades).sort();
      },
      error: (err) => {
        this.errorHandler.showError(err, 'Error al cargar citas');
      }
    });
  }

  /**
   * Cambia el estado de una cita
   */
  cambioEstado(cita: any) {
    this.CitaMedicaService.actualizarCita(cita.idCita, { estado: cita.estado }).subscribe({
      next: (response) => {
        this.errorHandler.showSuccess('Cita actualizada correctamente', '¡Hecho!');
      },
      error: (error) => {
        this.errorHandler.showError(error, 'Error al actualizar cita');
        // Revertir el cambio en el select
        this.cargarCitas();
      }
    });
  }

cambiarPagina(nuevoOffset: number) {
  this.desde = nuevoOffset;
  console.log(this.totalCitas);
  if( this.desde < 0){ 
    this.desde = 0;
  } else if( this.desde >= this.totalCitas ){ 
    this.desde -= nuevoOffset;
  }
  this.cargarCitas(); 
}

}
