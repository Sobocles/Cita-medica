# 📚 Documentación - Sistema de Perfil Completo del Médico

## 📋 Índice
1. [Resumen General](#resumen-general)
2. [Punto 1: Campos Adicionales](#punto-1-campos-adicionales)
3. [Punto 2: Endpoints Backend](#punto-2-endpoints-backend)
4. [Punto 3: Interfaz de Usuario](#punto-3-interfaz-de-usuario)
5. [Punto 4: Sistema de Documentos PDF](#punto-4-sistema-de-documentos-pdf)
6. [Guía de Uso](#guía-de-uso)
7. [Ejemplos de Implementación](#ejemplos-de-implementación)

---

## 🎯 Resumen General

Se implementó un sistema completo de perfil profesional para médicos que permite:

- ✅ Almacenar información profesional detallada
- ✅ Subir documentos PDF (títulos, certificados)
- ✅ Mostrar perfil completo a pacientes antes de agendar
- ✅ Gestionar documentos de forma segura en AWS S3

---

## 📊 Punto 1: Campos Adicionales

### **Backend - Modelo Médico**

**Archivo**: `backend/models/medico.ts`

### Nuevos Campos en Base de Datos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `titulo_profesional` | VARCHAR(100) | Título del médico (ej: "Médico Cirujano") |
| `subespecialidad` | VARCHAR(150) | Subespecialidad médica |
| `registro_medico` | VARCHAR(50) | Número de registro profesional |
| `universidad` | VARCHAR(200) | Universidad de egreso |
| `anio_titulacion` | INTEGER | Año de titulación (1950-actual) |
| `anios_experiencia` | INTEGER | Años de experiencia (0-60) |
| `idiomas` | TEXT (JSON) | Array de idiomas que habla |
| `certificaciones` | TEXT (JSON) | Array de certificaciones |
| `biografia` | TEXT | Descripción del médico (max 1000 caracteres) |
| `documentos_s3_keys` | TEXT (JSON) | Array de documentos en S3 |

### Métodos Helper

```typescript
// Obtener idiomas como array
medico.getIdiomas() // => ["Español", "Inglés"]

// Obtener certificaciones como array
medico.getCertificaciones() // => ["Cert1", "Cert2"]

// Obtener documentos como array de objetos
medico.getDocumentos() // => [{nombre: "titulo.pdf", key: "s3/key"}]
```

### Migración SQL

**Archivo**: `backend/migrations/add_medico_professional_info.sql`

```sql
-- Ejecutar para agregar campos a la tabla medicos
USE gestor;
ALTER TABLE medicos
ADD COLUMN titulo_profesional VARCHAR(100) NULL,
ADD COLUMN subespecialidad VARCHAR(150) NULL,
-- ... (resto de campos)
```

---

## 🔌 Punto 2: Endpoints Backend

### Endpoints de Información Profesional

#### **GET `/api/medicos/:rut/perfil`** (Público)

Obtiene perfil completo del médico con toda su información profesional.

**Request**:
```http
GET /api/medicos/12345678-9/perfil
```

**Response**:
```json
{
  "ok": true,
  "perfil": {
    "rut": "12345678-9",
    "nombreCompleto": "Juan Pérez González",
    "especialidad_medica": "Cardiología",
    "titulo_profesional": "Médico Cirujano",
    "subespecialidad": "Cardiología Intervencionista",
    "universidad": "Universidad de Chile",
    "anio_titulacion": 2005,
    "anios_experiencia": 15,
    "idiomas": ["Español", "Inglés"],
    "certificaciones": ["Cert1", "Cert2"],
    "biografia": "Médico cardiólogo...",
    "imagenUrl": "https://s3.amazonaws.com/...",
    "documentos": [
      {
        "nombre": "Título.pdf",
        "url": "https://s3.amazonaws.com/..."
      }
    ]
  }
}
```

**Características**:
- ✅ Público (no requiere autenticación)
- ✅ URLs firmadas temporales (1 hora de expiración)
- ✅ Parsea automáticamente campos JSON

---

#### **PUT `/api/medicos/:rut/info-profesional`** (Autenticado)

Actualiza información profesional del médico.

**Headers**:
```
Authorization: Bearer <token>
```

**Request**:
```json
{
  "titulo_profesional": "Médico Cirujano",
  "subespecialidad": "Cardiología Intervencionista",
  "universidad": "Universidad de Chile",
  "anio_titulacion": 2005,
  "anios_experiencia": 15,
  "idiomas": ["Español", "Inglés", "Portugués"],
  "certificaciones": [
    "Certificado en Ecocardiografía (2010)",
    "Fellow American College of Cardiology (2015)"
  ],
  "biografia": "Médico cardiólogo con amplia experiencia..."
}
```

**Response**:
```json
{
  "ok": true,
  "mensaje": "Información profesional actualizada correctamente",
  "medico": { /* objeto actualizado */ }
}
```

**Características**:
- ✅ Requiere JWT
- ✅ Actualización parcial (solo campos enviados)
- ✅ Conversión automática de arrays a JSON

---

### Endpoints de Documentos PDF

#### **POST `/api/medicos/:rut/documento`** (Autenticado)

Sube un documento PDF del médico a AWS S3.

**Headers**:
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request** (FormData):
```
documento: File (PDF)
rut: "12345678-9"
```

**Response**:
```json
{
  "ok": true,
  "mensaje": "Documento subido correctamente",
  "documento": {
    "nombre": "Titulo_Medico.pdf",
    "url": "https://s3.amazonaws.com/..."
  }
}
```

**Características**:
- ✅ Solo archivos PDF
- ✅ Máximo 10MB
- ✅ Almacenamiento en: `documentos/medicos/{RUT}/{timestamp}_{filename}.pdf`
- ✅ Bucket privado con URLs firmadas

---

#### **GET `/api/medicos/:rut/documentos`** (Público)

Lista todos los documentos de un médico.

**Request**:
```http
GET /api/medicos/12345678-9/documentos
```

**Response**:
```json
{
  "ok": true,
  "documentos": [
    {
      "nombre": "Titulo_Medico.pdf",
      "key": "documentos/medicos/12345678-9/...",
      "url": "https://s3.amazonaws.com/...",
      "uploadedAt": "2025-11-17T10:30:00.000Z"
    }
  ],
  "total": 1
}
```

---

#### **DELETE `/api/medicos/:rut/documento`** (Autenticado)

Elimina un documento del médico.

**Headers**:
```
Authorization: Bearer <token>
```

**Request**:
```json
{
  "key": "documentos/medicos/12345678-9/1234567890_Titulo.pdf"
}
```

**Response**:
```json
{
  "ok": true,
  "mensaje": "Documento eliminado correctamente"
}
```

**Características**:
- ✅ Elimina de S3 y de la base de datos
- ✅ Validación de existencia

---

## 🎨 Punto 3: Interfaz de Usuario

### Servicio Angular

**Archivo**: `frontend/src/app/admin/pages/services/medico.service.ts`

#### Métodos Disponibles

```typescript
// Obtener perfil completo
obtenerPerfilMedico(rut: string): Observable<any>

// Actualizar información profesional
actualizarInfoProfesional(rut: string, info: any): Observable<any>

// Subir documento
subirDocumentoMedico(rut: string, documento: File): Observable<any>

// Listar documentos
listarDocumentosMedico(rut: string): Observable<any>

// Eliminar documento
eliminarDocumentoMedico(rut: string, key: string): Observable<any>
```

### Vista en Tabla de Horarios

**Archivo**: `frontend/src/app/pacientes/pages/busqueda-medico/`

**Mejoras visuales**:
- ✅ Ícono de información (ℹ️) junto al nombre del médico
- ✅ Especialidad mostrada debajo del nombre
- ✅ Modal de perfil completo al hacer clic

**HTML**:
```html
<div class="d-flex flex-column">
  <div class="d-flex align-items-center">
    <span>{{ bloque.medicoNombre }}</span>
    <!-- Ícono clickeable -->
    <button (click)="verPerfilMedico(bloque.rutMedico)"
            class="btn btn-link btn-sm p-0 ms-2">
      <i class="fa fa-info-circle text-primary"></i>
    </button>
  </div>
  <small class="text-muted">{{ bloque.especialidad }}</small>
</div>
```

### Modal de Perfil del Médico

**Componente**: `busqueda-medico.component.ts`

**Método**: `verPerfilMedico(rutMedico: string)`

**Características del Modal**:
- ✅ Imagen del médico (120px circular)
- ✅ Información profesional organizada por secciones
- ✅ Idiomas listados
- ✅ Certificaciones listadas
- ✅ Biografía justificada
- ✅ Documentos descargables (links a PDFs)
- ✅ Mensaje si no hay información adicional
- ✅ Ancho de 800px
- ✅ Loading mientras carga
- ✅ Manejo de errores

**Ejemplo visual del modal**:
```
╔═══════════════════════════════════════════════╗
║     👨‍⚕️ Dr. Juan Pérez González                ║
║          Cardiología                         ║
╠═══════════════════════════════════════════════╣
║  [Imagen circular 120px]                     ║
║                                              ║
║ 📋 INFORMACIÓN PROFESIONAL                    ║
║ ──────────────────────────                   ║
║ Título: Médico Cirujano                      ║
║ Universidad: U. de Chile (2005)              ║
║ Experiencia: 15 años                         ║
║                                              ║
║ 🌍 IDIOMAS                                    ║
║ ──────────────────────────                   ║
║ • Español                                    ║
║ • Inglés                                     ║
║                                              ║
║ 📎 DOCUMENTOS                                 ║
║ ──────────────────────────                   ║
║ 📄 Título Médico.pdf  [Descargar]           ║
║                                              ║
║              [✖ Cerrar]                      ║
╚═══════════════════════════════════════════════╝
```

---

## 📄 Punto 4: Sistema de Documentos PDF

### Configuración de S3

**Archivo**: `backend/config/s3.config.ts`

**Middleware Multer para PDFs**:
```typescript
export const uploadMedicoDocument = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET_NAME,
    acl: 'private', // Bucket privado
    key: function (req, file, cb) {
      // documentos/medicos/{RUT}/{timestamp}_{filename}.pdf
      const rut = req.params.rut;
      const timestamp = Date.now();
      const filename = `documentos/medicos/${rut}/${timestamp}_${file.originalname}`;
      cb(null, filename);
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024 // Máximo 10MB
  },
  fileFilter: function (req, file, cb) {
    // Solo PDFs
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF'));
    }
  }
});
```

### Funciones Helper

```typescript
// Eliminar documento de S3
deleteDocumentFromS3(key: string): Promise<boolean>

// Verificar si documento existe
documentExistsInS3(key: string): Promise<boolean>

// Generar URL firmada (reutiliza la función existente)
getSignedUrl(key: string, expiresIn?: number): string
```

### Estructura de Almacenamiento

```
AWS S3 Bucket
├── medicos/
│   ├── 12345678-9_1234567890.jpg (imágenes)
│   └── ...
└── documentos/
    └── medicos/
        └── 12345678-9/
            ├── 1700000001_Titulo_Medico_Cirujano.pdf
            ├── 1700000002_Certificado_Cardiologia.pdf
            └── 1700000003_Diploma_Especialidad.pdf
```

---

## 📖 Guía de Uso

### Para Administradores

#### 1. Actualizar Información Profesional de un Médico

**Opción A: Via Postman/Insomnia**

```http
PUT http://localhost:8000/api/medicos/12345678-9/info-profesional
Authorization: Bearer <token>
Content-Type: application/json

{
  "titulo_profesional": "Médico Cirujano",
  "universidad": "Universidad de Chile",
  "anio_titulacion": 2005,
  "anios_experiencia": 15,
  "idiomas": ["Español", "Inglés"],
  "certificaciones": [
    "Certificado en Ecocardiografía (2010)"
  ],
  "biografia": "Médico cardiólogo con amplia experiencia..."
}
```

**Opción B: Via Angular (futuro componente)**

```typescript
this.medicoService.actualizarInfoProfesional(rut, {
  titulo_profesional: "Médico Cirujano",
  anios_experiencia: 15,
  idiomas: ["Español", "Inglés"]
}).subscribe(response => {
  console.log('Actualizado:', response);
});
```

#### 2. Subir Documento PDF

**Via Postman**:
```
POST http://localhost:8000/api/medicos/12345678-9/documento
Authorization: Bearer <token>
Body: form-data
  - documento: [seleccionar archivo PDF]
  - rut: 12345678-9
```

**Via Angular** (ejemplo para futuro componente):
```typescript
subirDocumento(event: any, rutMedico: string) {
  const file = event.target.files[0];

  if (file && file.type === 'application/pdf') {
    this.medicoService.subirDocumentoMedico(rutMedico, file)
      .subscribe({
        next: (response) => {
          Swal.fire('Éxito', 'Documento subido correctamente', 'success');
        },
        error: (error) => {
          Swal.fire('Error', 'No se pudo subir el documento', 'error');
        }
      });
  } else {
    Swal.fire('Error', 'Solo se permiten archivos PDF', 'error');
  }
}
```

#### 3. Eliminar Documento

```typescript
eliminarDocumento(rutMedico: string, key: string) {
  Swal.fire({
    title: '¿Eliminar documento?',
    text: 'Esta acción no se puede deshacer',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      this.medicoService.eliminarDocumentoMedico(rutMedico, key)
        .subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Documento eliminado correctamente', 'success');
            this.cargarDocumentos(); // Recargar lista
          },
          error: () => {
            Swal.fire('Error', 'No se pudo eliminar el documento', 'error');
          }
        });
    }
  });
}
```

### Para Pacientes

#### Ver Perfil del Médico

1. Ir a "Agendar Cita"
2. Seleccionar especialidad y fecha
3. En la tabla de médicos disponibles, hacer clic en el ícono ℹ️
4. Ver perfil completo en modal
5. Revisar documentos, certificaciones, experiencia
6. Hacer clic en documentos para descargarlos
7. Cerrar modal y agendar cita

---

## 💡 Ejemplos de Implementación

### Ejemplo 1: Datos de Prueba en SQL

```sql
-- Actualizar médico con información completa
UPDATE medicos
SET
    titulo_profesional = 'Médico Cirujano',
    especialidad_medica = 'Cardiología',
    subespecialidad = 'Cardiología Intervencionista',
    registro_medico = '12345678',
    universidad = 'Universidad de Chile',
    anio_titulacion = 2005,
    anios_experiencia = 15,
    idiomas = '["Español", "Inglés", "Portugués"]',
    certificaciones = '["Certificado en Ecocardiografía (2010)", "Fellow American College of Cardiology (2015)", "Diplomado en Cardiología Intervencionista (2018)"]',
    biografia = 'Médico cardiólogo con amplia experiencia en el tratamiento de enfermedades cardiovasculares. Especializado en procedimientos mínimamente invasivos y con enfoque en la prevención de enfermedades cardíacas. Ha participado en múltiples investigaciones clínicas y conferencias internacionales.'
WHERE rut = '12345678-9'; -- Reemplazar con RUT real
```

### Ejemplo 2: Componente de Gestión de Documentos (HTML)

```html
<!-- Futuro componente para admin/médico -->
<div class="card">
  <div class="card-header">
    <h5>Gestión de Documentos Profesionales</h5>
  </div>
  <div class="card-body">

    <!-- Formulario de carga -->
    <div class="mb-3">
      <label for="documento" class="form-label">Subir Documento PDF</label>
      <input
        type="file"
        class="form-control"
        id="documento"
        accept=".pdf"
        (change)="subirDocumento($event)">
      <small class="text-muted">Máximo 10MB - Solo archivos PDF</small>
    </div>

    <!-- Lista de documentos -->
    <h6 class="mt-4">Documentos Actuales:</h6>
    <ul class="list-group">
      <li class="list-group-item d-flex justify-content-between align-items-center"
          *ngFor="let doc of documentos">
        <div>
          <i class="fa fa-file-pdf-o text-danger me-2"></i>
          <a [href]="doc.url" target="_blank">{{ doc.nombre }}</a>
          <small class="text-muted ms-2">
            {{ doc.uploadedAt | date:'dd/MM/yyyy HH:mm' }}
          </small>
        </div>
        <button
          class="btn btn-sm btn-danger"
          (click)="eliminarDocumento(doc.key)">
          <i class="fa fa-trash"></i>
        </button>
      </li>
      <li class="list-group-item text-center text-muted"
          *ngIf="documentos.length === 0">
        No hay documentos subidos
      </li>
    </ul>
  </div>
</div>
```

### Ejemplo 3: Componente TypeScript

```typescript
export class GestionDocumentosMedicoComponent implements OnInit {
  documentos: any[] = [];
  rutMedico: string = '';

  constructor(
    private medicoService: MedicoService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.rutMedico = this.route.snapshot.params['rut'];
    this.cargarDocumentos();
  }

  cargarDocumentos() {
    this.medicoService.listarDocumentosMedico(this.rutMedico)
      .subscribe(response => {
        this.documentos = response.documentos;
      });
  }

  subirDocumento(event: any) {
    const file = event.target.files[0];

    if (!file) return;

    if (file.type !== 'application/pdf') {
      Swal.fire('Error', 'Solo se permiten archivos PDF', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      Swal.fire('Error', 'El archivo no debe superar 10MB', 'error');
      return;
    }

    Swal.fire({
      title: 'Subiendo documento...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    this.medicoService.subirDocumentoMedico(this.rutMedico, file)
      .subscribe({
        next: (response) => {
          Swal.fire('Éxito', 'Documento subido correctamente', 'success');
          this.cargarDocumentos(); // Recargar lista
          // Limpiar input
          event.target.value = '';
        },
        error: (error) => {
          Swal.fire('Error', error.error.mensaje || 'No se pudo subir el documento', 'error');
        }
      });
  }

  eliminarDocumento(key: string) {
    Swal.fire({
      title: '¿Eliminar documento?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      confirmButtonColor: '#d33',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.medicoService.eliminarDocumentoMedico(this.rutMedico, key)
          .subscribe({
            next: () => {
              Swal.fire('Eliminado', 'Documento eliminado correctamente', 'success');
              this.cargarDocumentos();
            },
            error: () => {
              Swal.fire('Error', 'No se pudo eliminar el documento', 'error');
            }
          });
      }
    });
  }
}
```

---

## 📁 Archivos Modificados/Creados

### Backend
1. ✅ `backend/models/medico.ts` - Modelo extendido con nuevos campos
2. ✅ `backend/config/s3.config.ts` - Configuración de carga de PDFs
3. ✅ `backend/controllers/medico.ts` - 6 métodos nuevos
4. ✅ `backend/routes/medico.ts` - 5 rutas nuevas
5. ✅ `backend/migrations/add_medico_professional_info.sql` - Migración SQL

### Frontend
1. ✅ `frontend/src/app/admin/pages/services/medico.service.ts` - 5 métodos nuevos
2. ✅ `frontend/src/app/pacientes/pages/busqueda-medico/busqueda-medico.component.html` - Ícono agregado
3. ✅ `frontend/src/app/pacientes/pages/busqueda-medico/busqueda-medico.component.ts` - 2 métodos nuevos

### Documentación
1. ✅ `DOCUMENTACION_PERFIL_MEDICO.md` - Este documento

---

## 🚀 Próximos Pasos Sugeridos

### Mejoras Futuras

1. **Componente de Administración de Perfil**
   - Panel para que el médico edite su propia información
   - Interfaz drag-and-drop para subir documentos
   - Vista previa de PDFs antes de subir

2. **Validación de Documentos**
   - Sistema de aprobación por admin
   - Estado de documento (pendiente/aprobado/rechazado)
   - Notificaciones cuando se aprueba/rechaza

3. **Reseñas y Valoraciones**
   - Sistema de puntuación (1-5 estrellas)
   - Comentarios de pacientes
   - Filtrado por valoración

4. **Estadísticas del Médico**
   - Número de consultas realizadas
   - Promedio de valoración
   - Especialidades más solicitadas

5. **Búsqueda Avanzada**
   - Filtrar por idioma
   - Filtrar por años de experiencia
   - Filtrar por certificaciones específicas

---

## ❓ Preguntas Frecuentes

### ¿Cómo se almacenan los documentos?
Los documentos se almacenan en AWS S3 en un bucket privado. Se generan URLs firmadas temporales (1 hora) para acceder a ellos de forma segura.

### ¿Qué pasa si un médico no tiene información completa?
El modal mostrará solo los campos que estén completos y un mensaje indicando que el médico aún no ha completado su perfil.

### ¿Los pacientes pueden subir documentos?
No, solo los médicos y administradores pueden gestionar los documentos del perfil médico.

### ¿Cómo se actualizan las URLs firmadas?
Las URLs se generan dinámicamente cada vez que se consulta el perfil o la lista de documentos, por lo que siempre son válidas.

### ¿Puedo subir otros tipos de archivos además de PDF?
Actualmente solo se permiten PDFs por seguridad y estandarización. Si se requiere otro formato, se debe modificar el `fileFilter` en `s3.config.ts`.

---

## 📞 Soporte

Para reportar bugs o solicitar nuevas funcionalidades, contactar al equipo de desarrollo.

**Fecha de Documentación**: 17 de Noviembre, 2025
**Versión**: 1.0.0
