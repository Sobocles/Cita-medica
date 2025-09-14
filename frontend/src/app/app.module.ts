import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from './shared/shared.module';
import { HttpClientModule } from '@angular/common/http';

import { PacientesModule } from './pacientes/pacientes.module';
import { ReactiveFormsModule } from '@angular/forms';

import { MedicosModule } from './medicos/medicos.module';
import { AdminModule } from './admin/admin.module';


@NgModule({
  declarations: [
    AppComponent,
    
   
   
   
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    SharedModule,
    HttpClientModule,
    AdminModule,
    PacientesModule,
    ReactiveFormsModule,
    MedicosModule

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
