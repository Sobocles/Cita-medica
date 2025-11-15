# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Medical appointment management platform for clinics, built with Angular 16 frontend and Node.js/Express/TypeScript backend. The system supports three user roles: administrators (manage doctors, patients, appointments, schedules), patients (book and pay for appointments via MercadoPago), and doctors (manage medical histories and view their appointments).

## Development Commands

### Backend (Node.js + Express + TypeScript)

Located in `backend/` directory:

```bash
# Install dependencies
npm install

# Build TypeScript to JavaScript
npm run build
# or continuous watch mode
npm run watch
# or
tsc --watch

# Start server (after building)
npm start
# or with nodemon
nodemon dist/app.js

# Development (build + start)
npm run dev
```

**Important**: Backend runs on port 8000. When making changes to TypeScript files, ensure `tsc --watch` is running to compile changes to the `dist/` folder.

### Frontend (Angular 16)

Located in `frontend/` directory:

```bash
# Install dependencies
npm install

# Serve development server (requires internet for Bootstrap CDN)
npm start
# or
ng serve

# Build for production
npm run build
# or
ng build

# Run tests
npm test
# or
ng test
```

**Important**: Frontend runs on port 4200 and requires internet connection as it uses Bootstrap CDN for styling.

### Docker

Run entire stack with Docker Compose:

```bash
docker-compose up
```

Services:
- MySQL: Port 3308 (external) → 3306 (internal)
- Backend: Port 8000
- Frontend: Port 4200

## Architecture

### Backend Architecture

The backend follows a **layered architecture** with clear separation of concerns:

**Layer Structure** (from routes to database):
```
Routes → Controllers → Services → Repositories → Models → Database
```

**Directory Structure**:
- `routes/` - Express route definitions (API endpoints)
- `controllers/` - Request/response handling and validation
- `services/` - Business logic layer
- `repositories/` - Data access layer (abstracts database operations)
- `models/` - Sequelize ORM models (database table definitions)
- `db/` - Database connection and initialization
- `middlewares/` - JWT validation, field validation
- `dtos/` - Data Transfer Objects for type safety
- `interfaces/` - TypeScript interface definitions
- `helpers/` - Utility functions
- `Utils/` - Additional utilities

**Key Files**:
- `app.ts` - Application entry point, initializes database and starts server
- `models/server.ts` - Express server setup, middleware configuration, route mounting
- `models/associations.ts` - Sequelize model relationships (foreign keys, cascade rules)
- `db/connection.ts` - Sequelize database connection
- `db/initializer.ts` - Database initialization (creates default data like roles)

**Database**: MySQL with Sequelize ORM. Connection configured via environment variables (`.env` file).

**Authentication**: JWT-based authentication. Middleware validates tokens for protected routes.

**API Endpoints** (all prefixed with `/api`):
- `/api/login` - Authentication
- `/api/usuarios` - User management
- `/api/medicos` - Doctor management
- `/api/cita_medica` - Appointment management
- `/api/tipo_cita` - Appointment types
- `/api/horario_medico` - Doctor schedules
- `/api/horario_clinica` - Clinic hours
- `/api/historial` - Medical histories
- `/api/busqueda` - General search
- `/api/busqueda_cita` - Appointment search
- `/api/mercadoPago` - Payment processing

### Frontend Architecture

Angular 16 application with **feature module architecture**:

**Module Structure**:
- `app/` - Root module
- `app/auth/` - Authentication module (login, registration)
- `app/admin/` - Admin dashboard module (manage doctors, patients, appointments, schedules)
- `app/medicos/` - Doctor module (medical histories, view appointments)
- `app/pacientes/` - Patient module (book appointments, view histories)
- `app/shared/` - Shared components, services, validators
- `app/material/` - Angular Material module exports
- `app/models/` - TypeScript interfaces/models

**Key Concepts**:
- Lazy-loaded feature modules for better performance
- Route guards for authentication/authorization (`auth/guards/`)
- Services for API communication and state management
- Bootstrap 5 + Angular Material for UI

## Important Configuration Notes

### MercadoPago Payment Integration

The backend uses **ngrok** to expose localhost for MercadoPago webhooks during development.

**Setup Process**:
1. Start backend on port 8000
2. Run ngrok: `.\ngrok.exe http 8000` (ngrok.exe is in backend/)
3. Copy the generated URL (e.g., `https://xxxx.ngrok.io`)
4. Update `notification_url` in `backend/controllers/mercadoPago.ts`:
   ```typescript
   notification_url: "https://xxxx.ngrok.io/api/mercadoPago/webhook"
   ```
5. **Important**: Run `tsc --watch` before updating the URL so changes are compiled

**Note**: ngrok URLs expire when backend stops. Repeat this process each time you restart the backend.

**Test Credentials**:
- MercadoPago Test User: `TESTUSER90381648` / `tCfitcy8wl`
- Test Card (Visa): `4023 6535 2391 4373`, CVV: `123`, Exp: `11/25`, Name: `APRO` (approved) or `OTHE` (rejected)

### Database Configuration

Environment variables in `backend/.env`:
- `DB_HOST` - Database host (default: localhost, docker: mysql)
- `DB_PORT` - Database port (default: 3306)
- `DB_NAME` - Database name (default: gestor)
- `DB_USER` - Database user (default: root)
- `DB_PASSWORD` - Database password (default: puppetmaster)
- `PORT` - Backend server port (default: 8000)

**Docker**: MySQL runs on port 3308 externally to avoid conflicts with local MySQL instances.

### Default Admin Account

Email: `Shadowhearts@gmail.com`
Password: `Puppetmaster.9`

## Model Relationships

Key Sequelize associations defined in `models/associations.ts`:

- **Usuario** (Patient) → hasMany → **CitaMedica**, **HistorialMedico**
- **Medico** (Doctor) → hasMany → **CitaMedica**, **HorarioMedic**
- **TipoCita** → hasOne → **CitaMedica**
- **CitaMedica** → belongsTo → **Usuario** (paciente), **Medico**, **TipoCita**
- **CitaMedica** → hasOne → **Factura**
- **HistorialMedico** → belongsTo → **Usuario** (paciente), **Medico**
- **Usuario**, **Medico** → belongsTo → **Rol**

**Cascade Deletes**: Most relationships have `onDelete: 'CASCADE'` to maintain referential integrity.

## Common Workflows

### Adding a New Backend Feature

1. Define model in `models/` if new entity required
2. Add associations in `models/associations.ts`
3. Create repository in `repositories/` for data access
4. Create service in `services/` for business logic
5. Create controller in `controllers/` for request handling
6. Define routes in `routes/`
7. Mount routes in `models/server.ts` under `apiPaths` and `routes()` method
8. Run `tsc --watch` to compile changes
9. Test with `nodemon dist/app.js`

### Adding a New Frontend Feature

1. Generate component/service: `ng generate component/service path/name`
2. Add to appropriate feature module (admin/medicos/pacientes)
3. Define routes in module's routing file
4. Create service in module's `services/` for API calls
5. Test with `ng serve`

## Technology Stack

**Backend**:
- TypeScript 5.1
- Node.js + Express
- Sequelize ORM (MySQL)
- JWT for authentication
- bcrypt for password hashing
- MercadoPago SDK for payments
- Nodemailer for email
- express-validator for input validation

**Frontend**:
- Angular 16
- Bootstrap 5 (via CDN)
- Angular Material
- FullCalendar for calendar views
- SweetAlert2 for alerts
- RxJS for reactive programming

**Database**:
- MySQL 8.0

**DevOps**:
- Docker + Docker Compose
- ngrok for local webhook testing
