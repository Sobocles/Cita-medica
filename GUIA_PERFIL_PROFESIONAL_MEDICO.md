# Guía: Sistema de Perfil Profesional del Médico

## Descripción General

Esta funcionalidad permite a los administradores y médicos gestionar información profesional detallada que se mostrará a los pacientes antes de agendar una cita. Esto ayuda a los pacientes a tomar decisiones informadas sobre qué médico elegir.

## Características Implementadas

### 1. Información Profesional del Médico

Los médicos pueden agregar la siguiente información a su perfil:

#### Datos Profesionales Básicos
- **Título Profesional**: Ej: "Médico Cirujano", "Doctor en Medicina"
- **Subespecialidad**: Ej: "Cardiología Intervencionista"
- **Número de Registro Médico**: Registro profesional único
- **Universidad de Egreso**: Institución donde estudió
- **Año de Titulación**: Año en que se graduó
- **Años de Experiencia**: Años de práctica profesional

#### Idiomas
- Lista dinámica de idiomas que domina el médico
- Ejemplo: Español, Inglés, Portugués, Alemán

#### Certificaciones
- Lista de certificaciones adicionales, diplomados, fellows
- Ejemplo: "Certificado en Ecocardiografía (2010)", "Fellow en Cardiología (Johns Hopkins, 2015)"

#### Biografía
- Descripción profesional del médico (máximo 1000 caracteres)
- Espacio para describir experiencia, áreas de interés, logros profesionales

#### Documentos (PDFs)
- Títulos profesionales
- Certificados de especialización
- Diplomas de cursos o postgrados
- Cualquier documento relevante

### 2. Visualización por Pacientes

Los pacientes pueden ver el perfil completo del médico desde dos lugares:

1. **En la búsqueda de médicos**: Haciendo clic en el ícono de información (ℹ️) al lado del nombre del médico
2. **Modal de Perfil**: Se muestra toda la información en un modal elegante con:
   - Foto del médico
   - Datos profesionales completos
   - Lista de idiomas
   - Certificaciones
   - Biografía
   - Documentos descargables (PDF)

### 3. Panel de Administración

#### Acceso
Los administradores pueden editar el perfil profesional desde:
- **Gestionar Médicos** → Botón azul con ícono de médico (👨‍⚕️) en la tabla

#### Funcionalidades del Panel

**Secciones del Formulario:**

1. **Información Profesional** (tarjeta azul)
   - Campos para título, especialidad, registro, universidad, años

2. **Idiomas** (tarjeta celeste)
   - Agregar/eliminar idiomas dinámicamente
   - Botón "+" para agregar nuevos
   - Botón "🗑️" para eliminar

3. **Certificaciones** (tarjeta verde)
   - Agregar/eliminar certificaciones dinámicamente
   - Botón "+" para agregar nuevas
   - Botón "🗑️" para eliminar

4. **Biografía** (tarjeta gris)
   - Área de texto con contador de caracteres
   - Máximo 1000 caracteres

5. **Documentos PDF** (tarjeta amarilla - sidebar)
   - Subir archivos PDF (máximo 10MB)
   - Ver lista de documentos actuales
   - Eliminar documentos
   - Descargar documentos

**Validaciones:**
- Título profesional: máximo 100 caracteres
- Subespecialidad: máximo 150 caracteres
- Registro médico: máximo 50 caracteres
- Universidad: máximo 200 caracteres
- Año de titulación: entre 1950 y año actual
- Años de experiencia: entre 0 y 60
- Idiomas: obligatorio, máximo 50 caracteres
- Certificaciones: obligatorio, máximo 200 caracteres
- Biografía: máximo 1000 caracteres
- Documentos: solo PDF, máximo 10MB

## Arquitectura Técnica

### Backend

#### Modelo de Datos (medico.ts)

Nuevos campos agregados a la tabla `medicos`:

```typescript
titulo_profesional: string (max 100)
subespecialidad: string (max 150)
registro_medico: string (max 50)
universidad: string (max 200)
anio_titulacion: number
anios_experiencia: number
idiomas: TEXT (JSON array)
certificaciones: TEXT (JSON array)
biografia: TEXT (max 1000)
documentos_s3_keys: TEXT (JSON array)
```

#### Endpoints Nuevos

**1. Obtener Perfil Completo (Público)**
```
GET /api/medicos/:rut/perfil
```
Retorna toda la información profesional del médico con URLs firmadas para la imagen y documentos.

**2. Actualizar Información Profesional (Autenticado)**
```
PUT /api/medicos/:rut/info-profesional
Headers: Authorization: Bearer <token>
Body: {
  titulo_profesional: string,
  subespecialidad: string,
  registro_medico: string,
  universidad: string,
  anio_titulacion: number,
  anios_experiencia: number,
  idiomas: string[],
  certificaciones: string[],
  biografia: string
}
```

**3. Subir Documento PDF (Autenticado)**
```
POST /api/medicos/:rut/documento
Headers: Authorization: Bearer <token>
Content-Type: multipart/form-data
Body: FormData con archivo PDF
```

**4. Listar Documentos (Público)**
```
GET /api/medicos/:rut/documentos
```
Retorna array de documentos con URLs firmadas (válidas por 1 hora).

**5. Eliminar Documento (Autenticado)**
```
DELETE /api/medicos/:rut/documento
Headers: Authorization: Bearer <token>
Body: { key: string }
```

#### Almacenamiento en S3

**Estructura de Carpetas:**
```
s3://bucket-name/
  └── documentos/
      └── medicos/
          └── {RUT}/
              ├── {timestamp}_certificado_cardiologia.pdf
              ├── {timestamp}_titulo_medico.pdf
              └── {timestamp}_diploma_postgrado.pdf
```

**Seguridad:**
- Archivos privados (ACL: 'private')
- URLs firmadas con expiración de 1 hora
- Validación de tipo (solo PDF)
- Validación de tamaño (máximo 10MB)

### Frontend

#### Componentes

**1. EditarPerfilMedicoComponent**
- Ubicación: `frontend/src/app/admin/pages/editar-perfil-medico/`
- Archivos:
  - `editar-perfil-medico.component.ts` - Lógica del formulario
  - `editar-perfil-medico.component.html` - Template
  - `editar-perfil-medico.component.scss` - Estilos

**Características:**
- FormGroup reactivo con validaciones
- FormArrays para idiomas y certificaciones dinámicos
- Gestión de archivos (upload/delete)
- Integración con SweetAlert2 para feedback

**2. BusquedaMedicoComponent (actualizado)**
- Nuevo método: `verPerfilMedico(rut: string)`
- Modal con perfil completo del médico
- Ícono de información en la tabla

**3. GestionarMedicosComponent (actualizado)**
- Nuevo botón en la tabla de acciones
- Navegación a editar perfil profesional

#### Servicios

**MedicoService (actualizado)**

Nuevos métodos:
```typescript
obtenerPerfilMedico(rut: string): Observable<any>
actualizarInfoProfesional(rut: string, info: any): Observable<any>
subirDocumentoMedico(rut: string, archivo: File): Observable<any>
listarDocumentosMedico(rut: string): Observable<any>
eliminarDocumentoMedico(rut: string, key: string): Observable<any>
```

#### Rutas

Nueva ruta en AdminRoutingModule:
```typescript
{
  path: 'medico/:rut/editar-perfil',
  component: EditarPerfilMedicoComponent,
  canActivate: [AuthGuard, AdminGuard]
}
```

## Migración de Base de Datos

Para agregar los nuevos campos a la tabla `medicos`, ejecutar:

```sql
-- Archivo: backend/migrations/add_medico_professional_info.sql

ALTER TABLE medicos
ADD COLUMN titulo_profesional VARCHAR(100) NULL,
ADD COLUMN subespecialidad VARCHAR(150) NULL,
ADD COLUMN registro_medico VARCHAR(50) NULL,
ADD COLUMN universidad VARCHAR(200) NULL,
ADD COLUMN anio_titulacion INT NULL,
ADD COLUMN anios_experiencia INT NULL,
ADD COLUMN idiomas TEXT NULL,
ADD COLUMN certificaciones TEXT NULL,
ADD COLUMN biografia TEXT NULL,
ADD COLUMN documentos_s3_keys TEXT NULL;
```

## Flujo de Uso

### Para Administradores

1. Ir a **Admin → Gestionar Médicos**
2. En la tabla, encontrar al médico deseado
3. Hacer clic en el botón azul con ícono de médico (👨‍⚕️)
4. Se abre el formulario de edición de perfil profesional
5. Completar la información deseada:
   - Datos profesionales
   - Agregar idiomas (botón "+")
   - Agregar certificaciones (botón "+")
   - Escribir biografía
   - Subir documentos PDF
6. Hacer clic en "Guardar Cambios"
7. El sistema valida y guarda la información

### Para Pacientes

1. Ir a **Agendar Cita** en el menú de paciente
2. Seleccionar especialidad y fecha
3. Ver la tabla de médicos disponibles
4. Hacer clic en el ícono ℹ️ al lado del nombre del médico
5. Se abre un modal con:
   - Foto del médico
   - Todos los datos profesionales
   - Idiomas que habla
   - Certificaciones
   - Biografía
   - Documentos descargables
6. Tomar una decisión informada sobre qué médico elegir
7. Cerrar el modal y proceder con el agendamiento

## Beneficios

### Para la Clínica
- **Profesionalismo**: Muestra un nivel alto de profesionalismo
- **Transparencia**: Los pacientes tienen toda la información antes de agendar
- **Confianza**: Genera confianza en los pacientes al ver credenciales

### Para los Médicos
- **Visibilidad**: Destacan sus credenciales y experiencia
- **Diferenciación**: Se diferencian de otros médicos
- **Credibilidad**: Los documentos respaldan sus afirmaciones

### Para los Pacientes
- **Información**: Toman decisiones informadas
- **Seguridad**: Saben que están eligiendo un profesional calificado
- **Confianza**: Ven las credenciales antes de agendar

## Consideraciones de Seguridad

1. **Autenticación**: Los endpoints de modificación requieren JWT válido
2. **Autorización**: Solo admin o el médico dueño puede editar
3. **Validación de Archivos**:
   - Solo PDF permitidos
   - Máximo 10MB
   - Sanitización de nombres de archivo
4. **URLs Firmadas**: Los documentos usan URLs temporales (1 hora)
5. **Privacidad**: Los archivos en S3 son privados, no públicos

## Solución de Problemas

### Error: "No se pudo cargar la información del médico"
- Verificar que el RUT sea válido
- Verificar conexión a la base de datos
- Revisar logs del backend

### Error: "Solo se permiten archivos PDF"
- Asegurar que el archivo sea PDF real (no renombrado)
- Verificar que el MIME type sea 'application/pdf'

### Error: "El archivo no debe superar 10MB"
- Reducir el tamaño del PDF
- Usar herramientas de compresión de PDF

### Los documentos no se muestran
- Verificar configuración de AWS S3
- Verificar que las variables de entorno estén correctas
- Revisar permisos del bucket S3

### Las URLs firmadas expiran
- Normal: expiran en 1 hora por seguridad
- Al recargar la lista, se generan nuevas URLs

## Próximas Mejoras (Opcionales)

1. **Sistema de Aprobación**: Admin debe aprobar documentos antes de mostrarlos
2. **Calificaciones**: Pacientes pueden calificar médicos
3. **Filtros Avanzados**: Buscar por idioma, experiencia, certificaciones
4. **Dashboard**: Estadísticas para médicos sobre vistas de perfil
5. **Notificaciones**: Avisar al médico cuando un paciente ve su perfil
6. **Verificación**: Sistema de verificación de credenciales por terceros

## Conclusión

Este sistema de perfil profesional mejora significativamente la experiencia del paciente al proporcionar información completa y verificable sobre los médicos. Aumenta la confianza en la plataforma y ayuda a los pacientes a tomar decisiones informadas sobre su atención médica.
