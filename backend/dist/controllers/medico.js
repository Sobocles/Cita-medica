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
const medico_service_1 = __importDefault(require("../services/medico.service"));
const jwt_1 = __importDefault(require("../helpers/jwt"));
const enums_1 = require("../types/enums");
const response_helper_1 = __importDefault(require("../helpers/response.helper"));
const s3_config_1 = require("../config/s3.config");
/**
 * Helper: parsea idiomas desde JSON
 */
function parseIdiomas(idiomas) {
    try {
        return idiomas ? JSON.parse(idiomas) : [];
    }
    catch (error) {
        return [];
    }
}
/**
 * Helper: parsea certificaciones desde JSON
 */
function parseCertificaciones(certificaciones) {
    try {
        return certificaciones ? JSON.parse(certificaciones) : [];
    }
    catch (error) {
        return [];
    }
}
/**
 * Helper: parsea documentos desde JSON
 */
function parseDocumentos(documentos_s3_keys) {
    try {
        return documentos_s3_keys ? JSON.parse(documentos_s3_keys) : [];
    }
    catch (error) {
        return [];
    }
}
/**
 * Controlador para manejar las peticiones HTTP relacionadas con médicos
 * RESPONSABILIDAD: Solo manejar request/response, delegar lógica al servicio
 */
class MedicosController {
    static get instance() {
        return this._instance || (this._instance = new MedicosController());
    }
    /**
     * Obtiene médicos paginados
     */
    getMedicos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const desde = Number(req.query.desde) || 0;
                const result = yield medico_service_1.default.getPaginatedMedicos(desde);
                return response_helper_1.default.successWithCustomData(res, {
                    medicos: result.medicos,
                    total: result.total
                });
            }
            catch (error) {
                console.error('Error al obtener los médicos:', error);
                return response_helper_1.default.serverError(res, 'Error al obtener médicos', error);
            }
        });
    }
    /**
     * Obtiene médicos filtrados por especialidades activas
     */
    getMedicosEspecialidad(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const medicos = yield medico_service_1.default.getMedicosByEspecialidad();
                return response_helper_1.default.successWithCustomData(res, { medicos });
            }
            catch (error) {
                console.error('Error al obtener médicos por especialidad:', error);
                return response_helper_1.default.serverError(res, 'Error al obtener médicos por especialidad', error);
            }
        });
    }
    /**
     * Obtiene todos los médicos activos sin paginación
     */
    getAllMedicos(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield medico_service_1.default.getAllMedicos();
                return response_helper_1.default.successWithCustomData(res, {
                    medicos: result.medicos,
                    total: result.total
                });
            }
            catch (error) {
                console.error('Error al obtener todos los médicos:', error);
                return response_helper_1.default.serverError(res, 'Error al obtener todos los médicos', error);
            }
        });
    }
    /**
     * Obtiene un médico por su RUT
     */
    getMedico(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const medico = yield medico_service_1.default.getMedicoById(id);
                return response_helper_1.default.successWithCustomData(res, { medico });
            }
            catch (error) {
                console.error('Error al obtener médico:', error);
                if (error.message === 'Médico no encontrado') {
                    return response_helper_1.default.notFound(res, error.message);
                }
                return response_helper_1.default.serverError(res, 'Error al obtener médico', error);
            }
        });
    }
    /**
     * Crea un nuevo médico y genera su JWT
     */
    crearMedico(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const medico = yield medico_service_1.default.createMedico(req.body);
                // Para el token, necesitamos el rol como string
                const medicoJSON = medico.toJSON();
                const rol = ((_a = medicoJSON.rol) === null || _a === void 0 ? void 0 : _a.codigo) || enums_1.UserRole.MEDICO;
                // Generar JWT
                const token = yield jwt_1.default.instance.generarJWT(medico.rut, medico.nombre, medico.apellidos, rol);
                return response_helper_1.default.successWithCustomData(res, {
                    medico: medicoJSON,
                    token
                });
            }
            catch (error) {
                console.error('Error al crear médico:', error);
                return response_helper_1.default.badRequest(res, error.message);
            }
        });
    }
    /**
     * Actualiza un médico existente
     */
    putMedico(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { rut } = req.params;
                const medico = yield medico_service_1.default.updateMedico(rut, req.body);
                // Procesar para respuesta
                const medicoJSON = medico.toJSON();
                if (medicoJSON.rol && medicoJSON.rol.codigo) {
                    medicoJSON.rol = medicoJSON.rol.codigo;
                }
                return response_helper_1.default.successWithCustomData(res, { medico: medicoJSON });
            }
            catch (error) {
                console.error('Error al actualizar médico:', error);
                if (error.message === 'Médico no encontrado') {
                    return response_helper_1.default.notFound(res, error.message);
                }
                return response_helper_1.default.badRequest(res, error.message);
            }
        });
    }
    /**
     * Elimina un médico (soft delete) y sus relaciones
     */
    deleteMedico(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { rut } = req.params;
                yield medico_service_1.default.deleteMedico(rut);
                return response_helper_1.default.success(res, undefined, 'Médico eliminado correctamente');
            }
            catch (error) {
                console.error('Error al eliminar médico:', error);
                if (error.message === 'Médico no encontrado') {
                    return response_helper_1.default.notFound(res, error.message);
                }
                return response_helper_1.default.badRequest(res, error.message);
            }
        });
    }
    /**
     * Cambia la contraseña de un médico
     */
    cambiarPasswordMedico(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { rut, password, newPassword } = req.body;
                yield medico_service_1.default.changePassword(rut, password, newPassword);
                return response_helper_1.default.success(res, undefined, 'Contraseña actualizada correctamente');
            }
            catch (error) {
                console.error('Error al cambiar contraseña:', error);
                if (error.message === 'Médico no encontrado') {
                    return response_helper_1.default.notFound(res, error.message);
                }
                return response_helper_1.default.badRequest(res, error.message);
            }
        });
    }
    /**
     * Sube una imagen de perfil para un médico a S3
     * La imagen se almacena en un bucket privado y se guarda la key en la BD
     */
    subirImagenMedico(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { rut } = req.params;
                // Verificar que se subió un archivo
                if (!req.file) {
                    return response_helper_1.default.badRequest(res, 'No se recibió ningún archivo');
                }
                // El archivo ya fue subido a S3 por multer-s3
                const s3Key = req.file.key; // Key generada por multer-s3
                // Actualizar el médico con la nueva key de S3
                const medico = yield medico_service_1.default.updateMedicoImage(rut, s3Key);
                return response_helper_1.default.successWithCustomData(res, {
                    medico,
                    mensaje: 'Imagen subida correctamente',
                    s3Key
                });
            }
            catch (error) {
                console.error('Error al subir imagen del médico:', error);
                if (error.message === 'Médico no encontrado') {
                    return response_helper_1.default.notFound(res, error.message);
                }
                return response_helper_1.default.serverError(res, 'Error al subir imagen', error);
            }
        });
    }
    /**
     * Elimina la imagen de perfil de un médico de S3 y limpia el campo en BD
     */
    eliminarImagenMedico(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { rut } = req.params;
                // Obtener el médico para obtener la key de S3
                const medico = yield medico_service_1.default.getMedicoById(rut);
                if (!medico.imagen_s3_key) {
                    return response_helper_1.default.badRequest(res, 'El médico no tiene imagen para eliminar');
                }
                // Eliminar de S3
                const eliminado = yield (0, s3_config_1.deleteImageFromS3)(medico.imagen_s3_key);
                if (!eliminado) {
                    console.warn(`No se pudo eliminar la imagen de S3: ${medico.imagen_s3_key}`);
                }
                // Limpiar el campo en la base de datos
                yield medico_service_1.default.updateMedicoImage(rut, null);
                return response_helper_1.default.success(res, undefined, 'Imagen eliminada correctamente');
            }
            catch (error) {
                console.error('Error al eliminar imagen del médico:', error);
                if (error.message === 'Médico no encontrado') {
                    return response_helper_1.default.notFound(res, error.message);
                }
                return response_helper_1.default.serverError(res, 'Error al eliminar imagen', error);
            }
        });
    }
    /**
     * Obtiene una URL firmada temporal para acceder a la imagen de un médico
     * Las URLs expiran según la configuración de S3_SIGNED_URL_EXPIRATION
     */
    obtenerUrlImagen(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { rut } = req.params;
                // Obtener el médico
                const medico = yield medico_service_1.default.getMedicoById(rut);
                if (!medico.imagen_s3_key) {
                    return response_helper_1.default.badRequest(res, 'El médico no tiene imagen');
                }
                // Generar URL firmada
                const url = (0, s3_config_1.getSignedUrl)(medico.imagen_s3_key);
                return response_helper_1.default.successWithCustomData(res, {
                    url,
                    expiresIn: parseInt(process.env.S3_SIGNED_URL_EXPIRATION || '3600')
                });
            }
            catch (error) {
                console.error('Error al obtener URL de imagen:', error);
                if (error.message === 'Médico no encontrado') {
                    return response_helper_1.default.notFound(res, error.message);
                }
                return response_helper_1.default.serverError(res, 'Error al obtener URL de imagen', error);
            }
        });
    }
    /**
     * Obtiene el perfil completo de un médico incluyendo información profesional
     * Este endpoint es público para que los pacientes puedan ver el perfil antes de agendar
     */
    getMedicoPerfil(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { rut } = req.params;
                // Obtener el médico con toda su información
                const medico = yield medico_service_1.default.getMedicoById(rut);
                // Construir objeto de respuesta con información profesional
                const perfil = {
                    // Información básica
                    rut: medico.rut,
                    nombre: medico.nombre,
                    apellidos: medico.apellidos,
                    nombreCompleto: `${medico.nombre} ${medico.apellidos}`,
                    especialidad_medica: medico.especialidad_medica,
                    // Información profesional
                    titulo_profesional: medico.titulo_profesional || null,
                    subespecialidad: medico.subespecialidad || null,
                    registro_medico: medico.registro_medico || null,
                    universidad: medico.universidad || null,
                    anio_titulacion: medico.anio_titulacion || null,
                    anios_experiencia: medico.anios_experiencia || null,
                    biografia: medico.biografia || null,
                    // Arrays parseados desde JSON
                    idiomas: parseIdiomas(medico.idiomas),
                    certificaciones: parseCertificaciones(medico.certificaciones),
                    documentos: parseDocumentos(medico.documentos_s3_keys),
                };
                // Si tiene imagen en S3, generar URL firmada
                if (medico.imagen_s3_key) {
                    perfil.imagenUrl = (0, s3_config_1.getSignedUrl)(medico.imagen_s3_key);
                }
                // Si tiene documentos en S3, generar URLs firmadas para cada uno
                if (perfil.documentos && perfil.documentos.length > 0) {
                    perfil.documentos = perfil.documentos.map((doc) => ({
                        nombre: doc.nombre,
                        url: (0, s3_config_1.getSignedUrl)(doc.key)
                    }));
                }
                return response_helper_1.default.successWithCustomData(res, { perfil });
            }
            catch (error) {
                console.error('Error al obtener perfil del médico:', error);
                if (error.message === 'Médico no encontrado') {
                    return response_helper_1.default.notFound(res, error.message);
                }
                return response_helper_1.default.serverError(res, 'Error al obtener perfil del médico', error);
            }
        });
    }
    /**
     * Actualiza la información profesional de un médico
     * Solo puede ser usado por el médico mismo o un administrador
     */
    actualizarInfoProfesional(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { rut } = req.params;
                const { titulo_profesional, subespecialidad, registro_medico, universidad, anio_titulacion, anios_experiencia, idiomas, certificaciones, biografia } = req.body;
                // Obtener el médico (modelo de Sequelize para poder usar .update())
                const medico = yield medico_service_1.default.getMedicoModelById(rut);
                // Construir objeto de actualización
                const updateData = {};
                if (titulo_profesional !== undefined)
                    updateData.titulo_profesional = titulo_profesional;
                if (subespecialidad !== undefined)
                    updateData.subespecialidad = subespecialidad;
                if (registro_medico !== undefined)
                    updateData.registro_medico = registro_medico;
                if (universidad !== undefined)
                    updateData.universidad = universidad;
                if (anio_titulacion !== undefined)
                    updateData.anio_titulacion = anio_titulacion;
                if (anios_experiencia !== undefined)
                    updateData.anios_experiencia = anios_experiencia;
                if (biografia !== undefined)
                    updateData.biografia = biografia;
                // Convertir arrays a JSON strings si se proporcionan
                if (idiomas !== undefined) {
                    updateData.idiomas = Array.isArray(idiomas) ? JSON.stringify(idiomas) : idiomas;
                }
                if (certificaciones !== undefined) {
                    updateData.certificaciones = Array.isArray(certificaciones) ? JSON.stringify(certificaciones) : certificaciones;
                }
                // Actualizar médico
                yield medico.update(updateData);
                // Recargar médico con datos actualizados
                yield medico.reload();
                return response_helper_1.default.successWithCustomData(res, {
                    mensaje: 'Información profesional actualizada correctamente',
                    medico
                });
            }
            catch (error) {
                console.error('Error al actualizar información profesional:', error);
                if (error.message === 'Médico no encontrado') {
                    return response_helper_1.default.notFound(res, error.message);
                }
                return response_helper_1.default.serverError(res, 'Error al actualizar información profesional', error);
            }
        });
    }
    /**
     * Sube un documento PDF (título, certificado) del médico a AWS S3
     * El archivo se guarda en: documentos/medicos/{RUT}/{timestamp}_{originalname}.pdf
     */
    subirDocumentoMedico(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { rut } = req.params;
                const file = req.file;
                if (!file) {
                    return response_helper_1.default.badRequest(res, 'No se proporcionó ningún archivo');
                }
                // Obtener el médico (modelo de Sequelize para poder usar .update())
                const medico = yield medico_service_1.default.getMedicoModelById(rut);
                // Obtener documentos actuales
                const medicoJSON = medico.toJSON();
                const documentosActuales = parseDocumentos(medicoJSON.documentos_s3_keys);
                // Agregar nuevo documento
                const nuevoDocumento = {
                    nombre: file.originalname,
                    key: file.key,
                    uploadedAt: new Date().toISOString()
                };
                documentosActuales.push(nuevoDocumento);
                // Actualizar médico
                yield medico.update({
                    documentos_s3_keys: JSON.stringify(documentosActuales)
                });
                console.log(`✅ Documento subido para médico ${rut}: ${file.originalname}`);
                return response_helper_1.default.successWithCustomData(res, {
                    mensaje: 'Documento subido correctamente',
                    documento: {
                        nombre: nuevoDocumento.nombre,
                        url: (0, s3_config_1.getSignedUrl)(nuevoDocumento.key)
                    }
                });
            }
            catch (error) {
                console.error('Error al subir documento del médico:', error);
                if (error.message === 'Médico no encontrado') {
                    return response_helper_1.default.notFound(res, error.message);
                }
                return response_helper_1.default.serverError(res, 'Error al subir documento', error);
            }
        });
    }
    /**
     * Elimina un documento del médico de AWS S3 y de la base de datos
     */
    eliminarDocumentoMedico(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { rut } = req.params;
                const { key } = req.body;
                if (!key) {
                    return response_helper_1.default.badRequest(res, 'Debe proporcionar la key del documento a eliminar');
                }
                // Obtener el médico (modelo de Sequelize para poder usar .update())
                const medico = yield medico_service_1.default.getMedicoModelById(rut);
                // Obtener documentos actuales
                const medicoJSON = medico.toJSON();
                const documentosActuales = parseDocumentos(medicoJSON.documentos_s3_keys);
                // Buscar el documento
                const documentoIndex = documentosActuales.findIndex((doc) => doc.key === key);
                if (documentoIndex === -1) {
                    return response_helper_1.default.notFound(res, 'Documento no encontrado');
                }
                // Eliminar de S3
                const eliminadoDeS3 = yield (0, s3_config_1.deleteDocumentFromS3)(key);
                if (!eliminadoDeS3) {
                    console.warn(`⚠️ No se pudo eliminar el documento de S3, pero se eliminará de la BD: ${key}`);
                }
                // Eliminar del array
                documentosActuales.splice(documentoIndex, 1);
                // Actualizar médico
                yield medico.update({
                    documentos_s3_keys: JSON.stringify(documentosActuales)
                });
                console.log(`✅ Documento eliminado para médico ${rut}: ${key}`);
                return response_helper_1.default.successWithCustomData(res, {
                    mensaje: 'Documento eliminado correctamente'
                });
            }
            catch (error) {
                console.error('Error al eliminar documento del médico:', error);
                if (error.message === 'Médico no encontrado') {
                    return response_helper_1.default.notFound(res, error.message);
                }
                return response_helper_1.default.serverError(res, 'Error al eliminar documento', error);
            }
        });
    }
    /**
     * Lista todos los documentos de un médico con URLs firmadas
     */
    listarDocumentosMedico(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { rut } = req.params;
                // Obtener el médico
                const medico = yield medico_service_1.default.getMedicoById(rut);
                // Obtener documentos con URLs firmadas
                const documentos = parseDocumentos(medico.documentos_s3_keys).map((doc) => ({
                    nombre: doc.nombre,
                    key: doc.key,
                    url: (0, s3_config_1.getSignedUrl)(doc.key),
                    uploadedAt: doc.uploadedAt || null
                }));
                return response_helper_1.default.successWithCustomData(res, {
                    documentos,
                    total: documentos.length
                });
            }
            catch (error) {
                console.error('Error al listar documentos del médico:', error);
                if (error.message === 'Médico no encontrado') {
                    return response_helper_1.default.notFound(res, error.message);
                }
                return response_helper_1.default.serverError(res, 'Error al listar documentos', error);
            }
        });
    }
}
exports.default = MedicosController;
//# sourceMappingURL=medico.js.map