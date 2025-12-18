# 🗺️ MAPEO DE SERVICIOS → ENDPOINTS - LobbySync

## 📊 Tabla de Referencia Rápida

| Función | Servicio | Endpoint | Método | Auth |
|---------|----------|----------|--------|------|
| **LOGIN** | `authService.loginRequest()` | `/api/auth/login` | POST | No |
| **LOGOUT** | `authService.logoutRequest()` | `/api/auth/logout` | POST | Sí |
| **FIREBASE SYNC** | `authService.syncWithFirebase()` | `/api/auth/sync` | POST | Sí |
| **Listar Usuarios** | `adminUsers.list()` | `/api/users` | GET | Sí |
| **Crear Usuario** | `adminUsers.create()` | `/api/users` | POST | Sí |
| **Actualizar Usuario** | `adminUsers.update()` | `/api/users/:id` | PUT | Sí |
| **Listar Edificios** | `adminBuildings.list()` | `/api/v1/buildings` | GET | Sí |
| **Crear Edificio** | `adminBuildings.create()` | `/api/v1/buildings` | POST | Sí |
| **Listar Activos** | `adminAssets.list()` | `/api/v1/assets` | GET | Sí |
| **Registrar Activo** | `adminAssets.record()` | `/api/v1/assets/record` | POST | Sí |
| **Crear Ticket** | `adminAssets.createTicket()` | `/api/v1/assets/ticket` | POST | Sí |
| **Listar Facturas** | `adminFinance.listBills()` | `/api/v1/bills` | GET | Sí |
| **Generar Facturas** | `adminFinance.generateBills()` | `/api/v1/finance/bills/generate` | POST | Sí |
| **Listar Bitácora** | `conciergeLogbook.list()` | `/logbook` | GET | Sí |
| **Crear Entrada** | `conciergeLogbook.create()` | `/logbook` | POST | Sí |
| **Listar Paquetes** | `conciergePackages.list()` | `/api/v1/parcels` | GET | Sí |
| **Crear Paquete** | `conciergePackages.create()` | `/api/v1/parcels` | POST | Sí |
| **Marcar Entregado** | `conciergePackages.markDelivered()` | `/api/v1/parcels/:id` | PUT | Sí |
| **Listar Acceso** | `conciergeAccess.listLogs()` | `/api/v1/access/logs` | GET | Sí |
| **Registrar Acceso** | `conciergeAccess.recordEntry()` | `/api/v1/access/entry` | POST | Sí |
| **Listar Visitantes** | `conciergeVisitors.list()` | `/visitors` | GET | Sí |
| **Crear Visitante** | `conciergeVisitors.create()` | `/visitors` | POST | Sí |
| **Ver Mis Paquetes** | `residentPackages.list()` | `/api/v1/parcels` | GET | Sí |
| **Ver Mis Facturas** | `residentBills.list()` | `/api/v1/bills` | GET | Sí |
| **Pagar Factura** | `residentBills.pay()` | `/api/v1/bills/:id/pay` | POST | Sí |
| **Ver Mi Acceso** | `residentAccess.listLogs()` | `/api/v1/access/logs` | GET | Sí |
| **Crear Invitación** | `residentInvitations.create()` | `/visitors` | POST | Sí |
| **Ver Amenidades** | `residentAmenities.listAvailable()` | `/amenities` | GET | Sí |
| **Hacer Reserva** | `residentAmenities.reserve()` | `/amenities/reserve` | POST | Sí |
| **Ver Mis Reservas** | `residentAmenities.myReservations()` | `/amenities/my-reservations` | GET | Sí |

---

## 🔐 Autenticación

### Ubicación
`src/api/authService.js`

### Métodos Disponibles

```javascript
import { 
  loginRequest,
  logoutRequest,
  syncWithFirebase
} from './authService';

// Login
const response = await loginRequest({
  username: 'admin',
  password: 'password123'
  // OR email: 'admin@example.com'
});

// Logout
const response = await logoutRequest();

// Sync con Firebase
const response = await syncWithFirebase({
  firebaseUid: 'uid-from-firebase',
  email: 'user@example.com'
});
```

---

## 👨‍💼 Servicios ADMIN

### Ubicación
`src/api/adminService.js`

### Exporta

```javascript
export const adminUsers = { ... }       // CRUD usuarios
export const adminBuildings = { ... }   // CRUD edificios
export const adminUnits = { ... }       // CRUD unidades
export const adminAssets = { ... }      // Registro de activos
export const adminFinance = { ... }     // Gestión de facturas
export const adminMetrics = { ... }     // Métricas
```

### Uso Típico

```javascript
import { 
  adminUsers,
  adminBuildings,
  adminAssets,
  adminFinance,
  adminMetrics
} from './adminService';

// Listar usuarios
const users = await adminUsers.list({ page: 0, size: 10 });

// Crear usuario
const newUser = await adminUsers.create({
  username: 'newuser',
  email: 'new@example.com',
  role: 'admin'
});

// Listar edificios
const buildings = await adminBuildings.list();

// Registrar activo
const asset = await adminAssets.record({
  name: 'Ascensor',
  buildingId: 'building-1'
});

// Generar facturas
const bills = await adminFinance.generateBills({
  buildingId: 'building-1',
  month: '2024-12'
});

// Dashboard
const metrics = await adminMetrics.dashboard();
```

---

## 🔔 Servicios CONSERJE

### Ubicación
`src/api/conciergeService.js`

### Exporta

```javascript
export const conciergeLogbook = { ... }     // Bitácora
export const conciergePackages = { ... }    // Paquetes/Parceles
export const conciergeVisitors = { ... }    // Visitantes
export const conciergeAccess = { ... }      // Control de acceso
export const residentPackages = { ... }     // Para residente
```

### Uso Típico

```javascript
import {
  conciergeLogbook,
  conciergePackages,
  conciergeVisitors,
  conciergeAccess
} from './conciergeService';

// Listar bitácora
const entries = await conciergeLogbook.list({ page: 0 });

// Crear entrada
const entry = await conciergeLogbook.create({
  title: 'Reparación',
  priority: 'high'
});

// Listar paquetes
const packages = await conciergePackages.list();

// Marcar como entregado
const delivered = await conciergePackages.markDelivered(
  'parcel-1',
  { status: 'delivered', deliveredTo: 'Juan' }
);

// Registrar acceso
const access = await conciergeAccess.recordEntry({
  type: 'entry',
  buildingId: 'building-1'
});

// Crear visitante
const visitor = await conciergeVisitors.create({
  visitorName: 'Juan Doe',
  unitId: 'unit-1'
});
```

---

## 👤 Servicios RESIDENTE

### Ubicación
`src/api/residentService.js`

### Exporta

```javascript
export const residentPackages = { ... }      // Mis paquetes
export const residentBills = { ... }         // Mis facturas
export const residentAccess = { ... }        // Mi acceso
export const residentInvitations = { ... }   // Mis invitaciones
export const residentAmenities = { ... }     // Amenidades
```

### Uso Típico

```javascript
import {
  residentPackages,
  residentBills,
  residentAccess,
  residentInvitations,
  residentAmenities
} from './residentService';

// Ver mis paquetes
const myPackages = await residentPackages.list();

// Ver mis facturas
const myBills = await residentBills.list();

// Pagar factura
const payment = await residentBills.pay(
  'bill-1',
  { amount: 500, paymentMethod: 'transfer' }
);

// Ver mi acceso
const myAccess = await residentAccess.listLogs();

// Crear invitación
const invitation = await residentInvitations.create({
  visitorName: 'Juan',
  unitId: 'unit-1'
});

// Ver amenidades
const amenities = await residentAmenities.listAvailable();

// Hacer reserva
const reservation = await residentAmenities.reserve({
  amenityId: 'amenity-1',
  date: '2024-12-20'
});

// Mis reservas
const myReservations = await residentAmenities.myReservations();
```

---

## 🎯 Acceso por Rol

### ADMIN (Cuenta completa)

```
✅ Usuarios (CRUD)
✅ Edificios (CRUD)
✅ Unidades (CRUD)
✅ Activos (crear, tickets)
✅ Facturas (generar, ver)
✅ Métricas (dashboard)

❌ Bitácora (solo leer)
❌ Paquetes (solo leer)
❌ Acceso (solo leer)
```

**Ubicación de componentes:**
- `src/pages/admin/Users.jsx`
- `src/pages/admin/Buildings.jsx`
- `src/pages/admin/Units.jsx` (ready)
- `src/pages/admin/Metrics.jsx` (ready)

---

### CONSERJE (Operacional)

```
✅ Bitácora (CRUD)
✅ Paquetes (CRUD)
✅ Visitantes (CRUD + approve/reject)
✅ Acceso (ver logs + registrar)

❌ Usuarios
❌ Edificios
❌ Facturas
```

**Ubicación de componentes:**
- `src/pages/concierge/Logbook.jsx`
- `src/pages/concierge/Packages.jsx` (ready)
- `src/pages/concierge/Visitors.jsx` (ready)

---

### RESIDENTE (Consulta)

```
✅ Mis paquetes (ver)
✅ Mis facturas (ver + pagar)
✅ Mi acceso (ver)
✅ Amenidades (ver + reservar)
✅ Invitaciones (crear + ver)

❌ Todo lo demás
```

**Ubicación de componentes:**
- `src/pages/resident/MyPackages.jsx`
- `src/pages/resident/MyBills.jsx` (a crear)
- `src/pages/resident/MyAccess.jsx` (a crear)
- `src/pages/resident/ReserveAmenity.jsx`
- `src/pages/resident/CreateInvitation.jsx`

---

## 📋 Checklist de Integración

### ✅ Completado
- [x] Servicios creados (admin, concierge, resident, auth)
- [x] Endpoints mapeados
- [x] Rutas de API actualizadas a `/api/v1/*`
- [x] Autenticación con Firebase sync
- [x] 4 páginas conectadas a servicios

### ⏳ Falta Completar
- [ ] Crear `MyBills.jsx` para residente
- [ ] Crear `MyAccess.jsx` para residente
- [ ] Crear `Packages.jsx` para conserje
- [ ] Crear `Visitors.jsx` para conserje
- [ ] Crear `Units.jsx` para admin
- [ ] Crear `Metrics.jsx` para admin
- [ ] Conectar Firebase auth (opcional)
- [ ] Agregar interceptor de token en todas las requests
- [ ] Agregar refresh token logic
- [ ] Testing con backend real

---

## 🚀 Próximos Pasos

1. **Crear páginas faltantes** usando el patrón de Users.jsx:
   ```javascript
   import { residentBills } from '../../api/residentService';
   
   useEffect(() => {
     const loadBills = async () => {
       const { data } = await residentBills.list({ page: 0 });
       setBills(data.content);
     };
     loadBills();
   }, []);
   ```

2. **Conectar con backend real:**
   - Cambiar `axiosConfig.js` para usar endpoints reales
   - Desactivar mock adapter
   - Configurar headers de autorización

3. **Agregar interceptors globales:**
   ```javascript
   // En axiosConfig.js
   apiClient.interceptors.request.use((config) => {
     const token = localStorage.getItem('token');
     if (token) {
       config.headers.Authorization = `Bearer ${token}`;
     }
     return config;
   });
   ```

---

