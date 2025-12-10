import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from '../material/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MedicosRoutingModule } from './medicos-routing.module';
import { LayoutPageComponent } from './layout-page/layout-page.component';
import { HistorialComponent } from './historial/historial.component';
import { GestionarHistorialesComponent } from './gestionar-historiales/gestionar-historiales.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from "../shared/shared.module";
import { VerCitasMedicasComponent } from './ver-citas-medicas/ver-citas-medicas.component';
import { CambiarPasswordMedicoComponent } from './cambiar-password-medico/cambiar-password-medico.component';
import { MiPerfilProfesionalComponent } from './mi-perfil-profesional/mi-perfil-profesional.component';






@NgModule({
    declarations: [
        LayoutPageComponent,
        HistorialComponent,
        GestionarHistorialesComponent,
        VerCitasMedicasComponent,
        CambiarPasswordMedicoComponent,
        MiPerfilProfesionalComponent,

    ],
    imports: [
        CommonModule,
        MaterialModule,
        FormsModule,
        ReactiveFormsModule,
        MedicosRoutingModule,
        RouterModule,
        SharedModule
    ]
})
export class MedicosModule { }
