import { Request, Response } from 'express';
import medicoService from '../services/medico.service';
import JwtGenerate from '../helpers/jwt';
import { UserRole } from '../types/enums';
import ResponseHelper from '../helpers/response.helper';
import { getSignedUrl, deleteImageFromS3, deleteDocumentFromS3 } from '../config/s3.config';

/**
 * Helper: parsea idiomas desde JSON
 */
function parseIdiomas(idiomas: string | null): string[] {
    try {
        return idiomas ? JSON.parse(idiomas) : [];
    } catch (error) {
        return [];
    }
}

/**
 * Helper: parsea certificaciones desde JSON
 */
function parseCertificaciones(certificaciones: string | null): string[] {
    try {
        return certificaciones ? JSON.parse(certificaciones) : [];
    } catch (error) {
        return [];
    }
}

/**
 * Helper: parsea documentos desde JSON
 */
function parseDocumentos(documentos_s3_keys: string | null): any[] {
    try {
        return documentos_s3_keys ? JSON.parse(documentos_s3_keys) : [];
    } catch (error) {
        return [];
    }
}

/**
 * Controlador para manejar las peticiones HTTP relacionadas con médicos
 * RESPONSABILIDAD: Solo manejar request/response, delegar lógica al servicio
 */
export default class MedicosController {
    private static _instance: MedicosController;

    public static get instance() {
        return this._instance || (this._instance = new MedicosController());
    }

    /**
     * Obtiene médicos paginados
     */
    async getMedicos(req: Request, res: Response) {
        try {
            const desde = Number(req.query.desde) || 0;
            const result = await medicoService.getPaginatedMedicos(desde);

            return ResponseHelper.successWithCustomData(res, {
                medicos: result.medicos,
                total: result.total
            });
        } catch (error: any) {
            console.error('Error al obtener los médicos:', error);
            return ResponseHelper.serverError(res, 'Error al obtener médicos', error);
        }
    }

    /**
     * Obtiene médicos filtrados por especialidades activas
     */
    async getMedicosEspecialidad(req: Request, res: Response) {
        try {
            const medicos = await medicoService.getMedicosByEspecialidad();

            return ResponseHelper.successWithCustomData(res, { medicos });
        } catch (error: any) {
            console.error('Error al obtener médicos por especialidad:', error);
            return ResponseHelper.serverError(res, 'Error al obtener médicos por especialidad', error);
        }
    }

    /**
     * Obtiene todos los médicos activos sin paginación
     */
    async getAllMedicos(req: Request, res: Response) {
        try {
            const result = await medicoService.getAllMedicos();

            return ResponseHelper.successWithCustomData(res, {
                medicos: result.medicos,
                total: result.total
            });
        } catch (error: any) {
            console.error('Error al obtener todos los médicos:', error);
            return ResponseHelper.serverError(res, 'Error al obtener todos los médicos', error);
        }
    }

    /**
     * Obtiene un médico por su RUT
     */
    async getMedico(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const medico = await medicoService.getMedicoById(id);

            return ResponseHelper.successWithCustomData(res, { medico });
        } catch (error: any) {
            console.error('Error al obtener médico:', error);

            if (error.message === 'Médico no encontrado') {
                return ResponseHelper.notFound(res, error.message);
            }

            return ResponseHelper.serverError(res, 'Error al obtener médico', error);
        }
    }

    /**
     * Crea un nuevo médico y genera su JWT
     */
    async crearMedico(req: Request, res: Response) {
        try {
            const medico = await medicoService.createMedico(req.body);

            // Para el token, necesitamos el rol como string
            const medicoJSON: any = medico.toJSON();
            const rol = medicoJSON.rol?.codigo || UserRole.MEDICO;

            // Generar JWT
            const token = await JwtGenerate.instance.generarJWT(
                medico.rut,
                medico.nombre,
                medico.apellidos,
                rol
            );

            return ResponseHelper.successWithCustomData(res, {
                medico: medicoJSON,
                token
            });
        } catch (error: any) {
            console.error('Error al crear médico:', error);
            return ResponseHelper.badRequest(res, error.message);
        }
    }

    /**
     * Actualiza un médico existente
     */
    async putMedico(req: Request, res: Response) {
        try {
            const { rut } = req.params;
            const medico = await medicoService.updateMedico(rut, req.body);

            // Procesar para respuesta
            const medicoJSON: any = medico.toJSON();
            if (medicoJSON.rol && medicoJSON.rol.codigo) {
                medicoJSON.rol = medicoJSON.rol.codigo;
            }

            return ResponseHelper.successWithCustomData(res, { medico: medicoJSON });
        } catch (error: any) {
            console.error('Error al actualizar médico:', error);

            if (error.message === 'Médico no encontrado') {
                return ResponseHelper.notFound(res, error.message);
            }

            return ResponseHelper.badRequest(res, error.message);
        }
    }

    /**
     * Elimina un médico (soft delete) y sus relaciones
     */
    async deleteMedico(req: Request, res: Response) {
        try {
            const { rut } = req.params;
            await medicoService.deleteMedico(rut);

            return ResponseHelper.success(res, undefined, 'Médico eliminado correctamente');
        } catch (error: any) {
            console.error('Error al eliminar médico:', error);

            if (error.message === 'Médico no encontrado') {
                return ResponseHelper.notFound(res, error.message);
            }

            return ResponseHelper.badRequest(res, error.message);
        }
    }

    /**
     * Cambia la contraseña de un médico
     */
    async cambiarPasswordMedico(req: Request, res: Response) {
        try {
            const { rut, password, newPassword } = req.body;
            await medicoService.changePassword(rut, password, newPassword);

            return ResponseHelper.success(res, undefined, 'Contraseña actualizada correctamente');
        } catch (error: any) {
            console.error('Error al cambiar contraseña:', error);

            if (error.message === 'Médico no encontrado') {
                return ResponseHelper.notFound(res, error.message);
            }

            return ResponseHelper.badRequest(res, error.message);
        }
    }

    /**
     * Sube una imagen de perfil para un médico a S3
     * La imagen se almacena en un bucket privado y se guarda la key en la BD
     */
    async subirImagenMedico(req: Request, res: Response) {
        try {
            const { rut } = req.params;

            // Verificar que se subió un archivo
            if (!req.file) {
                return ResponseHelper.badRequest(res, 'No se recibió ningún archivo');
            }

            // El archivo ya fue subido a S3 por multer-s3
            const s3Key = (req.file as any).key; // Key generada por multer-s3

            // Actualizar el médico con la nueva key de S3
            const medico = await medicoService.updateMedicoImage(rut, s3Key);

            return ResponseHelper.successWithCustomData(res, {
                medico,
                mensaje: 'Imagen subida correctamente',
                s3Key
            });
        } catch (error: any) {
            console.error('Error al subir imagen del médico:', error);

            if (error.message === 'Médico no encontrado') {
                return ResponseHelper.notFound(res, error.message);
            }

            return ResponseHelper.serverError(res, 'Error al subir imagen', error);
        }
    }

    /**
     * Elimina la imagen de perfil de un médico de S3 y limpia el campo en BD
     */
    async eliminarImagenMedico(req: Request, res: Response) {
        try {
            const { rut } = req.params;

            // Obtener el médico para obtener la key de S3
            const medico = await medicoService.getMedicoById(rut);

            if (!medico.imagen_s3_key) {
                return ResponseHelper.badRequest(res, 'El médico no tiene imagen para eliminar');
            }

            // Eliminar de S3
            const eliminado = await deleteImageFromS3(medico.imagen_s3_key);

            if (!eliminado) {
                console.warn(`No se pudo eliminar la imagen de S3: ${medico.imagen_s3_key}`);
            }

            // Limpiar el campo en la base de datos
            await medicoService.updateMedicoImage(rut, null);

            return ResponseHelper.success(res, undefined, 'Imagen eliminada correctamente');
        } catch (error: any) {
            console.error('Error al eliminar imagen del médico:', error);

            if (error.message === 'Médico no encontrado') {
                return ResponseHelper.notFound(res, error.message);
            }

            return ResponseHelper.serverError(res, 'Error al eliminar imagen', error);
        }
    }

    /**
     * Obtiene una URL firmada temporal para acceder a la imagen de un médico
     * Las URLs expiran según la configuración de S3_SIGNED_URL_EXPIRATION
     */
    async obtenerUrlImagen(req: Request, res: Response) {
        try {
            const { rut } = req.params;

            // Obtener el médico
            const medico = await medicoService.getMedicoById(rut);

            if (!medico.imagen_s3_key) {
                return ResponseHelper.badRequest(res, 'El médico no tiene imagen');
            }

            // Generar URL firmada
            const url = getSignedUrl(medico.imagen_s3_key);

            return ResponseHelper.successWithCustomData(res, {
                url,
                expiresIn: parseInt(process.env.S3_SIGNED_URL_EXPIRATION || '3600')
            });
        } catch (error: any) {
            console.error('Error al obtener URL de imagen:', error);

            if (error.message === 'Médico no encontrado') {
                return ResponseHelper.notFound(res, error.message);
            }

            return ResponseHelper.serverError(res, 'Error al obtener URL de imagen', error);
        }
    }

    /**
     * Obtiene el perfil completo de un médico incluyendo información profesional
     * Este endpoint es público para que los pacientes puedan ver el perfil antes de agendar
     */
    async getMedicoPerfil(req: Request, res: Response) {
        try {
            const { rut } = req.params;

            // Obtener el médico con toda su información
            const medico = await medicoService.getMedicoById(rut);

            // Construir objeto de respuesta con información profesional
            const perfil: any = {
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
                perfil.imagenUrl = getSignedUrl(medico.imagen_s3_key);
            }

            // Si tiene documentos en S3, generar URLs firmadas para cada uno
            if (perfil.documentos && perfil.documentos.length > 0) {
                perfil.documentos = perfil.documentos.map((doc: any) => ({
                    nombre: doc.nombre,
                    url: getSignedUrl(doc.key)
                }));
            }

            return ResponseHelper.successWithCustomData(res, { perfil });
        } catch (error: any) {
            console.error('Error al obtener perfil del médico:', error);

            if (error.message === 'Médico no encontrado') {
                return ResponseHelper.notFound(res, error.message);
            }

            return ResponseHelper.serverError(res, 'Error al obtener perfil del médico', error);
        }
    }

    /**
     * Actualiza la información profesional de un médico
     * Solo puede ser usado por el médico mismo o un administrador
     */
    async actualizarInfoProfesional(req: Request, res: Response) {
        try {
            const { rut } = req.params;
            const {
                titulo_profesional,
                subespecialidad,
                registro_medico,
                universidad,
                anio_titulacion,
                anios_experiencia,
                idiomas,
                certificaciones,
                biografia
            } = req.body;

            // Obtener el médico (modelo de Sequelize para poder usar .update())
            const medico = await medicoService.getMedicoModelById(rut);

            // Construir objeto de actualización
            const updateData: any = {};

            if (titulo_profesional !== undefined) updateData.titulo_profesional = titulo_profesional;
            if (subespecialidad !== undefined) updateData.subespecialidad = subespecialidad;
            if (registro_medico !== undefined) updateData.registro_medico = registro_medico;
            if (universidad !== undefined) updateData.universidad = universidad;
            if (anio_titulacion !== undefined) updateData.anio_titulacion = anio_titulacion;
            if (anios_experiencia !== undefined) updateData.anios_experiencia = anios_experiencia;
            if (biografia !== undefined) updateData.biografia = biografia;

            // Convertir arrays a JSON strings si se proporcionan
            if (idiomas !== undefined) {
                updateData.idiomas = Array.isArray(idiomas) ? JSON.stringify(idiomas) : idiomas;
            }
            if (certificaciones !== undefined) {
                updateData.certificaciones = Array.isArray(certificaciones) ? JSON.stringify(certificaciones) : certificaciones;
            }

            // Actualizar médico
            await medico.update(updateData);

            // Recargar médico con datos actualizados
            await medico.reload();

            return ResponseHelper.successWithCustomData(res, {
                mensaje: 'Información profesional actualizada correctamente',
                medico
            });
        } catch (error: any) {
            console.error('Error al actualizar información profesional:', error);

            if (error.message === 'Médico no encontrado') {
                return ResponseHelper.notFound(res, error.message);
            }

            return ResponseHelper.serverError(res, 'Error al actualizar información profesional', error);
        }
    }

    /**
     * Sube un documento PDF (título, certificado) del médico a AWS S3
     * El archivo se guarda en: documentos/medicos/{RUT}/{timestamp}_{originalname}.pdf
     */
    async subirDocumentoMedico(req: Request, res: Response) {
        try {
            const { rut } = req.params;
            const file = (req as any).file;

            if (!file) {
                return ResponseHelper.badRequest(res, 'No se proporcionó ningún archivo');
            }

            // Obtener el médico (modelo de Sequelize para poder usar .update())
            const medico = await medicoService.getMedicoModelById(rut);

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
            await medico.update({
                documentos_s3_keys: JSON.stringify(documentosActuales)
            });

            console.log(`✅ Documento subido para médico ${rut}: ${file.originalname}`);

            return ResponseHelper.successWithCustomData(res, {
                mensaje: 'Documento subido correctamente',
                documento: {
                    nombre: nuevoDocumento.nombre,
                    url: getSignedUrl(nuevoDocumento.key)
                }
            });
        } catch (error: any) {
            console.error('Error al subir documento del médico:', error);

            if (error.message === 'Médico no encontrado') {
                return ResponseHelper.notFound(res, error.message);
            }

            return ResponseHelper.serverError(res, 'Error al subir documento', error);
        }
    }

    /**
     * Elimina un documento del médico de AWS S3 y de la base de datos
     */
    async eliminarDocumentoMedico(req: Request, res: Response) {
        try {
            const { rut } = req.params;
            const { key } = req.body;

            if (!key) {
                return ResponseHelper.badRequest(res, 'Debe proporcionar la key del documento a eliminar');
            }

            // Obtener el médico (modelo de Sequelize para poder usar .update())
            const medico = await medicoService.getMedicoModelById(rut);

            // Obtener documentos actuales
            const medicoJSON = medico.toJSON();
            const documentosActuales = parseDocumentos(medicoJSON.documentos_s3_keys);

            // Buscar el documento
            const documentoIndex = documentosActuales.findIndex((doc: any) => doc.key === key);

            if (documentoIndex === -1) {
                return ResponseHelper.notFound(res, 'Documento no encontrado');
            }

            // Eliminar de S3
            const eliminadoDeS3 = await deleteDocumentFromS3(key);

            if (!eliminadoDeS3) {
                console.warn(`⚠️ No se pudo eliminar el documento de S3, pero se eliminará de la BD: ${key}`);
            }

            // Eliminar del array
            documentosActuales.splice(documentoIndex, 1);

            // Actualizar médico
            await medico.update({
                documentos_s3_keys: JSON.stringify(documentosActuales)
            });

            console.log(`✅ Documento eliminado para médico ${rut}: ${key}`);

            return ResponseHelper.successWithCustomData(res, {
                mensaje: 'Documento eliminado correctamente'
            });
        } catch (error: any) {
            console.error('Error al eliminar documento del médico:', error);

            if (error.message === 'Médico no encontrado') {
                return ResponseHelper.notFound(res, error.message);
            }

            return ResponseHelper.serverError(res, 'Error al eliminar documento', error);
        }
    }

    /**
     * Lista todos los documentos de un médico con URLs firmadas
     */
    async listarDocumentosMedico(req: Request, res: Response) {
        try {
            const { rut } = req.params;

            // Obtener el médico
            const medico = await medicoService.getMedicoById(rut);

            // Obtener documentos con URLs firmadas
            const documentos = parseDocumentos(medico.documentos_s3_keys).map((doc: any) => ({
                nombre: doc.nombre,
                key: doc.key,
                url: getSignedUrl(doc.key),
                uploadedAt: doc.uploadedAt || null
            }));

            return ResponseHelper.successWithCustomData(res, {
                documentos,
                total: documentos.length
            });
        } catch (error: any) {
            console.error('Error al listar documentos del médico:', error);

            if (error.message === 'Médico no encontrado') {
                return ResponseHelper.notFound(res, error.message);
            }

            return ResponseHelper.serverError(res, 'Error al listar documentos', error);
        }
    }
}