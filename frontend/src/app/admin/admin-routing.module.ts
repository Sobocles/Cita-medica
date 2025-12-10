import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutPageComponent } from './pages/layout-page/layout-page.component';
import { RouterModule, Routes } from '@angular/router';
import { GestionarPacientesComponent } from './pages/gestionar-pacientes/gestionar-pacientes/gestionar-pacientes.component';
import { GestionarCitasMedicasComponent } from './pages/gestionarCitasMedicas/gestionar-citas/gestionar-citas-medicas.component';
import { GestionarTiposCitasComponent } from './pages/gestionarTiposCitas/gestionar-tipos-citas/gestionar-tipos-citas.component';
import { GestionarHorariosMedicosComponent } from './pages/gestionarHorariosMedicos/gestionar-horarios-medicos/gestionar-horarios-medicos.component';
import { AgregarPacienteComponent } from './pages/gestionar-pacientes/agregar-paciente/agregar-paciente.component';
import { AgregarHorarioMedicoComponent } from './pages/gestionarHorariosMedicos/agregar-horario/agregar-horario.component';
import { GestionarMedicosComponent } from './pages/gestionar-medicos/gestiona-medicos/gestionar-medicos.component';
import { AgregarCitaMedicaComponent } from './pages/gestionarCitasMedicas/agregar-cita-medica/agregar-cita-medica.component';
import { AgregarmedicoComponent } from './pages/gestionar-medicos/agregarmedico/agregarmedico.component';
import { AgregarTipoCitaComponent } from './pages/gestionarTiposCitas/agregar-tipo-cita/agregar-tipo-cita.component';

import { AuthGuard } from '../auth/guards/auth.guard';
import { EditarUsuarioComponent } from './pages/gestionar-pacientes/editar-usuario/editar-usuario.component';
import { InicioComponent } from './pages/inicio/inicio.component';
import { InfoClinicaComponent } from './pages/info-clinica/info-clinica.component';
import { AgregarInfoClinicaComponent } from './pages/info-clinica/agregar-info-clinica/agregar-info-clinica.component';
import { AdminGuard } from '../auth/guards/admin.guard';
import { VerFacturasComponent } from './pages/facturas-medicas/ver-facturas/ver-facturas.component';
import { ImprimirFacturaComponent } from './pages/facturas-medicas/imprimir-factura/imprimir-factura.component';
import { ValidarPrevisionComponent } from './pages/validar-prevision/validar-prevision.component';
import { EditarPerfilMedicoComponent } from './pages/editar-perfil-medico/editar-perfil-medico.component';


const routes: Routes = [
  {
    path: '',
    component: LayoutPageComponent, canActivate: [AuthGuard],
    children: [
      { path: 'info-clinica', component: InfoClinicaComponent, canActivate: [AuthGuard,AdminGuard]  },

      { path: 'factura', component: VerFacturasComponent,canActivate: [AuthGuard,AdminGuard] },

      { path: 'imprimir-factura/:id', component: ImprimirFacturaComponent, canActivate: [AuthGuard,AdminGuard] },

      { path: 'agregar-info-clinica', component: AgregarInfoClinicaComponent, canActivate: [AuthGuard,AdminGuard]  },

      { path: 'inicio-instrucciones', component: InicioComponent, canActivate: [AuthGuard,AdminGuard]  },

      { path: 'gestionar-pacientes', component: GestionarPacientesComponent , canActivate: [AuthGuard,AdminGuard] },
      {
        path: 'agregar-paciente', component: AgregarPacienteComponent, canActivate: [AuthGuard,AdminGuard]  // El componente al que deseas redirigir
      },
      {
        path: 'editar-usuario/:id', 
        component: EditarUsuarioComponent, canActivate: [AuthGuard,AdminGuard]
      },
      {
        path: 'gestionar-medicos', component: GestionarMedicosComponent, canActivate: [AuthGuard,AdminGuard] // El componente al que deseas redirigir
      },
      {
        path: 'agregar-medico',
        component: AgregarmedicoComponent,
        canActivate: [AuthGuard, AdminGuard]
      },
      {
        path: 'editar-medico/:id',
        component: AgregarmedicoComponent,
        canActivate: [AuthGuard, AdminGuard]
      },
      {
        path: 'medico/:rut/editar-perfil',
        component: EditarPerfilMedicoComponent,
        canActivate: [AuthGuard, AdminGuard]
      },




      


      { path: 'gestionar-cita', component: GestionarCitasMedicasComponent, canActivate: [AuthGuard,AdminGuard]  },

      { path: 'agregar-cita', component: AgregarCitaMedicaComponent, canActivate: [AuthGuard,AdminGuard]  },

      { path: 'gestionar-horarios-medicos', component: GestionarHorariosMedicosComponent, canActivate: [AuthGuard,AdminGuard] },

      { path: 'agregar-horario-medico', component: AgregarHorarioMedicoComponent, canActivate: [AuthGuard, AdminGuard] },
      { path: 'editar-horario/:id', component: AgregarHorarioMedicoComponent, canActivate: [AuthGuard, AdminGuard] },


      { path: 'gestionar-tipo-cita', component: GestionarTiposCitasComponent, canActivate: [AuthGuard, AdminGuard] },
      { path: 'agregar-tipo-cita', component: AgregarTipoCitaComponent, canActivate: [AuthGuard, AdminGuard] },
      { path: 'editar-tipoCita/:id', component: AgregarTipoCitaComponent, canActivate: [AuthGuard, AdminGuard] },

      // Ruta para validar previsión
      { path: 'validar-prevision', component: ValidarPrevisionComponent, canActivate: [AuthGuard, AdminGuard] },





    ]
  }
];

@NgModule({
  imports: [ RouterModule.forChild( routes ) ],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
