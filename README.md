# 🏥 Sistema de Gestión de Citas Médicas

[![Backend CI/CD](https://github.com/Sobocles/Cita-medica/actions/workflows/deploy-backend.yml/badge.svg)](https://github.com/Sobocles/Cita-medica/actions/workflows/deploy-backend.yml)
[![Frontend CI/CD](https://github.com/Sobocles/Cita-medica/actions/workflows/deploy-frontend.yml/badge.svg)](https://github.com/Sobocles/Cita-medica/actions/workflows/deploy-frontend.yml)
[![CI - Pull Request Checks](https://github.com/Sobocles/Cita-medica/actions/workflows/ci.yml/badge.svg)](https://github.com/Sobocles/Cita-medica/actions/workflows/ci.yml)

Plataforma web full-stack para la gestión integral de citas médicas, desarrollada con Angular 16 y Node.js/Express con TypeScript.

##Demo<br>
https://cita-medica-cyan.verce<br>

## Demo Credentials<br>
Para acceder a las funciones de administración de la aplicación, utilice las siguientes credenciales de demostración<br>

- **Email:** admin@sistema.com<br>
- **Password:** admin123<br>


## 📋 Descripción

Sistema completo de gestión de citas médicas que permite:

- **Administradores**: Gestionar médicos, pacientes, tipos de citas, horarios y citas médicas
- **Pacientes**: Registrarse, buscar médicos por especialidad, agendar citas y realizar pagos mediante MercadoPago
- **Médicos**: Gestionar historiales médicos de pacientes y visualizar sus citas programadas

## 🚀 Inicio Rápido con Docker

### Prerrequisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y en ejecución
- Puerto 3308 (MySQL), 8000 (Backend) y 4200 (Frontend) disponibles

### Instrucciones de Ejecución

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd CitaProyect-Fullstack
   ```

2. **Configurar variables de entorno**
   ```bash
   # Copiar el archivo de ejemplo
   cp backend/.env.example backend/.env
   ```

   **IMPORTANTE**: El archivo `.env` ya está configurado con valores de desarrollo. Si deseas usar la funcionalidad de pagos con MercadoPago, deberás actualizar el token de acceso (ver sección de MercadoPago más abajo).

3. **Levantar la aplicación completa**
   ```bash
   docker-compose up
   ```

   Esto iniciará automáticamente:
   - **MySQL** en puerto 3308
   - **Backend** en puerto 8000
   - **Frontend** en puerto 4200

4. **Acceder a la aplicación**
   - **Frontend**: http://localhost:4200
   - **Backend API**: http://localhost:8000/api

5. **Credenciales de acceso**

   Al iniciar por primera vez, el sistema crea automáticamente un usuario administrador:

   **Administrador**:
   - Email: `admin@sistema.com`
   - Password: `
   - admin123`

---

## 🎯 Funcionalidades Principales

### Administradores
- ✅ Gestión completa de médicos (CRUD)
- ✅ Gestión de pacientes
- ✅ Configuración de tipos de citas (especialidades, precios, duración)
- ✅ Administración de horarios médicos
- ✅ Visualización y gestión de citas programadas

### Pacientes
- ✅ Registro y autenticación
- ✅ Búsqueda de médicos por especialidad y fecha
- ✅ Reserva de citas médicas
- ✅ Pago integrado con MercadoPago
- ✅ Visualización de historial médico

### Médicos
- ✅ Registro de historiales médicos
- ✅ Visualización de citas programadas
- ✅ Gestión de perfil profesional

---

## 🛠 Stack Tecnológico

### Frontend
- **Angular 16**: Framework principal
- **TypeScript**: Lenguaje de programación
- **Bootstrap 5**: Framework CSS (vía CDN)
- **Angular Material**: Componentes UI
- **RxJS**: Programación reactiva

### Backend
- **Node.js**: Entorno de ejecución
- **Express**: Framework web
- **TypeScript**: Lenguaje de programación
- **Sequelize**: ORM para MySQL
- **JWT**: Autenticación
- **bcrypt**: Encriptación de contraseñas

### Base de Datos
- **MySQL 8.0**: Base de datos relacional

### Servicios Externos
- **MercadoPago**: Procesamiento de pagos

---

## 💳 Configuración de Pagos con MercadoPago (Opcional)

Si deseas probar la funcionalidad de pagos, sigue estos pasos:

### 1. Configurar ngrok para webhooks

MercadoPago requiere una URL pública para enviar notificaciones de pago. En desarrollo local, usa ngrok:

```bash
# Descargar ngrok desde https://ngrok.com/download
# Ejecutar (con el backend corriendo):
ngrok http 8000
```

Esto generará una URL pública similar a:
```
https://xxxx-xxxx-xxxx.ngrok-free.app
```

### 2. Actualizar configuración

Edita el archivo `backend/.env` y actualiza la variable `NGROK_URL`:
```env
NGROK_URL=https://tu-url-generada.ngrok-free.app
```

**IMPORTANTE**: Cada vez que detengas el backend, la URL de ngrok expirará. Deberás repetir este proceso.

### 3. Iniciar sesión en MercadoPago

Para realizar pagos de prueba:

1. Accede a [MercadoPago Developers](https://www.mercadopago.cl/developers)
2. Haz clic en "Ingresar" (esquina superior derecha)
3. Usa las credenciales de prueba:
   - **Usuario**: `TESTUSER90381648`
   - **Contraseña**: `tCfitcy8wl`

### 4. Tarjetas de prueba

Usa estas tarjetas para simular pagos:

**Visa - Pago Aprobado**:
- Número: `4023 6535 2391 4373`
- CVV: `123`
- Fecha: `11/25`
- Titular: `APRO`

**Visa - Pago Rechazado**:
- Número: `4023 6535 2391 4373`
- CVV: `123`
- Fecha: `11/25`
- Titular: `OTHE`

Más tarjetas de prueba: [MercadoPago Test Cards](https://www.mercadopago.cl/developers/es/docs/checkout-pro/additional-content/test-cards)

---

## 🔧 Desarrollo sin Docker

Si prefieres ejecutar el proyecto sin Docker:

### Backend

```bash
cd backend

# Instalar dependencias
npm install

# Configurar base de datos MySQL local
# Crear base de datos 'gestor'

# Configurar .env con tus credenciales de MySQL local
# DB_HOST=localhost
# DB_PORT=3306

# Compilar TypeScript
npm run build
# o en modo watch
npm run watch

# Ejecutar servidor
npm start
# o con nodemon
nodemon dist/app.js
```

### Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Ejecutar servidor de desarrollo
npm start
# o
ng serve
```

**NOTA**: El frontend requiere conexión a internet ya que utiliza Bootstrap desde CDN.

---

## 📁 Estructura del Proyecto

```
CitaProyect-Fullstack/
├── backend/                 # API REST (Node.js + Express + TypeScript)
│   ├── controllers/         # Controladores de rutas
│   ├── services/           # Lógica de negocio
│   ├── repositories/       # Capa de acceso a datos
│   ├── models/             # Modelos Sequelize
│   ├── routes/             # Definición de rutas
│   ├── middlewares/        # Validación JWT, etc.
│   ├── db/                 # Configuración de base de datos
│   └── dist/               # JavaScript compilado
├── frontend/               # Aplicación Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── admin/      # Módulo de administración
│   │   │   ├── medicos/    # Módulo de médicos
│   │   │   ├── pacientes/  # Módulo de pacientes
│   │   │   └── auth/       # Autenticación
│   │   └── ...
└── docker-compose.yml      # Configuración Docker
```

---

## 🗄 Base de Datos

La base de datos se inicializa automáticamente al ejecutar Docker con:

- **3 roles**: Administrador, Médico, Paciente
- **Usuario administrador por defecto** (credenciales arriba)
- **Tablas**: usuarios, medicos, citas_medicas, tipos_citas, horarios_medicos, historiales_medicos, facturas

---

## 🐳 Comandos Docker Útiles

```bash
# Iniciar servicios
docker-compose up

# Iniciar en segundo plano
docker-compose up -d

# Detener servicios
docker-compose down

# Ver logs
docker-compose logs -f

# Reconstruir contenedores (si cambias Dockerfile)
docker-compose up --build

# Eliminar todo (incluye volúmenes de base de datos)
docker-compose down -v
```

---

## 🔒 Seguridad

- Autenticación mediante **JWT**
- Contraseñas encriptadas con **bcrypt**
- Validación de datos con **express-validator**
- Variables de entorno para credenciales sensibles
- **.env** excluido del repositorio (usar `.env.example` como plantilla)

---

## 🔄 CI/CD con GitHub Actions

El proyecto cuenta con pipelines automatizados de CI/CD configurados con GitHub Actions:

### Workflows Implementados

**1. Backend CI/CD** (`.github/workflows/deploy-backend.yml`)
- **Trigger**: Push o PR a `main` con cambios en `backend/`
- **Proceso**:
  - ✅ TypeScript linting y type checking
  - 🔨 Build de TypeScript a JavaScript
  - ✅ Validación de artefactos de build
  - 🚀 Despliegue automático a Render (solo en push a main)

**2. Frontend CI/CD** (`.github/workflows/deploy-frontend.yml`)
- **Trigger**: Push o PR a `main` con cambios en `frontend/`
- **Proceso**:
  - ✅ Linting de Angular (si está configurado)
  - 🔨 Build de producción de Angular
  - ✅ Validación de artefactos de build
  - 🚀 Vercel despliega automáticamente vía integración GitHub (no requiere secrets)

**3. CI - Pull Request Checks** (`.github/workflows/ci.yml`)
- **Trigger**: Pull requests a `main` o `develop`
- **Proceso**:
  - ✅ Validación de backend (si hay cambios)
  - ✅ Validación de frontend (si hay cambios)
  - 📊 Resumen de validaciones en el PR

### Secretos Requeridos en GitHub

Para que los workflows funcionen, configura estos secretos en GitHub Settings → Secrets and variables → Actions:

**Backend (Render)**:
- `RENDER_DEPLOY_HOOK`: URL del deploy hook de Render

**Frontend (Vercel)**:
- ℹ️ No requiere secretos - Vercel despliega automáticamente mediante su integración nativa con GitHub
- El workflow solo valida que el build sea exitoso antes del deploy

### Estado de los Workflows

Los badges en la parte superior del README muestran el estado actual de cada workflow. Puedes ver los detalles de cada ejecución en la pestaña [Actions](https://github.com/Sobocles/Cita-medica/actions) del repositorio.

---

## 🌐 Despliegue en Producción

La aplicación está desplegada y disponible en:

- **Frontend (Vercel)**: https://cita-medica-cyan.vercel.app
- **Backend (Render)**: https://cita-medica-hzlc.onrender.com
- **Base de Datos**: Supabase (PostgreSQL)

### Credenciales de Producción

**Administrador**:
- Email: `admin@sistema.com`
- Password: `admin123`

**⚠️ Nota importante**: El backend en Render (tier gratis) se suspende después de 15 minutos de inactividad. La primera carga puede tardar 30-60 segundos mientras el servicio se reactiva.

### Documentación de Despliegue

Para instrucciones detalladas sobre cómo desplegar tu propia instancia, consulta:
- **Guía rápida (30 min)**: `QUICK_START_DEPLOYMENT.md`
- **Guía completa**: `README_DEPLOYMENT.md`
- **Resumen técnico**: `DEPLOYMENT_SUMMARY.md`

---

## 📞 Contacto

**Desarrollador**: Sebastián Morales Pincheira
**Email**: smoralespincheira@gmail.com

---

## 📝 Notas Adicionales

- **Conexión a Internet requerida**: El frontend usa Bootstrap desde CDN
- **Puertos utilizados**: 3308 (MySQL), 8000 (Backend), 4200 (Frontend)
- **Persistencia de datos**: MySQL usa volúmenes de Docker para persistir datos entre reinicios
- **Hot reload**: Los contenedores están configurados para recargar automáticamente al detectar cambios en el código

---

## 🎓 Licencia

Este proyecto es de código abierto y está disponible para fines educativos y de demostración.

---

**¡Gracias por revisar este proyecto!** 🚀
