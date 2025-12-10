"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CitaService = void 0;
const CitaRepository_1 = __importDefault(require("../repositories/CitaRepository"));
const usuario_1 = __importDefault(require("../models/usuario"));
const connection_1 = __importDefault(require("../db/connection"));
/**
 * Servicio que contiene la lógica de negocio para las citas médicas
 */
class CitaService {
    /**
     * Obtiene todas las citas activas (excluyendo no pagadas) con paginación
     */
    getCitas(desde = 0, limite = 5) {
        return __awaiter(this, void 0, void 0, function* () {
            const totalCitas = yield CitaRepository_1.default.countActiveCitasExcludingNoPagado();
            const citas = yield CitaRepository_1.default.findActiveCitasWithRelations(desde, limite);
            return {
                citas,
                total: totalCitas
            };
        });
    }
    /**
     * Obtiene las citas de un médico específico con paginación
     */
    getCitasMedico(rut_medico, desde = 0, limite = 5) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!rut_medico) {
                throw new Error('El RUT del médico es requerido');
            }
            const totalCitas = yield CitaRepository_1.default.countCitasByMedico(rut_medico);
            const citas = yield CitaRepository_1.default.findCitasByMedico(rut_medico, desde, limite);
            if (!citas || citas.length === 0) {
                throw new Error('No se encontraron citas activas para este médico');
            }
            return {
                count: totalCitas,
                citas
            };
        });
    }
    /**
     * Obtiene las citas de un paciente específico con paginación
     */
    getCitasPaciente(rut_paciente, desde = 0, limite = 5) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!rut_paciente) {
                throw new Error('El RUT del paciente es requerido');
            }
            const totalCitas = yield CitaRepository_1.default.countCitasByPaciente(rut_paciente);
            const citas = yield CitaRepository_1.default.findCitasByPaciente(rut_paciente, desde, limite);
            if (!citas || citas.length === 0) {
                throw new Error('No se encontraron citas activas para este paciente');
            }
            return {
                count: totalCitas,
                citas
            };
        });
    }
    /**
     * Obtiene una cita con su factura y relaciones completas
     */
    getCitaFactura(idCita) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!idCita) {
                throw new Error('Es necesario el ID de la cita médica');
            }
            const citaMedica = yield CitaRepository_1.default.findCitaWithFactura(idCita);
            if (!citaMedica) {
                throw new Error('Cita médica no encontrada');
            }
            return citaMedica;
        });
    }
    /**
     * Crea una nueva cita médica (usado por administradores)
     */
    crearCita(citaData) {
        return __awaiter(this, void 0, void 0, function* () {
            // Verificar si ya existe una cita con el mismo ID (si se proporciona)
            if (citaData.idCita) {
                const citaExistente = yield CitaRepository_1.default.findByPk(citaData.idCita);
                if (citaExistente) {
                    throw new Error('Ya existe una cita con el mismo ID');
                }
            }
            return CitaRepository_1.default.create(citaData);
        });
    }
    /**
     * Verifica si un paciente tiene citas activas (pagadas o en curso)
     */
    verificarCitasUsuario(rut_paciente) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!rut_paciente) {
                throw new Error('El RUT del paciente es requerido');
            }
            return CitaRepository_1.default.existsActiveCitaForPaciente(rut_paciente);
        });
    }
    /**
     * Crea una cita médica desde la perspectiva del paciente
     * Verifica que el paciente no tenga citas activas antes de crear
     */
    crearCitaPaciente(citaData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { rutPaciente, rutMedico, fecha, hora_inicio, hora_fin, especialidad, idTipoCita } = citaData;
            // Validaciones
            if (!rutPaciente || !rutMedico || !fecha || !hora_inicio || !hora_fin || !idTipoCita) {
                throw new Error('Todos los campos son requeridos');
            }
            // Verificar si el paciente ya tiene una cita activa
            const tieneCitaActiva = yield this.verificarCitasUsuario(rutPaciente);
            if (tieneCitaActiva) {
                throw new Error('Ya tienes una cita programada. Debes asistir y terminar tu cita actual para agendar otra.');
            }
            // Crear la cita con estado no_pagado
            const nuevaCita = yield CitaRepository_1.default.create({
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
        });
    }
    /**
     * Actualiza una cita existente
     */
    actualizarCita(idCita, citaData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!idCita) {
                throw new Error('El ID de la cita es requerido');
            }
            const cita = yield CitaRepository_1.default.findByPk(idCita);
            if (!cita) {
                throw new Error('Cita no encontrada');
            }
            return CitaRepository_1.default.update(cita, citaData);
        });
    }
    /**
     * Elimina lógicamente una cita (soft delete)
     */
    eliminarCita(idCita) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!idCita) {
                throw new Error('El ID de la cita es requerido');
            }
            const cita = yield CitaRepository_1.default.findByPk(idCita);
            if (!cita) {
                throw new Error('No existe una cita con el id ' + idCita);
            }
            yield CitaRepository_1.default.softDelete(idCita);
            return { mensaje: 'Cita actualizada a inactivo correctamente' };
        });
    }
    /**
     * Valida la previsión del paciente el día de la cita
     * Maneja 3 escenarios:
     * 1. Validó correctamente (trae documentos) -> marca prevision_validada = true
     * 2. No trajo documentos -> registra diferencia_pagada_efectivo
     * 3. Mintió sobre previsión -> actualiza tipo_prevision real del usuario
     */
    validarPrevision(idCita, validado, diferenciaEfectivo, tipoPrevisionReal, observaciones) {
        return __awaiter(this, void 0, void 0, function* () {
            const transaction = yield connection_1.default.transaction();
            try {
                // Cargar cita con paciente
                const cita = yield CitaRepository_1.default.findByPk(idCita);
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
                const usuario = yield usuario_1.default.findByPk(cita.rut_paciente, { transaction });
                if (!usuario) {
                    throw new Error('Paciente no encontrado');
                }
                let mensaje = '';
                if (validado) {
                    // ESCENARIO 1: Validó correctamente (trajo documentos)
                    yield cita.update({
                        prevision_validada: true,
                        observaciones_validacion: observaciones || 'Previsión validada correctamente con documentos'
                    }, { transaction });
                    yield usuario.update({
                        prevision_validada: true,
                        fecha_validacion_prevision: new Date()
                    }, { transaction });
                    mensaje = 'Previsión validada correctamente. El paciente presentó los documentos requeridos.';
                }
                else if (diferenciaEfectivo !== undefined && diferenciaEfectivo > 0) {
                    // ESCENARIO 2: No trajo documentos, pagó diferencia en efectivo
                    yield cita.update({
                        prevision_validada: false,
                        diferencia_pagada_efectivo: diferenciaEfectivo,
                        observaciones_validacion: observaciones || 'No presentó documentos. Pagó diferencia en efectivo.'
                    }, { transaction });
                    // Si mintió sobre la previsión y se especificó la real
                    if (tipoPrevisionReal && tipoPrevisionReal !== cita.tipo_prevision_aplicada) {
                        yield usuario.update({
                            tipo_prevision: tipoPrevisionReal,
                            prevision_validada: false
                        }, { transaction });
                        mensaje = `No presentó documentos. Pagó $${diferenciaEfectivo.toLocaleString('es-CL')} en efectivo. Su previsión real es ${tipoPrevisionReal}.`;
                    }
                    else {
                        mensaje = `No presentó documentos. Pagó $${diferenciaEfectivo.toLocaleString('es-CL')} en efectivo.`;
                    }
                }
                else if (tipoPrevisionReal) {
                    // ESCENARIO 3: Mintió sobre previsión (actualizamos el tipo real)
                    yield cita.update({
                        prevision_validada: false,
                        observaciones_validacion: observaciones || `Previsión real: ${tipoPrevisionReal}. No coincide con la declarada.`
                    }, { transaction });
                    yield usuario.update({
                        tipo_prevision: tipoPrevisionReal,
                        prevision_validada: false
                    }, { transaction });
                    mensaje = `Previsión actualizada. El paciente tiene ${tipoPrevisionReal}, no ${cita.tipo_prevision_aplicada}.`;
                }
                else {
                    // ESCENARIO 4: No validó y no pagó diferencia (reprogramar cita)
                    yield cita.update({
                        prevision_validada: false,
                        observaciones_validacion: observaciones || 'No presentó documentos y no pagó diferencia.'
                    }, { transaction });
                    mensaje = 'No presentó documentos. La cita debe ser reprogramada o el paciente debe pagar la diferencia.';
                }
                yield transaction.commit();
                return {
                    cita,
                    usuario,
                    mensaje
                };
            }
            catch (error) {
                yield transaction.rollback();
                throw error;
            }
        });
    }
}
exports.CitaService = CitaService;
exports.default = new CitaService();
//# sourceMappingURL=Cita.service.js.map