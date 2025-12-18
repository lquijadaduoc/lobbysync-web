# 👥 Jerarquía de Funcionalidades por Rol de Usuario

## 📊 Matriz de Acceso

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    JERARQUÍA DE FUNCIONALIDADES                         │
└─────────────────────────────────────────────────────────────────────────┘

                        ADMIN
                        ════════════════════════════════════════
                        ✅ Gestión COMPLETA del sistema
                        ✅ Acceso a TODOS los módulos
                        ✅ Creación de usuarios
                        ✅ Gestión de edificios y unidades
                        ✅ Control de activos y finanzas
                        ✅ Métricas y reportes

                        CONCIERGE
                        ════════════════════════════════════════
                        ✅ Operaciones del edificio
                        ✅ Gestión de paquetes
                        ✅ Control de visitantes
                        ✅ Registro de accesos
                        ✅ Bitácora de eventos
                        ❌ NO puede gestionar usuarios
                        ❌ NO puede ver finanzas

                        RESIDENT
                        ════════════════════════════════════════
                        ✅ Ver mis datos personales
                        ✅ Recoger paquetes
                        ✅ Crear invitaciones
                        ✅ Reservar amenidades
                        ✅ Ver mis facturas
                        ✅ Ver mi historial de acceso
                        ❌ NO puede gestionar edificios
                        ❌ NO puede ver otros usuarios
```

---

## 🔐 Detalle por Rol

### 1️⃣ ADMIN - Administrador Completo

**Acceso:** Todas las funcionalidades  
**Dashboard:** Resumen general del sistema

#### Módulos Disponibles:

| Módulo | Función | Ruta | Implementado |
|--------|---------|------|--------------|
| **Usuarios** | CRUD usuarios del sistema | `/admin/users` | ✅ Sí |
| **Edificios** | CRUD edificios y propiedades | `/admin/buildings` | ✅ Sí |
| **Unidades** | CRUD departamentos/unidades | `/admin/units` | ✅ Sí |
| **Activos** | Registro y gestión de activos | (Falta página) | ⚠️ Servicio listo |
| **Finanzas** | Gestión de facturas y pagos | (Falta página) | ⚠️ Servicio listo |
| **Métricas** | Dashboard de reportes | `/admin/metrics` | ✅ Sí |

**Acciones Permitidas:**
- ✅ Crear usuario
- ✅ Editar usuario
- ✅ Eliminar usuario
- ✅ Ver todos los edificios
- ✅ Crear edificio
- ✅ Generar facturas
- ✅ Ver reportes

**Ejemplo de autorización:**
```jsx
<ProtectedRoute allowedRoles={['ADMIN']}>
  <AdminDashboard />
</ProtectedRoute>
```

---

### 2️⃣ CONCIERGE - Conserje/Portería

**Acceso:** Operaciones del edificio  
**Dashboard:** Turno actual y alertas rápidas

#### Módulos Disponibles:

| Módulo | Función | Ruta | Implementado |
|--------|---------|------|--------------|
| **Bitácora** | Registro de eventos | `/concierge/logbook` | ✅ Sí |
| **Paquetes** | Recepción y entrega de paquetes | `/concierge/packages` | ✅ Sí |
| **Visitantes** | Control y aprobación de visitas | `/concierge/visitors` | ✅ Sí |
| **Acceso** | Control de entradas y salidas | (Falta página) | ⚠️ Servicio listo |

**Acciones Permitidas:**
- ✅ Crear entrada en bitácora
- ✅ Registrar paquete recibido
- ✅ Marcar paquete entregado
- ✅ Crear registro de visitante
- ✅ Aprobar/rechazar visitantes
- ✅ Registrar acceso de entrada/salida
- ✅ Ver historial de acceso

**Acciones NO Permitidas:**
- ❌ Ver/editar usuarios
- ❌ Ver finanzas
- ❌ Acceder a /admin
- ❌ Generar reportes globales

**Ejemplo de autorización:**
```jsx
<ProtectedRoute allowedRoles={['CONCIERGE']}>
  <ConciergeDashboard />
</ProtectedRoute>
```

---

### 3️⃣ RESIDENT - Residente

**Acceso:** Datos personales solo  
**Dashboard:** Mis paquetes, invitaciones, reservas

#### Módulos Disponibles:

| Módulo | Función | Ruta | Implementado |
|--------|---------|------|--------------|
| **Mis Paquetes** | Ver paquetes personales | `/resident/packages` | ✅ Sí |
| **Mis Facturas** | Ver y pagar facturas | `/resident/bills` | ✅ Sí |
| **Mi Acceso** | Ver historial de acceso personal | `/resident/access` | ✅ Sí |
| **Invitar Visita** | Crear código temporal para invitado | `/resident/invitations` | ✅ Sí |
| **Reservar Amenidad** | Reservar áreas comunes | `/resident/amenities` | ✅ Sí |

**Acciones Permitidas:**
- ✅ Ver mis paquetes (solo los míos)
- ✅ Ver mis facturas (solo las mías)
- ✅ Pagar mi factura
- ✅ Ver historial de mi acceso
- ✅ Crear invitación para visitante
- ✅ Ver amenidades disponibles
- ✅ Hacer reserva de amenidad

**Acciones NO Permitidas:**
- ❌ Ver paquetes de otros residentes
- ❌ Ver facturas de otros residentes
- ❌ Ver historial de otro usuario
- ❌ Acceder a /admin
- ❌ Acceder a /concierge
- ❌ Gestionar usuarios

**Ejemplo de autorización:**
```jsx
<ProtectedRoute allowedRoles={['RESIDENT']}>
  <ResidentDashboard />
</ProtectedRoute>
```

---

## 🔄 Flujo de Autenticación y Autorización

```
Usuario ingresa credenciales
          ↓
    Login request
          ↓
Backend devuelve JWT con rol
          ↓
AuthProvider decodifica token
          ↓
Se guarda: token + role en estado
          ↓
ProtectedRoute verifica rol
          ↓
┌─────────────────────────────────┐
│ Rol verificado?                 │
├─────────────────────────────────┤
│ ✅ SÍ → Mostrar página          │
│ ❌ NO → Redirigir a /forbidden  │
└─────────────────────────────────┘
```

---

## 📋 Implementación de Seguridad

### 1. **ProtectedRoute.jsx** - Validación en rutas

```jsx
const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { isAuthenticated, role } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;  // ← No autenticado
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" />;  // ← Rol no permitido
  }
  
  return children;  // ← Acceso permitido
};
```

### 2. **AuthProvider.jsx** - Decodificación de JWT

```jsx
const decodeRole = (token) => {
  const decoded = jwtDecode(token);
  const role = decoded.role || decoded.rol || decoded.authority;
  
  return { role, email, ...decoded };
};
```

### 3. **AppRouter.jsx** - Definición de rutas protegidas

```jsx
// Solo ADMIN puede acceder
<Route path="/admin/*" 
  element={<ProtectedRoute allowedRoles={['ADMIN']}>
    <DashboardLayout />
  </ProtectedRoute>}
/>

// Solo CONCIERGE puede acceder
<Route path="/concierge/*" 
  element={<ProtectedRoute allowedRoles={['CONCIERGE']}>
    <DashboardLayout />
  </ProtectedRoute>}
/>

// Solo RESIDENT puede acceder
<Route path="/resident/*" 
  element={<ProtectedRoute allowedRoles={['RESIDENT']}>
    <DashboardLayout />
  </ProtectedRoute>}
/>
```

---

## 🎯 Estado de Implementación

### ✅ COMPLETADO

```
Autenticación
├── ✅ Login con validación de rol
├── ✅ Logout
├── ✅ Token storage (localStorage)
└── ✅ Decodificación de JWT

Rutas Protegidas
├── ✅ ProtectedRoute con validación
├── ✅ Redirección a /unauthorized si no tiene rol
└── ✅ Redirección a /login si no está autenticado

Dashboards por Rol
├── ✅ AdminDashboard
├── ✅ ConciergeDashboard
└── ✅ ResidentDashboard

Páginas ADMIN
├── ✅ Users.jsx (CRUD usuarios)
├── ✅ Buildings.jsx (CRUD edificios)
├── ✅ Units.jsx (CRUD unidades)
├── ✅ Metrics.jsx (reportes)
└── ⚠️ Assets, Finance (servicios listos, falta UI)

Páginas CONCIERGE
├── ✅ Logbook.jsx (bitácora)
├── ✅ Packages.jsx (paquetes)
├── ✅ Visitors.jsx (visitantes)
└── ⚠️ Access logs (servicio listo, falta UI)

Páginas RESIDENT
├── ✅ ResidentDashboard
├── ✅ MyPackages.jsx
├── ✅ MyBills.jsx (NUEVO)
├── ✅ MyAccess.jsx (NUEVO)
├── ✅ CreateInvitation.jsx
└── ✅ ReserveAmenity.jsx
```

---

## ⚠️ FALTA IMPLEMENTAR

### Páginas de UI (servicios listos, falta interfaz)

1. **Admin Assets** - `/admin/assets`
   - Servicio: `adminAssets` ✅
   - Página: Falta crear

2. **Admin Finance** - `/admin/finance`
   - Servicio: `adminFinance` ✅
   - Página: Falta crear

3. **Concierge Access** - `/concierge/access`
   - Servicio: `conciergeAccess` ✅
   - Página: Falta crear

### Control de Acceso en Nivel de Componente

```jsx
// Ejemplo: Mostrar botón solo si es ADMIN
import { useAuth } from '../../auth/AuthProvider';

function Component() {
  const { role } = useAuth();
  
  return (
    <>
      {role === 'ADMIN' && (
        <button>Crear usuario</button>
      )}
      
      {role === 'RESIDENT' && (
        <button>Crear invitación</button>
      )}
    </>
  );
}
```

---

## 🧪 Test de Roles

### Test 1: Login como ADMIN
```bash
1. http://localhost:5173/login
2. Ingresa credenciales ADMIN
3. Debería ir a /admin
4. Ver: Users, Buildings, Units, Metrics
```

### Test 2: Login como CONCIERGE
```bash
1. http://localhost:5173/login
2. Ingresa credenciales CONCIERGE
3. Debería ir a /concierge
4. Ver: Logbook, Packages, Visitors
```

### Test 3: Login como RESIDENT
```bash
1. http://localhost:5173/login
2. Ingresa credenciales RESIDENT
3. Debería ir a /resident
4. Ver: Packages, Bills, Access, Invitations
```

### Test 4: Acceso sin autorización
```bash
1. Login como RESIDENT
2. Intenta acceder a http://localhost:5173/admin/users
3. Debería redirigir a /unauthorized
```

---

## 📚 Resumen

**La jerarquía está IMPLEMENTADA y FUNCIONAL:**

```
NIVEL 3: ADMIN
         ├─ Gestión total
         └─ 6 módulos principales

         ↓ (subordinado a)

NIVEL 2: CONCIERGE
         ├─ Operaciones
         └─ 4 módulos operacionales

         ↓ (subordinado a)

NIVEL 1: RESIDENT
         ├─ Consulta personal
         └─ 5 módulos de auto-servicio
```

Cada rol tiene:
- ✅ Dashboard personalizado
- ✅ Páginas específicas
- ✅ Servicios API configurados
- ✅ Rutas protegidas
- ✅ Acceso controlado por JWT

