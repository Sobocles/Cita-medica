import { Component, OnInit } from '@angular/core';
import { BusquedaMedicoService } from '../../services/busqueda-medico.service';
import { Bloque, BloquesResponse } from '../interfaces/busqueda-medicos';
import { CitaMedicaService } from '../../../admin/pages/services/cita-medica.service';
import { MedicoService } from '../../../admin/pages/services/medico.service';
import { AuthService } from '../../../auth/services/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-busqueda-medico',
  templateUrl: './busqueda-medico.component.html',
  styleUrls: ['./busqueda-medico.component.scss']
})
export class BusquedaMedicoComponent implements OnInit {

  bloques: Bloque[] = [];

  perfilCargando: boolean = false;

  constructor(
    private BusquedaMedicoService: BusquedaMedicoService,
    private CitaMedicaService: CitaMedicaService,
    private MedicoService: MedicoService,
    public AuthService: AuthService,
    private router: Router
  ) { }
  
  ngOnInit(): void {
    this.BusquedaMedicoService.bloques$
      .subscribe(data => {
        this.bloques = data;
        console.log(this.bloques);

        // Cargar imágenes de los médicos
        if (this.bloques.length > 0) {
          this.cargarImagenesMedicos();
        }
      });
      const rutPaciente = this.AuthService.usuario.rut;
      console.log('Aqui esta el rut del paciente logeado',rutPaciente);
  }

  /**
   * Carga las imágenes de todos los médicos en los bloques
   */
  cargarImagenesMedicos(): void {
    // Obtener RUTs únicos de médicos
    const rutsUnicos = [...new Set(this.bloques.map(bloque => bloque.rutMedico))];

    // Crear array de observables para cargar imágenes
    const imagenesObservables = rutsUnicos.map(rut =>
      this.MedicoService.obtenerUrlImagenMedico(rut)
    );

    // Ejecutar todas las peticiones en paralelo
    forkJoin(imagenesObservables).subscribe({
      next: (respuestas) => {
        // Crear un mapa de RUT -> URL de imagen
        const mapaImagenes: { [rut: string]: string } = {};
        rutsUnicos.forEach((rut, index) => {
          if (respuestas[index]?.url) {
            mapaImagenes[rut] = respuestas[index].url;
          }
        });

        // Asignar URLs a cada bloque
        this.bloques = this.bloques.map(bloque => ({
          ...bloque,
          imagenUrl: mapaImagenes[bloque.rutMedico] || undefined
        }));
      },
      error: (err) => {
        // Si falla, simplemente no mostrar imágenes
        console.log('Algunos médicos no tienen imagen de perfil');
      }
    });
  }

  volverAlFormulario(): void {
    this.router.navigate(['/formulario-cita']);
  }

  /**
   * Calcula el precio que el paciente debe pagar según su tipo de previsión
   */
  calcularPrecioParaPaciente(bloque: Bloque): number {
    const tipoPrevision = this.AuthService.usuario.tipo_prevision || 'Particular';

    switch (tipoPrevision) {
      case 'Fonasa':
        return bloque.precio_fonasa || bloque.precio * 0.7;
      case 'Isapre':
        return bloque.precio_isapre || bloque.precio * 0.85;
      case 'Particular':
      default:
        return bloque.precio_particular || bloque.precio;
    }
  }

  /**
   * Obtiene información del descuento aplicado para mostrar en badge
   */
  obtenerInfoDescuento(bloque: Bloque): { texto: string, clase: string } | null {
    const tipoPrevision = this.AuthService.usuario.tipo_prevision || 'Particular';

    if (tipoPrevision === 'Particular') {
      return null; // No hay descuento
    }

    const precioOriginal = bloque.precio_particular || bloque.precio;
    const precioFinal = this.calcularPrecioParaPaciente(bloque);
    const descuento = precioOriginal - precioFinal;

    if (descuento <= 0) {
      return null; // No hay descuento
    }

    const porcentaje = Math.round((descuento / precioOriginal) * 100);

    let texto = '';
    let clase = '';

    if (tipoPrevision === 'Fonasa') {
      const tramo = this.AuthService.usuario.tramo_fonasa || '';
      texto = `🏷️ ${porcentaje}% Descuento FONASA${tramo ? ' ' + tramo : ''}`;
      clase = 'bg-success text-white'; // Verde oscuro con texto blanco - mejor contraste
    } else if (tipoPrevision === 'Isapre') {
      const isapre = this.AuthService.usuario.nombre_isapre || '';
      texto = `🏷️ ${porcentaje}% Descuento ISAPRE${isapre ? ' ' + isapre : ''}`;
      clase = 'bg-warning text-dark'; // Amarillo con texto oscuro - excelente contraste
    }

    return { texto, clase };
  }




/**
   * Agenda una cita médica mostrando primero un modal de confirmación
   * con información detallada de precios, descuentos y documentos requeridos
   */
  async agendarCita(bloque: Bloque): Promise<void> {
    const tipoPrevision = this.AuthService.usuario.tipo_prevision || 'Particular';

    // Calcular precios
    const precioOriginal = bloque.precio_particular || bloque.precio;
    const precioFinal = this.calcularPrecioParaPaciente(bloque);
    const descuento = precioOriginal - precioFinal;
    const porcentaje = tipoPrevision !== 'Particular'
      ? Math.round((descuento / precioOriginal) * 100)
      : 0;

    // Mostrar modal de confirmación (siempre, incluso para pacientes particulares)
    const confirmar = await this.mostrarModalConfirmacion({
      tipoPrevision,
      previsionValidada: this.AuthService.usuario.prevision_validada || false,
      tramoFonasa: this.AuthService.usuario.tramo_fonasa,
      nombreIsapre: this.AuthService.usuario.nombre_isapre,
      precioOriginal,
      precioFinal,
      descuento,
      porcentaje,
      medicoNombre: bloque.medicoNombre,
      especialidad: bloque.especialidad,
      horaInicio: bloque.hora_inicio
    });

    if (!confirmar) {
      return; // Usuario canceló
    }

    // Continuar con creación de cita
    this.crearCitaYPagar(bloque);
  }

  /**
   * Muestra un modal de confirmación con información detallada de la cita
   */
  private async mostrarModalConfirmacion(datos: any): Promise<boolean> {
    // Determinar documentos requeridos
    let documentosHTML = '';
    let advertenciaHTML = '';

    if (datos.tipoPrevision === 'Fonasa') {
      const documentos = [
        `Carnet FONASA vigente${datos.tramoFonasa ? ` (Tramo ${datos.tramoFonasa})` : ''}`,
        'Cédula de identidad'
      ];

      if (datos.previsionValidada) {
        // Si ya validó previamente, mostrar mensaje tranquilizador
        advertenciaHTML = `
          <div style="background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin-top: 20px;">
            <h4 style="color: #155724; margin-top: 0;">✅ Su Previsión Ya Está Validada</h4>
            <p style="margin: 0;">
              Ya validó sus documentos FONASA en una cita anterior, por lo que <strong>el descuento se aplicará automáticamente</strong>
              en todas sus futuras citas. Solo traiga su cédula de identidad para confirmar su identidad.
            </p>
          </div>
        `;
      } else {
        // Si no ha validado, mostrar advertencia completa
        documentosHTML = `
          <ul style="text-align: left; margin: 10px 0;">
            ${documentos.map(doc => `<li>✓ ${doc}</li>`).join('')}
          </ul>
        `;

        advertenciaHTML = `
          <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin-top: 20px;">
            <h4 style="color: #856404; margin-top: 0;">⚠️ MUY IMPORTANTE - PRIMERA VEZ CON FONASA</h4>
            <p><strong>DEBE TRAER A LA CITA:</strong></p>
            ${documentosHTML}

            <div style="background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; margin-top: 15px; border-radius: 4px;">
              <p style="margin: 0; font-weight: bold; color: #721c24;">
                ❗ Si no presenta estos documentos, deberá pagar la diferencia de
                <span style="font-size: 1.1em;">$${datos.descuento.toLocaleString('es-CL')}</span>
                en efectivo en la clínica, totalizando los
                <span style="font-size: 1.1em;">$${datos.precioOriginal.toLocaleString('es-CL')}</span> completos.
              </p>
            </div>

            <p style="margin-top: 10px; margin-bottom: 0; color: #155724;">
              <strong>✅ Una vez validados sus documentos, no tendrá que traerlos nuevamente en futuras citas.</strong>
            </p>
          </div>
        `;
      }
    } else if (datos.tipoPrevision === 'Isapre') {
      const documentos = [
        `Credencial de Isapre vigente${datos.nombreIsapre ? ` (${datos.nombreIsapre})` : ''}`,
        'Cédula de identidad',
        'Bono de atención médica (si su plan lo requiere)'
      ];

      if (datos.previsionValidada) {
        advertenciaHTML = `
          <div style="background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin-top: 20px;">
            <h4 style="color: #155724; margin-top: 0;">✅ Su Previsión Ya Está Validada</h4>
            <p style="margin: 0;">
              Ya validó sus documentos de Isapre en una cita anterior, por lo que <strong>el descuento se aplicará automáticamente</strong>
              en todas sus futuras citas. Recuerde traer su bono médico si su plan lo requiere.
            </p>
          </div>
        `;
      } else {
        documentosHTML = `
          <ul style="text-align: left; margin: 10px 0;">
            ${documentos.map(doc => `<li>✓ ${doc}</li>`).join('')}
          </ul>
        `;

        advertenciaHTML = `
          <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin-top: 20px;">
            <h4 style="color: #856404; margin-top: 0;">⚠️ MUY IMPORTANTE - PRIMERA VEZ CON ISAPRE</h4>
            <p><strong>DEBE TRAER A LA CITA:</strong></p>
            ${documentosHTML}

            <div style="background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; margin-top: 15px; border-radius: 4px;">
              <p style="margin: 0; font-weight: bold; color: #721c24;">
                ❗ Si no presenta estos documentos o el bono no está autorizado, deberá pagar la diferencia de
                <span style="font-size: 1.1em;">$${datos.descuento.toLocaleString('es-CL')}</span>
                en efectivo en la clínica, totalizando los
                <span style="font-size: 1.1em;">$${datos.precioOriginal.toLocaleString('es-CL')}</span> completos.
              </p>
            </div>

            <p style="margin-top: 10px; margin-bottom: 0; color: #155724;">
              <strong>✅ Una vez validados sus documentos, no tendrá que traerlos nuevamente en futuras citas.</strong>
            </p>
          </div>
        `;
      }
    }

    // Construir HTML del modal
    let preciosHTML = '';
    if (datos.tipoPrevision !== 'Particular') {
      preciosHTML = `
        <h4 style="color: #28a745; margin-top: 20px;">💰 RESUMEN DE PRECIOS:</h4>
        <hr style="margin: 10px 0;">
        <p><strong>Precio Consulta Normal:</strong> <span style="text-decoration: line-through;">$${datos.precioOriginal.toLocaleString('es-CL')}</span></p>
        <p><strong>Descuento ${datos.tipoPrevision}:</strong> <span style="color: #28a745;">-$${datos.descuento.toLocaleString('es-CL')} (${datos.porcentaje}%)</span></p>
        <hr style="margin: 10px 0; border-top: 2px solid #000;">
        <p style="font-size: 1.2em;"><strong>💵 Total a Pagar Ahora:</strong> <span style="color: #28a745; font-weight: bold;">$${datos.precioFinal.toLocaleString('es-CL')}</span></p>
      `;
    } else {
      preciosHTML = `
        <h4 style="color: #007bff; margin-top: 20px;">💰 PRECIO DE LA CONSULTA:</h4>
        <hr style="margin: 10px 0;">
        <p style="font-size: 1.2em;"><strong>💵 Total a Pagar:</strong> <span style="color: #007bff; font-weight: bold;">$${datos.precioFinal.toLocaleString('es-CL')}</span></p>
        <p class="text-muted" style="font-size: 0.9em; margin-top: 10px;">
          💡 <strong>Tip:</strong> Si tiene FONASA o ISAPRE, puede actualizar su información en su perfil para obtener descuentos automáticos en sus citas.
        </p>
      `;
    }

    const result = await Swal.fire({
      title: '🏥 Confirmar Reserva de Cita Médica',
      html: `
        <div style="text-align: left; padding: 0 20px;">

          <h4 style="color: #007bff; margin-top: 20px;">📋 RESUMEN DE CITA:</h4>
          <hr style="margin: 10px 0;">
          <p><strong>Médico:</strong> ${datos.medicoNombre}</p>
          <p><strong>Especialidad:</strong> ${datos.especialidad}</p>
          <p><strong>Hora:</strong> ${datos.horaInicio}</p>

          ${preciosHTML}

          ${advertenciaHTML}

          <p style="margin-top: 20px; font-weight: bold; text-align: center;">¿Desea continuar con el pago?</p>
        </div>
      `,
      icon: datos.previsionValidada && datos.tipoPrevision !== 'Particular' ? 'success' : 'info',
      showCancelButton: true,
      confirmButtonText: '✅ Continuar al Pago',
      cancelButtonText: '❌ Cancelar',
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#dc3545',
      width: '750px',
      customClass: {
        popup: 'swal-wide'
      }
    });

    return result.isConfirmed;
  }

  /**
   * Crea la cita médica y procede con el pago
   */
  private crearCitaYPagar(bloque: Bloque): void {
    const rutPaciente = this.AuthService.usuario.rut!;

    // Crear la cita médica
    this.CitaMedicaService.crearCitaMedicaPaciente(bloque, rutPaciente)
      .subscribe(
        (response) => {
          console.log('Cita creada con éxito', response);
          console.log('ID de cita creada:', response.cita.idCita);

          // Una vez que la cita está creada, procedemos con el pago
          // El backend calculará automáticamente el precio según la previsión del paciente
          this.BusquedaMedicoService.pagarCita(bloque.especialidad, response.cita.idCita)
            .subscribe(
              responsePago => {
                console.log('Respuesta del pago:', responsePago);
                // Redirigir a MercadoPago
                window.location.href = responsePago.sandbox_init_point;
              },
              errorPago => {
                console.error('Error al crear la orden de pago:', errorPago);
                Swal.fire({
                  title: 'Error en el Pago',
                  text: 'Hubo un problema al procesar su pago. Por favor, intente nuevamente.',
                  icon: 'error',
                  confirmButtonText: 'Entendido'
                });
              }
            );
        },
        (error) => {
          console.error('Error al crear la cita médica:', error);

          // Verificar si el error es específicamente porque el usuario ya tiene una cita programada
          if (error.status === 400 && error.error.mensaje) {
            Swal.fire({
              title: 'Error',
              text: error.error.mensaje,
              icon: 'error',
              confirmButtonText: 'Entendido'
            });
          } else {
            // Manejo de otros tipos de errores
            Swal.fire({
              title: 'Error',
              text: 'Ha ocurrido un error al agendar la cita.',
              icon: 'error',
              confirmButtonText: 'Entendido'
            });
          }
        }
      );
  }

  /**
   * Muestra un modal con el perfil completo del médico
   */
  verPerfilMedico(rutMedico: string): void {
    // Mostrar loading mientras se carga la información
    Swal.fire({
      title: 'Cargando información del médico...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.MedicoService.obtenerPerfilMedico(rutMedico).subscribe({
      next: (response) => {
        const perfil = response.perfil;

        // Construir HTML del modal
        const modalHTML = this.construirHTMLPerfil(perfil);

        Swal.fire({
          title: `👨‍⚕️ ${perfil.nombreCompleto}`,
          html: modalHTML,
          width: '800px',
          showCloseButton: true,
          showConfirmButton: false,
          customClass: {
            popup: 'perfil-medico-modal'
          }
        });
      },
      error: (error) => {
        console.error('Error al cargar perfil del médico:', error);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo cargar la información del médico. Por favor, intente nuevamente.',
          icon: 'error',
          confirmButtonText: 'Entendido'
        });
      }
    });
  }

  /**
   * Construye el HTML para mostrar el perfil del médico en el modal
   */
  private construirHTMLPerfil(perfil: any): string {
    let html = '<div style="text-align: left; padding: 20px;">';

    // Imagen del médico
    if (perfil.imagenUrl) {
      html += `
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${perfil.imagenUrl}"
               alt="${perfil.nombreCompleto}"
               style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 3px solid #007bff;">
        </div>
      `;
    }

    // Especialidad
    html += `
      <div style="text-align: center; margin-bottom: 30px;">
        <h5 style="color: #007bff; margin: 0;">${perfil.especialidad_medica || 'Médico General'}</h5>
      </div>
    `;

    // Información Profesional
    html += '<h5 style="color: #007bff; border-bottom: 2px solid #007bff; padding-bottom: 5px; margin-top: 20px;">📋 Información Profesional</h5>';

    if (perfil.titulo_profesional) {
      html += `<p><strong>Título:</strong> ${perfil.titulo_profesional}</p>`;
    }

    if (perfil.subespecialidad) {
      html += `<p><strong>Subespecialidad:</strong> ${perfil.subespecialidad}</p>`;
    }

    if (perfil.registro_medico) {
      html += `<p><strong>Registro Médico:</strong> ${perfil.registro_medico}</p>`;
    }

    if (perfil.universidad) {
      html += `<p><strong>Universidad:</strong> ${perfil.universidad}${perfil.anio_titulacion ? ` (${perfil.anio_titulacion})` : ''}</p>`;
    }

    if (perfil.anios_experiencia) {
      html += `<p><strong>Experiencia:</strong> ${perfil.anios_experiencia} años</p>`;
    }

    // Idiomas
    if (perfil.idiomas && perfil.idiomas.length > 0) {
      html += '<h5 style="color: #007bff; border-bottom: 2px solid #007bff; padding-bottom: 5px; margin-top: 20px;">🌍 Idiomas</h5>';
      html += '<ul style="margin-left: 20px;">';
      perfil.idiomas.forEach((idioma: string) => {
        html += `<li>${idioma}</li>`;
      });
      html += '</ul>';
    }

    // Certificaciones
    if (perfil.certificaciones && perfil.certificaciones.length > 0) {
      html += '<h5 style="color: #007bff; border-bottom: 2px solid #007bff; padding-bottom: 5px; margin-top: 20px;">🏆 Certificaciones</h5>';
      html += '<ul style="margin-left: 20px;">';
      perfil.certificaciones.forEach((cert: string) => {
        html += `<li>${cert}</li>`;
      });
      html += '</ul>';
    }

    // Biografía
    if (perfil.biografia) {
      html += '<h5 style="color: #007bff; border-bottom: 2px solid #007bff; padding-bottom: 5px; margin-top: 20px;">📄 Sobre el Médico</h5>';
      html += `<p style="text-align: justify;">${perfil.biografia}</p>`;
    }

    // Documentos
    if (perfil.documentos && perfil.documentos.length > 0) {
      html += '<h5 style="color: #007bff; border-bottom: 2px solid #007bff; padding-bottom: 5px; margin-top: 20px;">📎 Documentos</h5>';
      html += '<ul style="margin-left: 20px;">';
      perfil.documentos.forEach((doc: any) => {
        html += `
          <li>
            <a href="${doc.url}" target="_blank" rel="noopener noreferrer" style="color: #007bff; text-decoration: none;">
              📄 ${doc.nombre}
            </a>
          </li>
        `;
      });
      html += '</ul>';
    }

    // Mensaje si no hay información adicional
    const tieneInfoAdicional = perfil.titulo_profesional || perfil.subespecialidad ||
                                perfil.universidad || perfil.anios_experiencia ||
                                (perfil.idiomas && perfil.idiomas.length > 0) ||
                                (perfil.certificaciones && perfil.certificaciones.length > 0) ||
                                perfil.biografia;

    if (!tieneInfoAdicional) {
      html += `
        <div style="text-align: center; padding: 30px; background: #f8f9fa; border-radius: 8px; margin-top: 20px;">
          <p style="color: #6c757d; margin: 0;">
            Este médico aún no ha completado su perfil profesional.
          </p>
        </div>
      `;
    }

    html += '</div>';

    return html;
  }



}
