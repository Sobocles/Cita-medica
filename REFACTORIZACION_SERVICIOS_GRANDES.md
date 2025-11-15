# Refactorización Frontend - Servicios Demasiado Grandes

## 🎯 Problema Resuelto: 2.2 MAYOR - Componentes y Servicios Demasiado Grandes

### Problemas Identificados:

1. **`auth.service.ts`** - 206 líneas con múltiples responsabilidades:
   - Autenticación (login, logout, registro)
   - Gestión de tokens y localStorage
   - Recuperación de contraseñas
   - Cambio de contraseñas (usuarios y médicos)
   - Gestión de estado (usuario, médico, infoClinica)

2. **`gestionar-pacientes.component.ts`** - 130 líneas:
   - Después de análisis, este componente está bien estructurado
   - Todas sus responsabilidades están relacionadas con la gestión de pacientes
   - No requiere refactorización

**Violaciones de principios:**
- ❌ **Single Responsibility Principle (SRP)**: AuthService tenía demasiadas responsabilidades
- ❌ **Open/Closed Principle**: Difícil extender sin modificar
- ❌ **Dependency Inversion Principle**: Componentes dependían directamente de implementaciones concretas

---

## ✅ Solución Implementada

### Arquitectura Antes

```
AuthService (206 líneas)
├── login()
├── logout()
├── crearUsuario()
├── validarToken()
├── guardarLocalStorage()
├── recuperarPassword()
├── cambiarPassword()
├── cambiarPasswordMedico()
└── getters (token, headers)
```

**Problemas:**
- Un servicio hace TODO
- Difícil de testear
- Alto acoplamiento
- Violación de SRP

---

### Arquitectura Después

```
┌─────────────────────────────────────┐
│      AuthService (216 líneas)      │
│  - login()                          │
│  - logout()                         │
│  - crearUsuario()                   │
│  - validarToken()                   │
│  - getters delegados                │
│  + Métodos deprecated (wrapper)     │
└──────────┬──────────────────────────┘
           │
           ├──> TokenService (138 líneas)
           │    ├── getToken()
           │    ├── setToken()
           │    ├── saveSession()
           │    ├── clearSession()
           │    ├── getAuthHeaders()
           │    └── getBearerHeaders()
           │
           └──> PasswordService (155 líneas)
                ├── recuperarPassword()
                ├── cambiarPasswordUsuario()
                ├── cambiarPasswordMedico()
                └── cambiarPassword()
```

**Beneficios:**
- ✅ Responsabilidades separadas
- ✅ Cada servicio tiene una única razón para cambiar
- ✅ Fácil de testear independientemente
- ✅ Bajo acoplamiento
- ✅ Cumple SRP

---

## 📊 Desglose de Servicios Creados

### 1. **TokenService** (Nuevo)

**Ubicación**: `frontend/src/app/shared/services/token.service.ts`
**Líneas**: 138
**Responsabilidad**: Gestión de tokens JWT y localStorage

#### Métodos Públicos:

| Método | Descripción | Retorno |
|--------|-------------|---------|
| `getToken()` | Obtiene token del localStorage | `string` |
| `setToken(token)` | Guarda token en localStorage | `void` |
| `removeToken()` | Elimina token | `void` |
| `hasToken()` | Verifica si existe token | `boolean` |
| `getMenu()` | Obtiene menú del localStorage | `any[]` |
| `setMenu(menu)` | Guarda menú | `void` |
| `removeMenu()` | Elimina menú | `void` |
| `saveSession(token, menu)` | Guarda token y menú | `void` |
| `clearSession()` | Limpia toda la sesión | `void` |
| `getAuthHeaders()` | Headers con x-token | `HttpHeaders` |
| `getBearerHeaders()` | Headers con Bearer | `HttpHeaders` |

#### Uso:

```typescript
// Inyectar en constructor
constructor(private tokenService: TokenService) {}

// Guardar sesión
this.tokenService.saveSession(response.token, response.menu);

// Limpiar sesión (logout)
this.tokenService.clearSession();

// Obtener headers para requests
this.http.get(url, this.tokenService.getAuthHeaders());

// Verificar si hay sesión activa
if (this.tokenService.hasToken()) {
  // Usuario está autenticado
}
```

---

### 2. **PasswordService** (Nuevo)

**Ubicación**: `frontend/src/app/shared/services/password.service.ts`
**Líneas**: 155
**Responsabilidad**: Operaciones relacionadas con contraseñas

#### Métodos Públicos:

| Método | Descripción | Parámetros | Retorno |
|--------|-------------|------------|---------|
| `recuperarPassword()` | Solicita recuperación de contraseña | nombre, email | `Observable<boolean \| string>` |
| `cambiarPasswordUsuario()` | Cambia contraseña de usuario | rut, password, newPassword | `Observable<boolean \| string>` |
| `cambiarPasswordMedico()` | Cambia contraseña de médico | rut, password, newPassword | `Observable<boolean \| string>` |
| `cambiarPassword()` | Método genérico | rut, password, newPassword, esMedico | `Observable<boolean \| string>` |

#### Uso:

```typescript
// Inyectar en constructor
constructor(private passwordService: PasswordService) {}

// Recuperar contraseña
this.passwordService.recuperarPassword('Juan', 'juan@gmail.com')
  .subscribe(result => {
    if (result === true) {
      Swal.fire('Éxito', 'Email enviado', 'success');
    } else {
      Swal.fire('Error', result, 'error');
    }
  });

// Cambiar contraseña de usuario
this.passwordService.cambiarPasswordUsuario(rut, oldPass, newPass)
  .subscribe(result => {
    if (result === true) {
      Swal.fire('Éxito', 'Contraseña actualizada', 'success');
    }
  });

// Cambiar contraseña (detecta automáticamente el tipo)
const esMedico = this.authService.medico !== undefined;
this.passwordService.cambiarPassword(rut, oldPass, newPass, esMedico);
```

**Ventajas:**
- Centraliza lógica de contraseñas
- Manejo consistente de errores
- Retorna `boolean | string` (true o mensaje de error)
- Valida sesión activa antes de cambiar contraseña

---

### 3. **AuthService** (Refactorizado)

**Ubicación**: `frontend/src/app/auth/services/auth.service.ts`
**Líneas**: 216 (antes: 206)
**Responsabilidad**: Solo autenticación y validación de sesión

#### Cambios Realizados:

**Eliminado:**
- ❌ Implementación directa de `guardarLocalStorage()`
- ❌ Implementación directa de `recuperarPassword()`
- ❌ Implementación directa de `cambiarPassword()`
- ❌ Implementación directa de `cambiarPasswordMedico()`
- ❌ Acceso directo a localStorage

**Agregado:**
- ✅ Inyección de `TokenService`
- ✅ Inyección de `PasswordService`
- ✅ Delegación a servicios especializados
- ✅ Métodos @deprecated para compatibilidad
- ✅ Documentación JSDoc completa

#### Métodos Principales:

| Método | Descripción | Delega a |
|--------|-------------|----------|
| `login()` | Inicia sesión | `TokenService.saveSession()` |
| `logout()` | Cierra sesión | `TokenService.clearSession()` |
| `crearUsuario()` | Registra usuario | - |
| `validarToken()` | Valida token JWT | `TokenService` |
| `get token()` | Obtiene token | `TokenService.getToken()` |
| `get headers()` | Obtiene headers | `TokenService.getAuthHeaders()` |
| `recuperarPassword()` | **@deprecated** | `PasswordService.recuperarPassword()` |
| `cambiarPassword()` | **@deprecated** | `PasswordService.cambiarPasswordUsuario()` |
| `cambiarPasswordMedico()` | **@deprecated** | `PasswordService.cambiarPasswordMedico()` |

#### Código Refactorizado:

**ANTES:**
```typescript
guardarLocalStorage(token: string, menu: any) {
  localStorage.setItem('token', token);
  localStorage.setItem('menu', JSON.stringify(menu));
}

login(email: string, password: string) {
  return this.http.post(`${base_url}/login`, body).pipe(
    tap((resp: any) => {
      this.guardarLocalStorage(resp.token, resp.menu);
    })
  );
}

logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('menu');
}
```

**AHORA:**
```typescript
constructor(
  private http: HttpClient,
  private tokenService: TokenService,
  public passwordService: PasswordService
) {}

login(email: string, password: string) {
  return this.http.post(`${base_url}/login`, body).pipe(
    tap((resp: any) => {
      // Delegar a TokenService
      this.tokenService.saveSession(resp.token, resp.menu);
    })
  );
}

logout() {
  // Delegar a TokenService
  this.tokenService.clearSession();
}
```

---

## 📊 Métricas de Refactorización

### Comparación de Líneas de Código

| Archivo | Antes | Ahora | Cambio | Tipo |
|---------|-------|-------|--------|------|
| `auth.service.ts` | 206 | 216 | +10 | Refactorizado |
| `token.service.ts` | 0 | 138 | +138 | Nuevo |
| `password.service.ts` | 0 | 155 | +155 | Nuevo |
| **Total** | **206** | **509** | **+303** | - |

**Análisis**: Aunque aumentó ~303 líneas en total, ahora tenemos:
- ✅ **3 servicios especializados** en lugar de 1 monolítico
- ✅ **Separación de responsabilidades** (SRP cumplido)
- ✅ **Código reutilizable** (TokenService se puede usar en otros servicios)
- ✅ **Testeable** (cada servicio se prueba independientemente)
- ✅ **Mantenible** (un cambio en tokens no afecta passwords)
- ✅ **Escalable** (fácil agregar nuevos métodos de auth)

### Responsabilidades por Servicio

```
ANTES (AuthService - 206 líneas):
├── Autenticación (40%)
├── Tokens (20%)
├── Contraseñas (30%)
└── Estado (10%)

AHORA:
┌── AuthService (216 líneas):
│   └── Autenticación (100%)
│
├── TokenService (138 líneas):
│   └── Gestión de tokens (100%)
│
└── PasswordService (155 líneas):
    └── Gestión de contraseñas (100%)
```

---

## 🎯 Principios Aplicados

### 1. **Single Responsibility Principle (SRP)**
- **AuthService**: Solo maneja autenticación
- **TokenService**: Solo maneja tokens
- **PasswordService**: Solo maneja contraseñas

### 2. **Dependency Inversion Principle (DIP)**
- AuthService ahora depende de abstracciones (TokenService, PasswordService)
- Fácil reemplazar implementaciones si es necesario

### 3. **Open/Closed Principle**
- Servicios abiertos para extensión (nuevos métodos)
- Cerrados para modificación (no necesitas tocar código existente)

### 4. **Don't Repeat Yourself (DRY)**
- Lógica de tokens centralizada en TokenService
- No más código duplicado de localStorage

---

## 🚀 Beneficios Obtenidos

### 1. **Testabilidad** ⬆️⬆️⬆️
**ANTES:**
```typescript
// Difícil testear - muchas dependencias
describe('AuthService', () => {
  it('should save to localStorage on login', () => {
    // Necesitas mockear localStorage, HttpClient, etc.
  });
});
```

**AHORA:**
```typescript
// Fácil testear - responsabilidades separadas
describe('TokenService', () => {
  it('should save token', () => {
    const service = new TokenService();
    service.setToken('abc123');
    expect(service.getToken()).toBe('abc123');
  });
});

describe('AuthService', () => {
  it('should delegate to TokenService on login', () => {
    const tokenSpy = spyOn(tokenService, 'saveSession');
    authService.login('test@test.com', '123');
    expect(tokenSpy).toHaveBeenCalled();
  });
});
```

### 2. **Mantenibilidad** ⬆️⬆️
- Cambiar cómo se guardan tokens: **Solo editas TokenService**
- Agregar nuevo método de recuperación de password: **Solo editas PasswordService**
- Implementar OAuth: **Solo editas AuthService**, no afecta tokens ni passwords

### 3. **Reutilización** ⬆️⬆️
```typescript
// TokenService se puede usar en CUALQUIER servicio
@Injectable()
export class OtherService {
  constructor(private tokenService: TokenService) {}

  makeAuthenticatedRequest() {
    return this.http.get(url, this.tokenService.getAuthHeaders());
  }
}
```

### 4. **Escalabilidad** ⬆️⬆️
Agregar nuevas funcionalidades es fácil:

```typescript
// TokenService - Agregar refresh token
export class TokenService {
  getRefreshToken(): string { ... }
  setRefreshToken(token: string): void { ... }
}

// PasswordService - Agregar validación de fortaleza
export class PasswordService {
  validatePasswordStrength(password: string): boolean { ... }
}

// AuthService - Agregar autenticación biométrica
export class AuthService {
  loginWithBiometric(): Observable<any> { ... }
}
```

### 5. **Legibilidad** ⬆️
- Nombres de servicios descriptivos
- Métodos claramente agrupados por responsabilidad
- Documentación JSDoc en todos los métodos

---

## 📝 Migración para Código Existente

Los métodos @deprecated mantienen compatibilidad hacia atrás:

```typescript
// OPCIÓN 1: Usar métodos deprecated (sin cambios)
this.authService.cambiarPassword(rut, oldPass, newPass);

// OPCIÓN 2: Migrar a nuevo servicio (recomendado)
this.authService.passwordService.cambiarPasswordUsuario(rut, oldPass, newPass);

// OPCIÓN 3: Inyectar PasswordService directamente
constructor(private passwordService: PasswordService) {}
this.passwordService.cambiarPasswordUsuario(rut, oldPass, newPass);
```

**Recomendación**: Migrar gradualmente al nuevo servicio para aprovechar todos los beneficios.

---

## 🧪 Ejemplos de Testing

### Unit Test - TokenService

```typescript
describe('TokenService', () => {
  let service: TokenService;

  beforeEach(() => {
    localStorage.clear();
    service = new TokenService();
  });

  it('should save and retrieve token', () => {
    service.setToken('test-token');
    expect(service.getToken()).toBe('test-token');
  });

  it('should clear session', () => {
    service.saveSession('token123', [{label: 'Home'}]);
    service.clearSession();
    expect(service.hasToken()).toBe(false);
    expect(service.getMenu()).toBeNull();
  });

  it('should generate auth headers', () => {
    service.setToken('my-token');
    const headers = service.getAuthHeaders();
    expect(headers.headers.get('x-token')).toBe('my-token');
  });
});
```

### Unit Test - PasswordService

```typescript
describe('PasswordService', () => {
  let service: PasswordService;
  let httpMock: HttpTestingController;
  let tokenService: jasmine.SpyObj<TokenService>;

  beforeEach(() => {
    const tokenSpy = jasmine.createSpyObj('TokenService', ['hasToken', 'getBearerHeaders']);
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        PasswordService,
        { provide: TokenService, useValue: tokenSpy }
      ]
    });
    service = TestBed.inject(PasswordService);
    httpMock = TestBed.inject(HttpTestingController);
    tokenService = TestBed.inject(TokenService) as jasmine.SpyObj<TokenService>;
  });

  it('should change user password', () => {
    tokenService.hasToken.and.returnValue(true);

    service.cambiarPasswordUsuario('12345678-9', 'old', 'new')
      .subscribe(result => {
        expect(result).toBe(true);
      });

    const req = httpMock.expectOne(`${base_url}/usuarios/cambiarPassword`);
    expect(req.request.method).toBe('POST');
    req.flush({ ok: true });
  });

  it('should return error if no session', () => {
    tokenService.hasToken.and.returnValue(false);

    service.cambiarPasswordUsuario('12345678-9', 'old', 'new')
      .subscribe(result => {
        expect(result).toBe('No hay sesión activa');
      });
  });
});
```

### Integration Test - AuthService

```typescript
describe('AuthService Integration', () => {
  let authService: AuthService;
  let tokenService: TokenService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService, TokenService, PasswordService]
    });
    authService = TestBed.inject(AuthService);
    tokenService = TestBed.inject(TokenService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should save session on successful login', () => {
    const loginResponse = {
      token: 'abc123',
      menu: [{label: 'Home'}],
      userOrMedico: {rut: '12345678-9', nombre: 'Test'}
    };

    authService.login('test@test.com', '123').subscribe();

    const req = httpMock.expectOne(`${base_url}/login`);
    req.flush(loginResponse);

    expect(tokenService.getToken()).toBe('abc123');
    expect(tokenService.getMenu()).toEqual([{label: 'Home'}]);
  });

  it('should clear session on logout', () => {
    tokenService.saveSession('token123', []);
    authService.logout();
    expect(tokenService.hasToken()).toBe(false);
  });
});
```

---

## 📚 Archivos Modificados/Creados

### Archivos Nuevos (2)
- ✅ `frontend/src/app/shared/services/token.service.ts` (138 líneas)
- ✅ `frontend/src/app/shared/services/password.service.ts` (155 líneas)

### Archivos Refactorizados (1)
- ♻️ `frontend/src/app/auth/services/auth.service.ts` (206 → 216 líneas)

### Total de archivos tocados: **3 archivos**

---

## 🎓 Lecciones Aprendidas

1. **Servicios grandes son señal de violación de SRP**: Si un servicio hace TODO, probablemente hace DEMASIADO

2. **Delegación > Implementación directa**: AuthService ahora delega en lugar de implementar

3. **@deprecated mantiene compatibilidad**: No rompes código existente mientras migras

4. **Documentación JSDoc es esencial**: Especialmente en servicios reutilizables

5. **Servicios en shared/ son reutilizables**: TokenService y PasswordService pueden usarse en CUALQUIER parte de la app

6. **Testing es más fácil con SRP**: Cada servicio se prueba independientemente

7. **Más líneas ≠ peor código**: 509 líneas bien organizadas > 206 líneas monolíticas

---

## 🔄 Próximos Pasos Sugeridos

Si se desea continuar mejorando:

### 1. **Crear más servicios especializados**
- `StorageService` - Abstracción sobre localStorage (fácil migrar a sessionStorage o IndexedDB)
- `HttpInterceptorService` - Agregar token automáticamente a requests
- `RefreshTokenService` - Renovación automática de tokens

### 2. **Agregar Guard de autenticación**
```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    if (!this.tokenService.hasToken()) {
      this.router.navigate(['/login']);
      return of(false);
    }
    return this.authService.validarToken();
  }
}
```

### 3. **Testing completo**
- Unit tests para TokenService (100% coverage)
- Unit tests para PasswordService (100% coverage)
- Integration tests para AuthService
- E2E tests para flujo de login completo

### 4. **Refactorizar gestionar-pacientes.component.ts**

Aunque no es urgente (130 líneas es aceptable), podría mejorarse:

**Potenciales mejoras:**
- Extraer validación "no puedes eliminarte a ti mismo" a un servicio
- Crear PaginationService para lógica de paginación
- Mover lógica de SweetAlert a un DialogService

---

**Refactorización completada exitosamente** ✅
**Fecha**: 2025-11-15
**Problema resuelto**: 2.2 MAYOR - Servicios Demasiado Grandes
**Principio aplicado**: Single Responsibility Principle (SRP)
**Impacto**: Código más modular, testeable y mantenible
