import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MedicoService } from '../../services/medico.service';
import { TipoCitaService } from '../../services/tipo-cita.service';
import { rutValidator } from 'src/app/shared/Validators/rut-validator';
import { phoneValidator } from 'src/app/shared/Validators/phone-validator';
import { passwordStrengthValidator } from 'src/app/shared/Validators/password-strength-validator';
import { gmailValidator } from 'src/app/shared/Validators/gmail-validator';
import { ErrorHandlerService } from '../../../../shared/services/error-handler.service';

@Component({
  selector: 'app-agregarmedico',
  templateUrl: './agregarmedico.component.html',
  styleUrls: ['./agregarmedico.component.scss']
})

export class AgregarmedicoComponent implements OnInit {
  formulario: FormGroup;
  isEditMode: boolean = false;
  medicoId: string | null = null;
  especialidades: string[] = [];

  // Variables para manejo de imagen
  imagenSeleccionada: File | null = null;
  imagenPreview: string | null = null;
  imagenActualUrl: string | null = null;
  subiendoImagen: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private medicoService: MedicoService,
    private tipoCitaService: TipoCitaService,
    private route: ActivatedRoute,
    private router: Router,
    private errorHandler: ErrorHandlerService
  ) {
    // Construir el formulario con sus validaciones compartidas
    this.formulario = this.formBuilder.group({
      rut: ['', [Validators.required, rutValidator()]],
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      email: ['', [Validators.required, Validators.email, gmailValidator()]],
      telefono: ['', [Validators.required, phoneValidator()]],
      direccion: ['', [Validators.required, Validators.maxLength(66)]],
      nacionalidad: ['', Validators.required],
      // Se incluirá la contraseña solo en modo agregar; en edición se puede omitir o hacer opcional
      password: ['', [Validators.required, passwordStrengthValidator()]],
      especialidad_medica: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Llamar a cargar las especialidades
    this.cargaEspecialidades();
  
    // Obtener el parámetro 'id' de la ruta para determinar si es modo edición
    this.medicoId = this.route.snapshot.paramMap.get('id');
    if (this.medicoId) {
      this.isEditMode = true;
      // Llama al servicio para obtener los datos del médico y rellena el formulario
      this.medicoService.obtenerMedicoPorId(this.medicoId).subscribe({
        next: (response: any) => {
          const medico = response.medico;
          this.formulario.patchValue({
            rut: medico.rut,
            nombre: medico.nombre,
            apellidos: medico.apellidos,
            email: medico.email,
            telefono: medico.telefono,
            direccion: medico.direccion,
            nacionalidad: medico.nacionalidad,
            especialidad_medica: medico.especialidad_medica
          });

          // Cargar imagen si existe
          this.cargarImagenMedico(medico.rut);
        },
        error: (err) => {
          console.error("Error al cargar el médico:", err);
          this.errorHandler.showError(err, 'Error al cargar datos del médico');
          this.router.navigate(['/gestionar-medicos']);
        }
      });
    } else {
      this.isEditMode = false;
    }
  }
  

  cargaEspecialidades(): void {
    // Usar el nuevo endpoint que devuelve TODAS las especialidades
    this.tipoCitaService.cargaTodasEspecialidades().subscribe({
      next: (data) => {
        console.log('Todas las especialidades para médico:', data);
        // Suponiendo que data.especialidades es un arreglo de objetos con la propiedad especialidad_medica
        this.especialidades = data.especialidades.map((e: { especialidad_medica: string }) => e.especialidad_medica);
        console.log('Especialidades procesadas:', this.especialidades);
      },
      error: (err) => {
        console.error("Error al cargar especialidades:", err);
        this.errorHandler.showError(err, 'Error al cargar especialidades');
        this.especialidades = []; // Estado seguro
      }
    });
}
  

  onSubmit(): void {
    console.log("Iniciando envío de formulario");
    if (this.formulario.invalid) {
      console.log("Formulario inválido:", this.formulario.invalid);
      this.formulario.markAllAsTouched();
      this.errorHandler.showValidationError(
        'Por favor completa todos los campos requeridos correctamente',
        'Formulario inválido'
      );
      return;
    }

    const formData = this.formulario.value;
    console.log("Datos del formulario:", formData);

    if (this.isEditMode) {
      // En modo edición se llama al servicio de edición
      this.medicoService.editarMedico(formData).subscribe({
        next: (response) => {
          console.log("Médico editado:", response);

          // Si hay una imagen seleccionada, subirla
          if (this.imagenSeleccionada && this.medicoId) {
            this.subirImagen(this.medicoId);
          } else {
            this.errorHandler.showSuccess(
              'El médico ha sido editado exitosamente',
              '¡Éxito!'
            );
            this.router.navigateByUrl('/gestionar-medicos');
          }
        },
        error: (err) => {
          this.errorHandler.showError(err, 'Error al editar médico');
        }
      });
    } else {
      // En modo agregar se crea un nuevo médico
      this.medicoService.crearMedico(formData).subscribe({
        next: (response: any) => {
          const rutCreado = formData.rut;

          // Si hay una imagen seleccionada, subirla
          if (this.imagenSeleccionada && rutCreado) {
            this.subirImagen(rutCreado);
          } else {
            this.errorHandler.showSuccess(
              response.msg || 'El médico ha sido registrado exitosamente',
              '¡Registro exitoso!'
            );
            this.router.navigateByUrl('/gestionar-medicos');
          }
        },
        error: (err) => {
          this.errorHandler.showError(err, 'Error al registrar médico');
        }
      });
    }
  }

  /**
   * Maneja la selección de archivo de imagen
   */
  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      // Validar tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        this.errorHandler.showValidationError(
          'Solo se permiten archivos de imagen (JPG, PNG, WEBP, GIF)',
          'Tipo de archivo no válido'
        );
        return;
      }

      // Validar tamaño (5MB máximo)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        this.errorHandler.showValidationError(
          'La imagen no debe superar los 5MB',
          'Archivo demasiado grande'
        );
        return;
      }

      this.imagenSeleccionada = file;

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagenPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * Carga la URL de la imagen actual del médico
   */
  cargarImagenMedico(rut: string): void {
    this.medicoService.obtenerUrlImagenMedico(rut).subscribe({
      next: (response) => {
        this.imagenActualUrl = response.url;
      },
      error: (err) => {
        // Si no tiene imagen, simplemente no mostrar nada
        console.log('El médico no tiene imagen de perfil');
      }
    });
  }

  /**
   * Sube la imagen seleccionada al servidor
   */
  subirImagen(rut: string): void {
    if (!this.imagenSeleccionada) {
      this.errorHandler.showValidationError(
        'No se ha seleccionado ninguna imagen',
        'Error'
      );
      return;
    }

    this.subiendoImagen = true;
    this.medicoService.subirImagenMedico(rut, this.imagenSeleccionada).subscribe({
      next: (response) => {
        this.subiendoImagen = false;
        this.errorHandler.showSuccess(
          this.isEditMode ?
            'Médico e imagen actualizados correctamente' :
            'Médico e imagen registrados correctamente',
          '¡Éxito!'
        );
        this.router.navigateByUrl('/gestionar-medicos');
      },
      error: (err) => {
        this.subiendoImagen = false;
        this.errorHandler.showError(err, 'Error al subir imagen');
        // Aunque falle la imagen, si el médico se creó/editó, considerarlo éxito parcial
        if (!this.isEditMode) {
          this.router.navigateByUrl('/gestionar-medicos');
        }
      }
    });
  }

  /**
   * Elimina la imagen actual del médico
   */
  eliminarImagen(): void {
    if (!this.medicoId) return;

    this.errorHandler.showDeleteConfirmation(
      '¿Está seguro que desea eliminar la imagen de perfil?'
    ).then((confirmado) => {
      if (confirmado && this.medicoId) {
        this.medicoService.eliminarImagenMedico(this.medicoId).subscribe({
          next: () => {
            this.imagenActualUrl = null;
            this.imagenPreview = null;
            this.imagenSeleccionada = null;
            this.errorHandler.showSuccess('Imagen eliminada correctamente', '¡Éxito!');
          },
          error: (err) => {
            this.errorHandler.showError(err, 'Error al eliminar imagen');
          }
        });
      }
    });
  }

  /**
   * Cancela la selección de imagen
   */
  cancelarSeleccion(): void {
    this.imagenSeleccionada = null;
    this.imagenPreview = null;
  }
}
