import citaRepository from '../repositories/CitaRepository';
import { CitaMedicaAttributes } from '../models/cita_medica';

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
}

export default new CitaService();