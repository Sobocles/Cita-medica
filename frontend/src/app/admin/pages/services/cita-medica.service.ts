import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environment/environment';
import { CitaMedica, CitasResponse } from '../interface/cita_medica';
import { Observable } from 'rxjs';
import { CitasResponsex } from '../interface/cita_medicaResponse';
import { CitaMedicaF } from '../../../pacientes/pages/interfaces/payment'
const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class CitaMedicaService {

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

  
  crearCitaMedica( formData: any ){    
    return this.http.post<any>(`${base_url}/cita_medica`,formData, this.headers)

  }

  crearCitaMedicaPaciente(formData: any, rutPaciente: string) {
    // Incluye el rutPaciente en el objeto formData
    const data = {
      ...formData,
      rutPaciente: rutPaciente 
    };

    console.log('AQUI ESTA LA DATA',data);
    
    // Ahora, envía solo data y las opciones (que incluyen los headers)
    return this.http.post<any>(`${base_url}/cita_medica/crearCitapaciente`, data, this.headers);
  }
  

  obtenerCitaMedicaPorId(  horarioId: number ):Observable<CitasResponse>{ //aca role no viene como parametro (viene email y nombre en this.perfilForm.value) pero aun asi funciona ya que role simplemente se ignora
    
    return this.http.get<CitasResponse>(`${ base_url }/cita_medica/${horarioId}`, this.headers) //Para actualizar los datos del usuario se necesita enviar al backend El id que se obtiene de un metodo get que me da el id del usuario logeado que es el mismo que esta intentando actualizar sus datos, la data que se quiere actualizar que es enviada por un formulario y los header con el token de acceso
     
  }

  obtenerCitamedicaFacturaPorId( idCita: number ){
    console.log('AQUI ESTA EL ID DE LA CITA QUE LLEGA AL METODO obtenerCitamedicaFacturaPorId',idCita);
    return this.http.get<any>(`${ base_url }/cita_medica/${idCita}`, this.headers) 
     
  }

  obtenerCitaMedicaPorIdParaMedicos(rutMedico: string, desde: number, limite: number = 5): Observable<CitasResponse> { 
    const url = `${ base_url }/cita_medica/medico/${rutMedico}?desde=${desde}&limite=${limite}`;
    console.log('URL de solicitud:', url);
    return this.http.get<CitasResponse>(url, this.headers); 
}

obtenerCitaMedicaPorIdParaPacientes(rutPaciente: string, desde: number, limite: number = 5): Observable<CitasResponse> { 
  const url = `${ base_url }/cita_medica/usuario/${rutPaciente}?desde=${desde}&limite=${limite}`;
  console.log('URL de solicitud:', url);
  return this.http.get<CitasResponse>(url, this.headers); 
}

  cargarCitaMedica(desde: number = 0) {
   
    const url = `${base_url}/cita_medica?desde=${desde}`;
    return this.http.get<CitasResponse>(url, this.headers);
  }

  borrarCitaMedica( id: number ){
    const url = `${ base_url }/cita_medica/${ id }`;
    return this.http.delete( url, this.headers );
  }

  actualizarCita(id: number, data: any): Observable<any> {
    const url = `${ base_url }/cita_medica/${ id }`;
    return this.http.put(url, data, this.headers);
  }

  /**
   * Valida la previsión del paciente el día de la cita
   * @param idCita - ID de la cita a validar
   * @param validacionData - Datos de validación (validado, diferenciaEfectivo, tipoPrevisionReal, observaciones)
   */
  validarPrevision(idCita: number, validacionData: {
    validado: boolean;
    diferenciaEfectivo?: number;
    tipoPrevisionReal?: 'Fonasa' | 'Isapre' | 'Particular';
    observaciones?: string;
  }): Observable<any> {
    const url = `${base_url}/cita_medica/validar-prevision/${idCita}`;
    return this.http.post(url, validacionData, this.headers);
  }

}
