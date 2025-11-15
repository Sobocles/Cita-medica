import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PacienteService } from '../../services/usuario.service';
import { Router } from '@angular/router';
import { Paciente, UsuariosResponse } from '../../interface/paciente';
import { BusquedasService } from '../../services/busquedas.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { Usuario } from '../../../../medicos/usuarios';
import { ErrorHandlerService } from '../../../../shared/services/error-handler.service';

@Component({
  selector: 'app-gestionar-pacientes',
  templateUrl: './gestionar-pacientes.component.html',
  styleUrls: ['./gestionar-pacientes.component.scss']
})
export class GestionarPacientesComponent implements OnInit {
  
  pacientes: Paciente [] = [];
  public desde: number = 0;
  public totalUsuarios: number = 0;

  constructor(
    private PacienteService: PacienteService,
    private router: Router,
    private BusquedasService: BusquedasService,
    private AuthService: AuthService,
    private errorHandler: ErrorHandlerService
  ){}

  ngOnInit(){
    this.cargaPacientes();
  }


  cargaPacientes() {
    this.PacienteService.cargarPacientes(this.desde)
      .subscribe({
        next: (response: UsuariosResponse) => {
          this.totalUsuarios = response.total;
          this.pacientes = response.usuarios;
        },
        error: (err) => {
          this.errorHandler.showError(err, 'Error al cargar pacientes');
          this.pacientes = [];
        }
      });
  }

  async borrarPaciente(paciente: Paciente) {
    if (this.AuthService.usuario.rut === paciente.rut) {
      this.errorHandler.showValidationError(
        'No puedes eliminarte a ti mismo',
        'Operación no permitida'
      );
      return;
    }

    const confirmado = await this.errorHandler.showConfirmation(
      `¿Estás seguro de querer eliminar a ${paciente.nombre}?`,
      'Esta acción eliminará todas las citas agendadas del paciente y sus historiales médicos',
      'Sí, eliminar',
      'Cancelar'
    );

    if (!confirmado) return;

    this.PacienteService.borrarPaciente(paciente.rut).subscribe({
      next: (response) => {
        this.errorHandler.showSuccess(
          response.msg || 'Paciente eliminado correctamente',
          '¡Eliminado!'
        );
        this.cargaPacientes();
      },
      error: (err) => {
        this.errorHandler.showError(err, 'Error al eliminar paciente');
      }
    });
  }

  
  

  cambiarRole(paciente: Paciente) {
    // Verificar si el paciente a editar es el mismo que el usuario autenticado
    if (this.AuthService.usuario.rut === paciente.rut) {
      this.errorHandler.showValidationError(
        'No puedes cambiar tu propio rol',
        'Operación no permitida'
      );
      return; // Detener la ejecución si el usuario intenta cambiar su propio rol
    }

    // Si no es el mismo, proceder con la lógica de cambio de rol
    this.PacienteService.guardarUsuario(paciente).subscribe({
      next: (resp) => {
        console.log(resp);
        this.errorHandler.showSuccess(
          `El rol de ${paciente.nombre} fue actualizado correctamente`,
          'Rol actualizado'
        );
      },
      error: (err) => {
        this.errorHandler.showError(err, 'Error al actualizar rol');
      }
    });
  }
  
  buscar(termino: string): void {
    console.log(termino);
    if (termino.length === 0) {
      this.cargaPacientes(); // Recargar todos los pacientes si la búsqueda está vacía
      return;
    }

    this.BusquedasService.buscar('usuarios', termino).subscribe({
      next: (resp) => {
        console.log("Respuesta completa:", resp);
        this.pacientes = resp; // Asignar los resultados de la búsqueda
        console.log("this.pacientes después de asignar:", this.pacientes);
      },
      error: (err) => {
        this.errorHandler.showError(err, 'Error al buscar pacientes');
        this.pacientes = [];
      }
    });
  }

editarUsuario(usuario: any) {
  console.log('este paciente',usuario);
  this.router.navigate(['/editar-usuario', usuario.rut]);
}



cambiarPagina(nuevoOffset: number) {
      
      this.desde = nuevoOffset;

      if( this.desde < 0){
        this.desde = 0;
      } else if( this.desde >= this.totalUsuarios ){ 
        this.desde -= nuevoOffset;
      }
      this.cargaPacientes();

    }




}
