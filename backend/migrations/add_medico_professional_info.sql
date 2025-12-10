-- ============================================
-- MIGRACIÓN: Agregar información profesional a tabla medicos
-- Fecha: 2025-11-17
-- Descripción: Agrega campos para información profesional del médico
--              (título, certificaciones, biografía, documentos, etc.)
-- ============================================

USE gestor;

-- Agregar nuevos campos a la tabla medicos
ALTER TABLE medicos

-- Título profesional
ADD COLUMN titulo_profesional VARCHAR(100) NULL
COMMENT 'Título profesional del médico (ej: Médico Cirujano)',

-- Subespecialidad
ADD COLUMN subespecialidad VARCHAR(150) NULL
COMMENT 'Subespecialidad médica si tiene',

-- Número de registro médico
ADD COLUMN registro_medico VARCHAR(50) NULL
COMMENT 'Número de registro profesional',

-- Universidad de egreso
ADD COLUMN universidad VARCHAR(200) NULL
COMMENT 'Universidad de egreso',

-- Año de titulación
ADD COLUMN anio_titulacion INT NULL
COMMENT 'Año de titulación',

-- Años de experiencia
ADD COLUMN anios_experiencia INT NULL
COMMENT 'Años de experiencia profesional',

-- Idiomas (JSON)
ADD COLUMN idiomas TEXT NULL
COMMENT 'JSON array de idiomas que habla',

-- Certificaciones (JSON)
ADD COLUMN certificaciones TEXT NULL
COMMENT 'JSON array de certificaciones adicionales',

-- Biografía
ADD COLUMN biografia TEXT NULL
COMMENT 'Biografía o descripción del médico',

-- Documentos en S3 (JSON)
ADD COLUMN documentos_s3_keys TEXT NULL
COMMENT 'JSON array de objetos con documentos en S3';

-- Verificar que los campos se agregaron correctamente
DESCRIBE medicos;

-- ============================================
-- DATOS DE EJEMPLO (OPCIONAL)
-- ============================================
-- Puedes comentar esto si no quieres datos de ejemplo

-- UPDATE medicos
-- SET
--     titulo_profesional = 'Médico Cirujano',
--     subespecialidad = 'Cardiología Intervencionista',
--     registro_medico = '12345678',
--     universidad = 'Universidad de Chile',
--     anio_titulacion = 2005,
--     anios_experiencia = 15,
--     idiomas = '["Español", "Inglés"]',
--     certificaciones = '["Certificado en Ecocardiografía (2010)", "Fellow American College of Cardiology (2015)"]',
--     biografia = 'Médico cardiólogo con amplia experiencia en el tratamiento de enfermedades cardiovasculares. Especializado en procedimientos mínimamente invasivos.'
-- WHERE rut = 'RUT_DEL_MEDICO'; -- Reemplazar con el RUT del médico

-- ============================================
-- FIN DE LA MIGRACIÓN
-- ============================================
