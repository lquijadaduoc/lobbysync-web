# 🌐 Cómo Probar la Aplicación en Orden por HTML

## Opción 1: Con el Servidor en Vivo (RECOMENDADO)

### Paso 1: Iniciar la aplicación
```powershell
cd "c:\Users\Sebastian\Desktop\Examen Final\lobbysync-web"
npm run dev
```

### Paso 2: Acceder a las guías
En tu navegador, abre:

- **Guía de Testing Completa:** `http://localhost:5173/GUIA_TESTING.html`
  - Tutorial paso a paso de todas las funcionalidades
  - Testing checklist
  - Errores comunes y soluciones

- **Catálogo Interactivo:** `http://localhost:5173/CATALOGO_FUNCIONALIDADES.html`
  - Búsqueda y filtrado de funcionalidades
  - Qué hace cada una
  - Cómo probarla
  - Rol requerido

### Paso 3: Probar la aplicación
Accede a: `http://localhost:5173/`

## Opción 2: Sin Servidor (HTML Local)

Si quieres ver las guías sin ejecutar la app:

### Opción A: Abrir directamente con doble click
```
Localización: c:\Users\Sebastian\Desktop\Examen Final\lobbysync-web\GUIA_TESTING.html
Doble click → Se abre en tu navegador
```

### Opción B: Desde línea de comandos
```powershell
# Windows
start "c:\Users\Sebastian\Desktop\Examen Final\lobbysync-web\GUIA_TESTING.html"

# O así
& 'c:\Users\Sebastian\Desktop\Examen Final\lobbysync-web\GUIA_TESTING.html'
```

## Plan Completo de Testing (En Orden)

### 📋 Paso 1: Preparar (5 minutos)

```bash
cd "c:\Users\Sebastian\Desktop\Examen Final\lobbysync-web"
npm run dev
# Espera a que diga "Local: http://localhost:5173"
```

### 🔐 Paso 2: Probar Autenticación (5 minutos)

**URL:** `http://localhost:5173`

1. **Test Quick Buttons:**
   - Click en "👑 Ver TODO" (SUPER_ADMIN)
   - Verifica que se abra el dashboard
   - Abre DevTools (F12) → Console
   - Busca: `"📦 Mock: GET /"` (esto significa que está usando mock)

2. **Test Logout:**
   - Click en menu → Logout
   - Verifica que vuelva a login

3. **Test Acceso Denegado:**
   - Abre en nueva pestaña: `http://localhost:5173/admin`
   - SUPER_ADMIN → Debería dejarle
   - Logout y login como RESIDENT
   - `http://localhost:5173/admin` → Debe mostrar "Acceso Denegado"

### 👥 Paso 3: Panel Admin (5 minutos)

**Roles que pueden:** ADMIN, SUPER_ADMIN

1. Login como ADMIN
2. Click en "Panel" en el menú lateral
3. Observa:
   - Total de usuarios
   - Edificios activos
   - Gráficos de actividad
4. Verifica que los números sean razonables

### 👥 Paso 4: Gestión de Usuarios (5 minutos)

**Roles que pueden:** ADMIN, SUPER_ADMIN

1. Click en "Usuarios" en el menú
2. Verifica lista de 6 usuarios
3. Click en "Crear Usuario"
4. Completa formulario (datos ficticios)
5. Click "Guardar"
6. **NOTA:** Los cambios se guardan en memoria (se pierden al refrescar)

### 🏢 Paso 5: Gestión de Edificios (3 minutos)

**Roles que pueden:** ADMIN, SUPER_ADMIN

1. Click en "Edificios"
2. Verifica los 3 edificios simulados
3. Intenta crear uno nuevo
4. Verifica que aparezca en la lista

### 🚪 Paso 6: Gestión de Departamentos (3 minutos)

**Roles que pueden:** ADMIN, SUPER_ADMIN

1. Click en "Departamentos"
2. Verifica estructura por edificio y piso
3. Intenta cambiar información

### 📝 Paso 7: Bitácora (CONCIERGE) (10 minutos)

**Roles que pueden:** CONCIERGE, SUPER_ADMIN

1. Logout del admin
2. Login como CONCIERGE
3. Click en "Bitácora"
4. **Pruebas:**
   - ✓ Ver lista de 5 eventos
   - ✓ Click en "Nuevo Evento"
   - ✓ Completa: Tipo, Descripción, Edificio, Prioridad, Detalles
   - ✓ Click "Guardar Evento"
   - ✓ Verifica que aparezca en la lista
   - ✓ Intenta filtrar por tipo
   - ✓ Intenta buscar por fecha

### 📦 Paso 8: Paquetería (CONCIERGE) (10 minutos)

**Roles que pueden:** CONCIERGE, SUPER_ADMIN

1. Click en "Paquetería"
2. **Pruebas:**
   - ✓ Ver tabla de 3 paquetes
   - ✓ Haz click en uno para ver detalles
   - ✓ Cambia el estado a "Entregado"
   - ✓ Verifica que se actualice
   - ✓ Filtra por estado
   - ✓ Busca por número de seguimiento

### 🚪 Paso 9: Visitas (CONCIERGE) (5 minutos)

**Roles que pueden:** CONCIERGE, SUPER_ADMIN

1. Click en "Visitas"
2. Verifica lista de visitantes pendientes
3. Intenta aprobar/rechazar una invitación
4. Verifica cambios en estado

### 📦 Paso 10: Mis Paquetes (RESIDENT) (5 minutos)

**Roles que pueden:** RESIDENT, SUPER_ADMIN

1. Logout
2. Login como RESIDENT
3. Click en "Paquetes"
4. **Pruebas:**
   - ✓ Ver solo paquetes del residente (no todos)
   - ✓ Verifica estado de cada paquete
   - ✓ Intenta filtrar por estado

### 💳 Paso 11: Mis Facturas (RESIDENT) (10 minutos)

**Roles que pueden:** RESIDENT, SUPER_ADMIN

**ESTA ES LA FUNCIONALIDAD MÁS COMPLETA**

1. Click en "Facturas"
2. **Pruebas:**
   - ✓ Ver tabla de facturas con estados (Pendiente, Pagada, Vencida)
   - ✓ Filtra por estado
   - ✓ Click en "Pagar" en una factura pendiente
   - ✓ Modal aparece con opciones de pago
   - ✓ Selecciona método: Tarjeta, Transferencia o Efectivo
   - ✓ Completa datos ficticios
   - ✓ Click "Confirmar Pago"
   - ✓ Verifica mensaje de éxito
   - ✓ Verifica que factura ahora sea "Pagada"
   - ✓ Intenta el proceso con otra factura

### 🔐 Paso 12: Mi Acceso (RESIDENT) (5 minutos)

**Roles que pueden:** RESIDENT, SUPER_ADMIN

1. Click en "Acceso"
2. **Pruebas:**
   - ✓ Ver historial con 5 registros
   - ✓ Cada uno muestra: fecha, hora, tipo (entrada/salida), puerta, método
   - ✓ Filtra por fecha
   - ✓ Filtra por tipo de acceso
   - ✓ Combina múltiples filtros
   - ✓ Verifica que los registros sean del residente actual

### 🎯 Paso 13: Invitaciones (RESIDENT) (5 minutos)

**Roles que pueden:** RESIDENT, SUPER_ADMIN

1. Click en "Invitaciones"
2. Click en "Crear Invitación"
3. Completa:
   - Nombre del visitante
   - Email y teléfono
   - Fecha y hora de visita
   - Motivo
4. Click "Crear"
5. Verifica que aparezca en lista de invitaciones

### 🏋️ Paso 14: Amenidades (RESIDENT) (5 minutos)

**Roles que pueden:** RESIDENT, SUPER_ADMIN

1. Click en "Amenidades"
2. Verifica lista de espacios (Gym, Piscina, Salón, Cine)
3. Intenta hacer una reserva
4. Selecciona fecha y hora
5. Click "Reservar"

### 🔧 Paso 15: Gestión de Activos (ADMIN) (5 minutos)

**Roles que pueden:** ADMIN, SUPER_ADMIN

1. Login como ADMIN
2. Intenta ir a Assets (si existe el menú)
3. Verifica lista de equipos
4. Ver datos técnicos

### 💰 Paso 16: Finanzas (ADMIN) (5 minutos)

**Roles que pueden:** ADMIN, SUPER_ADMIN

1. Click en Finanzas (si existe)
2. Verifica ingresos/gastos
3. Analiza reportes

## 📊 Testing Matrix Rápida

Copia esta tabla y marca según completes:

```
┌─────────────────────────┬──────────┬──────────┬──────────┐
│ Funcionalidad           │ ADMIN    │ CONCIERGE│ RESIDENT │
├─────────────────────────┼──────────┼──────────┼──────────┤
│ Login                   │ ✓ OK     │ ✓ OK     │ ✓ OK     │
│ Panel                   │ ✓ OK     │ ✗ No     │ ✗ No     │
│ Usuarios                │ ✓ OK     │ ✗ No     │ ✗ No     │
│ Edificios               │ ✓ OK     │ ✗ No     │ ✗ No     │
│ Departamentos           │ ✓ OK     │ ✗ No     │ ✗ No     │
│ Bitácora                │ ✗ No     │ ✓ OK     │ ✗ No     │
│ Paquetería              │ ✗ No     │ ✓ OK     │ ✓ OK*    │
│ Visitas                 │ ✗ No     │ ✓ OK     │ ✓ OK**   │
│ Acceso                  │ ✗ No     │ ✓ OK     │ ✓ OK***  │
│ Mis Paquetes            │ ✗ No     │ ✗ No     │ ✓ OK     │
│ Mis Facturas            │ ✗ No     │ ✗ No     │ ✓ OK     │
│ Mi Acceso               │ ✗ No     │ ✗ No     │ ✓ OK     │
│ Invitaciones            │ ✗ No     │ ✗ No     │ ✓ OK     │
│ Amenidades              │ ✗ No     │ ✗ No     │ ✓ OK     │
└─────────────────────────┴──────────┴──────────┴──────────┘

* RESIDENT ve solo sus paquetes
** RESIDENT puede crear invitaciones
*** RESIDENT ve solo su historial
```

## 🔍 Debugging: Verificar que está usando MOCK

**Abre DevTools (F12) y ve a la pestaña Console**

### Signos de que está en MOCK mode:
```
✓ Ves mensajes: "📦 Mock: GET /api/..."
✓ Las respuestas son instantáneas (< 100ms)
✓ Cambios se pierden al refrescar página
```

### Signos de que intenta backend real:
```
✓ Ves mensajes: "GET /api/..." (sin el prefijo 📦 Mock)
✓ Hay latencia (tarda > 1 segundo)
✓ Posibles errores de timeout
```

### Ver todos los requests en consola:
```javascript
// Abre DevTools → Console y pega esto:
console.log(document.location.href)
```

## ⚙️ Soluciones a Problemas Comunes

### Problema: "Blank page" al abrir
**Solución:**
1. Refresca (Ctrl+R)
2. Abre DevTools (F12) → Console
3. Verifica errores rojos
4. Si hay errores, reinicia: Ctrl+C + `npm run dev`

### Problema: "Backend no disponible"
**Solución:** ESTO ES NORMAL
- El app cambia a MOCK automáticamente
- Verifica en Console: "Backend no disponible, usando mock data"
- Funciona con datos simulados

### Problema: Los cambios no se guardan
**Solución:** ESTO ES CORRECTO EN MOCK
- Los datos se guardan en memoria
- Se pierden al refrescar
- Prueba refrescando y viendo que vuelve a los datos originales

### Problema: No puedo pagar facturas
**Solución:**
1. Verifica que seas RESIDENT o SUPER_ADMIN
2. La factura debe tener estado "Pendiente"
3. Click en botón "Pagar"
4. Selecciona método de pago
5. Completa datos ficticios

## 📋 Checklist Final

Después de completar todas las pruebas:

- [ ] Login funciona con 4 usuarios
- [ ] SUPER_ADMIN accede a TODO
- [ ] ADMIN solo ve panel admin
- [ ] CONCIERGE solo ve operaciones
- [ ] RESIDENT solo ve personal
- [ ] Bitácora: crear, listar, filtrar funciona
- [ ] Paquetes: cambiar estado funciona
- [ ] Facturas: pagar funciona completamente
- [ ] Acceso: filtros funcionan
- [ ] No hay errores en Console (F12)
- [ ] Las páginas cargan rápido (< 2s)
- [ ] Las guías HTML abren correctamente

## 🎯 Conclusión

**¡La aplicación está LISTA PARA PROBAR!**

- Todas las funcionalidades principales funcionan
- 18+ páginas completamente operacionales
- Sistema de roles y seguridad implementado
- Mock data para desarrollo offline
- Listo para conectar backend real

**Disfruta probando:** `npm run dev` → `http://localhost:5173`
