-- Migración: Agregar campo imagen_s3_key a tabla medicos
-- Fecha: 2025-01-16
-- Descripción: Permite almacenar la key de S3 de la imagen de perfil del médico

USE gestor;

-- Agregar columna imagen_s3_key
ALTER TABLE medicos
ADD COLUMN imagen_s3_key VARCHAR(300) NULL
COMMENT 'Key de la imagen del médico en S3 (bucket privado)';

-- Verificar que se agregó correctamente
DESCRIBE medicos;

-- Resultado esperado: debe aparecer el campo imagen_s3_key
