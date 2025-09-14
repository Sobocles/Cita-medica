export interface tipoCitaResponse {
    tipo_cita: Tipo_cita[];
    total: number;
  }
  
  export interface Tipo_cita {
    idTipoCita: number;  
    tipo_cita: string;
    precio: number;
    especialidad_medica: string;
    duracion_cita: number;
    createdAt: string;
    updatedAt: string;
  }