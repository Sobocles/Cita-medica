import { Component, OnInit } from '@angular/core';
import { CitaMedicaService } from '../services/cita-medica.service';
import { CitaMedica } from '../interface/cita_medica';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-validar-prevision',
  templateUrl: './validar-prevision.component.html',
  styleUrls: ['./validar-prevision.component.scss']
})
export class ValidarPrevisionComponent implements OnInit {

  citasPendientes: CitaMedica[] = [];
  cargando: boolean = false;
  desde: number = 0;
  totalCitas: number = 0;

  constructor(
    private citaMedicaService: CitaMedicaService
  ) { }

  ngOnInit(): void {
    this.cargarCitasPendientesValidacion();
  }

  cargarCitasPendientesValidacion() {
    this.cargando = true;
    this.citaMedicaService.cargarCitaMedica(this.desde).subscribe({
      next: (response) => {
        // Filtrar solo citas que requieren validación y no han sido validadas
        this.citasPendientes = response.citas.filter(cita =>
          cita.requiere_validacion_prevision && !cita.prevision_validada
        );
        this.totalCitas = this.citasPendientes.length;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar citas:', error);
        Swal.fire('Error', 'No se pudieron cargar las citas pendientes', 'error');
        this.cargando = false;
      }
    });
  }

  abrirModalValidacion(cita: CitaMedica) {
    const diferenciaPagar = cita.descuento_aplicado || 0;

    Swal.fire({
      title: '✅ Validar Previsión',
      html: `
        <div style="text-align: left;">
          <p><strong>Paciente:</strong> ${cita.paciente.nombre} ${cita.paciente.apellidos}</p>
          <p><strong>Tipo de Previsión:</strong> ${cita.tipo_prevision_aplicada}</p>
          <p><strong>Precio Pagado:</strong> $${cita.precio_final?.toLocaleString('es-CL')}</p>
          <p><strong>Diferencia si no presenta documentos:</strong> $${diferenciaPagar.toLocaleString('es-CL')}</p>
          <hr>
          <p><strong>¿El paciente presentó los documentos requeridos?</strong></p>
        </div>
      `,
      icon: 'question',
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: '✓ Sí, validó correctamente',
      denyButtonText: '✗ No trajo documentos',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#28a745',
      denyButtonColor: '#dc3545',
    }).then((result) => {
      if (result.isConfirmed) {
        // ESCENARIO 1: Validó correctamente
        this.validarConDocumentos(cita);
      } else if (result.isDenied) {
        // ESCENARIO 2 o 3: No trajo documentos
        this.abrirModalNoTrajoDocumentos(cita);
      }
    });
  }

  validarConDocumentos(cita: CitaMedica) {
    Swal.fire({
      title: 'Observaciones (opcional)',
      input: 'textarea',
      inputPlaceholder: 'Ingrese observaciones sobre la validación...',
      showCancelButton: true,
      confirmButtonText: 'Confirmar Validación',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        const validacionData = {
          validado: true,
          observaciones: result.value || 'Previsión validada correctamente con documentos'
        };

        this.citaMedicaService.validarPrevision(cita.idCita, validacionData).subscribe({
          next: (response) => {
            Swal.fire({
              icon: 'success',
              title: '¡Validación exitosa!',
              text: response.mensaje,
              timer: 2000,
              showConfirmButton: false
            });
            this.cargarCitasPendientesValidacion();
          },
          error: (error) => {
            Swal.fire('Error', error.error?.msg || 'Error al validar la previsión', 'error');
          }
        });
      }
    });
  }

  abrirModalNoTrajoDocumentos(cita: CitaMedica) {
    const diferenciaPagar = cita.descuento_aplicado || 0;

    Swal.fire({
      title: 'No presentó documentos',
      html: `
        <div style="text-align: left;">
          <p><strong>Diferencia a pagar:</strong> $${diferenciaPagar.toLocaleString('es-CL')}</p>
          <hr>
          <p><strong>¿Qué acción realizar?</strong></p>
        </div>
      `,
      icon: 'warning',
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: '💵 Pagó en efectivo',
      denyButtonText: '⚠️ Mintió sobre previsión',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#17a2b8',
      denyButtonColor: '#ffc107',
    }).then((result) => {
      if (result.isConfirmed) {
        // ESCENARIO 2: Pagó diferencia en efectivo
        this.registrarPagoEfectivo(cita, diferenciaPagar);
      } else if (result.isDenied) {
        // ESCENARIO 3: Mintió sobre previsión
        this.registrarPrevisionIncorrecta(cita);
      }
    });
  }

  registrarPagoEfectivo(cita: CitaMedica, diferencia: number) {
    Swal.fire({
      title: 'Confirmar pago en efectivo',
      html: `
        <div style="text-align: left;">
          <label><strong>Monto pagado en efectivo:</strong></label>
          <input type="number" id="montoEfectivo" class="swal2-input" value="${diferencia}" min="0">
          <br>
          <label><strong>Observaciones:</strong></label>
          <textarea id="observaciones" class="swal2-textarea" placeholder="Detalles del pago..."></textarea>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const monto = (document.getElementById('montoEfectivo') as HTMLInputElement).value;
        const observaciones = (document.getElementById('observaciones') as HTMLTextAreaElement).value;

        if (!monto || parseFloat(monto) <= 0) {
          Swal.showValidationMessage('Ingrese un monto válido');
          return false;
        }

        return { monto: parseFloat(monto), observaciones };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const validacionData = {
          validado: false,
          diferenciaEfectivo: result.value.monto,
          observaciones: result.value.observaciones || 'No presentó documentos. Pagó diferencia en efectivo.'
        };

        this.citaMedicaService.validarPrevision(cita.idCita, validacionData).subscribe({
          next: (response) => {
            Swal.fire({
              icon: 'success',
              title: 'Pago registrado',
              text: `Se registró el pago de $${result.value!.monto.toLocaleString('es-CL')} en efectivo`,
              timer: 2000,
              showConfirmButton: false
            });
            this.cargarCitasPendientesValidacion();
          },
          error: (error) => {
            Swal.fire('Error', error.error?.msg || 'Error al registrar el pago', 'error');
          }
        });
      }
    });
  }

  registrarPrevisionIncorrecta(cita: CitaMedica) {
    Swal.fire({
      title: 'Previsión incorrecta',
      html: `
        <div style="text-align: left;">
          <p>El paciente declaró <strong>${cita.tipo_prevision_aplicada}</strong></p>
          <hr>
          <label><strong>Seleccione la previsión real:</strong></label>
          <select id="previsionReal" class="swal2-select">
            <option value="">Seleccione...</option>
            <option value="Fonasa">Fonasa</option>
            <option value="Isapre">Isapre</option>
            <option value="Particular">Particular</option>
          </select>
          <br>
          <label><strong>Observaciones:</strong></label>
          <textarea id="observaciones" class="swal2-textarea" placeholder="Detalles de la situación..."></textarea>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Actualizar Previsión',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const previsionReal = (document.getElementById('previsionReal') as HTMLSelectElement).value;
        const observaciones = (document.getElementById('observaciones') as HTMLTextAreaElement).value;

        if (!previsionReal) {
          Swal.showValidationMessage('Seleccione la previsión real');
          return false;
        }

        return { previsionReal, observaciones };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const validacionData = {
          validado: false,
          tipoPrevisionReal: result.value.previsionReal as 'Fonasa' | 'Isapre' | 'Particular',
          observaciones: result.value.observaciones || `Previsión real: ${result.value.previsionReal}. No coincide con la declarada.`
        };

        this.citaMedicaService.validarPrevision(cita.idCita, validacionData).subscribe({
          next: (response) => {
            Swal.fire({
              icon: 'info',
              title: 'Previsión actualizada',
              text: response.mensaje,
              timer: 2500,
              showConfirmButton: false
            });
            this.cargarCitasPendientesValidacion();
          },
          error: (error) => {
            Swal.fire('Error', error.error?.msg || 'Error al actualizar la previsión', 'error');
          }
        });
      }
    });
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
