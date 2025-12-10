# Guía de Manejo de Errores - Frontend Angular

## Resumen Ejecutivo

Este proyecto cuenta con infraestructura robusta para manejo de errores:
- **ErrorHandlerService**: Servicio centralizado para mostrar mensajes al usuario
- **HttpErrorInterceptor**: Interceptor que maneja errores HTTP automáticamente

**IMPORTANTE**: Todos los componentes DEBEN usar `ErrorHandlerService` en lugar de `Swal.fire()` directamente.

---

## 1. ErrorHandlerService - Métodos Disponibles

### Métodos para Errores

#### `showError(error: any, title?: string)`
Muestra errores genéricos. Extrae automáticamente el mensaje del backend.

```typescript
this.authService.login(email, password).subscribe({
  next: (response) => { /* ... */ },
  error: (err) => {
    this.errorHandler.showError(err); // ✅ Título por defecto: "Error"
    // o
    this.errorHandler.showError(err, 'Error de Login'); // ✅ Título personalizado
  }
});
```

#### `handleAuthError(error: any)`
Manejo especializado para errores de autenticación (login, registro, etc.)

```typescript
this.authService.crearUsuario(formData).subscribe({
  next: (resp) => { /* ... */ },
  error: (err) => {
    this.errorHandler.handleAuthError(err); // ✅ Título: "Error de Autenticación"
  }
});
```

#### `showValidationError(mensaje: string, title?: string)`
Errores de validación (validaciones en el cliente)

```typescript
if (fechaSeleccionada < fechaActual) {
  this.errorHandler.showValidationError(
    'No puedes seleccionar una fecha anterior a la actual.',
    'Fecha no válida'
  );
  return;
}
```

#### `handleValidationErrors(errors: string[])`
Muestra múltiples errores de validación en una lista

```typescript
const errores = [];
if (!this.formulario.valid) {
  if (this.formulario.get('email')?.hasError('required')) {
    errores.push('El email es obligatorio');
  }
  if (this.formulario.get('password')?.hasError('minlength')) {
    errores.push('La contraseña debe tener al menos 8 caracteres');
  }
}

if (errores.length > 0) {
  this.errorHandler.handleValidationErrors(errores);
  return;
}
```

---

### Métodos para Mensajes de Éxito

#### `showSuccess(mensaje: string, title?: string)`
Mensajes de éxito

```typescript
this.medicoService.crearMedico(formData).subscribe({
  next: (response) => {
    this.errorHandler.showSuccess(
      'El médico ha sido registrado exitosamente',
      '¡Registro exitoso!'
    );
  }
});
```

#### `showToast(mensaje: string, icon: 'success' | 'error' | 'warning' | 'info', position?, timer?)`
Notificaciones toast (menos intrusivas)

```typescript
// Toast de éxito
this.errorHandler.showToast('Cambios guardados', 'success');

// Toast de error con duración personalizada
this.errorHandler.showToast('No se pudo guardar', 'error', 'top-end', 5000);
```

---

### Métodos para Advertencias e Información

#### `showWarning(mensaje: string, title?: string)`
Advertencias (no son errores, pero el usuario debe saberlo)

```typescript
if (this.formulario.get('password')?.value !== this.formulario.get('confirmPassword')?.value) {
  this.errorHandler.showWarning(
    'Las contraseñas no coinciden',
    'Verificación de Contraseña'
  );
  return;
}
```

#### `showInfo(mensaje: string, title?: string)`
Mensajes informativos

```typescript
this.errorHandler.showInfo(
  'Selecciona un médico para ver su disponibilidad',
  'Información'
);
```

---

### Métodos para Confirmaciones

#### `showConfirmation(titulo: string, mensaje: string, confirmButtonText?: string, cancelButtonText?: string): Promise<boolean>`
Diálogo de confirmación genérico

```typescript
const confirmado = await this.errorHandler.showConfirmation(
  '¿Confirmar cita?',
  '¿Estás seguro de que deseas agendar esta cita?',
  'Sí, agendar',
  'Cancelar'
);

if (confirmado) {
  // Proceder con la acción
  this.crearCita();
}
```

#### `showDeleteConfirmation(itemName?: string): Promise<boolean>`
Confirmación especializada para eliminación

```typescript
const confirmado = await this.errorHandler.showDeleteConfirmation('el médico');

if (confirmado) {
  this.medicoService.borrarMedico(id).subscribe({
    next: () => {
      this.errorHandler.showSuccess('Médico eliminado correctamente');
      this.cargarMedicos();
    },
    error: (err) => this.errorHandler.showError(err)
  });
}
```

---

## 2. Patrones de Uso en Componentes

### Patrón 1: Operaciones CRUD (Crear, Leer, Actualizar, Eliminar)

#### Crear/Actualizar

```typescript
// ❌ INCORRECTO (No usar Swal directamente)
this.medicoService.crearMedico(formData).subscribe(
  (response: any) => {
    Swal.fire('Mensaje', response.msg, 'success');
  },
  error => {
    Swal.fire('Error', error.error.msg, 'error');
  }
);

// ✅ CORRECTO (Usar ErrorHandlerService)
this.medicoService.crearMedico(formData).subscribe({
  next: (response) => {
    this.errorHandler.showSuccess(
      response.msg || 'El médico ha sido registrado exitosamente',
      '¡Registro exitoso!'
    );
    this.formulario.reset();
    this.router.navigate(['/admin/medicos']);
  },
  error: (err) => {
    this.errorHandler.showError(err, 'Error al registrar médico');
  }
});
```

#### Eliminar

```typescript
// ✅ CORRECTO
async borrarMedico(medico: Medico) {
  const confirmado = await this.errorHandler.showDeleteConfirmation('el médico');

  if (!confirmado) return;

  this.medicoService.borrarMedico(medico.id!).subscribe({
    next: () => {
      this.errorHandler.showSuccess('Médico eliminado correctamente');
      this.cargarMedicos();
    },
    error: (err) => {
      this.errorHandler.showError(err, 'Error al eliminar médico');
    }
  });
}
```

#### Leer/Cargar Datos

```typescript
// ❌ INCORRECTO (Solo console.error)
this.medicoService.obtenerMedicos().subscribe(
  response => {
    this.medicos = response;
  },
  error => {
    console.error('Error cargando médicos:', error);
  }
);

// ✅ CORRECTO (Informar al usuario)
cargarMedicos() {
  this.medicoService.obtenerMedicos().subscribe({
    next: (response) => {
      this.medicos = response;
    },
    error: (err) => {
      this.errorHandler.showError(err, 'Error al cargar médicos');
      this.medicos = []; // Estado seguro
    }
  });
}
```

---

### Patrón 2: Validaciones del Cliente

```typescript
// ❌ INCORRECTO
if (!this.formulario.valid) {
  Swal.fire({
    icon: 'error',
    title: 'Formulario inválido',
    text: 'Por favor completa todos los campos requeridos'
  });
  return;
}

// ✅ CORRECTO (Validación simple)
if (!this.formulario.valid) {
  this.errorHandler.showValidationError(
    'Por favor completa todos los campos requeridos',
    'Formulario inválido'
  );
  return;
}

// ✅ CORRECTO (Múltiples validaciones)
validarFormulario(): boolean {
  const errores: string[] = [];

  if (this.formulario.get('nombre')?.hasError('required')) {
    errores.push('El nombre es obligatorio');
  }
  if (this.formulario.get('email')?.hasError('email')) {
    errores.push('El email no es válido');
  }
  if (this.formulario.get('telefono')?.hasError('pattern')) {
    errores.push('El teléfono debe contener solo números');
  }

  if (errores.length > 0) {
    this.errorHandler.handleValidationErrors(errores);
    return false;
  }

  return true;
}

onSubmit() {
  if (!this.validarFormulario()) return;

  // Proceder con el envío
  this.crearMedico();
}
```

---

### Patrón 3: Autenticación (Login/Registro/Password)

```typescript
// ✅ Login
login() {
  const { email, password } = this.formulario.value;

  this.authService.login(email, password).subscribe({
    next: (response) => {
      this.errorHandler.showSuccess('Inicio de sesión exitoso', '¡Bienvenido!');
      this.router.navigate(['/dashboard']);
    },
    error: (err) => {
      this.errorHandler.handleAuthError(err); // Método especializado
    }
  });
}

// ✅ Registro
registrar() {
  if (!this.validarFormulario()) return;

  this.authService.crearUsuario(this.formulario.value).subscribe({
    next: (response) => {
      this.errorHandler.showSuccess(
        'Te hemos enviado un correo de confirmación',
        '¡Registro completado!'
      );
      this.router.navigate(['/login']);
    },
    error: (err) => {
      this.errorHandler.handleAuthError(err);
    }
  });
}

// ✅ Cambio de contraseña
cambiarPassword() {
  this.passwordService.cambiarPassword(datos).subscribe({
    next: (response) => {
      this.errorHandler.showSuccess('Tu contraseña ha sido actualizada');
      this.formulario.reset();
    },
    error: (err) => {
      this.errorHandler.showError(err, 'Error al cambiar contraseña');
    }
  });
}
```

---

### Patrón 4: Validaciones de Fechas

```typescript
// ❌ INCORRECTO (Validación manual sin servicio)
validarFecha(event: any) {
  const fechaSeleccionada = new Date(event.target.value);
  const fechaActual = new Date();

  if (fechaSeleccionada < fechaActual) {
    Swal.fire({
      title: 'Fecha no válida',
      text: 'No puedes seleccionar una fecha anterior a la actual.',
      icon: 'error'
    });
  }
}

// ✅ CORRECTO (Usar ErrorHandlerService)
validarFecha(event: any) {
  const fechaSeleccionada = new Date(event.target.value);
  const fechaActual = new Date();

  if (fechaSeleccionada < fechaActual) {
    this.errorHandler.showValidationError(
      'No puedes seleccionar una fecha anterior a la actual.',
      'Fecha no válida'
    );
    this.formulario.get('fecha')?.setValue(''); // Limpiar campo
    return false;
  }

  return true;
}
```

---

## 3. Integración en el Componente

### Inyección del Servicio

```typescript
import { Component, OnInit } from '@angular/core';
import { ErrorHandlerService } from '@shared/services/error-handler.service';

@Component({
  selector: 'app-mi-componente',
  templateUrl: './mi-componente.component.html'
})
export class MiComponenteComponent implements OnInit {

  constructor(
    private errorHandler: ErrorHandlerService, // ✅ Inyectar servicio
    // ... otros servicios
  ) { }

  // NO es necesario importar Swal directamente
}
```

### NO Importar SweetAlert2 Directamente

```typescript
// ❌ INCORRECTO - NO HACER ESTO
import Swal from 'sweetalert2';

export class MiComponenteComponent {
  metodo() {
    Swal.fire('Título', 'Mensaje', 'success'); // ❌
  }
}

// ✅ CORRECTO
import { ErrorHandlerService } from '@shared/services/error-handler.service';

export class MiComponenteComponent {
  constructor(private errorHandler: ErrorHandlerService) { }

  metodo() {
    this.errorHandler.showSuccess('Mensaje', 'Título'); // ✅
  }
}
```

---

## 4. HttpErrorInterceptor - Funcionamiento Automático

El interceptor maneja automáticamente estos errores **SIN necesidad de código adicional**:

- **401 (No autorizado)**: Cierra sesión, muestra advertencia y redirige a login
- **403 (Prohibido)**: Muestra error de permisos
- **0 (Error de red)**: Muestra error de conexión al servidor
- **500 (Error del servidor)**: Muestra error genérico (solo si el backend no envía mensaje)

**IMPORTANTE**: Los componentes SIEMPRE deben tener el bloque `error` en `subscribe()` porque:
1. El interceptor muestra un mensaje al usuario, pero también propaga el error
2. El componente puede necesitar hacer limpieza o cambiar estado
3. Algunos errores (400, 404) el interceptor los deja pasar para que el componente los maneje específicamente

```typescript
// ✅ CORRECTO - Siempre incluir bloque error
this.authService.login(email, password).subscribe({
  next: (response) => {
    // Manejo de éxito
  },
  error: (err) => {
    // Aunque el interceptor muestre el mensaje, podemos hacer limpieza aquí
    this.formulario.enable();
    this.loading = false;
  }
});
```

---

## 5. Casos Especiales

### Confirmaciones con Acciones Complejas

```typescript
async procesarPago() {
  const confirmado = await this.errorHandler.showConfirmation(
    'Confirmar Pago',
    `El monto total es $${this.total}. ¿Deseas proceder con el pago?`,
    'Sí, pagar',
    'Cancelar'
  );

  if (!confirmado) return;

  // Mostrar loading
  this.loading = true;

  this.mercadoPagoService.crearPreferencia(this.datosPago).subscribe({
    next: (response) => {
      this.loading = false;
      // Redirigir a MercadoPago
      window.location.href = response.init_point;
    },
    error: (err) => {
      this.loading = false;
      this.errorHandler.showError(err, 'Error al procesar el pago');
    }
  });
}
```

### Múltiples Operaciones Secuenciales

```typescript
async guardarCita() {
  if (!this.validarFormulario()) return;

  this.loading = true;

  // Paso 1: Crear cita
  this.citaService.crearCita(this.formulario.value).subscribe({
    next: (cita) => {
      // Paso 2: Crear factura
      this.facturaService.crearFactura(cita.id).subscribe({
        next: (factura) => {
          this.loading = false;
          this.errorHandler.showSuccess(
            'Cita agendada y factura generada correctamente',
            '¡Éxito!'
          );
          this.router.navigate(['/mis-citas']);
        },
        error: (err) => {
          this.loading = false;
          this.errorHandler.showError(err, 'Error al generar factura');
          // La cita se creó pero la factura falló - informar al usuario
        }
      });
    },
    error: (err) => {
      this.loading = false;
      this.errorHandler.showError(err, 'Error al agendar cita');
    }
  });
}
```

---

## 6. Checklist de Migración

Al refactorizar un componente para usar `ErrorHandlerService`:

- [ ] Importar `ErrorHandlerService` desde `@shared/services/error-handler.service`
- [ ] Inyectar en el constructor como `private errorHandler: ErrorHandlerService`
- [ ] Eliminar import de `import Swal from 'sweetalert2';`
- [ ] Reemplazar todos los `Swal.fire()` por métodos de `errorHandler`
- [ ] Asegurar que todos los `subscribe()` tengan bloque `error`
- [ ] Reemplazar `console.error()` en errores HTTP por `errorHandler.showError()`
- [ ] Usar `showDeleteConfirmation()` para eliminaciones
- [ ] Usar `handleAuthError()` para errores de autenticación
- [ ] Usar `showValidationError()` o `handleValidationErrors()` para validaciones
- [ ] Probar que los mensajes se muestran correctamente

---

## 7. Beneficios de Usar ErrorHandlerService

1. **Consistencia**: Todos los errores se muestran de la misma manera
2. **Mantenibilidad**: Un solo lugar para cambiar el formato de mensajes
3. **Robustez**: El servicio maneja diferentes estructuras de error del backend
4. **Menos código**: No repetir configuración de SweetAlert2
5. **Mejor UX**: Mensajes estandarizados y profesionales
6. **Facilidad de testing**: Más fácil hacer mock del servicio
7. **Separación de responsabilidades**: El componente no se preocupa del UI de errores

---

## 8. Recursos

- **ErrorHandlerService**: `frontend/src/app/shared/services/error-handler.service.ts`
- **HttpErrorInterceptor**: `frontend/src/app/shared/interceptors/http-error.interceptor.ts`
- **Ejemplos de uso**:
  - `frontend/src/app/auth/pages/register/register.component.ts`
  - `frontend/src/app/auth/pages/password/password.component.ts`

---

**Última actualización**: 2025-11-15
**Versión**: 1.0
