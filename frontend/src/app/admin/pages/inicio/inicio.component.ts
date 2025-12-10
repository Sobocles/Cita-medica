import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SystemStatusService } from '../services/system-status.service';
import { SystemStatus, SystemAlert } from '../interfaces/system-status.interface';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.scss']
})
export class InicioComponent implements OnInit {

  systemStatus: SystemStatus | null = null;
  loading: boolean = true;
  mostrarInstrucciones: boolean = false;

  constructor(
    private systemStatusService: SystemStatusService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargarEstadoSistema();
  }

  /**
   * Carga el estado completo del sistema
   */
  cargarEstadoSistema(): void {
    this.loading = true;
    this.systemStatusService.getSystemStatus().subscribe({
      next: (status) => {
        this.systemStatus = status;
        this.loading = false;
        console.log('Estado del sistema:', status);
      },
      error: (err) => {
        console.error('Error al cargar estado del sistema:', err);
        this.loading = false;
      }
    });
  }

  /**
   * Navega a la ruta especificada
   */
  navegar(ruta: string): void {
    this.router.navigate([ruta]);
  }

  /**
   * Obtiene el icono según el tipo de alerta
   */
  getAlertIcon(tipo: 'error' | 'warning' | 'info'): string {
    switch (tipo) {
      case 'error': return 'bi-x-circle-fill';
      case 'warning': return 'bi-exclamation-triangle-fill';
      case 'info': return 'bi-info-circle-fill';
      default: return 'bi-info-circle';
    }
  }

  /**
   * Obtiene la clase CSS según el tipo de alerta
   */
  getAlertClass(tipo: 'error' | 'warning' | 'info'): string {
    switch (tipo) {
      case 'error': return 'alert-danger';
      case 'warning': return 'alert-warning';
      case 'info': return 'alert-info';
      default: return 'alert-secondary';
    }
  }

  /**
   * Calcula el porcentaje de médicos con horario
   */
  getPorcentajeMedicosConHorario(): number {
    if (!this.systemStatus || this.systemStatus.medicos.total === 0) return 0;
    return Math.round((this.systemStatus.medicos.conHorario / this.systemStatus.medicos.total) * 100);
  }

  /**
   * Obtiene el color de la barra de progreso
   */
  getProgressBarClass(): string {
    const porcentaje = this.getPorcentajeMedicosConHorario();
    if (porcentaje >= 80) return 'bg-success';
    if (porcentaje >= 50) return 'bg-warning';
    return 'bg-danger';
  }

  /**
   * Alterna la vista de instrucciones
   */
  toggleInstrucciones(): void {
    this.mostrarInstrucciones = !this.mostrarInstrucciones;
  }

  /**
   * Verifica si hay alertas críticas (errores)
   */
  tieneAlertasCriticas(): boolean {
    return this.systemStatus?.alertas.some(a => a.tipo === 'error') || false;
  }

  /**
   * Cuenta las alertas por tipo
   */
  contarAlertas(tipo: 'error' | 'warning' | 'info'): number {
    return this.systemStatus?.alertas.filter(a => a.tipo === tipo).length || 0;
  }
}
