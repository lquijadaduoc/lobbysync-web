# 🎯 Qué Ve Cada Usuario - Guía Visual

## Login

```
┌─────────────────────────────────────────┐
│     LOGIN PAGE                          │
├─────────────────────────────────────────┤
│                                         │
│  Usuario: [________________]            │
│  Contraseña: [________________]         │
│                                         │
│         [Ingresar]                      │
│                                         │
└─────────────────────────────────────────┘
         ↓
  Backend devuelve:
  {
    token: "eyJhbGc...",
    role: "ADMIN" | "CONCIERGE" | "RESIDENT"
  }
         ↓
  Role-based Redirect
         ↓
   ┌─────┬──────────┬─────────┐
   ↓     ↓          ↓         ↓
  ADMIN CONCIERGE RESIDENT   ERROR
```

---

## 🔑 ADMIN - Administrador

```
┌────────────────────────────────────────────────────────┐
│                    ADMIN PANEL                         │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Panel ADMIN                          Salir            │
│  LobbySync                                             │
│  ────────────────────────────────────────             │
│  📊 Dashboard                                          │
│  👥 Usuarios         ← CRUD completo                  │
│  🏢 Edificios        ← CRUD completo                  │
│  🏠 Unidades         ← CRUD completo                  │
│  🔧 Activos          ← Gestión activos                │
│  💰 Finanzas         ← Gestión facturas               │
│  📈 Métricas         ← Reportes                        │
│                                                        │
└────────────────────────────────────────────────────────┘

PUEDE HACER:
  ✅ Ver todos los usuarios del sistema
  ✅ Crear nuevos usuarios
  ✅ Editar datos de cualquier usuario
  ✅ Eliminar usuarios
  ✅ Crear/editar edificios
  ✅ Crear/editar unidades
  ✅ Registrar y gestionar activos
  ✅ Generar y gestionar facturas
  ✅ Ver reportes y métricas

NO PUEDE HACER:
  ❌ Ver datos de otros administradores (restricción backend)
  ❌ Eliminar su propia cuenta
  ❌ Cambiar su propio rol
```

---

## 🔑 CONCIERGE - Conserje/Portería

```
┌────────────────────────────────────────────────────────┐
│                 CONCIERGE PANEL                        │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Panel CONCIERGE                      Salir            │
│  LobbySync                                             │
│  ────────────────────────────────────────             │
│  📋 Bitácora         ← Registro de eventos            │
│  📦 Paquetes        ← Recepción/Entrega               │
│  👤 Visitantes      ← Aprobación de visitas           │
│  🚪 Control Acceso  ← Log de entrada/salida           │
│                                                        │
└────────────────────────────────────────────────────────┘

PUEDE HACER:
  ✅ Ver todos los paquetes del edificio
  ✅ Registrar recepción de paquete
  ✅ Marcar paquete como entregado
  ✅ Crear entrada en bitácora
  ✅ Ver historial de eventos (bitácora)
  ✅ Crear registro de visitante
  ✅ Aprobar visitantes
  ✅ Rechazar visitantes
  ✅ Ver logs de acceso

NO PUEDE HACER:
  ❌ Ver/editar usuarios
  ❌ Ver finanzas o facturas
  ❌ Gestionar edificios o unidades
  ❌ Ver datos personales de residentes
  ❌ Acceder a /admin
```

---

## 🔑 RESIDENT - Residente

```
┌────────────────────────────────────────────────────────┐
│                 RESIDENT PANEL                         │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Panel RESIDENT                       Salir            │
│  LobbySync                                             │
│  ────────────────────────────────────────             │
│  📦 Mis Paquetes    ← Ver paquetes personales         │
│  💵 Mis Facturas    ← Ver y pagar facturas            │
│  🚪 Mi Acceso       ← Ver mi historial acceso         │
│  👥 Invitar Visita  ← Crear invitación temporal       │
│  🏊 Amenidades      ← Reservar áreas comunes          │
│                                                        │
└────────────────────────────────────────────────────────┘

PUEDE HACER:
  ✅ Ver MIS paquetes (solo los destinados a mi unidad)
  ✅ Ver MIS facturas (solo mis facturas)
  ✅ Pagar mis facturas (procesar pago)
  ✅ Ver MI historial de acceso
  ✅ Crear invitación para visitante
  ✅ Ver todas las amenidades disponibles
  ✅ Hacer reserva de amenidad
  ✅ Ver mis reservas actuales

NO PUEDE HACER:
  ❌ Ver paquetes de otros residentes
  ❌ Ver facturas de otros residentes
  ❌ Ver datos de otros usuarios
  ❌ Crear usuarios
  ❌ Acceder a /admin
  ❌ Acceder a /concierge
```

---

## 📊 Matriz de Permisos Detallada

```
FUNCIÓN                  ADMIN    CONCIERGE    RESIDENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Ver Usuarios             ✅       ❌           ❌
Crear Usuario            ✅       ❌           ❌
Editar Usuario           ✅       ❌           ❌
Eliminar Usuario         ✅       ❌           ❌

Ver Edificios            ✅       ✅ (lectura) ❌
Crear Edificio           ✅       ❌           ❌
Editar Edificio          ✅       ❌           ❌

Ver Paquetes             ✅       ✅           ✅ (míos)
Registrar Paquete        ❌       ✅           ❌
Entregar Paquete         ❌       ✅           ❌

Ver Visitantes           ✅       ✅           ❌
Registrar Visitante      ❌       ✅           ✅ (crear)
Aprobar Visitante        ❌       ✅           ❌

Ver Acceso               ✅       ✅           ✅ (mío)
Registrar Acceso         ❌       ✅           ❌

Ver Facturas             ✅       ❌           ✅ (mías)
Generar Facturas         ✅       ❌           ❌
Pagar Factura            ❌       ❌           ✅ (mías)

Ver Activos              ✅       ❌           ❌
Registrar Activo         ✅       ❌           ❌

Ver Amenidades           ✅ (all) ✅ (all)     ✅ (all)
Reservar Amenidad        ❌       ❌           ✅

Ver Bitácora             ✅ (all) ✅ (all)     ❌
Crear Bitácora           ❌       ✅           ❌

Ver Métricas/Reportes    ✅       ❌           ❌

Dashboard Personalizado  ✅       ✅           ✅
```

---

## 🔐 Cómo Se Implementa la Seguridad

### 1. En Rutas (AppRouter.jsx)
```jsx
// Solo ADMIN puede entrar aquí
<Route path="/admin/*"
  element={
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AdminDashboard />
    </ProtectedRoute>
  }
/>

// Si RESIDENT intenta entrar:
// ❌ ProtectedRoute rechaza
// → Redirige a /unauthorized
```

### 2. En Componentes
```jsx
// Mostrar botón solo si es ADMIN
const { role } = useAuth();

return (
  <>
    {role === 'ADMIN' && <button>Crear usuario</button>}
    {role === 'RESIDENT' && <button>Crear invitación</button>}
  </>
);
```

### 3. En Servicios API
```jsx
// El backend también valida
// Si RESIDENT intenta:
//   POST /api/users → 403 Forbidden
//   GET /api/v1/buildings → 403 Forbidden

// Solo GET /api/v1/bills → ✅ 200 OK
```

---

## 🧪 Escenarios de Prueba

### Escenario 1: Admin accede a /admin/users
```
✅ PERMITIDO
└─ Muestra lista de todos los usuarios del sistema
└─ Botones: Crear, Editar, Eliminar
```

### Escenario 2: Resident accede a /admin/users
```
❌ DENEGADO
└─ ProtectedRoute redirige a /unauthorized
└─ Muestra mensaje de acceso denegado
```

### Escenario 3: Concierge accede a /concierge/logbook
```
✅ PERMITIDO
└─ Muestra bitácora del edificio
└─ Puede crear nuevas entradas
└─ No ve datos financieros
```

### Escenario 4: Resident accede a /resident/bills
```
✅ PERMITIDO
└─ Muestra SOLO sus facturas personales
└─ Puede pagar sus facturas
└─ No ve facturas de otros residentes
```

---

## 📱 Flujo Completo de Usuario

```
ADMIN FLOW:
   Login → Dashboard (métricas)
      ├─ Gestionar Usuarios
      ├─ Gestionar Edificios
      ├─ Gestionar Finanzas
      └─ Ver Reportes

CONCIERGE FLOW:
   Login → Dashboard (turno)
      ├─ Gestionar Paquetes
      ├─ Gestionar Visitantes
      ├─ Registrar Accesos
      └─ Crear Bitácora

RESIDENT FLOW:
   Login → Dashboard (mis cosas)
      ├─ Ver Mis Paquetes
      ├─ Pagar Mis Facturas
      ├─ Ver Mi Acceso
      ├─ Crear Invitación
      └─ Reservar Amenidades
```

---

## ✅ Estado Actual

- ✅ Autenticación por rol implementada
- ✅ Rutas protegidas por rol
- ✅ Dashboards personalizados
- ✅ Control de acceso en componentes
- ✅ 15+ páginas funcionales
- ✅ 50+ endpoints de API
- ⚠️ Falta: Assets, Finance, Access (pages) - servicios listos

