import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from 'src/environment/environment';


const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class BusquedasService {

  constructor( private http: HttpClient) { }

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

  buscar(tipo: 'medicos' | 'usuarios' | 'horario_medico' | 'tipo_cita' | 'cita_medica' | 'facturas'| 'cita_medico'| 'historiales', termino: string) {
    console.log('aqui esta los headers',this.headers);
    const url = `${base_url}/busqueda/coleccion/${tipo}/${termino}`;
    return this.http.get<any[]>(url, this.headers)
        .pipe(
            map((resp: any) => {
                switch (tipo) {
                    case 'medicos':
                        return resp.medicos || [];
                    case 'usuarios':
                        return resp.usuarios || [];
                    case 'horario_medico':
                        return resp.horarios || [];
                    case 'tipo_cita':
                        return resp.tipos || [];
                    case 'cita_medica':
                        return resp.citas || [];
                    case 'facturas':
                        return resp.facturas || [];
                    case 'cita_medico':
                        return resp.citas || [];
                    case 'historiales':
                        return resp.historiales || [];
                    default:
                        return [];
                }
            })
        );
}

cargarMedicos() {
  //localhost:3000/api/usuarios?desde=0
  const url = `${ base_url }/busqueda_cita`;
  return this.http.get( url, this.headers)
     
      
}






}
