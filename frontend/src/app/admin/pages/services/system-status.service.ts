import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { MedicoService } from './medico.service';
import { TipoCitaService } from './tipo-cita.service';
import { HorarioMedicoService } from './horario-medico.service';
import { PacienteService } from './usuario.service';
import { CitaMedicaService } from './cita-medica.service';
import {
  SystemStatus,
  TipoCitaStats,
  MedicoStats,
  HorarioStats,
  PacienteStats,
  CitaStats,
  SystemAlert,
  PreRequisitos,
  MedicoSinHorario,
  EspecialidadMedicoCount,
  CitaPendiente
} from '../interfaces/system-status.interface';

/**
 * Servicio para obtener el estado completo del sistema
 * Recopila información de múltiples servicios para validar pre-requisitos
 */
@Injectable({
  providedIn: 'root'
})
export class SystemStatusService {

  constructor(
    private medicoService: MedicoService,
    private tipoCitaService: TipoCitaService,
    private horarioMedicoService: HorarioMedicoService,
    private pacienteService: PacienteService,
    private citaMedicaService: CitaMedicaService
  ) { }

  /**
   * Obtiene el estado completo del sistema
   */
  getSystemStatus(): Observable<SystemStatus> {
    return forkJoin({
      tiposCita: this.getTipoCitaStats(),
      medicos: this.getMedicoStats(),
      horarios: this.getHorarioStats(),
      pacientes: this.getPacienteStats(),
      citas: this.getCitaStats()
    }).pipe(
      map(stats => {
        const alertas = this.generarAlertas(stats);
        const preRequisitos = this.validarPreRequisitos(stats);

        return {
          ...stats,
          alertas,
          listo: preRequisitos.todoListo,
          mensajeListo: this.generarMensajeEstado(preRequisitos)
        };
      }),
      catchError(error => {
        console.error('Error obteniendo estado del sistema:', error);
        return of(this.getEmptyStatus());
      })
    );
  }

  /**
   * Obtiene estadísticas de tipos de cita
   */
  private getTipoCitaStats(): Observable<TipoCitaStats> {
    return forkJoin({
      todasEspecialidades: this.tipoCitaService.cargaTodasEspecialidades().pipe(
        catchError(() => of({ especialidades: [] }))
      ),
      medicos: this.medicoService.cargarMedicos().pipe(
        catchError(() => of({ medicos: [] }))
      )
    }).pipe(
      map(({ todasEspecialidades, medicos }) => {
        const especialidades = todasEspecialidades.especialidades?.map(
          (e: any) => e.especialidad_medica
        ) || [];

        const especialidadesConMedicos = new Set(
          medicos.medicos?.map((m: any) => m.especialidad_medica) || []
        );

        const sinMedicos = especialidades.filter(
          (esp: string) => !especialidadesConMedicos.has(esp)
        );

        return {
          total: especialidades.length,
          especialidades,
          sinMedicos
        };
      })
    );
  }

  /**
   * Obtiene estadísticas de médicos
   */
  private getMedicoStats(): Observable<MedicoStats> {
    return forkJoin({
      medicos: this.medicoService.cargarMedicos().pipe(
        catchError(() => of({ medicos: [] }))
      ),
      horarios: this.horarioMedicoService.cargarHorario().pipe(
        catchError(() => of({ horarios: [] }))
      )
    }).pipe(
      map(({ medicos, horarios }) => {
        const medicosArray = medicos.medicos || [];
        const horariosArray = horarios.horarios || [];

        // Médicos con horarios
        const medicosConHorarioSet = new Set(
          horariosArray.map((h: any) => h.rut_medico)
        );

        const medicosSinHorario: MedicoSinHorario[] = medicosArray
          .filter((m: any) => !medicosConHorarioSet.has(m.rut))
          .map((m: any) => ({
            rut: m.rut,
            nombre: m.nombre,
            apellidos: m.apellidos,
            especialidad_medica: m.especialidad_medica
          }));

        // Conteo por especialidad
        const especialidadCount: { [key: string]: number } = {};
        medicosArray.forEach((m: any) => {
          const esp = m.especialidad_medica;
          especialidadCount[esp] = (especialidadCount[esp] || 0) + 1;
        });

        const porEspecialidad: EspecialidadMedicoCount[] = Object.entries(especialidadCount)
          .map(([especialidad, cantidad]) => ({ especialidad, cantidad }));

        return {
          total: medicosArray.length,
          conHorario: medicosConHorarioSet.size,
          sinHorario: medicosSinHorario.length,
          medicosSinHorario,
          porEspecialidad
        };
      })
    );
  }

  /**
   * Obtiene estadísticas de horarios
   */
  private getHorarioStats(): Observable<HorarioStats> {
    return this.horarioMedicoService.cargarHorario().pipe(
      map((response: any) => {
        const horarios = response.horarios || [];

        // Conteo por día
        const diasSemana = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
        const porDia = diasSemana.map(dia => {
          const horariosDelDia = horarios.filter((h: any) =>
            h.diaSemana?.toLowerCase() === dia
          );

          const especialidades = [...new Set(
            horariosDelDia.map((h: any) => h.Medico?.especialidad_medica).filter(Boolean)
          )] as string[];

          return {
            dia,
            cantidad: horariosDelDia.length,
            especialidades
          };
        });

        // Especialidades sin cobertura completa (falta algún día)
        const especialidadesSinCobertura: any[] = [];

        return {
          total: horarios.length,
          porDia,
          especialidadesSinCobertura
        };
      }),
      catchError(() => of({
        total: 0,
        porDia: [],
        especialidadesSinCobertura: []
      }))
    );
  }

  /**
   * Obtiene estadísticas de pacientes
   */
  private getPacienteStats(): Observable<PacienteStats> {
    return this.pacienteService.cargarAllPacientes().pipe(
      map((response: any) => {
        const pacientes = response.usuarios || [];
        return {
          total: pacientes.length,
          activos: pacientes.filter((p: any) => p.estado !== 'inactivo').length
        };
      }),
      catchError(() => of({ total: 0, activos: 0 }))
    );
  }

  /**
   * Obtiene estadísticas de citas
   */
  private getCitaStats(): Observable<CitaStats> {
    return this.citaMedicaService.cargarCitaMedica().pipe(
      map((response: any) => {
        const citas = response.cita || [];

        const enCurso = citas.filter((c: any) => c.estado === 'en_curso').length;
        const pagadas = citas.filter((c: any) => c.estado === 'pagado').length;
        const terminadas = citas.filter((c: any) => c.estado === 'terminado').length;

        // Citas pendientes de cerrar (>24h en estado en_curso o pagado)
        const ahora = new Date();
        const pendientesCerrar: CitaPendiente[] = citas
          .filter((c: any) => {
            if (c.estado !== 'en_curso' && c.estado !== 'pagado') return false;

            const fechaCita = new Date(c.fecha);
            const horasTranscurridas = (ahora.getTime() - fechaCita.getTime()) / (1000 * 60 * 60);

            return horasTranscurridas > 24;
          })
          .map((c: any) => {
            const fechaCita = new Date(c.fecha);
            const horasTranscurridas = Math.floor(
              (ahora.getTime() - fechaCita.getTime()) / (1000 * 60 * 60)
            );

            return {
              idCita: c.idCita,
              paciente: `${c.Usuario?.nombre || ''} ${c.Usuario?.apellidos || ''}`.trim(),
              medico: `Dr. ${c.Medico?.nombre || ''} ${c.Medico?.apellidos || ''}`.trim(),
              fecha: c.fecha,
              estado: c.estado,
              horasTranscurridas
            };
          });

        return {
          total: citas.length,
          enCurso,
          pagadas,
          terminadas,
          pendientesCerrar
        };
      }),
      catchError(() => of({
        total: 0,
        enCurso: 0,
        pagadas: 0,
        terminadas: 0,
        pendientesCerrar: []
      }))
    );
  }

  /**
   * Genera alertas basadas en el estado del sistema
   */
  private generarAlertas(stats: any): SystemAlert[] {
    const alertas: SystemAlert[] = [];

    // Alertas de tipos de cita
    if (stats.tiposCita.total === 0) {
      alertas.push({
        tipo: 'error',
        mensaje: 'No hay especialidades médicas registradas',
        accion: {
          texto: 'Crear Especialidad',
          ruta: '/ad/agregar-tipo-cita'
        }
      });
    } else if (stats.tiposCita.sinMedicos.length > 0) {
      alertas.push({
        tipo: 'warning',
        mensaje: `${stats.tiposCita.sinMedicos.length} especialidad(es) sin médicos: ${stats.tiposCita.sinMedicos.join(', ')}`,
        accion: {
          texto: 'Agregar Médico',
          ruta: '/ad/agregar-medico'
        }
      });
    }

    // Alertas de médicos
    if (stats.medicos.total === 0) {
      alertas.push({
        tipo: 'error',
        mensaje: 'No hay médicos registrados en el sistema',
        accion: {
          texto: 'Registrar Médico',
          ruta: '/ad/agregar-medico'
        }
      });
    } else if (stats.medicos.sinHorario > 0) {
      alertas.push({
        tipo: 'warning',
        mensaje: `${stats.medicos.sinHorario} médico(s) sin horario asignado`,
        accion: {
          texto: 'Crear Horarios',
          ruta: '/ad/gestionar-horarios-medicos'
        }
      });
    }

    // Alertas de horarios
    if (stats.horarios.total === 0 && stats.medicos.total > 0) {
      alertas.push({
        tipo: 'error',
        mensaje: 'No hay horarios médicos configurados',
        accion: {
          texto: 'Configurar Horarios',
          ruta: '/ad/agregar-horario-medico'
        }
      });
    }

    // Alertas de pacientes
    if (stats.pacientes.total === 0) {
      alertas.push({
        tipo: 'warning',
        mensaje: 'No hay pacientes registrados',
        accion: {
          texto: 'Registrar Paciente',
          ruta: '/ad/agregar-paciente'
        }
      });
    }

    // Alertas de citas pendientes
    if (stats.citas.pendientesCerrar.length > 0) {
      alertas.push({
        tipo: 'warning',
        mensaje: `${stats.citas.pendientesCerrar.length} cita(s) pendiente(s) de cerrar (>24h)`,
        accion: {
          texto: 'Ver Citas',
          ruta: '/ad/gestionar-cita'
        }
      });
    }

    return alertas;
  }

  /**
   * Valida si se cumplen todos los pre-requisitos para crear citas
   */
  private validarPreRequisitos(stats: any): PreRequisitos {
    const mensajes: string[] = [];

    const tieneEspecialidades = stats.tiposCita.total > 0;
    const tieneMedicos = stats.medicos.total > 0;
    const tieneHorarios = stats.horarios.total > 0;
    const tienePacientes = stats.pacientes.total > 0;

    if (!tieneEspecialidades) {
      mensajes.push('Registre especialidades médicas');
    }
    if (!tieneMedicos) {
      mensajes.push('Registre médicos');
    }
    if (!tieneHorarios) {
      mensajes.push('Configure horarios para los médicos');
    }
    if (!tienePacientes) {
      mensajes.push('Registre pacientes');
    }

    const todoListo = tieneEspecialidades && tieneMedicos && tieneHorarios && tienePacientes;

    return {
      tieneEspecialidades,
      tieneMedicos,
      tieneHorarios,
      tienePacientes,
      todoListo,
      mensajes
    };
  }

  /**
   * Genera mensaje de estado del sistema
   */
  private generarMensajeEstado(preRequisitos: PreRequisitos): string {
    if (preRequisitos.todoListo) {
      return 'Sistema listo para crear citas médicas';
    }

    return `Faltan ${preRequisitos.mensajes.length} paso(s): ${preRequisitos.mensajes.join(', ')}`;
  }

  /**
   * Retorna un estado vacío en caso de error
   */
  private getEmptyStatus(): SystemStatus {
    return {
      tiposCita: { total: 0, especialidades: [], sinMedicos: [] },
      medicos: { total: 0, conHorario: 0, sinHorario: 0, medicosSinHorario: [], porEspecialidad: [] },
      horarios: { total: 0, porDia: [], especialidadesSinCobertura: [] },
      pacientes: { total: 0, activos: 0 },
      citas: { total: 0, enCurso: 0, pagadas: 0, terminadas: 0, pendientesCerrar: [] },
      alertas: [{
        tipo: 'error',
        mensaje: 'Error al cargar el estado del sistema'
      }],
      listo: false,
      mensajeListo: 'No se pudo verificar el estado del sistema'
    };
  }
}
