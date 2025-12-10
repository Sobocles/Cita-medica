import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GestionarHorariosMedicosComponent } from './pages/gestionarHorariosMedicos/gestionar-horarios-medicos/gestionar-horarios-medicos.component';
import { GestionarCitasMedicasComponent } from './pages/gestionarCitasMedicas/gestionar-citas/gestionar-citas-medicas.component';
import { GestionarTiposCitasComponent } from './pages/gestionarTiposCitas/gestionar-tipos-citas/gestionar-tipos-citas.component';
import { LayoutPageComponent } from './pages/layout-page/layout-page.component';
import { GestionarPacientesComponent } from './pages/gestionar-pacientes/gestionar-pacientes/gestionar-pacientes.component';
import { AdminRoutingModule } from './admin-routing.module';
import { MaterialModule } from '../material/material.module';
import { SharedModule } from '../shared/shared.module';
import { RouterModule } from '@angular/router';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AgregarPacienteComponent } from './pages/gestionar-pacientes/agregar-paciente/agregar-paciente.component';
import { AgregarHorarioMedicoComponent } from './pages/gestionarHorariosMedicos/agregar-horario/agregar-horario.component';
import { AgregarCitaMedicaComponent } from './pages/gestionarCitasMedicas/agregar-cita-medica/agregar-cita-medica.component';
import { GestionarMedicosComponent } from './pages/gestionar-medicos/gestiona-medicos/gestionar-medicos.component';

import { AgregarTipoCitaComponent } from './pages/gestionarTiposCitas/agregar-tipo-cita/agregar-tipo-cita.component';
import { EditarUsuarioComponent } from './pages/gestionar-pacientes/editar-usuario/editar-usuario.component';
import { InicioComponent } from './pages/inicio/inicio.component';
import { InfoClinicaComponent } from './pages/info-clinica/info-clinica.component';
import { AgregarInfoClinicaComponent } from './pages/info-clinica/agregar-info-clinica/agregar-info-clinica.component';
import { VerFacturasComponent } from './pages/facturas-medicas/ver-facturas/ver-facturas.component';
import { ImprimirFacturaComponent } from './pages/facturas-medicas/imprimir-factura/imprimir-factura.component';
import { AgregarmedicoComponent } from './pages/gestionar-medicos/agregarmedico/agregarmedico.component';
import { ValidarPrevisionComponent } from './pages/validar-prevision/validar-prevision.component';
import { EditarPerfilMedicoComponent } from './pages/editar-perfil-medico/editar-perfil-medico.component';






@NgModule({
  declarations: [
    GestionarCitasMedicasComponent,
    GestionarHorariosMedicosComponent,
    GestionarPacientesComponent,
    GestionarTiposCitasComponent,
    GestionarHorariosMedicosComponent,
  
    LayoutPageComponent,
 
    GestionarPacientesComponent,
    AgregarPacienteComponent,
    AgregarHorarioMedicoComponent,
    AgregarCitaMedicaComponent,
    GestionarCitasMedicasComponent,
    GestionarMedicosComponent,

    AgregarTipoCitaComponent,

    EditarUsuarioComponent,
    InicioComponent,
    InfoClinicaComponent,
    AgregarInfoClinicaComponent,
    VerFacturasComponent,
    ImprimirFacturaComponent,
    AgregarmedicoComponent,
    ValidarPrevisionComponent,
    EditarPerfilMedicoComponent,





  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    MaterialModule,
    SharedModule,
    ReactiveFormsModule,
    RouterModule,
    FormsModule

  ]
})
export class AdminModule { }
