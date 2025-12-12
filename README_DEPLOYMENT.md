# 🚀 Guía de Despliegue - Sistema de Citas Médicas

Esta guía te ayudará a desplegar tu aplicación de gestión de citas médicas en servicios gratuitos con CI/CD automático usando GitHub Actions.

## 📋 Arquitectura de Despliegue

- **Frontend (Angular 16)**: Vercel (gratis, con CDN global)
- **Backend (Node.js/Express/TypeScript)**: Render (tier gratis, con sleep después de 15 min de inactividad)
- **Base de Datos**: Supabase PostgreSQL (gratis, con limitaciones menores)
- **CI/CD**: GitHub Actions (gratis para repositorios públicos)

---

## 🗄️ Paso 1: Configurar Supabase (Base de Datos)

### 1.1 Crear cuenta y proyecto

1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta gratuita
3. Clic en "New Project"
4. Completa:
   - **Name**: `cita-medica-db` (o el nombre que prefieras)
   - **Database Password**: Genera una contraseña segura (¡guárdala!)
   - **Region**: Selecciona la más cercana (por ejemplo, South America - São Paulo)
   - **Pricing Plan**: Free

### 1.2 Obtener credenciales de conexión

1. Una vez creado el proyecto, ve a **Settings** > **Database**
2. En la sección "Connection string", copia los datos:
   - **Host**: `db.xxxxxxxxxxxxxx.supabase.co`
   - **Database name**: `postgres`
   - **Port**: `5432`
   - **User**: `postgres.xxxxxxxxxxxxxx`
   - **Password**: La que generaste en el paso anterior

3. **Importante**: En el Connection String, selecciona el modo **Session** (no Transaction)

### 1.3 Habilitar conexiones directas

1. En **Settings** > **Database**
2. Desplázate hasta **Connection pooling**
3. Asegúrate de que esté habilitado

---

## 🔧 Paso 2: Configurar Render (Backend)

### 2.1 Crear cuenta

1. Ve a [render.com](https://render.com)
2. Crea una cuenta con GitHub (recomendado para CI/CD automático)

### 2.2 Crear Web Service

1. En el dashboard, clic en **New +** > **Web Service**
2. Conecta tu repositorio de GitHub
3. Selecciona tu repositorio: `CitaProyect-Fullstack`
4. Configura el servicio:

   **Basic Settings:**
   - **Name**: `cita-medica-backend` (o tu nombre)
   - **Region**: Oregon (mejor para tier gratis)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

   **Instance Type:**
   - Selecciona **Free**

### 2.3 Configurar Variables de Entorno

En la sección **Environment**, agrega estas variables:

```bash
NODE_ENV=production
PORT=8000

# JWT Secret - Genera uno nuevo con:
# node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=tu_nuevo_secreto_jwt_seguro

# Database (Supabase)
DB_DIALECT=postgres
DB_HOST=db.xxxxxxxxxxxxxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres.xxxxxxxxxxxxxx
DB_PASSWORD=tu_password_de_supabase
DB_SSL=true

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=tu_token_de_mercadopago

# URLs (actualizar después de crear el frontend en Vercel)
FRONTEND_URL=https://tu-app.vercel.app
BACKEND_URL=https://cita-medica-backend.onrender.com
```

**Nota**: No agregues `NGROK_URL` en producción, solo es para desarrollo local.

### 2.4 Deploy

1. Clic en **Create Web Service**
2. Espera a que el primer deploy termine (5-10 minutos)
3. Copia tu URL de Render: `https://cita-medica-backend.onrender.com`

### 2.5 Obtener Deploy Hook (para CI/CD)

1. Ve a **Settings** > **Deploy Hook**
2. Clic en **Create Deploy Hook**
3. Copia la URL generada (la necesitarás para GitHub Actions)

---

## ☁️ Paso 3: Configurar Vercel (Frontend)

### 3.1 Crear cuenta

1. Ve a [vercel.com](https://vercel.com)
2. Crea una cuenta con GitHub (recomendado)

### 3.2 Importar proyecto

1. Clic en **Add New** > **Project**
2. Selecciona tu repositorio: `CitaProyect-Fullstack`
3. Configura el proyecto:

   **Framework Preset**: Detectará Angular automáticamente

   **Build Settings:**
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `dist/cita-proyect`

   **Environment Variables:**
   - No es necesario agregar nada aquí, el archivo `environment.prod.ts` ya tiene la configuración

### 3.3 Deploy

1. Clic en **Deploy**
2. Espera a que termine (2-5 minutos)
3. Copia tu URL de Vercel: `https://tu-app.vercel.app`

### 3.4 Actualizar URL del Backend en Frontend

1. Ve a tu proyecto en Vercel
2. **Settings** > **Environment Variables**
3. O edita el archivo `frontend/src/environment/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  base_url: 'https://cita-medica-backend.onrender.com/api'
};
```

4. Commit y push el cambio para que se redespliegue

### 3.5 Obtener tokens para CI/CD

1. Ve a **Settings** > **Tokens**
2. Crea un nuevo token
3. Guarda el token (lo necesitarás para GitHub Actions)
4. También necesitarás:
   - **Vercel Org ID**: En **Settings** > **General**
   - **Vercel Project ID**: En **Settings** > **General**

---

## 🔄 Paso 4: Configurar GitHub Actions (CI/CD)

### 4.1 Actualizar URL del Backend en Render

1. Ve a Render, a tu servicio backend
2. **Environment** > Edita `FRONTEND_URL`
3. Actualiza con tu URL de Vercel: `https://tu-app.vercel.app`
4. Guarda y espera a que se redespliegue

### 4.2 Agregar Secrets a GitHub

1. Ve a tu repositorio en GitHub
2. **Settings** > **Secrets and variables** > **Actions**
3. Clic en **New repository secret**
4. Agrega los siguientes secrets:

   **Para Frontend (Vercel):**
   - `VERCEL_TOKEN`: El token que generaste en Vercel
   - `VERCEL_ORG_ID`: Tu Org ID de Vercel
   - `VERCEL_PROJECT_ID`: Tu Project ID de Vercel

   **Para Backend (Render):**
   - `RENDER_DEPLOY_HOOK`: La URL del deploy hook de Render

### 4.3 Probar CI/CD

1. Haz un cambio pequeño en el frontend o backend
2. Commit y push a `main`:
   ```bash
   git add .
   git commit -m "test: Probar CI/CD"
   git push origin main
   ```
3. Ve a **Actions** en GitHub para ver el progreso
4. Los workflows se ejecutarán automáticamente:
   - `deploy-frontend.yml`: Solo si hay cambios en `frontend/`
   - `deploy-backend.yml`: Solo si hay cambios en `backend/`

---

## 🔧 Paso 5: Configuración de MercadoPago en Producción

### 5.1 Actualizar webhook URL

Como en producción no necesitas ngrok, actualiza el archivo `backend/controllers/mercadoPago.ts`:

```typescript
notification_url: `${process.env.BACKEND_URL}/api/mercadoPago/webhook`
```

Esto usará automáticamente la URL de Render en producción.

### 5.2 Configurar cuenta de MercadoPago

1. Crea una cuenta de producción en MercadoPago (si aún no la tienes)
2. Ve a [developers.mercadopago.com](https://www.mercadopago.com/developers/panel)
3. Obtén tu **Access Token de producción**
4. Actualiza la variable `MERCADOPAGO_ACCESS_TOKEN` en Render

---

## 📊 Paso 6: Inicializar Base de Datos

### 6.1 Conectarse a Supabase

Puedes usar cualquier cliente PostgreSQL o la consola SQL de Supabase:

1. En Supabase, ve a **SQL Editor**
2. O usa tu cliente favorito (DBeaver, pgAdmin, etc.)

### 6.2 Ejecutar migraciones

La primera vez que el backend se inicie, Sequelize creará las tablas automáticamente gracias a `db.sync()`.

Sin embargo, si necesitas ejecutar scripts SQL manualmente:

1. Exporta tu schema actual de MySQL (si tienes datos):
   ```bash
   mysqldump -u root -p gestor > schema.sql
   ```

2. Convierte el schema de MySQL a PostgreSQL (herramientas recomendadas):
   - [pgloader](https://pgloader.io/)
   - Conversión manual ajustando tipos de datos

3. O simplemente deja que Sequelize cree las tablas y carga los datos iniciales

### 6.3 Verificar que las tablas se crearon

1. En Supabase, ve a **Table Editor**
2. Deberías ver todas las tablas creadas por Sequelize
3. Verifica que el usuario admin se haya creado (revisa `backend/db/initializer.ts`)

---

## ✅ Verificación Final

### Checklist

- [ ] ✅ Base de datos Supabase creada y accesible
- [ ] ✅ Backend desplegado en Render
- [ ] ✅ Frontend desplegado en Vercel
- [ ] ✅ Variables de entorno configuradas en ambos servicios
- [ ] ✅ URLs actualizadas (FRONTEND_URL y BACKEND_URL)
- [ ] ✅ GitHub Actions configurado con secrets
- [ ] ✅ CORS actualizado en el backend
- [ ] ✅ Puedes hacer login con el usuario admin
- [ ] ✅ CI/CD funciona al hacer push a main

### Probar la aplicación

1. Abre tu URL de Vercel: `https://tu-app.vercel.app`
2. Intenta hacer login con el usuario admin:
   - Email: `Shadowhearts@gmail.com`
   - Password: `Puppetmaster.9`
3. Si funciona, ¡felicidades! 🎉

---

## 🐛 Solución de Problemas Comunes

### Backend no se conecta a Supabase

**Error**: `connection refused` o `SSL required`

**Solución**:
1. Verifica que `DB_SSL=true` en las variables de entorno de Render
2. Asegúrate de usar el **Session Mode** connection string de Supabase
3. Revisa que el host sea correcto: `db.xxxxxxxxxxxxxx.supabase.co`

### Frontend no puede conectarse al Backend

**Error**: CORS error en la consola del navegador

**Solución**:
1. Verifica que `FRONTEND_URL` en Render tenga tu URL de Vercel correcta
2. Asegúrate de que no tenga `/` al final
3. Revisa los logs de Render para ver si llegan las peticiones

### Render se duerme (sleep)

**Comportamiento esperado**: El tier gratis de Render duerme después de 15 minutos de inactividad.

**Soluciones**:
1. **Para demo/CV**: La primera carga será lenta (30-60 segundos), luego funcionará normal
2. **Opcional**: Usa un servicio de ping (ej: [UptimeRobot](https://uptimerobot.com/)) para mantenerlo despierto
3. **Nota para reclutadores**: Agrega en tu CV que puede tardar en cargar la primera vez

### GitHub Actions falla

**Error**: `Error: Process completed with exit code 1`

**Solución**:
1. Revisa los logs en **Actions** para ver el error específico
2. Verifica que todos los secrets estén configurados correctamente
3. Asegúrate de que los workflows solo se ejecuten cuando hay cambios en sus directorios

---

## 💰 Costos y Limitaciones

### Vercel (Gratis)
- ✅ 100 GB de ancho de banda/mes
- ✅ Ilimitados deployments
- ✅ SSL automático
- ✅ CDN global

### Render (Gratis)
- ✅ 750 horas/mes (suficiente para un servicio)
- ⚠️ Sleep después de 15 min de inactividad
- ✅ 512 MB RAM
- ✅ SSL automático

### Supabase (Gratis)
- ✅ 500 MB de base de datos
- ✅ 2 GB de transferencia/mes
- ⚠️ Proyecto pausado después de 1 semana de inactividad (fácil de reactivar)
- ✅ 50,000 usuarios MAU

### GitHub Actions (Gratis)
- ✅ 2,000 minutos/mes (repositorios privados)
- ✅ Ilimitado para repositorios públicos

**Para un portfolio/CV**: Estos límites son más que suficientes.

---

## 🔐 Mejores Prácticas de Seguridad

1. **Nunca** commitees el archivo `.env` al repositorio
2. Usa contraseñas fuertes y únicas para cada servicio
3. Genera un nuevo `JWT_SECRET` para producción
4. Usa tokens de producción de MercadoPago (no de test)
5. Revisa periódicamente los logs de Render para detectar actividad sospechosa
6. Mantén las dependencias actualizadas: `npm audit fix`

---

## 📚 Recursos Adicionales

- [Documentación de Vercel](https://vercel.com/docs)
- [Documentación de Render](https://render.com/docs)
- [Documentación de Supabase](https://supabase.com/docs)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Sequelize con PostgreSQL](https://sequelize.org/docs/v6/other-topics/dialect-specific-things/#postgresql)

---

## 🆘 Soporte

Si tienes problemas con el despliegue:

1. Revisa los logs de cada servicio:
   - **Render**: Logs > Real-time logs
   - **Vercel**: Deployments > [Tu deploy] > Logs
   - **Supabase**: Logs > Database logs

2. Verifica que las variables de entorno estén correctamente configuradas

3. Comprueba que las URLs estén actualizadas en todos los servicios

---

## ✨ Siguiente Paso: Agregar al CV

Una vez que todo funcione, agrega a tu CV:

```
🏥 Sistema de Gestión de Citas Médicas
- Full-stack: Angular 16 + Node.js/Express + PostgreSQL
- Deployment: Vercel + Render + Supabase
- CI/CD: GitHub Actions
- Integración de pagos: MercadoPago
- 🔗 Demo: https://tu-app.vercel.app
- 📁 Código: https://github.com/tu-usuario/CitaProyect-Fullstack
```

**¡Éxito con tu búsqueda laboral! 🚀**
