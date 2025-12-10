import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutPageComponent } from './layout-page/layout-page.component';
import { RouterModule, Routes } from '@angular/router';
import { GestionarHistorialesComponent } from './gestionar-historiales/gestionar-historiales.component';
import { HistorialComponent } from './historial/historial.component';
import { AuthGuard } from '../auth/guards/auth.guard';
import { VerCitasMedicasComponent } from './ver-citas-medicas/ver-citas-medicas.component';
import { medicGuard } from '../auth/guards/medic.guard';
import { CambiarPasswordMedicoComponent } from './cambiar-password-medico/cambiar-password-medico.component';
import { MiPerfilProfesionalComponent } from './mi-perfil-profesional/mi-perfil-profesional.component';



const routes: Routes = [
  {
    path: '',
    component: LayoutPageComponent, canActivate: [AuthGuard],
    children: [    
      { path: 'gestionar-historiales', component: GestionarHistorialesComponent, canActivate: [AuthGuard, medicGuard] },
      { path: 'agregar-historial', component: HistorialComponent, canActivate: [AuthGuard, medicGuard] },
      { path: 'editar-historial/:id', component: HistorialComponent, canActivate: [AuthGuard, medicGuard] },
      { path: 'cambiar-password-medicos', component: CambiarPasswordMedicoComponent, canActivate: [AuthGuard, medicGuard] },
      { path: 'ver-citas', component: VerCitasMedicasComponent, canActivate: [AuthGuard, medicGuard] },
      { path: 'mi-perfil-profesional', component: MiPerfilProfesionalComponent, canActivate: [AuthGuard, medicGuard] },
      // Elimina esta línea duplicada
      // { path: 'agregar-historial', component: HistorialComponent, canActivate: [AuthGuard, medicGuard] },

      { path: '**', redirectTo: 'gestionar-historiales' },
    ],
  },
];

@NgModule({
  imports: [ RouterModule.forChild( routes ) ],
  exports: [ RouterModule ],
})
export class MedicosRoutingModule { }
