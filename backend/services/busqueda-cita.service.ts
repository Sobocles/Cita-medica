import { Op } from 'sequelize';
import Medico from '../models/medico';
import HorarioMedic from '../models/horario_medico';
import TipoCita from '../models/tipo_cita';
import CitaMedica from '../models/cita_medica';
import { timeToMinutes, minutesToTime, numberToDay } from '../helpers/time.helper';

/**
 * Servicio para búsqueda y disponibilidad de citas médicas
 * RESPONSABILIDAD: Lógica de negocio para encontrar horarios disponibles
 */

interface HorarioMedico {
  dia: string;
  rut: string;
  horainicio: string;
  horafinalizacion: string;
  inicio_colacion: string | null;
  fin_colacion: string | null;
  especialidad_medica: string;
}

interface BloqueDisponible {
  rutMedico: string;
  medicoNombre: string;
  hora_inicio: string;
  hora_fin: string;
  precio: number;
  idTipoCita: number;
  especialidad: string;
  fecha: string;
}

class BusquedaCitaService {
  private static _instance: BusquedaCitaService;

  public static get instance() {
    return this._instance || (this._instance = new BusquedaCitaService());
  }

  /**
   * Busca un tipo de cita por especialidad
   */
  async buscarTipoCita(especialidad_medica: string): Promise<TipoCita> {
    const tipoCita = await TipoCita.findOne({
      where: {
        especialidad_medica,
        estado: 'activo'
      }
    });

    if (!tipoCita) {
      throw new Error('Tipo de cita no encontrado');
    }

    return tipoCita;
  }

  /**
   * Busca horarios de médicos para una especialidad y día específico
   */
  async buscarHorariosMedico(
    tipoCita: TipoCita,
    diaSemana: string
  ): Promise<HorarioMedico[]> {
    console.log('Buscando horario para:', tipoCita.especialidad_medica, diaSemana);

    // Buscar médicos con la especialidad
    const medicosConEspecialidad = await Medico.findAll({
      where: {
        especialidad_medica: tipoCita.especialidad_medica,
        estado: 'activo'
      }
    });

    if (medicosConEspecialidad.length === 0) {
      return [];
    }

    // Buscar horarios de todos los médicos
    const horariosDeTodosLosMedicos = [];

    for (const medico of medicosConEspecialidad) {
      const horariosMedico = await HorarioMedic.findAll({
        where: {
          diaSemana: diaSemana,
          rut_medico: medico.rut
        },
        attributes: ['rut_medico', 'horaInicio', 'horaFinalizacion', 'inicio_colacion', 'fin_colacion'],
        include: [{
          model: Medico,
          as: 'medico',
          attributes: ['rut', 'nombre', 'apellidos', 'especialidad_medica'],
          where: { estado: 'activo' }
        }]
      });

      horariosDeTodosLosMedicos.push(...horariosMedico);
    }

    // Formatear resultados
    return horariosDeTodosLosMedicos.map((row: any) => ({
      dia: diaSemana,
      rut: row.rut_medico,
      horainicio: row.horaInicio,
      horafinalizacion: row.horaFinalizacion,
      inicio_colacion: row.inicio_colacion,
      fin_colacion: row.fin_colacion,
      especialidad_medica: row.medico.especialidad_medica
    }));
  }

  /**
   * Busca bloques de tiempo disponibles para un médico en una fecha
   */
  async buscarBloquesDisponibles(
    horarioMedico: HorarioMedico,
    duracionCita: number,
    fecha: string,
    precioCita: number,
    idTipoCita: number,
    especialidad: string
  ): Promise<BloqueDisponible[]> {
    if (!horarioMedico || !horarioMedico.horainicio || !horarioMedico.horafinalizacion) {
      throw new Error('Datos del horario del médico no proporcionados correctamente.');
    }

    const medicoRut = horarioMedico.rut;

    // Obtener datos del médico
    const medicoData = await Medico.findOne({
      where: {
        rut: medicoRut,
        estado: 'activo'
      }
    });

    if (!medicoData) {
      throw new Error('Médico no encontrado');
    }

    const medicoNombre = `${medicoData.nombre} ${medicoData.apellidos}`;

    // Generar bloques posibles
    const bloquesPosibles = this.generarBloquesPosibles(
      horarioMedico,
      duracionCita,
      fecha,
      precioCita,
      idTipoCita,
      especialidad,
      medicoRut,
      medicoNombre
    );

    // Filtrar bloques ya ocupados
    return this.filtrarBloquesOcupados(bloquesPosibles, medicoRut, fecha);
  }

  /**
   * Genera todos los bloques posibles basándose en el horario del médico
   */
  private generarBloquesPosibles(
    horarioMedico: HorarioMedico,
    duracionCita: number,
    fecha: string,
    precioCita: number,
    idTipoCita: number,
    especialidad: string,
    medicoRut: string,
    medicoNombre: string
  ): BloqueDisponible[] {
    const horarioInicio = timeToMinutes(horarioMedico.horainicio);
    const horarioFin = timeToMinutes(horarioMedico.horafinalizacion);
    const inicioColacion = horarioMedico.inicio_colacion ? timeToMinutes(horarioMedico.inicio_colacion) : null;
    const finColacion = horarioMedico.fin_colacion ? timeToMinutes(horarioMedico.fin_colacion) : null;

    let bloques: BloqueDisponible[] = [];

    for (let i = horarioInicio; i + duracionCita <= horarioFin; i += duracionCita) {
      // Verificar si el bloque está fuera del horario de colación
      const estaEnColacion = inicioColacion !== null &&
        finColacion !== null &&
        i < finColacion &&
        i + duracionCita > inicioColacion;

      if (!estaEnColacion) {
        bloques.push({
          rutMedico: medicoRut,
          medicoNombre,
          hora_inicio: minutesToTime(i),
          hora_fin: minutesToTime(i + duracionCita),
          precio: precioCita,
          idTipoCita,
          especialidad,
          fecha
        });
      }
    }

    // Filtrar bloques pasados si es hoy
    return this.filtrarBloquesPasados(bloques, fecha);
  }

  /**
   * Filtra bloques que ya pasaron (solo si la fecha es hoy)
   */
  private filtrarBloquesPasados(bloques: BloqueDisponible[], fecha: string): BloqueDisponible[] {
    const ahora = new Date();
    const minutosActuales = ahora.getHours() * 60 + ahora.getMinutes();
    const fechaActualFormateada = ahora.toISOString().split('T')[0];

    if (fecha === fechaActualFormateada) {
      return bloques.filter(bloque =>
        timeToMinutes(bloque.hora_inicio) >= minutosActuales
      );
    }

    return bloques;
  }

  /**
   * Filtra bloques que ya están ocupados por citas existentes
   */
  private async filtrarBloquesOcupados(
    bloques: BloqueDisponible[],
    medicoRut: string,
    fecha: string
  ): Promise<BloqueDisponible[]> {
    const citasProgramadas = await CitaMedica.findAll({
      where: {
        rut_medico: medicoRut,
        fecha: { [Op.eq]: new Date(fecha) },
        [Op.and]: [
          { estado: { [Op.ne]: 'cancelada' } },
          { estado: { [Op.ne]: 'no_pagado' } }
        ],
        estado_actividad: 'activo'
      }
    });

    const bloquesOcupados = citasProgramadas.map(cita => ({
      hora_inicio: cita.hora_inicio,
      hora_fin: cita.hora_fin
    }));

    // Filtrar bloques que se solapan con citas existentes
    return bloques.filter(bloquePosible =>
      !bloquesOcupados.some(bloqueOcupado =>
        bloquePosible.hora_inicio < bloqueOcupado.hora_fin &&
        bloquePosible.hora_fin > bloqueOcupado.hora_inicio
      )
    );
  }

  /**
   * Método principal: busca médicos disponibles para una especialidad y fecha
   */
  async buscarMedicosDisponibles(especialidad: string, fecha: string): Promise<BloqueDisponible[]> {
    console.log('Especialidad buscada:', especialidad);
    console.log('Fecha recibida:', fecha);

    // Calcular día de la semana
    const [anio, mes, dia] = fecha.split('-');
    const fechaUTC = new Date(Date.UTC(Number(anio), Number(mes) - 1, Number(dia)));
    const diaSemana = numberToDay(fechaUTC.getUTCDay());

    console.log('Día de la semana calculado:', diaSemana);

    // Buscar tipo de cita
    const tipoCita = await this.buscarTipoCita(especialidad);
    console.log('Tipo de cita encontrado:', tipoCita.especialidad_medica);

    // Buscar horarios de médicos
    const horariosMedico = await this.buscarHorariosMedico(tipoCita, diaSemana);
    console.log('Horarios encontrados:', horariosMedico.length);

    // Buscar bloques disponibles para cada horario
    const bloquesPromises = horariosMedico.map(horario =>
      this.buscarBloquesDisponibles(
        horario,
        tipoCita.duracion_cita,
        fecha,
        tipoCita.precio,
        tipoCita.idTipoCita,
        tipoCita.especialidad_medica
      )
    );

    const bloquesArrays = await Promise.all(bloquesPromises);
    const bloquesTotales = bloquesArrays.flat();

    return bloquesTotales;
  }
}

export default BusquedaCitaService.instance;
