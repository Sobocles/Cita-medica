export interface Paciente {
  ok: boolean,
  rut: string;
  nombre: string;
  apellidos: string;
  email: string;
  fecha_nacimiento: string;
  telefono: string;
  direccion: string;
  rol: string;
  toral:number;

  // Campos de previsión de salud
  tipo_prevision?: 'Fonasa' | 'Isapre' | 'Particular';
  nombre_isapre?: string;
  tramo_fonasa?: 'A' | 'B' | 'C' | 'D';

  // Campos de validación de previsión
  prevision_validada?: boolean;
  fecha_validacion_prevision?: string;
}

export interface UsuariosResponse {
  usuarios: Paciente[];
  total: number;
}
  