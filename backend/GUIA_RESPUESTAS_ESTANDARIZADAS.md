# Guía de Respuestas Estandarizadas - ResponseHelper

## 📋 Problema Resuelto

**Antes**: Los controladores usaban múltiples formatos de respuesta inconsistentes:
- `{ error: "..." }`
- `{ msg: "..." }`
- `{ ok, msg }`
- Texto simple con `res.send()`

**Ahora**: Todas las respuestas siguen un formato estandarizado:
```typescript
{
  ok: boolean,
  msg?: string,
  data?: any,
  errors?: any
}
```

---

## 🎯 Formato Estándar de Respuestas

### ✅ Respuesta Exitosa
```json
{
  "ok": true,
  "msg": "Operación exitosa",
  "data": { ... }
}
```

### ❌ Respuesta de Error
```json
{
  "ok": false,
  "msg": "Descripción del error",
  "errors": { ... }
}
```

---

## 📚 Métodos Disponibles en ResponseHelper

### 1. `ResponseHelper.success(res, data?, msg?)`
**Uso**: Respuesta exitosa genérica (200 OK)
```typescript
return ResponseHelper.success(res, { usuario }, 'Usuario obtenido exitosamente');
// Respuesta: { ok: true, msg: "...", data: { usuario } }
```

### 2. `ResponseHelper.successWithCustomData(res, customData)`
**Uso**: Respuesta exitosa con propiedades personalizadas (retrocompatibilidad)
```typescript
return ResponseHelper.successWithCustomData(res, {
  usuarios: pacientes,
  total: pacientes.length
});
// Respuesta: { ok: true, usuarios: [...], total: 10 }
```

### 3. `ResponseHelper.created(res, data?, msg?)`
**Uso**: Recurso creado (201 Created)
```typescript
return ResponseHelper.created(res, { cita }, 'Cita creada exitosamente');
// Status: 201
```

### 4. `ResponseHelper.badRequest(res, msg, errors?)`
**Uso**: Error de validación (400 Bad Request)
```typescript
return ResponseHelper.badRequest(res, 'Datos inválidos', validationErrors);
// Status: 400
```

### 5. `ResponseHelper.unauthorized(res, msg?)`
**Uso**: No autenticado (401 Unauthorized)
```typescript
return ResponseHelper.unauthorized(res, 'Token inválido');
// Status: 401
```

### 6. `ResponseHelper.forbidden(res, msg?)`
**Uso**: Sin permisos (403 Forbidden)
```typescript
return ResponseHelper.forbidden(res, 'No tienes permisos');
// Status: 403
```

### 7. `ResponseHelper.notFound(res, msg?)`
**Uso**: Recurso no encontrado (404 Not Found)
```typescript
return ResponseHelper.notFound(res, 'Usuario no encontrado');
// Status: 404
```

### 8. `ResponseHelper.conflict(res, msg?)`
**Uso**: Conflicto - recurso ya existe (409 Conflict)
```typescript
return ResponseHelper.conflict(res, 'El email ya está registrado');
// Status: 409
```

### 9. `ResponseHelper.serverError(res, msg?, error?)`
**Uso**: Error interno (500 Internal Server Error)
```typescript
return ResponseHelper.serverError(res, 'Error al procesar', error);
// Status: 500
// En desarrollo incluye detalles del error
```

### 10. `ResponseHelper.paginated(res, data, total, page?, limit?, msg?)`
**Uso**: Respuesta paginada
```typescript
return ResponseHelper.paginated(res, usuarios, 100, 1, 10);
// Respuesta: { ok: true, data: [...], total: 100, page: 1, limit: 10 }
```

---

## 🔄 Cómo Migrar un Controlador

### ❌ ANTES (Inconsistente)
```typescript
import { Request, Response } from 'express';

export const getUsuario = async (req: Request, res: Response) => {
    try {
        const usuario = await service.find(id);

        if (!usuario) {
            return res.status(404).json({
                ok: false,
                msg: 'Usuario no encontrado'
            });
        }

        res.json({
            ok: true,
            usuario
        });
    } catch (error: any) {
        res.status(500).json({
            ok: false,
            msg: 'Error interno',
            error: error.message
        });
    }
};
```

### ✅ DESPUÉS (Estandarizado)
```typescript
import { Request, Response } from 'express';
import ResponseHelper from '../helpers/response.helper';

export const getUsuario = async (req: Request, res: Response) => {
    try {
        const usuario = await service.find(id);

        if (!usuario) {
            return ResponseHelper.notFound(res, 'Usuario no encontrado');
        }

        return ResponseHelper.successWithCustomData(res, { usuario });
    } catch (error: any) {
        console.error('Error al obtener usuario:', error);
        return ResponseHelper.serverError(res, 'Error al obtener usuario', error);
    }
};
```

---

## 📝 Ejemplos por Caso de Uso

### Caso 1: Obtener un recurso por ID
```typescript
export const getMedico = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const medico = await medicoService.getMedicoById(id);

        return ResponseHelper.successWithCustomData(res, { medico });
    } catch (error: any) {
        console.error('Error al obtener médico:', error);

        if (error.message === 'Médico no encontrado') {
            return ResponseHelper.notFound(res, error.message);
        }

        return ResponseHelper.serverError(res, 'Error al obtener médico', error);
    }
};
```

### Caso 2: Crear un recurso
```typescript
export const crearCita = async (req: Request, res: Response) => {
    try {
        const cita = await citaService.crearCita(req.body);

        return ResponseHelper.created(res, { cita }, 'Cita creada exitosamente');
    } catch (error: any) {
        console.error('Error al crear cita:', error);
        return ResponseHelper.badRequest(res, error.message);
    }
};
```

### Caso 3: Actualizar un recurso
```typescript
export const putMedico = async (req: Request, res: Response) => {
    try {
        const { rut } = req.params;
        const medico = await medicoService.updateMedico(rut, req.body);

        return ResponseHelper.successWithCustomData(res, {
            medico,
            msg: 'Médico actualizado correctamente'
        });
    } catch (error: any) {
        console.error('Error al actualizar médico:', error);

        if (error.message === 'Médico no encontrado') {
            return ResponseHelper.notFound(res, error.message);
        }

        return ResponseHelper.badRequest(res, error.message);
    }
};
```

### Caso 4: Eliminar un recurso
```typescript
export const deleteMedico = async (req: Request, res: Response) => {
    try {
        const { rut } = req.params;
        await medicoService.deleteMedico(rut);

        return ResponseHelper.success(res, undefined, 'Médico eliminado correctamente');
    } catch (error: any) {
        console.error('Error al eliminar médico:', error);

        if (error.message === 'Médico no encontrado') {
            return ResponseHelper.notFound(res, error.message);
        }

        return ResponseHelper.badRequest(res, error.message);
    }
};
```

### Caso 5: Listar recursos con paginación
```typescript
export const getCitas = async (req: Request, res: Response) => {
    try {
        const desde = Number(req.query.desde) || 0;
        const limite = 5;
        const { citas, total } = await citaService.getCitas(desde, limite);

        return ResponseHelper.successWithCustomData(res, {
            citas,
            total
        });
    } catch (error: any) {
        console.error('Error al obtener citas:', error);
        return ResponseHelper.serverError(res, 'Error al obtener citas', error);
    }
};
```

---

## 🎯 Patrón Recomendado para Manejo de Errores

```typescript
export const miControlador = async (req: Request, res: Response) => {
    try {
        // 1. Validación de entrada (ya manejada por middleware)

        // 2. Lógica de negocio (delegada al servicio)
        const resultado = await miServicio.metodo(datos);

        // 3. Respuesta exitosa
        return ResponseHelper.successWithCustomData(res, { resultado });

    } catch (error: any) {
        console.error('Error en miControlador:', error);

        // 4. Manejo de errores específicos
        if (error.message === 'No encontrado') {
            return ResponseHelper.notFound(res, error.message);
        }

        if (error.message === 'Ya existe') {
            return ResponseHelper.conflict(res, error.message);
        }

        if (error.message.includes('validación')) {
            return ResponseHelper.badRequest(res, error.message);
        }

        // 5. Error genérico
        return ResponseHelper.serverError(res, 'Error al procesar', error);
    }
};
```

---

## ✅ Checklist de Migración

Para migrar un controlador, asegúrate de:

- [ ] Importar `ResponseHelper`
- [ ] Reemplazar todos los `res.json()` con métodos del helper
- [ ] Reemplazar todos los `res.status().json()` con métodos del helper
- [ ] Agregar `return` antes de cada método del helper
- [ ] Agregar logs con `console.error()` en los catches
- [ ] Manejar errores específicos (404, 400, etc.) antes del error genérico
- [ ] Usar `successWithCustomData()` cuando necesites propiedades personalizadas
- [ ] Usar `success()` para respuestas simples con mensaje
- [ ] Usar `created()` para POST que crean recursos

---

## 📊 Estado de Migración

### ✅ Completados
- [x] `backend/helpers/response.helper.ts` (creado)
- [x] `backend/controllers/usuario.ts` (8 métodos)
- [x] `backend/controllers/medico.ts` (7 métodos)
- [x] `backend/controllers/cita_medica.ts` (8 métodos)
- [x] `backend/controllers/mercadoPago.ts` (createOrder)
- [x] `backend/controllers/facturas.ts` (3 métodos)
- [x] `backend/controllers/tipo_cita.ts` (6 métodos)

### ⏳ Pendientes
- [ ] `backend/controllers/historial_medico.ts` (6 métodos)
- [ ] `backend/controllers/horario_medico.ts` (5 métodos)
- [ ] `backend/controllers/busquedas.ts` (2 métodos)
- [ ] `backend/controllers/auth.ts` (4 métodos - usa ApiResponse)

---

## 🚀 Beneficios

1. **Consistencia**: Todas las respuestas siguen el mismo formato
2. **Mantenibilidad**: Cambios en el formato se hacen en un solo lugar
3. **Tipado**: TypeScript ayuda a evitar errores
4. **Frontend simplificado**: Solo necesita manejar un formato
5. **Debugging facilitado**: Respuestas predecibles y estandarizadas
6. **Documentación implícita**: El código es autodocumentado

---

## 📞 Soporte

Si tienes dudas sobre cómo migrar un controlador específico, consulta:
1. El archivo `backend/controllers/usuario.ts` como referencia
2. Esta guía para patrones comunes
3. El archivo `backend/helpers/response.helper.ts` para ver todos los métodos disponibles
