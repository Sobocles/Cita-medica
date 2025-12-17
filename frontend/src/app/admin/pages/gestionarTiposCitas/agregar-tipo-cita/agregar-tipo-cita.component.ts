import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TipoCitaService } from '../../services/tipo-cita.service';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { Tipo_cita, tipoCitaResponse } from '../../interface/tipoCita';

@Component({
  selector: 'app-agregar-tipo-cita',
  templateUrl: './agregar-tipo-cita.component.html',
  styleUrls: ['./agregar-tipo-cita.component.scss']
})
export class AgregarTipoCitaComponent {
  formularioTipoCita: FormGroup;
  isEditMode: boolean = false;
  tipoCitaId: string | null = null;
  formularioIntentadoEnviar: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private tipoCitaService: TipoCitaService
  ) {
    // Definimos el formulario
    this.formularioTipoCita = this.fb.group({
      idTipo: [''], // Se usará en edición; en creación se eliminará
      especialidad_medica: ['', Validators.required],
      precio: ['', [Validators.required, Validators.pattern(/^(?!0\d)\d+$/)]],
      // Precios diferenciados por tipo de previsión
      precio_fonasa: ['', [Validators.pattern(/^(?!0\d)\d+$/)]],
      precio_isapre: ['', [Validators.pattern(/^(?!0\d)\d+$/)]],
      precio_particular: ['', [Validators.pattern(/^(?!0\d)\d+$/)]],
      duracion_cita: ['', [
        Validators.required,
        Validators.pattern(/^\d+$/),
        Validators.max(180)
      ]]
    });
  }

  ngOnInit(): void {
    // Verificamos si en la ruta se pasó un parámetro "id"
    this.activatedRoute.params.subscribe(params => {
      this.tipoCitaId = params['id'] || null;
      if (this.tipoCitaId) {
        this.isEditMode = true;
        // Se carga el tipo de cita para editar
        this.tipoCitaService.obtenerTipoCitaId(this.tipoCitaId).subscribe(
          (response: any) => {
            // Ajusta según la estructura de la respuesta (por ejemplo, si el objeto viene en response.tipo_cita)
            const tipoCita = response.tipo_cita || response;
            this.formularioTipoCita.patchValue({
              idTipo: tipoCita.idTipo,
              especialidad_medica: tipoCita.especialidad_medica,
              precio: tipoCita.precio,
              precio_fonasa: tipoCita.precio_fonasa || '',
              precio_isapre: tipoCita.precio_isapre || '',
              precio_particular: tipoCita.precio_particular || '',
              duracion_cita: tipoCita.duracion_cita
            });
          },
          error => {
            console.error('Error al cargar el tipo de cita:', error);
          }
        );
      } else {
        this.isEditMode = false;
      }
    });
  }

  convertirMinutosAHoras(minutos: number): string {
    const horas = Math.floor(minutos / 60);
    const minutosRestantes = minutos % 60;
    return `${horas} hora(s) y ${minutosRestantes} minuto(s)`;
  }

  onSubmit(): void {
    this.formularioIntentadoEnviar = true;
    if (this.formularioTipoCita.invalid) {
      return;
    }

    // Preparar datos y convertir cadenas vacías a null para campos numéricos opcionales
    const formData = { ...this.formularioTipoCita.value };

    // Convertir strings vacíos a null para campos de precio opcionales
    if (formData.precio_fonasa === '' || formData.precio_fonasa === null) {
      formData.precio_fonasa = null;
    } else {
      formData.precio_fonasa = Number(formData.precio_fonasa);
    }

    if (formData.precio_isapre === '' || formData.precio_isapre === null) {
      formData.precio_isapre = null;
    } else {
      formData.precio_isapre = Number(formData.precio_isapre);
    }

    if (formData.precio_particular === '' || formData.precio_particular === null) {
      formData.precio_particular = null;
    } else {
      formData.precio_particular = Number(formData.precio_particular);
    }

    // Convertir precio y duración a números
    formData.precio = Number(formData.precio);
    formData.duracion_cita = Number(formData.duracion_cita);

    if (this.isEditMode) {
      // Modo edición
      this.tipoCitaService.editarTipoCita(formData).subscribe(
        response => {
          Swal.fire('Éxito', 'Tipo de cita editado exitosamente', 'success');
          this.router.navigateByUrl('/gestionar-tipo-cita');
        },
        error => {
          Swal.fire('Error', 'Hubo un error al editar el tipo de cita', 'error');
        }
      );
    } else {
      // Modo creación: eliminar el id ya que no se necesita
      delete formData.idTipo;
      this.tipoCitaService.crearTipoCita(formData).subscribe(
        (respuesta: tipoCitaResponse) => {
          Swal.fire('Mensaje', 'Registro exitoso', 'success');
          this.router.navigateByUrl('/gestionar-tipo-cita');
        },
        err => {
          Swal.fire('Error', err.error.msg, 'error');
        }
      );
    }
  }
}
