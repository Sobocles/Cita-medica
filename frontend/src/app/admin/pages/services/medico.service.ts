import { Injectable } from '@angular/core';
import { Medico, MedicoResponse } from '../interface/medicos'
import { HttpClient } from '@angular/common/http';
import { Observable, map, pipe, tap } from 'rxjs';
import { environment } from 'src/environment/environment';
import { Router } from '@angular/router';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})

export class MedicoService {

  get token(): string {
    return localStorage.getItem('token') || '';
  }
  get headers() {
    return { 
      headers: {
      'Authorization': `Bearer ${this.token}`
      }
    }
}



  constructor( private http: HttpClient) { }

  crearMedico( formData: Medico  ): Observable<Medico>{
    console.log('creando medico')    
    return this.http.post(`${base_url}/medicos`,formData, this.headers)
        .pipe(
            tap( (resp:any) => { 
             
              
            })
        )
  }

  cargarMedicos(desde: number = 0 ):Observable<MedicoResponse> {
    //localhost:3000/api/usuarios?desde=0
    const url = `${ base_url }/medicos?desde=${ desde }`;
    return this.http.get<MedicoResponse>( url, this.headers)      
  }

  cargarAllmedicos( ):Observable<MedicoResponse> {
    //localhost:3000/api/usuarios?desde=0
    const url = `${ base_url }/medicos/all`;
    return this.http.get<MedicoResponse>( url, this.headers)
       
        
  }

  cargarmedicosEspecialidad( ) {
    //localhost:3000/api/usuarios?desde=0
    const url = `${ base_url }/medicos/Especialidades`;
    return this.http.get( url, this.headers)
       
        
  }

  borrarMedico( id: string ){

    const url = `${ base_url }/medicos/${ id }`;
    return this.http.delete( url, this.headers );
  }

  obtenerMedicoPorId(  medicoId:string ){ 
    
    console.log(medicoId);
    return this.http.put(`${ base_url }/medicos/${medicoId}`, this.headers) 
     
  }

  editarMedico(medico: Medico): Observable<any> {
    return this.http.put(`${ base_url }/medicos/${medico.rut}`, medico, this.headers);
  }

  /**
   * Sube una imagen de perfil para un médico a AWS S3
   * @param rut - RUT del médico
   * @param imagen - Archivo de imagen (File)
   * @returns Observable con la respuesta del servidor
   */
  subirImagenMedico(rut: string, imagen: File): Observable<any> {
    const formData = new FormData();
    formData.append('imagen', imagen);
    formData.append('rut', rut);

    return this.http.post(`${base_url}/medicos/${rut}/imagen`, formData, this.headers);
  }

  /**
   * Elimina la imagen de perfil de un médico
   * @param rut - RUT del médico
   * @returns Observable con la respuesta del servidor
   */
  eliminarImagenMedico(rut: string): Observable<any> {
    return this.http.delete(`${base_url}/medicos/${rut}/imagen`, this.headers);
  }

  /**
   * Obtiene la URL firmada temporal para ver la imagen de un médico
   * @param rut - RUT del médico
   * @returns Observable con la URL firmada y tiempo de expiración
   */
  obtenerUrlImagenMedico(rut: string): Observable<{ url: string; expiresIn: number }> {
    return this.http.get<{ url: string; expiresIn: number }>(
      `${base_url}/medicos/${rut}/imagen`,
      this.headers
    );
  }

  /**
   * Obtiene el perfil completo de un médico incluyendo información profesional
   * Este endpoint es público y no requiere autenticación
   * @param rut - RUT del médico
   * @returns Observable con el perfil completo del médico
   */
  obtenerPerfilMedico(rut: string): Observable<any> {
    return this.http.get<any>(`${base_url}/medicos/${rut}/perfil`);
  }

  /**
   * Actualiza la información profesional de un médico
   * Requiere autenticación (solo médico o admin)
   * @param rut - RUT del médico
   * @param infoProfesional - Objeto con la información profesional a actualizar
   * @returns Observable con la respuesta del servidor
   */
  actualizarInfoProfesional(rut: string, infoProfesional: any): Observable<any> {
    return this.http.put(`${base_url}/medicos/${rut}/info-profesional`, infoProfesional, this.headers);
  }

  /**
   * ============================================
   * GESTIÓN DE DOCUMENTOS (PDFs)
   * ============================================
   */

  /**
   * Sube un documento PDF (título, certificado) del médico a S3
   * Requiere autenticación
   * @param rut - RUT del médico
   * @param documento - Archivo PDF
   * @returns Observable con la respuesta del servidor
   */
  subirDocumentoMedico(rut: string, documento: File): Observable<any> {
    const formData = new FormData();
    formData.append('documento', documento);
    formData.append('rut', rut);

    return this.http.post(`${base_url}/medicos/${rut}/documento`, formData, this.headers);
  }

  /**
   * Lista todos los documentos de un médico con URLs firmadas
   * Público - no requiere autenticación
   * @param rut - RUT del médico
   * @returns Observable con la lista de documentos
   */
  listarDocumentosMedico(rut: string): Observable<any> {
    return this.http.get<any>(`${base_url}/medicos/${rut}/documentos`);
  }

  /**
   * Elimina un documento del médico
   * Requiere autenticación
   * @param rut - RUT del médico
   * @param key - Key del documento en S3
   * @returns Observable con la respuesta del servidor
   */
  eliminarDocumentoMedico(rut: string, key: string): Observable<any> {
    return this.http.request('delete', `${base_url}/medicos/${rut}/documento`, {
      ...this.headers,
      body: { key }
    });
  }

}
