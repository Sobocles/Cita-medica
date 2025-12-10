/**
 * Interfaces para el Dashboard de Estado del Sistema
 */

/**
 * Estadísticas de tipos de cita
 */
export interface TipoCitaStats {
  total: number;
  especialidades: string[];
  sinMedicos: string[]; // Especialidades sin médicos asignados
}

/**
 * Estadísticas de médicos
 */
export interface MedicoStats {
  total: number;
  conHorario: number;
  sinHorario: number;
  medicosSinHorario: MedicoSinHorario[];
  porEspecialidad: EspecialidadMedicoCount[];
}

export interface MedicoSinHorario {
  rut: string;
  nombre: string;
  apellidos: string;
  especialidad_medica: string;
}

export interface EspecialidadMedicoCount {
  especialidad: string;
  cantidad: number;
}

/**
 * Estadísticas de horarios
 */
export interface HorarioStats {
  total: number;
  porDia: DiaHorarioCount[];
  especialidadesSinCobertura: EspecialidadCobertura[];
}

export interface DiaHorarioCount {
  dia: string;
  cantidad: number;
  especialidades: string[];
}

export interface EspecialidadCobertura {
  especialidad: string;
  diasSinCobertura: string[];
}

/**
 * Estadísticas de pacientes
 */
export interface PacienteStats {
  total: number;
  activos: number;
}

/**
 * Estadísticas de citas
 */
export interface CitaStats {
  total: number;
  enCurso: number;
  pagadas: number;
  terminadas: number;
  pendientesCerrar: CitaPendiente[]; // Citas con >24h en estado en_curso o pagado
}

export interface CitaPendiente {
  idCita: number;
  paciente: string;
  medico: string;
  fecha: string;
  estado: string;
  horasTranscurridas: number;
}

/**
 * Alertas del sistema
 */
export interface SystemAlert {
  tipo: 'error' | 'warning' | 'info';
  mensaje: string;
  accion?: AlertAction;
}

export interface AlertAction {
  texto: string;
  ruta: string;
}

/**
 * Estado completo del sistema
 */
export interface SystemStatus {
  tiposCita: TipoCitaStats;
  medicos: MedicoStats;
  horarios: HorarioStats;
  pacientes: PacienteStats;
  citas: CitaStats;
  alertas: SystemAlert[];
  listo: boolean; // true si se puede crear una cita
  mensajeListo: string;
}

/**
 * Resumen de requisitos para crear cita
 */
export interface PreRequisitos {
  tieneEspecialidades: boolean;
  tieneMedicos: boolean;
  tieneHorarios: boolean;
  tienePacientes: boolean;
  todoListo: boolean;
  mensajes: string[];
}
