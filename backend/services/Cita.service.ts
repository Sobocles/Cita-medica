import citaRepository from '../repositories/CitaRepository';
import { CitaMedicaAttributes } from '../models/cita_medica';
import Usuario from '../models/usuario';
import db from '../db/connection';

/**
 * Interfaz para el resultado de consultas con paginación
 */
interface PaginatedResult<T> {
    count: number;
    citas: T[];
}

/**
 * Interfaz para los datos de creación de cita de paciente
 */
interface CrearCitaPacienteData {
    rutPaciente: string;
    rutMedico: string;
    fecha: string | Date;
    hora_inicio: string;
    hora_fin: string;
    especialidad: string;
    idTipoCita: number;
}

/**
 * Servicio que contiene la lógica de negocio para las citas médicas
 */
export class CitaService {
    /**
     * Obtiene todas las citas activas (excluyendo no pagadas) con paginación
     */
    async getCitas(desde: number = 0, limite: number = 5) {
        const totalCitas = await citaRepository.countActiveCitasExcludingNoPagado();
        const citas = await citaRepository.findActiveCitasWithRelations(desde, limite);

        return {
            citas,
            total: totalCitas
        };
    }

    /**
     * Obtiene las citas de un médico específico con paginación
     */
    async getCitasMedico(rut_medico: string, desde: number = 0, limite: number = 5): Promise<PaginatedResult<any>> {
        if (!rut_medico) {
            throw new Error('El RUT del médico es requerido');
        }

        const totalCitas = await citaRepository.countCitasByMedico(rut_medico);
        const citas = await citaRepository.findCitasByMedico(rut_medico, desde, limite);

        if (!citas || citas.length === 0) {
            throw new Error('No se encontraron citas activas para este médico');
        }

        return {
            count: totalCitas,
            citas
        };
    }

    /**
     * Obtiene las citas de un paciente específico con paginación
     */
    async getCitasPaciente(rut_paciente: string, desde: number = 0, limite: number = 5): Promise<PaginatedResult<any>> {
        if (!rut_paciente) {
            throw new Error('El RUT del paciente es requerido');
        }

        const totalCitas = await citaRepository.countCitasByPaciente(rut_paciente);
        const citas = await citaRepository.findCitasByPaciente(rut_paciente, desde, limite);

        if (!citas || citas.length === 0) {
            throw new Error('No se encontraron citas activas para este paciente');
        }

        return {
            count: totalCitas,
            citas
        };
    }

    /**
     * Obtiene una cita con su factura y relaciones completas
     */
    async getCitaFactura(idCita: number) {
        if (!idCita) {
            throw new Error('Es necesario el ID de la cita médica');
        }

        const citaMedica = await citaRepository.findCitaWithFactura(idCita);

        if (!citaMedica) {
            throw new Error('Cita médica no encontrada');
        }

        return citaMedica;
    }

    /**
     * Crea una nueva cita médica (usado por administradores)
     */
    async crearCita(citaData: Partial<CitaMedicaAttributes>) {
        // Verificar si ya existe una cita con el mismo ID (si se proporciona)
        if (citaData.idCita) {
            const citaExistente = await citaRepository.findByPk(citaData.idCita);
            if (citaExistente) {
                throw new Error('Ya existe una cita con el mismo ID');
            }
        }

        return citaRepository.create(citaData);
    }

    /**
     * Verifica si un paciente tiene citas activas (pagadas o en curso)
     */
    async verificarCitasUsuario(rut_paciente: string): Promise<boolean> {
        if (!rut_paciente) {
            throw new Error('El RUT del paciente es requerido');
        }

        return citaRepository.existsActiveCitaForPaciente(rut_paciente);
    }

    /**
     * Crea una cita médica desde la perspectiva del paciente
     * Verifica que el paciente no tenga citas activas antes de crear
     */
    async crearCitaPaciente(citaData: CrearCitaPacienteData) {
        const { rutPaciente, rutMedico, fecha, hora_inicio, hora_fin, especialidad, idTipoCita } = citaData;

        // Validaciones
        if (!rutPaciente || !rutMedico || !fecha || !hora_inicio || !hora_fin || !idTipoCita) {
            throw new Error('Todos los campos son requeridos');
        }

        // Verificar si el paciente ya tiene una cita activa
        const tieneCitaActiva = await this.verificarCitasUsuario(rutPaciente);

        if (tieneCitaActiva) {
            throw new Error('Ya tienes una cita programada. Debes asistir y terminar tu cita actual para agendar otra.');
        }

        // Crear la cita con estado no_pagado
        const nuevaCita = await citaRepository.create({
            rut_paciente: rutPaciente,
            rut_medico: rutMedico,
            fecha: typeof fecha === 'string' ? new Date(fecha) : fecha,
            hora_inicio,
            hora_fin,
            estado: 'no_pagado',
            motivo: especialidad,
            idTipoCita
        });

        return {
            idCita: nuevaCita.idCita
        };
    }

    /**
     * Actualiza una cita existente
     */
    async actualizarCita(idCita: number, citaData: Partial<CitaMedicaAttributes>) {
        if (!idCita) {
            throw new Error('El ID de la cita es requerido');
        }

        const cita = await citaRepository.findByPk(idCita);

        if (!cita) {
            throw new Error('Cita no encontrada');
        }

        return citaRepository.update(cita, citaData);
    }

    /**
     * Elimina lógicamente una cita (soft delete)
     */
    async eliminarCita(idCita: number) {
        if (!idCita) {
            throw new Error('El ID de la cita es requerido');
        }

        const cita = await citaRepository.findByPk(idCita);

        if (!cita) {
            throw new Error('No existe una cita con el id ' + idCita);
        }

        await citaRepository.softDelete(idCita);

        return { mensaje: 'Cita actualizada a inactivo correctamente' };
    }

    /**
     * Valida la previsión del paciente el día de la cita
     * Maneja 3 escenarios:
     * 1. Validó correctamente (trae documentos) -> marca prevision_validada = true
     * 2. No trajo documentos -> registra diferencia_pagada_efectivo
     * 3. Mintió sobre previsión -> actualiza tipo_prevision real del usuario
     */
    async validarPrevision(
        idCita: number,
        validado: boolean,
        diferenciaEfectivo?: number,
        tipoPrevisionReal?: 'Fonasa' | 'Isapre' | 'Particular',
        observaciones?: string
    ) {
        const transaction = await db.transaction();

        try {
            // Cargar cita con paciente
            const cita = await citaRepository.findByPk(idCita);

            if (!cita) {
                throw new Error('Cita no encontrada');
            }

            if (!cita.requiere_validacion_prevision) {
                throw new Error('Esta cita no requiere validación de previsión');
            }

            if (cita.prevision_validada) {
                throw new Error('La previsión de esta cita ya fue validada anteriormente');
            }

            // Cargar el usuario/paciente
            const usuario = await Usuario.findByPk(cita.rut_paciente, { transaction });

            if (!usuario) {
                throw new Error('Paciente no encontrado');
            }

            let mensaje = '';

            if (validado) {
                // ESCENARIO 1: Validó correctamente (trajo documentos)
                await cita.update({
                    prevision_validada: true,
                    observaciones_validacion: observaciones || 'Previsión validada correctamente con documentos'
                }, { transaction });

                await usuario.update({
                    prevision_validada: true,
                    fecha_validacion_prevision: new Date()
                }, { transaction });

                mensaje = 'Previsión validada correctamente. El paciente presentó los documentos requeridos.';

            } else if (diferenciaEfectivo !== undefined && diferenciaEfectivo > 0) {
                // ESCENARIO 2: No trajo documentos, pagó diferencia en efectivo
                await cita.update({
                    prevision_validada: false,
                    diferencia_pagada_efectivo: diferenciaEfectivo,
                    observaciones_validacion: observaciones || 'No presentó documentos. Pagó diferencia en efectivo.'
                }, { transaction });

                // Si mintió sobre la previsión y se especificó la real
                if (tipoPrevisionReal && tipoPrevisionReal !== cita.tipo_prevision_aplicada) {
                    await usuario.update({
                        tipo_prevision: tipoPrevisionReal,
                        prevision_validada: false
                    }, { transaction });

                    mensaje = `No presentó documentos. Pagó $${diferenciaEfectivo.toLocaleString('es-CL')} en efectivo. Su previsión real es ${tipoPrevisionReal}.`;
                } else {
                    mensaje = `No presentó documentos. Pagó $${diferenciaEfectivo.toLocaleString('es-CL')} en efectivo.`;
                }

            } else if (tipoPrevisionReal) {
                // ESCENARIO 3: Mintió sobre previsión (actualizamos el tipo real)
                await cita.update({
                    prevision_validada: false,
                    observaciones_validacion: observaciones || `Previsión real: ${tipoPrevisionReal}. No coincide con la declarada.`
                }, { transaction });

                await usuario.update({
                    tipo_prevision: tipoPrevisionReal,
                    prevision_validada: false
                }, { transaction });

                mensaje = `Previsión actualizada. El paciente tiene ${tipoPrevisionReal}, no ${cita.tipo_prevision_aplicada}.`;

            } else {
                // ESCENARIO 4: No validó y no pagó diferencia (reprogramar cita)
                await cita.update({
                    prevision_validada: false,
                    observaciones_validacion: observaciones || 'No presentó documentos y no pagó diferencia.'
                }, { transaction });

                mensaje = 'No presentó documentos. La cita debe ser reprogramada o el paciente debe pagar la diferencia.';
            }

            await transaction.commit();

            return {
                cita,
                usuario,
                mensaje
            };

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
}

export default new CitaService();