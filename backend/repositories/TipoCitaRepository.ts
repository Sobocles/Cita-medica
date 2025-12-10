import { Op, FindOptions, WhereOptions } from 'sequelize';
import TipoCita from '../models/tipo_cita';

/**
 * Repositorio para manejar el acceso a datos de tipos de cita
 */
export class TipoCitaRepository {
  /**
   * Busca y cuenta todos los tipos de cita con opciones
   */
  async findAndCountAll(options: FindOptions) {
    return TipoCita.findAndCountAll(options);
  }

  /**
   * Busca un tipo de cita por su ID
   */
  async findByPk(id: number) {
    return TipoCita.findByPk(id);
  }

  /**
   * Busca un tipo de cita con opciones específicas
   */
  async findOne(options: FindOptions) {
    return TipoCita.findOne(options);
  }

  /**
   * Busca todos los tipos de cita con opciones específicas
   */
  async findAll(options?: FindOptions) {
    return TipoCita.findAll(options);
  }

  /**
   * Crea un nuevo tipo de cita
   */
  async create(tipoCitaData: any) {
    return TipoCita.create(tipoCitaData);
  }

  /**
   * Actualiza un tipo de cita por su ID
   */
  async update(id: number, tipoCitaData: any) {
    const tipoCita = await TipoCita.findByPk(id);
    if (!tipoCita) return null;
    return tipoCita.update(tipoCitaData);
  }

  /**
   * Desactiva un tipo de cita (soft delete)
   */
  async desactivar(id: number) {
    const tipoCita = await TipoCita.findByPk(id);
    if (!tipoCita) return null;
    return tipoCita.update({ estado: 'inactivo' });
  }

  /**
   * Obtiene todas las especialidades médicas activas únicas
   * Agrupa por especialidad_medica
   */
  async findActiveEspecialidades() {
    return TipoCita.findAll({
      attributes: ['especialidad_medica'],
      where: {
        especialidad_medica: { [Op.ne]: null },
        estado: 'activo'
      },
      group: ['especialidad_medica'],
      order: [['especialidad_medica', 'ASC']]
    });
  }

  /**
   * Obtiene las especialidades médicas como un array de strings
   */
  async getEspecialidadesArray(): Promise<string[]> {
    const tipos = await TipoCita.findAll({
      attributes: ['especialidad_medica'],
      where: {
        especialidad_medica: { [Op.ne]: null },
        estado: 'activo'
      },
      group: ['especialidad_medica']
    });

    return tipos.map(tipo => tipo.especialidad_medica).filter(Boolean) as string[];
  }

  /**
   * Cuenta tipos de cita con opciones específicas
   */
  async count(options?: { where?: WhereOptions }): Promise<number> {
    return TipoCita.count(options);
  }
}

export default new TipoCitaRepository();