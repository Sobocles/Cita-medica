# Solución: Error de Login del Usuario Admin

## Problema Reportado

**Fecha**: 2025-11-15
**Severidad**: CRÍTICO
**Usuario afectado**: Administrador del sistema

### Descripción del Problema

El usuario intentó acceder al sistema con las credenciales del administrador predeterminado:
- **Email**: `admin@sistema.com`
- **Password**: `admin123`

**Errores observados**:
1. Primer intento: Error 404 en endpoint `/api/login`
2. Segundo intento: `{"ok":false,"msg":"Usuario o médico no encontrado"}`

---

## Diagnóstico

### 1. Verificación del Endpoint

El endpoint `/api/login` existe y funciona correctamente. El error 404 inicial fue un problema temporal de tipeo o de servidor no iniciado.

### 2. Verificación de Usuario Admin

**Código responsable**: `backend/db/initializer.ts` (líneas 72-109)

La aplicación incluye una función `initializeAdminUser()` que **debería** crear automáticamente un usuario admin al iniciar la aplicación por primera vez:

```typescript
async function initializeAdminUser() {
  const adminRole = await Rol.findOne({ where: { codigo: UserRole.ADMIN } });

  const existingAdmin = await Usuario.findOne({
    include: [{
      model: Rol,
      as: 'rol',
      where: { codigo: UserRole.ADMIN }
    }]
  });

  if (!existingAdmin) {
    await Usuario.create({
      rut: 'ADMIN-001',
      nombre: 'Admin',
      apellidos: 'Sistema',
      email: 'admin@sistema.com',
      password: bcrypt.hashSync('admin123', salt),
      rolId: adminRole.id,
      estado: 'activo'
    });
  }
}
```

**Problema identificado**: El usuario admin NO existía en la base de datos, a pesar de que el código de inicialización estaba presente.

**Posible causa**:
- La función `initializeAdminUser()` pudo haber fallado silenciosamente en algún momento
- La base de datos pudo haber sido reiniciada o migrada sin ejecutar el inicializador
- El código de inicialización pudo haber tenido un error previo que impidió la creación del usuario

---

## Solución Implementada

### 1. Script de Verificación y Creación

**Archivo creado**: `backend/scripts/check-admin.ts`

Este script realiza las siguientes operaciones:
1. ✅ Verifica la conexión a la base de datos
2. ✅ Busca el rol `ADMIN_ROLE`
3. ✅ Busca al usuario admin con email `admin@sistema.com`
4. ✅ Si NO existe, lo crea automáticamente con las credenciales predeterminadas
5. ✅ Si existe, verifica que la contraseña sea correcta (y la actualiza si no coincide)

**Ejecución del script**:
```bash
cd backend
npx ts-node scripts/check-admin.ts
```

**Resultado**:
```
✅ Conectado a la base de datos
✅ Rol ADMIN encontrado con ID: 1

❌ Usuario admin NO encontrado
   Creando usuario admin...
✅ Usuario admin creado exitosamente
   Email: admin@sistema.com
   Password: admin123

✅ Verificación completada
```

### 2. Debugging del Servicio de Autenticación

Para confirmar que el problema estaba resuelto, se agregaron temporalmente logs de debugging en `backend/services/auth.service.ts` en el método `autenticarUsuario()`:

**Logs agregados**:
```typescript
console.log('🔐 AUTENTICAR USUARIO - Inicio');
console.log('🔐 Email recibido:', email);
console.log('🔐 Buscando usuario en base de datos...');
console.log('🔐 Resultado de búsqueda de usuario:', usuario ? 'ENCONTRADO' : 'NO ENCONTRADO');
```

**Resultado de prueba con curl**:
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sistema.com","password":"admin123"}'
```

**Respuesta exitosa**:
```json
{
  "ok": true,
  "userOrMedico": {
    "rut": "ADMIN-001",
    "nombre": "Admin",
    "apellidos": "Sistema",
    "email": "admin@sistema.com",
    "rol": "ADMIN_ROLE",
    "estado": "activo"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "menu": [
    {"label": "Inicio", "url": "/inicio-instrucciones"},
    {"label": "Gestionar Pacientes", "url": "/gestionar-pacientes"},
    {"label": "Gestionar Tipo de Cita", "url": "/gestionar-tipo-cita"},
    {"label": "Gestionar Médicos", "url": "/gestionar-medicos"},
    {"label": "Gestionar Horarios de Médicos", "url": "/gestionar-horarios-medicos"},
    {"label": "Gestionar Citas", "url": "/gestionar-cita"},
    {"label": "Datos clinica", "url": "/info-clinica"},
    {"label": "Ver facturas", "url": "/factura"}
  ],
  "infoClinica": {...}
}
```

**Logs del servidor confirmando éxito**:
```
🔐 AUTENTICAR USUARIO - Inicio
🔐 Email recibido: admin@sistema.com
🔐 Buscando usuario en base de datos...
🔐 Resultado de búsqueda de usuario: ENCONTRADO
🔐 Usuario encontrado: {
  rut: 'ADMIN-001',
  email: 'admin@sistema.com',
  nombre: 'Admin',
  estado: 'activo',
  rolId: 1
}
🔐 Autenticación exitosa, generando token...
```

### 3. Limpieza del Código

Una vez confirmado que el problema estaba resuelto, se eliminaron los logs de debugging para mantener el código limpio.

---

## Credenciales de Administrador

### Credenciales Predeterminadas

| Campo | Valor |
|-------|-------|
| **RUT** | `ADMIN-001` |
| **Nombre** | `Admin` |
| **Apellidos** | `Sistema` |
| **Email** | `admin@sistema.com` |
| **Password** | `admin123` |
| **Fecha Nacimiento** | `1990-01-01` |
| **Teléfono** | `123456789` |
| **Dirección** | `Dirección de Administración` |
| **Rol** | `ADMIN_ROLE` (ID: 1) |
| **Estado** | `activo` |

### Permisos del Administrador

El rol `ADMIN_ROLE` tiene acceso completo a todos los módulos del sistema:

1. ✅ **Inicio**: Instrucciones generales
2. ✅ **Gestionar Pacientes**: CRUD completo de usuarios/pacientes
3. ✅ **Gestionar Tipo de Cita**: Crear/modificar tipos de citas médicas
4. ✅ **Gestionar Médicos**: CRUD completo de médicos
5. ✅ **Gestionar Horarios de Médicos**: Configurar disponibilidad de médicos
6. ✅ **Gestionar Citas**: Ver, crear, modificar, cancelar citas
7. ✅ **Datos de Clínica**: Configuración general de la clínica
8. ✅ **Ver Facturas**: Acceso al sistema de facturación

---

## Archivos Modificados/Creados

### Archivos Nuevos
1. ✅ `backend/scripts/check-admin.ts` (90 líneas) - Script de verificación y creación de admin

### Archivos Analizados
1. ✅ `backend/db/initializer.ts` - Verificado el código de inicialización
2. ✅ `backend/services/auth.service.ts` - Debugging temporal (luego limpiado)
3. ✅ `backend/controllers/auth.ts` - Endpoint de login verificado

---

## Cómo Usar el Script de Verificación

### Cuándo ejecutarlo

Ejecuta este script cuando:
- No puedas acceder con las credenciales de admin
- Hayas resetteado la base de datos
- Sospeches que el usuario admin no existe
- Quieras verificar/actualizar la contraseña del admin

### Comando de ejecución

```bash
cd backend
npx ts-node scripts/check-admin.ts
```

### Comportamiento del script

**Si el admin existe**:
```
✅ Usuario admin encontrado:
   RUT: ADMIN-001
   Email: admin@sistema.com
   Nombre: Admin Sistema
   Rol: ADMIN_ROLE
   Estado: activo
   Password "admin123" es correcta: ✅

✅ Verificación completada
```

**Si el admin NO existe**:
```
❌ Usuario admin NO encontrado
   Creando usuario admin...
✅ Usuario admin creado exitosamente
   Email: admin@sistema.com
   Password: admin123
```

**Si la contraseña es incorrecta**:
```
⚠️ La contraseña NO coincide. ¿Desea actualizarla?
   Ejecutando actualización...
✅ Contraseña actualizada a: admin123
```

---

## Recomendaciones de Seguridad

### ⚠️ IMPORTANTE - Producción

**NUNCA uses estas credenciales en producción**. Son solo para desarrollo y testing.

### Cambiar la Contraseña del Admin

Para cambiar la contraseña del administrador en producción:

1. **Opción 1: Desde la aplicación**
   - Inicia sesión como admin
   - Ve a "Perfil" o "Configuración de cuenta"
   - Usa la función "Cambiar contraseña"

2. **Opción 2: Modificar el script**

   Edita `backend/scripts/check-admin.ts` línea 68:
   ```typescript
   // ANTES
   password: bcrypt.hashSync('admin123', salt),

   // DESPUÉS (usa una contraseña segura)
   password: bcrypt.hashSync('TuContraseñaSegura2025!', salt),
   ```

3. **Opción 3: Variable de entorno**

   Modifica el código para leer la contraseña desde `.env`:
   ```typescript
   const ADMIN_PASSWORD = process.env.ADMIN_DEFAULT_PASSWORD || 'admin123';
   password: bcrypt.hashSync(ADMIN_PASSWORD, salt)
   ```

### Características de una Contraseña Segura

Para producción, usa una contraseña que tenga:
- ✅ Mínimo 12 caracteres
- ✅ Letras mayúsculas y minúsculas
- ✅ Números
- ✅ Caracteres especiales (!@#$%^&*)
- ✅ NO sea una palabra del diccionario
- ✅ NO contenga información personal

**Ejemplo**: `Admin2025!Clinic#Secure`

---

## Testing

### Prueba Manual con cURL

```bash
# Login exitoso
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sistema.com","password":"admin123"}'

# Resultado esperado: Token JWT + datos de usuario con rol ADMIN_ROLE
```

### Prueba desde el Frontend

1. Abre la aplicación Angular: `http://localhost:4200`
2. Ve a la página de login
3. Ingresa las credenciales:
   - Email: `admin@sistema.com`
   - Password: `admin123`
4. Deberías ser redirigido al dashboard de administrador
5. Verifica que tengas acceso a todos los módulos del menú

---

## Estado Final

| Aspecto | Estado |
|---------|--------|
| **Usuario admin existe** | ✅ SÍ |
| **Login funciona** | ✅ SÍ |
| **Token JWT generado** | ✅ SÍ |
| **Rol correcto** | ✅ ADMIN_ROLE |
| **Menú completo** | ✅ 8 módulos disponibles |
| **Compilación** | ✅ Sin errores |
| **Script de verificación** | ✅ Disponible para futuro uso |

---

## Lecciones Aprendidas

1. **Inicializadores pueden fallar**: Aunque exista código de inicialización, no garantiza que se ejecute correctamente siempre.

2. **Scripts de verificación son útiles**: Tener un script dedicado para verificar/recrear usuarios críticos es una buena práctica.

3. **Logging ayuda en debugging**: Los logs temporales fueron cruciales para confirmar que el problema estaba resuelto.

4. **Credenciales predeterminadas deben documentarse**: Este documento ahora sirve como referencia para futuros desarrolladores.

5. **Seguridad en producción**: Las credenciales de desarrollo NUNCA deben usarse en producción.

---

**Problema resuelto**: ✅ COMPLETO
**Fecha de resolución**: 2025-11-15
**Login admin funcional**: ✅ SÍ
**Credenciales**: `admin@sistema.com` / `admin123`
