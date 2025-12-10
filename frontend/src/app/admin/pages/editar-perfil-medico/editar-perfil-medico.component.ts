import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MedicoService } from '../services/medico.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-editar-perfil-medico',
  templateUrl: './editar-perfil-medico.component.html',
  styleUrls: ['./editar-perfil-medico.component.scss']
})
export class EditarPerfilMedicoComponent implements OnInit {

  perfilForm!: FormGroup;
  rutMedico: string = '';
  medico: any = null;
  documentos: any[] = [];
  cargando: boolean = false;
  guardando: boolean = false;

  // Archivo seleccionado para subir
  archivoSeleccionado: File | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private medicoService: MedicoService
  ) {
    this.inicializarFormulario();
  }

  ngOnInit(): void {
    this.rutMedico = this.route.snapshot.params['rut'];
    this.cargarDatosMedico();
  }

  /**
   * Inicializa el formulario reactivo con validaciones
   */
  inicializarFormulario(): void {
    const currentYear = new Date().getFullYear();

    this.perfilForm = this.fb.group({
      // Información Profesional
      titulo_profesional: ['', [Validators.maxLength(100)]],
      subespecialidad: ['', [Validators.maxLength(150)]],
      registro_medico: ['', [Validators.maxLength(50)]],
      universidad: ['', [Validators.maxLength(200)]],
      anio_titulacion: ['', [Validators.min(1950), Validators.max(currentYear)]],
      anios_experiencia: ['', [Validators.min(0), Validators.max(60)]],
      biografia: ['', [Validators.maxLength(1000)]],

      // Arrays dinámicos
      idiomas: this.fb.array([]),
      certificaciones: this.fb.array([])
    });
  }

  /**
   * Carga los datos del médico y los documentos
   */
  cargarDatosMedico(): void {
    this.cargando = true;

    // Cargar perfil completo
    this.medicoService.obtenerPerfilMedico(this.rutMedico).subscribe({
      next: (response) => {
        this.medico = response.perfil;
        this.poblarFormulario();
        this.cargarDocumentos();
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar médico:', error);
        Swal.fire('Error', 'No se pudo cargar la información del médico', 'error');
        this.cargando = false;
      }
    });
  }

  /**
   * Puebla el formulario con los datos del médico
   */
  poblarFormulario(): void {
    this.perfilForm.patchValue({
      titulo_profesional: this.medico.titulo_profesional || '',
      subespecialidad: this.medico.subespecialidad || '',
      registro_medico: this.medico.registro_medico || '',
      universidad: this.medico.universidad || '',
      anio_titulacion: this.medico.anio_titulacion || '',
      anios_experiencia: this.medico.anios_experiencia || '',
      biografia: this.medico.biografia || ''
    });

    // Cargar idiomas
    if (this.medico.idiomas && this.medico.idiomas.length > 0) {
      this.medico.idiomas.forEach((idioma: string) => {
        this.agregarIdioma(idioma);
      });
    }

    // Cargar certificaciones
    if (this.medico.certificaciones && this.medico.certificaciones.length > 0) {
      this.medico.certificaciones.forEach((cert: string) => {
        this.agregarCertificacion(cert);
      });
    }
  }

  /**
   * Carga la lista de documentos
   */
  cargarDocumentos(): void {
    this.medicoService.listarDocumentosMedico(this.rutMedico).subscribe({
      next: (response) => {
        this.documentos = response.documentos || [];
      },
      error: (error) => {
        console.error('Error al cargar documentos:', error);
      }
    });
  }

  // ============================================
  // GETTERS PARA FORM ARRAYS
  // ============================================

  get idiomas(): FormArray {
    return this.perfilForm.get('idiomas') as FormArray;
  }

  get certificaciones(): FormArray {
    return this.perfilForm.get('certificaciones') as FormArray;
  }

  // ============================================
  // GESTIÓN DE IDIOMAS
  // ============================================

  agregarIdioma(valor: string = ''): void {
    this.idiomas.push(this.fb.control(valor, [Validators.required, Validators.maxLength(50)]));
  }

  eliminarIdioma(index: number): void {
    this.idiomas.removeAt(index);
  }

  agregarIdiomaVacio(): void {
    this.agregarIdioma('');
  }

  // ============================================
  // GESTIÓN DE CERTIFICACIONES
  // ============================================

  agregarCertificacion(valor: string = ''): void {
    this.certificaciones.push(this.fb.control(valor, [Validators.required, Validators.maxLength(200)]));
  }

  eliminarCertificacion(index: number): void {
    this.certificaciones.removeAt(index);
  }

  agregarCertificacionVacia(): void {
    this.agregarCertificacion('');
  }

  // ============================================
  // GESTIÓN DE DOCUMENTOS PDF
  // ============================================

  /**
   * Maneja la selección de archivo
   */
  onFileSelected(event: any): void {
    const file = event.target.files[0];

    if (!file) return;

    // Validar tipo
    if (file.type !== 'application/pdf') {
      Swal.fire('Error', 'Solo se permiten archivos PDF', 'error');
      event.target.value = '';
      return;
    }

    // Validar tamaño (10MB)
    if (file.size > 10 * 1024 * 1024) {
      Swal.fire('Error', 'El archivo no debe superar 10MB', 'error');
      event.target.value = '';
      return;
    }

    this.archivoSeleccionado = file;
  }

  /**
   * Sube el documento PDF seleccionado
   */
  subirDocumento(): void {
    if (!this.archivoSeleccionado) {
      Swal.fire('Error', 'Debe seleccionar un archivo PDF', 'error');
      return;
    }

    Swal.fire({
      title: 'Subiendo documento...',
      text: 'Por favor espere',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.medicoService.subirDocumentoMedico(this.rutMedico, this.archivoSeleccionado).subscribe({
      next: (response) => {
        Swal.fire('Éxito', 'Documento subido correctamente', 'success');
        this.archivoSeleccionado = null;

        // Limpiar input file
        const fileInput = document.getElementById('documentoInput') as HTMLInputElement;
        if (fileInput) fileInput.value = '';

        // Recargar documentos
        this.cargarDocumentos();
      },
      error: (error) => {
        console.error('Error al subir documento:', error);
        Swal.fire('Error', error.error?.mensaje || 'No se pudo subir el documento', 'error');
      }
    });
  }

  /**
   * Elimina un documento
   */
  eliminarDocumento(documento: any): void {
    Swal.fire({
      title: '¿Eliminar documento?',
      text: `Se eliminará: ${documento.nombre}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      confirmButtonColor: '#d33',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.medicoService.eliminarDocumentoMedico(this.rutMedico, documento.key).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Documento eliminado correctamente', 'success');
            this.cargarDocumentos();
          },
          error: (error) => {
            console.error('Error al eliminar documento:', error);
            Swal.fire('Error', 'No se pudo eliminar el documento', 'error');
          }
        });
      }
    });
  }

  // ============================================
  // GUARDAR CAMBIOS
  // ============================================

  /**
   * Guarda los cambios del perfil profesional
   */
  guardarCambios(): void {
    if (this.perfilForm.invalid) {
      Swal.fire('Error', 'Por favor complete correctamente todos los campos', 'error');
      this.marcarCamposComoTocados();
      return;
    }

    this.guardando = true;

    const datosActualizar = {
      ...this.perfilForm.value,
      idiomas: this.idiomas.value.filter((idioma: string) => idioma.trim() !== ''),
      certificaciones: this.certificaciones.value.filter((cert: string) => cert.trim() !== '')
    };

    this.medicoService.actualizarInfoProfesional(this.rutMedico, datosActualizar).subscribe({
      next: (response) => {
        Swal.fire('Éxito', 'Perfil actualizado correctamente', 'success');
        this.guardando = false;
        this.cargarDatosMedico(); // Recargar datos
      },
      error: (error) => {
        console.error('Error al actualizar perfil:', error);
        Swal.fire('Error', error.error?.mensaje || 'No se pudo actualizar el perfil', 'error');
        this.guardando = false;
      }
    });
  }

  /**
   * Marca todos los campos como tocados para mostrar validaciones
   */
  marcarCamposComoTocados(): void {
    Object.keys(this.perfilForm.controls).forEach(key => {
      const control = this.perfilForm.get(key);
      control?.markAsTouched();

      if (control instanceof FormArray) {
        control.controls.forEach(c => c.markAsTouched());
      }
    });
  }

  /**
   * Vuelve a la lista de médicos
   */
  volver(): void {
    this.router.navigate(['/admin/medicos']);
  }

  /**
   * Verifica si un campo es inválido y fue tocado
   */
  esCampoInvalido(campo: string): boolean {
    const control = this.perfilForm.get(campo);
    return !!(control && control.invalid && control.touched);
  }

  /**
   * Obtiene el mensaje de error de un campo
   */
  obtenerMensajeError(campo: string): string {
    const control = this.perfilForm.get(campo);

    if (!control || !control.errors) return '';

    if (control.errors['required']) return 'Este campo es obligatorio';
    if (control.errors['maxlength']) return `Máximo ${control.errors['maxlength'].requiredLength} caracteres`;
    if (control.errors['min']) return `Valor mínimo: ${control.errors['min'].min}`;
    if (control.errors['max']) return `Valor máximo: ${control.errors['max'].max}`;

    return '';
  }
}
