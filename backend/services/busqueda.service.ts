import { Op } from 'sequelize';
import Usuario from '../models/usuario';
import Medico from '../models/medico';
import HorarioMedic from '../models/horario_medico';
import CitaMedica from '../models/cita_medica';
import TipoCita from '../models/tipo_cita';
import Factura from '../models/factura';
import HistorialMedico from '../models/historial_medico';

/**
 * Servicio para manejar búsquedas en diferentes colecciones
 * RESPONSABILIDAD: Lógica de negocio para búsquedas
 */
class BusquedaService {
  private static _instance: BusquedaService;

  public static get instance() {
    return this._instance || (this._instance = new BusquedaService());
  }

  /**
   * Busca en la colección de usuarios
   */
  async buscarUsuarios(termino: string): Promise<any[]> {
    return Usuario.findAll({
      attributes: ['rut', 'nombre', 'apellidos', 'email', 'fecha_nacimiento', 'telefono', 'direccion', 'rol'],
      where: {
        nombre: { [Op.like]: `%${termino}%` },
        estado: 'activo'
      }
    });
  }

  /**
   * Busca en la colección de médicos
   */
  async buscarMedicos(termino: string): Promise<any[]> {
    return Medico.findAll({
      attributes: ['rut', 'foto', 'nombre', 'apellidos', 'telefono', 'email', 'direccion', 'nacionalidad', 'especialidad_medica'],
      where: {
        [Op.and]: [
          { nombre: { [Op.like]: `%${termino}%` } },
          { estado: 'activo' }
        ]
      }
    });
  }

  /**
   * Busca en horarios médicos
   */
  async buscarHorariosMedicos(termino: string): Promise<any[]> {
    return HorarioMedic.findAll({
      attributes: ['idHorario', 'diaSemana', 'horaInicio', 'horaFinalizacion', 'inicio_colacion', 'fin_colacion', 'disponibilidad', 'fechaCreacion'],
      where: {
        diaSemana: { [Op.like]: `%${termino}%` }
      },
      include: [{
        model: Medico,
        as: 'medico',
        attributes: ['nombre', 'apellidos', 'especialidad_medica'],
        where: { estado: 'activo' }
      }]
    });
  }

  /**
   * Busca en citas médicas
   */
  async buscarCitasMedicas(termino: string): Promise<any[]> {
    return CitaMedica.findAll({
      attributes: ['idCita', 'motivo', 'fecha', 'hora_inicio', 'hora_fin', 'estado'],
      include: [
        {
          model: Usuario,
          as: 'paciente',
          attributes: ['nombre', 'apellidos'],
          required: true
        },
        {
          model: Medico,
          as: 'medico',
          attributes: ['nombre', 'apellidos'],
          required: true
        },
        {
          model: TipoCita,
          as: 'tipoCita',
          attributes: ['especialidad_medica']
        }
      ],
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              { '$paciente.nombre$': { [Op.like]: `%${termino}%` } },
              { '$medico.nombre$': { [Op.like]: `%${termino}%` } }
            ]
          },
          { estado_actividad: 'activo' }
        ]
      }
    });
  }

  /**
   * Busca en tipos de cita
   */
  async buscarTiposCita(termino: string): Promise<any[]> {
    return TipoCita.findAll({
      attributes: ['idTipoCita', 'especialidad_medica', 'precio', 'duracion_cita'],
      where: {
        especialidad_medica: { [Op.like]: `%${termino}%` },
        estado: 'activo'
      }
    });
  }

  /**
   * Busca en facturas
   */
  async buscarFacturas(termino: string): Promise<any[]> {
    return Factura.findAll({
      where: { estado: 'activo' },
      include: [{
        model: CitaMedica,
        as: 'citaMedica',
        where: { estado_actividad: 'activo' },
        include: [
          {
            model: Usuario,
            as: 'paciente',
            attributes: ['rut', 'nombre', 'apellidos'],
            where: {
              nombre: { [Op.like]: `%${termino}%` },
              estado: 'activo'
            },
            required: true
          },
          {
            model: Medico,
            as: 'medico',
            attributes: ['rut', 'nombre', 'apellidos'],
            where: { estado: 'activo' },
            required: true
          }
        ],
        attributes: ['motivo']
      }],
      attributes: ['id_factura', 'payment_method_id', 'transaction_amount', 'monto_pagado', 'fecha_pago']
    });
  }

  /**
   * Busca en historiales médicos
   */
  async buscarHistoriales(termino: string): Promise<any[]> {
    return HistorialMedico.findAll({
      include: [{
        model: Usuario,
        as: 'paciente',
        where: {
          nombre: { [Op.like]: `%${termino}%` },
          estado: 'activo'
        },
        attributes: ['nombre', 'apellidos', 'rut']
      }],
      attributes: ['id_historial', 'diagnostico', 'medicamento', 'notas', 'fecha_consulta', 'archivo', 'rut_medico', 'estado'],
      where: { estado: 'activo' }
    });
  }

  /**
   * Busca en todas las colecciones (búsqueda global)
   */
  async buscarTodo(termino: string): Promise<{ usuarios: any[], medicos: any[] }> {
    const [usuarios, medicos] = await Promise.all([
      this.buscarUsuarios(termino),
      this.buscarMedicos(termino)
    ]);

    return { usuarios, medicos };
  }

  /**
   * Busca en una colección específica usando un mapa de estrategias
   */
  async buscarEnColeccion(tabla: string, termino: string): Promise<any[]> {
    const estrategiasBusqueda: { [key: string]: () => Promise<any[]> } = {
      'usuarios': () => this.buscarUsuarios(termino),
      'medicos': () => this.buscarMedicos(termino),
      'horario_medico': () => this.buscarHorariosMedicos(termino),
      'cita_medica': () => this.buscarCitasMedicas(termino),
      'cita_medico': () => this.buscarCitasMedicas(termino), // Alias
      'tipo_cita': () => this.buscarTiposCita(termino),
      'facturas': () => this.buscarFacturas(termino),
      'historiales': () => this.buscarHistoriales(termino)
    };

    const estrategia = estrategiasBusqueda[tabla];
    if (!estrategia) {
      throw new Error(`Tabla "${tabla}" no soportada para búsqueda`);
    }

    return estrategia();
  }
}

export default BusquedaService.instance;
