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
exports.buscarmedico = void 0;
exports.buscarTipoCita = buscarTipoCita;
exports.buscarHorarioMedico = buscarHorarioMedico;
exports.buscarBloquesDisponibles = buscarBloquesDisponibles;
const sequelize_1 = require("sequelize");
const medico_1 = __importDefault(require("../models/medico"));
const horario_medico_1 = __importDefault(require("../models/horario_medico"));
const tipo_cita_1 = __importDefault(require("../models/tipo_cita"));
const cita_medica_1 = __importDefault(require("../models/cita_medica"));
// Funciones Auxiliares:
function timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}
const ahora = new Date();
const minutosActuales = ahora.getHours() * 60 + ahora.getMinutes();
function minutesToTime(minutes) {
    const hh = Math.floor(minutes / 60).toString().padStart(2, '0');
    const mm = (minutes % 60).toString().padStart(2, '0');
    return `${hh}:${mm}`;
}
function numberToDay(dayNumber) {
    const days = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
    return days[dayNumber];
}
// Controlador principal:
// Controlador principal:
const buscarmedico = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { especialidad, fecha } = req.body;
    console.log('Especialidad buscada:', especialidad);
    console.log('fecha que llega como parametro', fecha);
    const fechaIngresada = new Date(fecha + 'T00:00:00Z');
    const fechaActual = new Date();
    fechaActual.setUTCHours(0, 0, 0, 0);
    const [anio, mes, dia] = fecha.split('-');
    console.log('Fecha ingresada como string:', fecha);
    const fechaUTC = new Date(Date.UTC(Number(anio), Number(mes) - 1, Number(dia)));
    console.log('Fecha convertida a objeto Date:', fechaUTC);
    const diaSemana = numberToDay(fechaUTC.getUTCDay());
    console.log('Día de la semana calculado:', diaSemana);
    let bloquesTotales = [];
    try {
        let tipoCitaEncontrado;
        tipoCitaEncontrado = yield buscarTipoCita(especialidad);
        console.log('Tipo de cita encontrado:', tipoCitaEncontrado);
        if (!tipoCitaEncontrado) {
            return res.status(400).json({
                ok: false,
                msg: 'No se encontró el tipo de cita'
            });
        }
        const idTipoCita = tipoCitaEncontrado.idTipoCita;
        const horarios_medico = yield buscarHorarioMedico(tipoCitaEncontrado, diaSemana);
        console.log('Aqui estan los horarios del medico', horarios_medico);
        for (let horario of horarios_medico) {
            const bloquesDisponibles = yield buscarBloquesDisponibles(horario, tipoCitaEncontrado.duracion_cita, fecha, tipoCitaEncontrado.precio, idTipoCita, horario.especialidad_medica);
            bloquesTotales = [...bloquesTotales, ...bloquesDisponibles];
        }
        res.json({
            ok: true,
            bloques: bloquesTotales
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error inesperado... revisar logs',
        });
    }
});
exports.buscarmedico = buscarmedico;
function buscarTipoCita(especialidad_medica) {
    return __awaiter(this, void 0, void 0, function* () {
        const tipoCita = yield tipo_cita_1.default.findOne({
            where: {
                especialidad_medica,
                estado: 'activo'
            }
        });
        if (!tipoCita) {
            throw new Error('Tipo de cita no encontrado');
        }
        return tipoCita;
    });
}
function buscarHorarioMedico(tipoCita, diaSemana) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Buscando horario para:', tipoCita, diaSemana);
        let whereClause = { diaSemana: diaSemana };
        console.log('Cláusula WHERE para la consulta:', whereClause);
        const medicosConEspecialidad = yield medico_1.default.findAll({
            where: {
                especialidad_medica: tipoCita.especialidad_medica,
                estado: 'activo' // Filtrar solo los médicos activos
            }
        });
        if (medicosConEspecialidad.length === 0) {
            return [];
        }
        const horariosDeTodosLosMedicos = [];
        for (const medico of medicosConEspecialidad) {
            const horariosMedico = yield horario_medico_1.default.findAll({
                where: {
                    diaSemana: diaSemana,
                    rut_medico: medico.rut
                },
                attributes: ['rut_medico', 'horaInicio', 'horaFinalizacion', 'inicio_colacion', 'fin_colacion'], // Incluir campos de colación
                include: [
                    {
                        model: medico_1.default,
                        as: 'medico',
                        attributes: ['rut', 'nombre', 'apellidos', 'especialidad_medica'],
                        where: {
                            estado: 'activo' // Incluir solo médicos activos
                        }
                    },
                ],
            });
            horariosDeTodosLosMedicos.push(...horariosMedico);
        }
        return horariosDeTodosLosMedicos.map((row) => ({
            dia: diaSemana,
            rut: row.rut_medico,
            horainicio: row.horaInicio,
            horafinalizacion: row.horaFinalizacion,
            inicio_colacion: row.inicio_colacion,
            fin_colacion: row.fin_colacion,
            especialidad_medica: tipoCita.tipo_cita === 'Consulta general' ? row.medico.especialidad_medica : row.medico.especialidad_medica
        }));
        return [];
    });
}
function buscarBloquesDisponibles(resultadoFormateado, duracionCita, fechaFormateada, precioCita, idTipoCita, especialidad) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!resultadoFormateado || !resultadoFormateado.horainicio || !resultadoFormateado.horafinalizacion) {
            throw new Error('Datos del horario del médico no proporcionados correctamente.');
        }
        const medicoRut = resultadoFormateado.rut;
        console.log('aqui esta el rut del medico', medicoRut);
        // Obtener el nombre del médico utilizando el medicoRut
        const medicoData = yield medico_1.default.findOne({
            where: {
                rut: medicoRut,
                estado: 'activo'
            }
        });
        if (!medicoData)
            throw new Error('Médico no encontrado');
        const medicoNombre = `${medicoData.nombre} ${medicoData.apellidos}`;
        const horarioInicio = timeToMinutes(resultadoFormateado.horainicio);
        const horarioFin = timeToMinutes(resultadoFormateado.horafinalizacion);
        const inicioColacion = resultadoFormateado.inicio_colacion ? timeToMinutes(resultadoFormateado.inicio_colacion) : null;
        const finColacion = resultadoFormateado.fin_colacion ? timeToMinutes(resultadoFormateado.fin_colacion) : null;
        const intervalo = duracionCita;
        let bloquesPosibles = [];
        for (let i = horarioInicio; i + intervalo <= horarioFin; i += intervalo) {
            // Verifica si el bloque actual está dentro del intervalo de colación
            if (!(inicioColacion !== null && finColacion !== null && i < finColacion && i + intervalo > inicioColacion)) {
                bloquesPosibles.push({
                    rutMedico: medicoRut,
                    medicoNombre, // Agregar el nombre del médico a cada bloque
                    hora_inicio: minutesToTime(i),
                    hora_fin: minutesToTime(i + intervalo),
                    precio: precioCita,
                    idTipoCita,
                    especialidad,
                    fecha: fechaFormateada
                });
            }
        }
        const ahora = new Date();
        const minutosActuales = ahora.getHours() * 60 + ahora.getMinutes();
        const fechaActualFormateada = ahora.toISOString().split('T')[0]; // Formato: 'YYYY-MM-DD'
        // Filtrar los bloques si la fecha es la actual
        if (fechaFormateada === fechaActualFormateada) {
            bloquesPosibles = bloquesPosibles.filter(bloque => timeToMinutes(bloque.hora_inicio) >= minutosActuales);
        }
        const citasProgramadas = yield cita_medica_1.default.findAll({
            where: {
                rut_medico: medicoRut,
                fecha: {
                    [sequelize_1.Op.eq]: new Date(fechaFormateada)
                },
                [sequelize_1.Op.and]: [
                    { estado: { [sequelize_1.Op.ne]: 'cancelada' } }, // Excluye citas canceladas
                    { estado: { [sequelize_1.Op.ne]: 'no_pagado' } } // Excluye citas no pagadas
                ],
                estado_actividad: 'activo' // Incluir solo citas con estado_actividad 'activo'
            }
        });
        /*
            const citasProgramadas = await CitaMedica.findAll({
            where: {
                rut_medico: medicoRut,
                fecha: {
                    [Op.eq]: new Date(fechaFormateada)
                },
                estado: { [Op.ne]: 'no_pagado' }, // Excluye las citas con estado 'no_pagado'
                estado_actividad: 'activo' // Incluir solo citas con estado_actividad 'activo'
            }
        });
    
        */
        const bloquesOcupados = citasProgramadas.map(cita => ({
            hora_inicio: cita.hora_inicio,
            hora_fin: cita.hora_fin
        }));
        // Filtrar los bloques posibles excluyendo aquellos que coinciden con bloques ocupados o el intervalo de colación
        return bloquesPosibles.filter(bloquePosible => !bloquesOcupados.some(bloqueOcupado => bloquePosible.hora_inicio < bloqueOcupado.hora_fin && bloquePosible.hora_fin > bloqueOcupado.hora_inicio));
    });
}
//# sourceMappingURL=busqueda_cita.js.map