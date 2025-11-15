import tipoCitaRepository from '../repositories/TipoCitaRepository';
import medicoRepository from '../repositories/medico.repository';
import citaRepository from '../repositories/CitaRepository';
import horarioMedicoRepository from '../repositories/HorarioMedicoRepository';
import { Op } from 'sequelize';
import Medico from '../models/medico';
import { CrearTipoCitaDto, ActualizarTipoCitaDto } from '../dtos/tipo-cita.dto';

/**
 * Servicio para manejar la lógica de negocio de tipos de cita
 */
export class TipoCitaService {
  /**
   * Obtiene todas las especialidades médicas activas
   */
  async getAllEspecialidades() {
    return tipoCitaRepository.findActiveEspecialidades();
  }

  /**
   * Obtiene especialidades disponibles que tienen médicos activos con horarios
   * Una especialidad está "disponible" si:
   * - Existe en tipocitas como activa
   * - Tiene al menos un médico activo con esa especialidad
   * - Ese médico tiene horarios configurados
   */
  async getEspecialidadesDisponibles() {
    try {
      // Obtener todas las especialidades activas
      const todasEspecialidades = await tipoCitaRepository.getEspecialidadesArray();

      // Filtrar solo las que tienen médicos activos con horarios
      const especialidadesConMedicos: { especialidad_medica: string }[] = [];

      for (const especialidad of todasEspecialidades) {
        // Buscar médicos activos con esta especialidad que tengan horarios
        const medicosConHorarios = await medicoRepository.findAll({
          where: {
            especialidad_medica: especialidad,
            estado: 'activo'
          },
          include: [{
            association: 'HorarioMedics',
            required: true, // Solo médicos que tengan horarios
            attributes: ['idHorario']
          }],
          attributes: ['rut'],
          limit: 1 // Solo necesitamos saber si existe al menos uno
        });

        if (medicosConHorarios.length > 0) {
          especialidadesConMedicos.push({ especialidad_medica: especialidad });
        }
      }

      return especialidadesConMedicos;
    } catch (error) {
      console.error("Error getting available specialties", error);
      // Fallback: retornar todas las especialidades activas
      const especialidades = await this.getAllEspecialidades();
      return especialidades.map(e => ({ especialidad_medica: e.especialidad_medica }));
    }
  }

  /**
   * Obtiene tipos de cita activos con paginación
   */
  async getTipoCitas(desde: number, limite: number) {
    return tipoCitaRepository.findAndCountAll({
      where: { estado: 'activo' },
      offset: desde,
      limit: limite
    });
  }

  /**
   * Obtiene un tipo de cita por su ID
   */
  async getTipoCita(id: number) {
    const tipoCita = await tipoCitaRepository.findByPk(id);
    if (!tipoCita) {
      throw new Error('Tipo de cita no encontrado');
    }
    return tipoCita;
  }

  /**
   * Crea un nuevo tipo de cita con validaciones
   */
  async crearTipoCita(tipoCitaData: CrearTipoCitaDto) {
    const normalizedData = {
      ...tipoCitaData,
      especialidad_medica: this.normalizarEspecialidad(tipoCitaData.especialidad_medica || '')
    };

    // Verificar que no exista una especialidad activa con el mismo nombre
    const exists = await tipoCitaRepository.findOne({
      where: {
        especialidad_medica: normalizedData.especialidad_medica,
        estado: 'activo'
      }
    });

    if (exists) {
      throw new Error(`La especialidad '${normalizedData.especialidad_medica}' ya está registrada`);
    }

    return tipoCitaRepository.create(normalizedData);
  }

  /**
   * Actualiza un tipo de cita existente
   */
  async actualizarTipoCita(id: number, tipoCitaData: ActualizarTipoCitaDto) {
    const tipoCita = await tipoCitaRepository.findByPk(id);
    if (!tipoCita) {
      throw new Error('Tipo de cita no encontrado');
    }

    return tipoCitaRepository.update(id, tipoCitaData);
  }

  /**
   * Elimina (desactiva) un tipo de cita y sus elementos relacionados
   * IMPORTANTE: También desactiva médicos, citas y horarios relacionados
   */
  async eliminarTipoCita(id: number) {
    const tipoCita = await tipoCitaRepository.desactivar(id);
    if (!tipoCita) {
      throw new Error('Tipo de cita no encontrado');
    }

    // Si el tipo de cita tiene especialidad, desactivar elementos relacionados
    if (tipoCita.especialidad_medica) {
      await this.desactivarElementosRelacionados(tipoCita.especialidad_medica);
    }

    return tipoCita;
  }

  /**
   * Desactiva médicos, citas y horarios relacionados con una especialidad
   * @private
   */
  private async desactivarElementosRelacionados(especialidad: string) {
    try {
      // 1. Obtener médicos con esta especialidad
      const medicos = await medicoRepository.findAll({
        where: { especialidad_medica: especialidad },
        attributes: ['rut']
      });

      if (medicos.length === 0) {
        return; // No hay médicos con esta especialidad
      }

      const rutsMedicos = medicos.map(m => m.rut);

      // 2. Desactivar médicos con esta especialidad
      await medicoRepository.updateWhere(
        { especialidad_medica: especialidad },
        { estado: 'inactivo' }
      );

      // 3. Desactivar citas de estos médicos en estados específicos
      await citaRepository.updateWhere(
        {
          rut_medico: { [Op.in]: rutsMedicos },
          estado: { [Op.in]: ['terminado', 'no_pagado', 'no_asistio'] }
        },
        { estado_actividad: 'inactivo' }
      );

      // 4. Eliminar horarios de estos médicos
      for (const rut of rutsMedicos) {
        await horarioMedicoRepository.destroyByMedico(rut);
      }
    } catch (error) {
      console.error("Error desactivando elementos relacionados con especialidad", error);
      throw new Error('Error al desactivar elementos relacionados con la especialidad');
    }
  }

  /**
   * Normaliza el nombre de una especialidad
   * - Remueve acentos
   * - Convierte a minúsculas
   * @private
   */
  private normalizarEspecialidad(especialidad: string): string {
    return especialidad
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }
}

export default new TipoCitaService();