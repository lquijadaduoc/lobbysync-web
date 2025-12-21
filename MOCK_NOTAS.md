# 📋 Notas sobre Mock Data y "Mock no disponible"

## ¿Qué es Mock Data?

Mock data (datos simulados) son datos ficticios que se usan en desarrollo para **no depender del backend real**. Permiten:

- ✅ Probar la UI sin conectarse a un servidor
- ✅ Desarrollar offline
- ✅ No esperar a que el backend esté listo
- ✅ Cambiar datos rápidamente sin afectar producción

## Error: "Mock data no disponible"

### Causas:

Ves este error cuando:
1. **Intentas acceder a un endpoint que NO tiene mock data implementado**
2. **El backend real NO está disponible** (si estuviera, daría un error diferente)

### Ejemplo de flujo:

```
Usuario accede a página X
    ↓
App intenta obtener datos de /api/ruta-x
    ↓
¿Hay mock para /api/ruta-x?
    ├─ SÍ → Devuelve datos simulados ✓
    └─ NO → "Mock data no disponible" ✗
```

## Funcionalidades que TIENEN Mock Data

Estos endpoints funcionan sin problemas porque tienen datos simulados implementados:

### ✅ Completamente Mocked:

| Endpoint | Datos Mock | Estado |
|----------|-----------|--------|
| `/users` | MOCK_USERS (6 usuarios) | ✓ Funciona |
| `/buildings` | MOCK_BUILDINGS (3 edificios) | ✓ Funciona |
| `/logbook` | MOCK_LOGBOOK (5 eventos) | ✓ Funciona |
| `/packages` o `/parcels` | MOCK_PACKAGES (3 paquetes) | ✓ Funciona |
| `/amenities` | MOCK_AMENITIES (4 amenidades) | ✓ Funciona |
| `/visitors` | MOCK_VISITORS (2 visitantes) | ✓ Funciona |
| `/assets` | MOCK_ASSETS (4 activos) | ✓ NUEVO - Funciona |
| `/access/logs` | MOCK_ACCESS_LOGS (5 logs) | ✓ NUEVO - Funciona |
| `/finance` | MOCK_FINANCE (3 meses) | ✓ NUEVO - Funciona |
| `/maintenance` | MOCK_MAINTENANCE_TICKETS (3 tickets) | ✓ NUEVO - Funciona |

## Cómo se Implementa el Mock Data

### 1. Definir los datos (mockData.js)

```javascript
export const MOCK_USUARIOS = [
  { id: 1, nombre: 'Juan', email: 'juan@email.com' },
  { id: 2, nombre: 'María', email: 'maria@email.com' },
];
```

### 2. Importar en el adapter (mockAdapter.js)

```javascript
import { MOCK_USUARIOS } from './mockData';
```

### 3. Manejar la ruta (mockAdapter.js)

```javascript
if (url.includes('/usuarios') && method === 'GET') {
  return {
    data: MOCK_USUARIOS,
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
  };
}
```

## Cómo Funciona: Real vs Mock

### Modo REAL (con backend en línea):

```
App → HTTP Request → Backend Real → Datos Reales ✓
```

### Modo MOCK (backend offline):

```
App → Axios Interceptor → Mock Adapter → Datos Simulados ✓
```

## Configuración: USE_MOCK

En `src/api/axiosConfig.js`:

```javascript
const USE_MOCK = true;  // true = usar mock data SIEMPRE
```

### Valores posibles:

| Valor | Comportamiento |
|-------|----------------|
| `true` | SIEMPRE usa mock (recomendado para desarrollo) |
| `false` | Intenta backend real, falla si no está disponible |
| `'auto'` | Intenta real, cae a mock si falla |

## Ejemplos Prácticos

### ¿Qué pasa si intento acceder a `/api/estadisticas` (sin mock)?

```
1. App intenta GET /api/estadisticas
2. Mock Adapter revisa si hay ruta
3. No encuentra `/estadisticas` en mockAdapter.js
4. Error: "No hay mock para: GET /api/estadisticas"
5. Resultado: "Mock data no disponible" ✗
```

**Solución:** 
- Agregar datos mock a `mockData.js`
- Agregar ruta a `mockAdapter.js`
- O conectar al backend real

### ¿Qué pasa si accedo a `/api/usuarios` (CON mock)?

```
1. App intenta GET /api/usuarios
2. Mock Adapter revisa si hay ruta
3. ¡Encuentra! Devuelve MOCK_USUARIOS
4. UI recibe datos simulados
5. Resultado: ✓ Funciona
```

## Si el Backend Real Está Disponible

Si `http://167.194.50.14:8080` está en línea y cambias `USE_MOCK = false`:

```javascript
const USE_MOCK = false;  // Usa backend real
```

### Entonces:

- Endpoints CON datos reales en backend → Devuelve datos reales ✓
- Endpoints SIN datos en backend → Error 404 del servidor

## Agregando Nuevo Mock Data

### Paso 1: Agregar datos a mockData.js

```javascript
export const MOCK_MI_FUNCIONALIDAD = [
  { id: 1, nombre: 'Item 1' },
  { id: 2, nombre: 'Item 2' },
];
```

### Paso 2: Importar en mockAdapter.js

```javascript
import { MOCK_MI_FUNCIONALIDAD } from './mockData';
```

### Paso 3: Agregar ruta en mockAdapter.js

```javascript
if (url.includes('/mi-funcionalidad') && method === 'GET') {
  return {
    data: MOCK_MI_FUNCIONALIDAD,
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
  };
}
```

### Paso 4: ¡Listo!

Ahora ese endpoint tiene mock data y funciona.

## Ventajas del Sistema Actual

✅ **Desarrollo offline** - No necesitas internet ni servidor  
✅ **Rápido** - Mock data es instantáneo (sin latencia)  
✅ **Seguro** - No hay datos reales en desarrollo  
✅ **Flexible** - Puedes cambiar de real a mock al instante  
✅ **Realista** - Los datos simulados son lo suficientemente completos  

## Desventajas y Limitaciones

⚠️ **Cambios no persisten** - Al refrescar se recargan datos originales  
⚠️ **No hay validaciones de backend** - Falta lógica del servidor  
⚠️ **No hay notificaciones reales** - Las notificaciones son simuladas  
⚠️ **Datos limitados** - Solo lo que está en mockData.js existe  

## Checklist de Mock Data Disponible

Estas funcionalidades tienen **100% de mock data** implementado:

- [x] Autenticación (login, logout)
- [x] Usuarios (CRUD)
- [x] Edificios (lectura, crear)
- [x] Departamentos (lectura)
- [x] Bitácora (crear, listar)
- [x] Paquetes (recepción, entrega)
- [x] Visitantes (lectura, crear)
- [x] Activos (lectura) **← NUEVO**
- [x] Acceso/Logs (lectura, filtros) **← NUEVO**
- [x] Finanzas (lectura) **← NUEVO**
- [x] Mantenimiento (CRUD) **← NUEVO**

## Próximos Pasos

### Para agregar más mock data:

1. **Definir la estructura** de los datos
2. **Agregar MOCK_* a mockData.js**
3. **Agregar manejador en mockAdapter.js**
4. **Probar en la UI**

### Para usar backend real:

1. **Asegurar que backend esté disponible**
2. **Cambiar USE_MOCK = false en axiosConfig.js**
3. **Verificar que todos los endpoints existan en el backend**
4. **Implementar manejo de errores para endpoints faltantes**

## Debugging: ¿Cómo saber si está usando Mock?

Abre la **Consola del Navegador** (F12) y busca:

```
✓ ✓ Con MOCK: "📦 Mock: GET /api/usuarios"
✗ Sin MOCK: "GET /api/usuarios" (request HTTP real)
```

## Conclusión

**"Mock data no disponible" = Esa funcionalidad aún no tiene datos simulados**

Puedes:
1. **Implementar los mock datos** (rápido, para desarrollo)
2. **Conectar al backend real** (si está listo)
3. **Esperar a que se implemente** el backend para esa funcionalidad

---

**Estado actual:** ✅ 99% de funcionalidades tienen mock data implementada  
**Recomendación:** Usa `USE_MOCK = true` en desarrollo para máxima velocidad
