import AWS from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';

/**
 * Configuración de AWS S3 para almacenamiento de imágenes de médicos
 * Bucket PRIVADO con URLs firmadas para seguridad
 */

// Configurar credenciales de AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const s3 = new AWS.S3();

/**
 * Configuración de Multer para subir archivos a S3
 * - Bucket privado (acl: 'private')
 * - Nombres únicos por médico
 * - Validación de tipos de archivo
 */
export const uploadMedicoImage = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET_NAME || '',
    acl: 'private', // ✅ PRIVADO - requiere URLs firmadas
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req: any, file: any, cb: any) {
      cb(null, {
        fieldName: file.fieldname,
        uploadedAt: new Date().toISOString()
      });
    },
    key: function (req: any, file: any, cb: any) {
      // Generar nombre único: medicos/{RUT}_{timestamp}.{ext}
      const rut = req.body?.rut || req.params?.rut || 'unknown';
      const timestamp = Date.now();
      const extension = path.extname(file.originalname).toLowerCase();
      const filename = `medicos/${rut}_${timestamp}${extension}`;
      cb(null, filename);
    }
  } as any),
  limits: {
    fileSize: 5 * 1024 * 1024 // Máximo 5MB
  },
  fileFilter: function (req: any, file: any, cb: any) {
    // Solo permitir imágenes
    const allowedMimes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif'
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen (JPG, PNG, WEBP, GIF)'));
    }
  }
});

/**
 * Genera una URL firmada temporal para acceder a una imagen privada
 * @param key - La key del objeto en S3 (ej: "medicos/12345678-9_1234567890.jpg")
 * @param expiresIn - Tiempo de expiración en segundos (default: 1 hora)
 * @returns URL firmada temporal
 */
export const getSignedUrl = (key: string, expiresIn?: number): string => {
  try {
    const expires = expiresIn || parseInt(process.env.S3_SIGNED_URL_EXPIRATION || '3600');

    const url = s3.getSignedUrl('getObject', {
      Bucket: process.env.AWS_S3_BUCKET_NAME || '',
      Key: key,
      Expires: expires
    });

    return url;
  } catch (error) {
    console.error('Error generando URL firmada:', error);
    throw new Error('No se pudo generar la URL de la imagen');
  }
};

/**
 * Extrae la key de S3 desde una URL completa
 * @param url - URL completa de S3 o solo la key
 * @returns La key del objeto
 */
export const getKeyFromUrl = (url: string): string => {
  try {
    // Si no contiene http, asumimos que ya es una key
    if (!url.includes('http')) {
      return url;
    }

    // Extraer key de URL firmada
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    return pathname.startsWith('/') ? pathname.substring(1) : pathname;
  } catch (error) {
    console.error('Error extrayendo key de URL:', error);
    return url;
  }
};

/**
 * Elimina una imagen del bucket S3
 * @param keyOrUrl - Key de S3 o URL completa
 * @returns true si se eliminó correctamente
 */
export const deleteImageFromS3 = async (keyOrUrl: string): Promise<boolean> => {
  try {
    const key = getKeyFromUrl(keyOrUrl);

    await s3.deleteObject({
      Bucket: process.env.AWS_S3_BUCKET_NAME || '',
      Key: key
    }).promise();

    console.log(`✅ Imagen eliminada de S3: ${key}`);
    return true;
  } catch (error) {
    console.error('❌ Error al eliminar imagen de S3:', error);
    return false;
  }
};

/**
 * Verifica si una imagen existe en S3
 * @param key - Key del objeto en S3
 * @returns true si existe
 */
export const imageExistsInS3 = async (key: string): Promise<boolean> => {
  try {
    await s3.headObject({
      Bucket: process.env.AWS_S3_BUCKET_NAME || '',
      Key: key
    }).promise();
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Obtiene información de un objeto en S3
 * @param key - Key del objeto
 * @returns Metadatos del objeto
 */
export const getImageMetadata = async (key: string): Promise<AWS.S3.HeadObjectOutput | null> => {
  try {
    const metadata = await s3.headObject({
      Bucket: process.env.AWS_S3_BUCKET_NAME || '',
      Key: key
    }).promise();
    return metadata;
  } catch (error) {
    console.error('Error obteniendo metadata:', error);
    return null;
  }
};

/**
 * ============================================
 * CONFIGURACIÓN PARA DOCUMENTOS PDF
 * ============================================
 */

/**
 * Configuración de Multer para subir documentos PDF a S3
 * - Bucket privado (acl: 'private')
 * - Solo PDFs permitidos
 * - Máximo 10MB por documento
 */
export const uploadMedicoDocument = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET_NAME || '',
    acl: 'private', // ✅ PRIVADO - requiere URLs firmadas
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req: any, file: any, cb: any) {
      cb(null, {
        fieldName: file.fieldname,
        uploadedAt: new Date().toISOString(),
        originalName: file.originalname
      });
    },
    key: function (req: any, file: any, cb: any) {
      // Generar nombre único: documentos/medicos/{RUT}/{timestamp}_{originalname}
      const rut = req.body?.rut || req.params?.rut || 'unknown';
      const timestamp = Date.now();
      const originalName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_'); // Sanitizar nombre
      const filename = `documentos/medicos/${rut}/${timestamp}_${originalName}`;
      cb(null, filename);
    }
  } as any),
  limits: {
    fileSize: 10 * 1024 * 1024 // Máximo 10MB para documentos
  },
  fileFilter: function (req: any, file: any, cb: any) {
    // Solo permitir PDFs
    const allowedMimes = [
      'application/pdf'
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF'));
    }
  }
});

/**
 * Elimina un documento del bucket S3
 * @param keyOrUrl - Key de S3 o URL completa
 * @returns true si se eliminó correctamente
 */
export const deleteDocumentFromS3 = async (keyOrUrl: string): Promise<boolean> => {
  try {
    const key = getKeyFromUrl(keyOrUrl);

    await s3.deleteObject({
      Bucket: process.env.AWS_S3_BUCKET_NAME || '',
      Key: key
    }).promise();

    console.log(`✅ Documento eliminado de S3: ${key}`);
    return true;
  } catch (error) {
    console.error('❌ Error al eliminar documento de S3:', error);
    return false;
  }
};

/**
 * Verifica si un documento existe en S3
 * @param key - Key del documento en S3
 * @returns true si existe
 */
export const documentExistsInS3 = async (key: string): Promise<boolean> => {
  try {
    await s3.headObject({
      Bucket: process.env.AWS_S3_BUCKET_NAME || '',
      Key: key
    }).promise();
    return true;
  } catch (error) {
    return false;
  }
};

export default s3;
