import { Component, OnInit } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
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
  styleUrls: ['./gestionar-pacientes.component.scss'],
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
export class GestionarPacientesComponent implements OnInit {

  pacientes: Paciente[] = [];
  pacientesFiltrados: Paciente[] = [];
  todosPacientes: Paciente[] = [];
  public desde: number = 0;
  public totalUsuarios: number = 0;

  // Sistema de filtros
  public mostrarFiltros: boolean = false;
  public filtros = {
    rol: '',
    rangoEdad: '',
    busqueda: ''
  };

  // Listas para los selects
  public rolesDisponibles: string[] = ['ADMIN_ROLE', 'USER_ROLE'];
  public rangosEdad = [
    { valor: '0-18', nombre: 'Menor de 18 años' },
    { valor: '18-30', nombre: '18-30 años' },
    { valor: '31-50', nombre: '31-50 años' },
    { valor: '51-65', nombre: '51-65 años' },
    { valor: '65-120', nombre: 'Mayor de 65 años' }
  ];

  // Ordenamiento
  public ordenActual = {
    columna: '',
    direccion: 'asc' as 'asc' | 'desc'
  };

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

          // Transformar usuarios: extraer el código del rol del objeto
          const usuariosTransformados = response.usuarios.map((usuario: any) => ({
            ...usuario,
            rol: usuario.rol?.codigo || usuario.rol || 'USER_ROLE'
          }));

          this.pacientes = usuariosTransformados;
          this.todosPacientes = usuariosTransformados;
          this.pacientesFiltrados = usuariosTransformados;
        },
        error: (err) => {
          this.errorHandler.showError(err, 'Error al cargar pacientes');
          this.pacientes = [];
          this.todosPacientes = [];
          this.pacientesFiltrados = [];
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
  
  /**
   * Busca pacientes por texto (nombre, apellidos, RUT, email)
   */
  buscar(termino: string): void {
    this.filtros.busqueda = termino;

    if (termino.length === 0) {
      // Recargar todos los pacientes desde el servidor
      this.cargaPacientes();
      return;
    }

    this.BusquedasService.buscar('usuarios', termino).subscribe({
      next: (resp) => {
        // Transformar usuarios: asegurar que rol sea string
        const usuariosTransformados = resp.map((usuario: any) => ({
          ...usuario,
          rol: usuario.rol?.codigo || usuario.rol || 'USER_ROLE'
        }));

        this.todosPacientes = usuariosTransformados;
        this.aplicarFiltros();
      },
      error: (err) => {
        this.errorHandler.showError(err, 'Error al buscar pacientes');
        this.pacientes = [];
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
    let resultado = [...this.todosPacientes];

    // Filtro por rol
    if (this.filtros.rol) {
      resultado = resultado.filter(paciente => paciente.rol === this.filtros.rol);
    }

    // Filtro por rango de edad
    if (this.filtros.rangoEdad) {
      const [min, max] = this.filtros.rangoEdad.split('-').map(Number);
      resultado = resultado.filter(paciente => {
        const edad = this.calcularEdad(paciente.fecha_nacimiento);
        return edad >= min && edad <= max;
      });
    }

    this.pacientesFiltrados = resultado;
    this.pacientes = resultado;
    this.totalUsuarios = resultado.length;
  }

  /**
   * Limpia todos los filtros
   */
  limpiarFiltros(): void {
    this.filtros = {
      rol: '',
      rangoEdad: '',
      busqueda: ''
    };
    this.cargaPacientes();
  }

  /**
   * Obtiene los filtros activos para mostrar como chips
   */
  getFiltrosActivos(): { key: string, label: string, valor: string }[] {
    const activos: { key: string, label: string, valor: string }[] = [];

    if (this.filtros.rol) {
      activos.push({
        key: 'rol',
        label: 'Rol',
        valor: this.getNombreRol(this.filtros.rol)
      });
    }

    if (this.filtros.rangoEdad) {
      const rangoEncontrado = this.rangosEdad.find(r => r.valor === this.filtros.rangoEdad);
      activos.push({
        key: 'rangoEdad',
        label: 'Edad',
        valor: rangoEncontrado?.nombre || this.filtros.rangoEdad
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
   * Obtiene el nombre legible del rol
   */
  getNombreRol(rol: string): string {
    const nombres: any = {
      'ADMIN_ROLE': 'Administrador',
      'USER_ROLE': 'Usuario'
    };
    return nombres[rol] || rol;
  }

  /**
   * Calcula la edad de un paciente a partir de su fecha de nacimiento
   */
  calcularEdad(fechaNacimiento: string): number {
    if (!fechaNacimiento) return 0;
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  }

  /**
   * Ordena por columna
   */
  ordenarPor(columna: string): void {
    if (this.ordenActual.columna === columna) {
      this.ordenActual.direccion = this.ordenActual.direccion === 'asc' ? 'desc' : 'asc';
    } else {
      this.ordenActual.columna = columna;
      this.ordenActual.direccion = 'asc';
    }

    this.pacientes.sort((a, b) => {
      let valorA: any;
      let valorB: any;

      switch (columna) {
        case 'rut':
          valorA = a.rut.toLowerCase();
          valorB = b.rut.toLowerCase();
          break;
        case 'nombre':
          valorA = a.nombre.toLowerCase();
          valorB = b.nombre.toLowerCase();
          break;
        case 'apellidos':
          valorA = a.apellidos.toLowerCase();
          valorB = b.apellidos.toLowerCase();
          break;
        case 'email':
          valorA = a.email.toLowerCase();
          valorB = b.email.toLowerCase();
          break;
        case 'rol':
          valorA = a.rol.toLowerCase();
          valorB = b.rol.toLowerCase();
          break;
        case 'edad':
          valorA = this.calcularEdad(a.fecha_nacimiento);
          valorB = this.calcularEdad(b.fecha_nacimiento);
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
   * Formatea la previsión de salud para mostrar en la tabla
   */
  formatearPrevision(paciente: Paciente): string {
    const tipo = paciente.tipo_prevision || 'Particular';

    if (tipo === 'Fonasa') {
      const tramo = paciente.tramo_fonasa ? ` (Tramo ${paciente.tramo_fonasa})` : '';
      return `Fonasa${tramo}`;
    }

    if (tipo === 'Isapre') {
      const isapre = paciente.nombre_isapre ? ` - ${paciente.nombre_isapre}` : '';
      return `Isapre${isapre}`;
    }

    return 'Particular';
  }

  /**
   * Obtiene la clase de Bootstrap para el badge según el tipo de previsión
   */
  getBadgeClass(tipoPrevision?: string): string {
    switch (tipoPrevision) {
      case 'Fonasa':
        return 'bg-success'; // Verde para Fonasa (público)
      case 'Isapre':
        return 'bg-primary'; // Azul para Isapre (privado)
      case 'Particular':
        return 'bg-secondary'; // Gris para Particular
      default:
        return 'bg-secondary';
    }
  }

  /**
   * Obtiene el icono de Bootstrap Icons según el tipo de previsión
   */
  getIconoPrevision(tipoPrevision?: string): string {
    switch (tipoPrevision) {
      case 'Fonasa':
        return 'bi-heart-pulse-fill'; // Corazón para Fonasa
      case 'Isapre':
        return 'bi-building'; // Edificio para Isapre
      case 'Particular':
        return 'bi-person-circle'; // Persona para Particular
      default:
        return 'bi-question-circle';
    }
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
