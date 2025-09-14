import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { MedicoService } from '../../services/medico.service';
import { TipoCitaService } from '../../services/tipo-cita.service';
import { rutValidator } from 'src/app/shared/Validators/rut-validator';
import { phoneValidator } from 'src/app/shared/Validators/phone-validator';
import { passwordStrengthValidator } from 'src/app/shared/Validators/password-strength-validator';

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

  constructor(
    private formBuilder: FormBuilder,
    private medicoService: MedicoService,
    private tipoCitaService: TipoCitaService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // Construir el formulario con sus validaciones compartidas
    this.formulario = this.formBuilder.group({
      rut: ['', [Validators.required, rutValidator()]],
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      email: ['', [Validators.required, Validators.email, this.gmailValidator]],
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
      this.medicoService.obtenerMedicoPorId(this.medicoId).subscribe(
        (response: any) => {
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
        },
        error => {
          console.error("Error al cargar el médico:", error);
        }
      );
    } else {
      this.isEditMode = false;
    }
  }
  
  

  // Validador personalizado para que el email termine en @gmail.com
  gmailValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;
    return value.endsWith('@gmail.com') ? null : { notGmail: true };
  }

cargaEspecialidades(): void {
    // Usar el nuevo endpoint que devuelve TODAS las especialidades
    this.tipoCitaService.cargaTodasEspecialidades().subscribe(
      data => {
        console.log('Todas las especialidades para médico:', data);
        // Suponiendo que data.especialidades es un arreglo de objetos con la propiedad especialidad_medica
        this.especialidades = data.especialidades.map((e: { especialidad_medica: string }) => e.especialidad_medica);
        console.log('Especialidades procesadas:', this.especialidades);
      },
      error => {
        console.error("Error al cargar especialidades:", error);
      }
    );
}
  

  onSubmit(): void {
    console.log("aholaaa");
    if (this.formulario.invalid) {
      console.log("Hola",this.formulario.invalid);
      this.formulario.markAllAsTouched();

    }
    
    const formData = this.formulario.value;
    console.log("aqui esta la data", formData);
    if (this.isEditMode) {
      // En modo edición se llama al servicio de edición
      this.medicoService.editarMedico(formData).subscribe(
        response => {
          console.log("medico ",response);
          Swal.fire('Éxito', 'Médico editado exitosamente', 'success');
          this.router.navigateByUrl('/gestionar-medicos');
        },
        error => {
          Swal.fire('Error', 'Hubo un error al editar el médico', 'error');
        }
      );
    } else {
      // En modo agregar se crea un nuevo médico
      this.medicoService.crearMedico(formData).subscribe(
        (response: any) => {
          Swal.fire('Mensaje', response.msg, 'success');
          this.router.navigateByUrl('/gestionar-medicos');
        },
        error => {
          Swal.fire('Error', error.error.msg, 'error');
        }
      );
    }
  }
}
