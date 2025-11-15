import medicoRepository from '../repositories/medico.repository';
import rolRepository from '../repositories/rol.repository';
import tipoCitaRepository from '../repositories/TipoCitaRepository';
import citaRepository from '../repositories/CitaRepository';
import horarioMedicoRepository from '../repositories/HorarioMedicoRepository';
import bcrypt from 'bcrypt';
import { UserRole } from '../types/enums';
import AuthService from './auth.service';
import { Op } from 'sequelize';

/**
 * Servicio para manejar la lógica de negocio de médicos
 */
class MedicoService {
    /**
     * Obtiene médicos paginados con información de rol
     */
    async getPaginatedMedicos(desde: number) {
        const [total, medicos] = await Promise.all([
            medicoRepository.countActiveMedicos(),
            medicoRepository.findActiveMedicos(desde)
        ]);

        return { total, medicos };
    }

    /**
     * Obtiene todos los médicos activos
     */
    async getAllMedicos() {
        const medicos = await medicoRepository.findAllActiveMedicos();
        const total = medicos.length;

        // Procesar para asignar el rol como string (compatibilidad con frontend)
        const medicosProcesados = medicos.map(medico => {
            const medicoJSON = medico.toJSON();
            if (medicoJSON.rol && medicoJSON.rol.codigo) {
                medicoJSON.rol = medicoJSON.rol.codigo;
            }
            return medicoJSON;
        });

        return { total, medicos: medicosProcesados };
    }

    /**
     * Obtiene médicos filtrados por especialidades activas
     */
    async getMedicosByEspecialidad() {
        // Obtener especialidades válidas desde TipoCita
        const especialidades = await tipoCitaRepository.getEspecialidadesArray();

        // Obtener médicos que tienen esas especialidades
        const medicos = await medicoRepository.findActiveMedicosByEspecialidades(especialidades);

        // Procesar para asignar el rol como string
        return medicos.map(medico => {
            const medicoJSON = medico.toJSON();
            if (medicoJSON.rol && medicoJSON.rol.codigo) {
                medicoJSON.rol = medicoJSON.rol.codigo;
            }
            return medicoJSON;
        });
    }

    /**
     * Obtiene un médico por su RUT
     */
    async getMedicoById(rut: string) {
        const medico = await medicoRepository.findById(rut);
        if (!medico) {
            throw new Error('Médico no encontrado');
        }

        // Procesar para asignar el rol como string
        const medicoJSON = medico.toJSON();
        if (medicoJSON.rol && medicoJSON.rol.codigo) {
            medicoJSON.rol = medicoJSON.rol.codigo;
        }
        return medicoJSON;
    }

    /**
     * Crea un nuevo médico con validaciones
     */
    async createMedico(medicoData: any) {
        const { email, rut, telefono, rol: rolCodigo, password } = medicoData;

        // Validar email único
        if (await AuthService.instance.verificarEmailExistente(email)) {
            throw new Error('El correo ya está registrado');
        }

        // Validar RUT único
        const existeRut = await medicoRepository.findById(rut);
        if (existeRut) {
            throw new Error('El RUT ya está registrado');
        }

        // Validar teléfono único
        if (await AuthService.instance.verificarTelefonoExistente(telefono)) {
            throw new Error('El teléfono ya está registrado');
        }

        // Obtener ID del rol usando el repositorio
        let rolId = 3; // MEDICO_ROLE por defecto
        if (rolCodigo) {
            const rol = await rolRepository.findByCode(rolCodigo);
            if (rol) rolId = rol.id;
        } else {
            const rolMedico = await rolRepository.findByCode(UserRole.MEDICO);
            if (rolMedico) rolId = rolMedico.id;
        }

        // Encriptar contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Crear médico
        return medicoRepository.create({
            ...medicoData,
            password: hashedPassword,
            rolId
        });
    }

    /**
     * Actualiza un médico existente
     */
    async updateMedico(rut: string, updateData: any) {
        // Si se proporciona un rol, obtener su ID
        if (updateData.rol) {
            const rol = await rolRepository.findByCode(updateData.rol);
            if (rol) {
                updateData.rolId = rol.id;
            }
            delete updateData.rol;
        }

        const medico = await medicoRepository.updateByRut(rut, updateData);
        if (!medico) {
            throw new Error('Médico no encontrado');
        }

        return medico;
    }

    /**
     * Elimina un médico (soft delete) y sus relaciones
     * IMPORTANTE: También marca como inactivas las citas y elimina horarios
     */
    async deleteMedico(rut: string) {
        // Verificar que el médico existe
        const medico = await medicoRepository.findByRut(rut);
        if (!medico) {
            throw new Error('Médico no encontrado');
        }

        // Marcar como inactivas las citas médicas terminadas, no pagadas o no asistidas
        await citaRepository.updateWhere(
            {
                rut_medico: rut,
                estado: { [Op.in]: ['terminado', 'no_pagado', 'no_asistio'] }
            },
            { estado_actividad: 'inactivo' }
        );

        // Eliminar todos los horarios del médico
        await horarioMedicoRepository.destroyByMedico(rut);

        // Marcar el médico como inactivo
        const medicoEliminado = await medicoRepository.softDelete(rut);
        if (!medicoEliminado) {
            throw new Error('Error al eliminar médico');
        }

        return medicoEliminado;
    }

    /**
     * Cambia la contraseña de un médico
     */
    async changePassword(rut: string, currentPassword: string, newPassword: string) {
        const medico = await medicoRepository.findById(rut, false);
        if (!medico) {
            throw new Error('Médico no encontrado');
        }

        // Validar contraseña actual
        const validPassword = bcrypt.compareSync(currentPassword, medico.password);
        if (!validPassword) {
            throw new Error('Contraseña actual incorrecta');
        }

        // Validar que la nueva contraseña sea diferente
        const samePassword = bcrypt.compareSync(newPassword, medico.password);
        if (samePassword) {
            throw new Error('La nueva contraseña no puede ser igual a la actual');
        }

        // Encriptar nueva contraseña
        const salt = bcrypt.genSaltSync();
        const hashedPassword = bcrypt.hashSync(newPassword, salt);

        // Actualizar contraseña
        return medicoRepository.update(medico, { password: hashedPassword } as any);
    }
}

export default new MedicoService();