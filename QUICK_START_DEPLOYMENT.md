# 🚀 Quick Start - Despliegue en 30 Minutos

Guía ultra-rápida para desplegar tu app. Para detalles completos, ver `README_DEPLOYMENT.md`.

## 📋 Pre-requisitos

- [ ] Cuenta de GitHub
- [ ] Repositorio pusheado a GitHub
- [ ] 30 minutos de tiempo

---

## ⚡ Pasos Rápidos

### 1️⃣ Supabase (5 min)

1. Ir a [supabase.com](https://supabase.com) → Sign up
2. New Project → Nombre: `cita-medica-db`
3. Generar password (¡guardarla!)
4. Region: South America
5. Settings → Database → Copiar:
   - Host: `db.xxx.supabase.co`
   - User: `postgres.xxx`
   - Password: (la que generaste)

---

### 2️⃣ Render (10 min)

1. Ir a [render.com](https://render.com) → Sign up con GitHub
2. New + → Web Service
3. Conectar repo: `CitaProyect-Fullstack`
4. Configurar:
   ```
   Name: cita-medica-backend
   Region: Oregon
   Branch: main
   Root Directory: backend
   Runtime: Node
   Build Command: npm install && npm run build
   Start Command: npm start
   Instance Type: Free
   ```

5. Environment variables (copiar y pegar):
   ```bash
   NODE_ENV=production
   PORT=8000
   JWT_SECRET=CAMBIAR_POR_UNO_SEGURO_USAR_CRYPTO_RANDOMYTES
   DB_DIALECT=postgres
   DB_HOST=db.xxx.supabase.co
   DB_PORT=5432
   DB_NAME=postgres
   DB_USER=postgres.xxx
   DB_PASSWORD=TU_PASSWORD_DE_SUPABASE
   DB_SSL=true
   MERCADOPAGO_ACCESS_TOKEN=TU_TOKEN
   FRONTEND_URL=https://ACTUALIZAR_DESPUES.vercel.app
   BACKEND_URL=https://cita-medica-backend.onrender.com
   ```

6. Create Web Service → Esperar ~5 min
7. Copiar URL: `https://cita-medica-backend.onrender.com`
8. Settings → Deploy Hook → Create → Copiar URL

---

### 3️⃣ Vercel (5 min)

1. Ir a [vercel.com](https://vercel.com) → Sign up con GitHub
2. Add New → Project
3. Import repo: `CitaProyect-Fullstack`
4. Configurar:
   ```
   Framework: Angular
   Root Directory: frontend
   Build Command: npm run vercel-build
   Output Directory: dist/cita-proyect
   ```

5. Deploy → Esperar ~3 min
6. Copiar URL: `https://tu-app.vercel.app`

---

### 4️⃣ Actualizar URLs (3 min)

**En Render:**
1. Environment → Editar `FRONTEND_URL`
2. Poner: `https://tu-app.vercel.app`
3. Save → Esperar redespliegue

**En tu código local:**
1. Editar `frontend/src/environment/environment.prod.ts`:
   ```typescript
   export const environment = {
     production: true,
     base_url: 'https://cita-medica-backend.onrender.com/api'
   };
   ```

2. Commit y push:
   ```bash
   git add .
   git commit -m "chore: Actualizar URL de backend en producción"
   git push origin main
   ```

---

### 5️⃣ GitHub Actions (5 min)

1. GitHub repo → Settings → Secrets and variables → Actions
2. New repository secret → Agregar 4 secrets:

   **Frontend (de Vercel):**
   - `VERCEL_TOKEN`: Settings → Tokens → Create
   - `VERCEL_ORG_ID`: Settings → General
   - `VERCEL_PROJECT_ID`: Settings → General

   **Backend (de Render):**
   - `RENDER_DEPLOY_HOOK`: (la URL que copiaste)

---

### 6️⃣ Probar (2 min)

1. Abrir `https://tu-app.vercel.app`
2. Login con:
   - Email: `Shadowhearts@gmail.com`
   - Password: `Puppetmaster.9`
3. Si funciona → ¡Listo! 🎉

---

## 🐛 Si algo falla

### Backend no arranca en Render
- Ver Logs en Render
- Verificar que todas las env vars estén configuradas
- Revisar que `DB_SSL=true`

### Frontend no carga
- Vercel → Deployments → Ver logs
- Verificar que el build termine exitoso

### Login no funciona
- Render logs → Verificar conexión a Supabase
- Puede tardar 30-60 seg la primera vez (Render gratis duerme)

### CORS error
- Verificar que `FRONTEND_URL` en Render sea correcta
- Sin `/` al final

---

## 📊 Verificar que todo esté bien

```bash
# Debe responder con datos
curl https://cita-medica-backend.onrender.com/api/usuarios

# Frontend debe cargar sin errores
# Abrir consola del navegador en tu URL de Vercel
```

---

## 🎯 Comandos Útiles

**Local con MySQL (desarrollo):**
```bash
cd backend
npm run dev

cd frontend
npm start
```

**Build local:**
```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build:prod
```

**CI/CD automático:**
```bash
# Al hacer push a main, se despliega automáticamente
git add .
git commit -m "feat: Nueva funcionalidad"
git push origin main

# Ver progreso en GitHub → Actions
```

---

## 📱 Para tu CV

```markdown
🏥 Sistema de Gestión de Citas Médicas
Stack: Angular 16, Node.js, Express, TypeScript, PostgreSQL
Deploy: Vercel + Render + Supabase con CI/CD (GitHub Actions)
Features: Autenticación JWT, Integración MercadoPago, Arquitectura en capas

🔗 Demo: https://tu-app.vercel.app
📁 Código: https://github.com/tu-usuario/CitaProyect-Fullstack

⚠️ Nota: La primera carga puede tardar 30-60 seg (tier gratis de Render)
```

---

## 🔗 Links Útiles

- **Documentación completa**: `README_DEPLOYMENT.md`
- **Resumen de cambios**: `DEPLOYMENT_SUMMARY.md`
- **Render Dashboard**: https://dashboard.render.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://supabase.com/dashboard

---

## ⏱️ Tiempos Estimados

| Servicio | Setup | Primer Deploy | Redespliegue |
|----------|-------|---------------|--------------|
| Supabase | 5 min | Instantáneo   | N/A          |
| Render   | 10 min| 5-10 min      | 3-5 min      |
| Vercel   | 5 min | 2-5 min       | 1-2 min      |
| GitHub Actions | 5 min | N/A      | Automático   |

**Total**: ~30 min (primera vez) + 5-15 min (despliegues)

---

## ✅ Checklist Final

Antes de compartir tu portfolio:

- [ ] App funciona en producción
- [ ] Login funciona
- [ ] Crear cita funciona
- [ ] URLs actualizadas
- [ ] CI/CD funciona (hacer test push)
- [ ] README.md actualizado con URLs de producción
- [ ] .env no está en el repo (verificar .gitignore)
- [ ] Screenshots/GIFs para el README
- [ ] Link agregado a tu CV/LinkedIn

---

**¡Todo listo para impresionar a los reclutadores! 🚀**
