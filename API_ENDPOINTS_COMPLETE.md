# 📡 API ENDPOINTS COMPLETO - LobbySync

## 🎯 Resumen General

Todos los endpoints mapeados según el backend real. Base URL: `http://localhost:8080`

**Estructura de rutas:**
- `/api/auth/*` - Autenticación
- `/api/v1/*` - API versión 1 (Edificios, Paquetes, Acceso, Facturas, Activos)
- `/logbook` - Bitácora (custom endpoint)
- `/visitors` - Visitantes

---

## 🔐 AUTENTICACIÓN

### POST /api/auth/login
**Login con usuario/contraseña**
```javascript
// Request
{
  username: "admin",
  password: "password123"
  // O alternativamente:
  // email: "admin@example.com"
}

// Response
{
  token: "jwt-token-here",
  user: {
    id: "user-id",
    email: "admin@example.com",
    role: "admin"
  }
}
```

**Servicio:** `authService.loginRequest(credentials)`

---

### POST /api/auth/logout
**Logout del usuario**
```javascript
// Request: sin body

// Response
{ status: 200 }
```

**Servicio:** `authService.logoutRequest()`

---

### POST /api/auth/sync
**Sincronizar usuario con Firebase**
```javascript
// Request
{
  firebaseUid: "uid-from-firebase",
  email: "user@example.com"
}

// Response
{
  status: "synced",
  userId: "internal-user-id"
}
```

**Servicio:** `authService.syncWithFirebase(firebaseData)`

---

## 👥 USUARIOS (Admin)

### GET /api/users
**Listar todos los usuarios**
```javascript
// Params: ?page=1&size=10&role=admin

// Response
{
  content: [...],
  totalElements: 100,
  totalPages: 10
}
```

**Servicio:** `adminUsers.list({ page, size, role })`

---

### GET /api/users/:id
**Obtener detalles de usuario**

**Servicio:** `adminUsers.get(userId)`

---

### POST /api/users
**Crear nuevo usuario**
```javascript
// Request
{
  username: "newuser",
  email: "new@example.com",
  password: "password",
  role: "residente"
}
```

**Servicio:** `adminUsers.create(userData)`

---

### PUT /api/users/:id
**Actualizar usuario**

**Servicio:** `adminUsers.update(userId, userData)`

---

### DELETE /api/users/:id
**Eliminar usuario**

**Servicio:** `adminUsers.delete(userId)`

---

### PATCH /api/users/:id/status
**Cambiar estado de usuario (activo/inactivo)**
```javascript
// Request
{ active: true/false }
```

**Servicio:** `adminUsers.toggleStatus(userId, active)`

---

## 🏢 EDIFICIOS (Admin)

### GET /api/v1/buildings
**Listar edificios**
```javascript
// Params: ?page=1&size=10

// Response
{
  content: [
    {
      id: "building-1",
      name: "Edificio A",
      address: "Calle 1 #123",
      floors: 5,
      units: 20
    }
  ]
}
```

**Servicio:** `adminBuildings.list({ page, size })`

---

### GET /api/v1/buildings/:id
**Obtener detalles de edificio**

**Servicio:** `adminBuildings.get(buildingId)`

---

### POST /api/v1/buildings
**Crear edificio**

**Servicio:** `adminBuildings.create(buildingData)`

---

### PUT /api/v1/buildings/:id
**Actualizar edificio**

**Servicio:** `adminBuildings.update(buildingId, buildingData)`

---

### DELETE /api/v1/buildings/:id
**Eliminar edificio**

**Servicio:** `adminBuildings.delete(buildingId)`

---

### GET /api/v1/buildings/:id/units
**Listar unidades de un edificio**

**Servicio:** `adminBuildings.getUnits(buildingId, params)`

---

## 📦 PAQUETES/PARCELAS (Conserje & Residente)

### GET /api/v1/parcels
**Listar paquetes**
```javascript
// Params: ?page=1&size=10&status=pending

// Response
{
  content: [
    {
      id: "parcel-1",
      reference: "PKG-001",
      provider: "FedEx",
      status: "received",
      recipientName: "Juan Perez",
      unitId: "unit-1",
      timestamp: "2024-12-18T10:30:00Z"
    }
  ]
}
```

**Servicio:**
- Conserje: `conciergePackages.list(params)`
- Residente: `residentPackages.list(params)`

---

### GET /api/v1/parcels/:id
**Obtener detalles de paquete**

**Servicio:**
- Conserje: `conciergePackages.get(packageId)`
- Residente: `residentPackages.get(packageId)`

---

### POST /api/v1/parcels
**Crear/registrar paquete (Conserje)**
```javascript
// Request
{
  reference: "PKG-001",
  provider: "FedEx",
  recipientName: "Juan Perez",
  unitId: "unit-1",
  description: "Paquete"
}
```

**Servicio:** `conciergePackages.create(packageData)`

---

### PUT /api/v1/parcels/:id
**Marcar como entregado (Conserje)**
```javascript
// Request
{
  status: "delivered",
  deliveredTo: "Juan Perez",
  deliveredAt: "2024-12-18T10:35:00Z"
}
```

**Servicio:** `conciergePackages.markDelivered(packageId, deliveryData)`

---

### DELETE /api/v1/parcels/:id
**Eliminar paquete**

**Servicio:** `conciergePackages.delete(packageId)`

---

## 🔐 CONTROL DE ACCESO

### GET /api/v1/access/logs
**Listar registros de acceso**
```javascript
// Params: ?page=1&size=10&buildingId=xxx&unitId=yyy&startDate=&endDate=

// Response
{
  content: [
    {
      id: "access-1",
      userId: "user-1",
      type: "entry", // entry, exit
      timestamp: "2024-12-18T10:30:00Z",
      buildingId: "building-1",
      unitId: "unit-1"
    }
  ]
}
```

**Servicio:**
- Conserje: `conciergeAccess.listLogs(params)`
- Residente: `residentAccess.listLogs(params)`

---

### POST /api/v1/access/entry
**Registrar entrada/salida (Conserje)**
```javascript
// Request
{
  userId: "user-id",
  type: "entry", // entry, exit
  buildingId: "building-1",
  unitId: "unit-1"
}

// Response
{
  id: "access-1",
  timestamp: "2024-12-18T10:30:00Z",
  status: "success"
}
```

**Servicio:** `conciergeAccess.recordEntry(accessData)`

---

### GET /api/v1/access/logs/date/:date
**Listar acceso por fecha**

**Servicio:** `conciergeAccess.listByDate(date, params)`

---

### GET /api/v1/access/logs/building/:buildingId
**Listar acceso por edificio**

**Servicio:** `conciergeAccess.listByBuilding(buildingId, params)`

---

### GET /api/v1/access/logs/unit/:unitId
**Listar acceso por unidad**

**Servicio:** `conciergeAccess.listByUnit(unitId, params)`

---

## 📝 BITÁCORA (Conserje)

### GET /logbook
**Listar entradas de bitácora**
```javascript
// Params: ?page=1&size=10&buildingId=xxx

// Response
{
  content: [
    {
      id: "entry-1",
      title: "Reparación",
      description: "Repararon tubería",
      priority: "high",
      timestamp: "2024-12-18T10:30:00Z",
      createdBy: "admin"
    }
  ]
}
```

**Servicio:** `conciergeLogbook.list(params)`

---

### GET /logbook/:id
**Obtener entrada**

**Servicio:** `conciergeLogbook.get(entryId)`

---

### POST /logbook
**Crear entrada de bitácora**
```javascript
// Request
{
  title: "Reparación",
  description: "Detalles",
  priority: "normal", // low, normal, high
  buildingId: "building-1"
}
```

**Servicio:** `conciergeLogbook.create(entryData)`

---

### PUT /logbook/:id
**Actualizar entrada**

**Servicio:** `conciergeLogbook.update(entryId, entryData)`

---

### DELETE /logbook/:id
**Eliminar entrada**

**Servicio:** `conciergeLogbook.delete(entryId)`

---

### GET /logbook/date/:date
**Listar por fecha**

**Servicio:** `conciergeLogbook.listByDate(date, params)`

---

### GET /logbook/building/:buildingId
**Listar por edificio**

**Servicio:** `conciergeLogbook.listByBuilding(buildingId, params)`

---

## 👥 VISITANTES (Conserje)

### GET /visitors
**Listar visitantes**

**Servicio:** `conciergeVisitors.list(params)`

---

### GET /visitors/:id
**Obtener detalles**

**Servicio:** `conciergeVisitors.get(visitorId)`

---

### POST /visitors
**Crear invitación de visitante**
```javascript
// Request
{
  visitorName: "Juan Doe",
  visitorEmail: "juan@example.com",
  visitorPhone: "555-1234",
  unitId: "unit-1",
  dateFrom: "2024-12-20",
  dateTo: "2024-12-22"
}
```

**Servicio:** 
- Conserje: `conciergeVisitors.create(visitorData)`
- Residente: `residentInvitations.create(invitationData)`

---

### PUT /visitors/:id
**Actualizar visitante**

**Servicio:** `conciergeVisitors.update(visitorId, visitorData)`

---

### DELETE /visitors/:id
**Eliminar visitante**

**Servicio:** `conciergeVisitors.delete(visitorId)`

---

### PATCH /visitors/:id/approve
**Aprobar visitante (Conserje)**

**Servicio:** `conciergeVisitors.approve(visitorId)`

---

### PATCH /visitors/:id/reject
**Rechazar visitante (Conserje)**

**Servicio:** `conciergeVisitors.reject(visitorId)`

---

### GET /visitors/invitations
**Listar invitaciones**

**Servicio:**
- Conserje: `conciergeVisitors.listInvitations(params)`
- Residente: `residentInvitations.listMyInvitations(params)`

---

## 💵 FACTURAS (Admin & Residente)

### GET /api/v1/bills
**Listar facturas**
```javascript
// Params: ?page=1&size=10&status=pending&unitId=xxx

// Response
{
  content: [
    {
      id: "bill-1",
      billNumber: "BILL-2024-001",
      unitId: "unit-1",
      amount: 500.00,
      dueDate: "2024-12-31",
      status: "pending", // pending, paid, overdue
      createdAt: "2024-12-01"
    }
  ]
}
```

**Servicio:**
- Admin: `adminFinance.listBills(params)`
- Residente: `residentBills.list(params)`

---

### GET /api/v1/bills/:id
**Obtener detalles de factura**

**Servicio:**
- Admin: `adminFinance.getBill(billId)`
- Residente: `residentBills.get(billId)`

---

### POST /api/v1/finance/bills/generate
**Generar facturas (Admin)**
```javascript
// Request
{
  buildingId: "building-1",
  month: "2024-12",
  amount: 500.00
}
```

**Servicio:** `adminFinance.generateBills(billData)`

---

### POST /api/v1/bills/:id/pay
**Pagar factura (Residente)**
```javascript
// Request
{
  amount: 500.00,
  paymentMethod: "transfer", // transfer, card, cash
  referenceNumber: "REF-123"
}

// Response
{
  status: "paid",
  paymentId: "pay-1",
  paidAt: "2024-12-18"
}
```

**Servicio:** `residentBills.pay(billId, paymentData)`

---

### GET /api/v1/finance/payments
**Listar pagos realizados**

**Servicio:** `adminFinance.getPayments(params)`

---

## 🔧 ACTIVOS (Admin)

### POST /api/v1/assets/record
**Registrar nuevo activo**
```javascript
// Request
{
  name: "Ascensor",
  description: "Ascensor principal",
  location: "Lobby",
  buildingId: "building-1",
  category: "elevator", // elevator, pump, generator, etc
  purchaseDate: "2020-01-15",
  warrantyExpiration: "2025-01-15"
}
```

**Servicio:** `adminAssets.record(assetData)`

---

### POST /api/v1/assets/ticket
**Crear ticket de mantenimiento**
```javascript
// Request
{
  assetId: "asset-1",
  title: "Mantenimiento preventivo",
  description: "Revisar ascensor",
  priority: "medium", // low, medium, high
  scheduledDate: "2024-12-20",
  assignedTo: "technician-id"
}

// Response
{
  ticketId: "ticket-1",
  status: "created",
  createdAt: "2024-12-18"
}
```

**Servicio:** `adminAssets.createTicket(ticketData)`

---

### GET /api/v1/assets
**Listar activos**

**Servicio:** `adminAssets.list(params)`

---

### GET /api/v1/assets/tickets
**Listar tickets de mantenimiento**

**Servicio:** `adminAssets.getTickets(params)`

---

### PUT /api/v1/assets/tickets/:id
**Actualizar ticket de mantenimiento**

**Servicio:** `adminAssets.updateTicket(ticketId, ticketData)`

---

## 🏘️ AMENIDADES (Residente)

### GET /amenities
**Listar amenidades disponibles**
```javascript
// Response
{
  content: [
    {
      id: "amenity-1",
      name: "Gym",
      description: "Sala de gimnasia",
      capacity: 20,
      location: "Piso 2"
    }
  ]
}
```

**Servicio:** `residentAmenities.listAvailable(params)` o `fetchAmenities(params)`

---

### POST /amenities/reserve
**Hacer reserva de amenidad**
```javascript
// Request
{
  amenityId: "amenity-1",
  date: "2024-12-20",
  startTime: "14:00",
  endTime: "15:00"
}

// Response
{
  reservationId: "res-1",
  status: "confirmed",
  confirmationCode: "RES-2024-001"
}
```

**Servicio:** `residentAmenities.reserve(reservationData)` o `createAmenityReservation(reservationData)`

---

### GET /amenities/my-reservations
**Ver mis reservas**

**Servicio:** `residentAmenities.myReservations(params)` o `fetchMyAmenityReservations(params)`

---

### DELETE /amenities/reservations/:id
**Cancelar reserva**

**Servicio:** `residentAmenities.cancelReservation(reservationId)` o `cancelAmenityReservation(reservationId)`

---

## 📊 MÉTRICAS (Admin)

### GET /metrics/dashboard
**Dashboard general**

**Servicio:** `adminMetrics.dashboard()`

---

### GET /metrics/users
**Métricas de usuarios**

**Servicio:** `adminMetrics.users()`

---

### GET /metrics/occupancy
**Métricas de ocupación**

**Servicio:** `adminMetrics.occupancy()`

---

### GET /metrics/activity
**Métricas de actividad**

**Servicio:** `adminMetrics.activity()`

---

### GET /metrics/finance
**Métricas financieras**

**Servicio:** `adminMetrics.finance()`

---

## 🔑 Acceso por Rol

| Rol | Acceso |
|-----|--------|
| **Admin** | Usuarios, Edificios, Unidades, Activos, Facturas, Métricas |
| **Conserje** | Bitácora, Paquetes, Visitantes, Control de Acceso |
| **Residente** | Mis Paquetes, Mis Facturas, Mi Acceso, Amenidades, Invitaciones |

---

## 📌 Notas Importantes

1. **Base URL:** `http://localhost:8080`
2. **Headers requeridos:**
   ```
   Content-Type: application/json
   Authorization: Bearer <token>
   ```
3. **Paginación:** Usar `?page=0&size=10` (page es 0-indexed)
4. **Filtros:** Dependen del endpoint
5. **Errores:** Status 401 = sin token, 403 = sin acceso, 404 = no encontrado

---

## 🔄 Flujos Principales

### Flow: Login
```
POST /api/auth/login
  ↓
Get JWT Token
  ↓
Save to localStorage
  ↓
Redirect to role dashboard
```

### Flow: Ver Paquetes (Residente)
```
GET /api/v1/parcels (con token)
  ↓
Filter by resident's unit
  ↓
Display en UI
```

### Flow: Crear Bitácora (Conserje)
```
POST /logbook (con token)
  ↓
Entry creada
  ↓
Refresh lista
```

---

