# 🎯 Mapeo de Funcionalidades - Perfil Residente

## 📋 FUNCIONALIDADES REQUERIDAS vs ENDPOINTS DISPONIBLES

### 1. 💰 MIS FINANZAS (Finances)

#### Colilla de Gasto Común
- **Funcionalidad**: Ver detalle de cobro mensual
- **Endpoint Requerido**: `GET /api/finance/units/{unitId}/debt`
- **Estado**: ❌ NO EXISTE
- **Alternativa**: Usar `/api/v1/units/{id}` y agregar cálculo de deuda
- **Acción**: Implementar en backend

#### Historial de Pagos
- **Funcionalidad**: Ver pagos realizados por año
- **Endpoint Requerido**: `GET /api/finance/bills/unit/{unitId}/year/{year}`
- **Estado**: ❌ NO EXISTE
- **Alternativa**: Crear endpoint
- **Acción**: Implementar en backend

#### Formulario de Pago
- **Funcionalidad**: Subir comprobante de pago
- **Endpoint Requerido**: `POST /api/finance/payments`
- **Estado**: ❌ NO EXISTE
- **Alternativa**: Crear endpoint
- **Acción**: Implementar en backend

---

### 2. 📅 RESERVAS DE ESPACIOS (ReserveAmenity)

#### Calendario de Disponibilidad
- **Funcionalidad**: Ver espacios disponibles por mes
- **Endpoint Requerido**: `GET /api/reservations/common-areas`
- **Estado**: ❌ NO EXISTE
- **Alternativa**: Usar `/api/v1/buildings/{id}` y agregar amenities
- **Acción**: Implementar en backend

#### Solicitar Reserva
- **Funcionalidad**: Crear nueva solicitud de reserva
- **Endpoint Requerido**: `POST /api/reservations`
- **Estado**: ❌ NO EXISTE
- **Alternativa**: Crear endpoint
- **Acción**: Implementar en backend

#### Ver Estado de Solicitud
- **Funcionalidad**: Ver estado (Pendiente/Aprobada/Rechazada)
- **Endpoint Requerido**: `GET /api/reservations/my-reservations`
- **Estado**: ❌ NO EXISTE
- **Alternativa**: Crear endpoint
- **Acción**: Implementar en backend

---

### 3. 👥 MI UNIDAD (MyHome)

#### Familia - Registrar Integrantes
- **Funcionalidad**: CRUD de integrantes del depto
- **Endpoint Requerido**: `GET/POST/PUT/DELETE /api/home/family`
- **Estado**: ❌ NO EXISTE
- **Código Backend**: ✅ EXISTE (`FamilyMemberService`, `FamilyMemberRepository`)
- **Acción**: Implementar controller

#### Vehículos - Registrar Autos
- **Funcionalidad**: CRUD de vehículos (patente, modelo)
- **Endpoint Requerido**: `GET/POST/PUT/DELETE /api/home/vehicles`
- **Estado**: ❌ NO EXISTE
- **Código Backend**: ✅ EXISTE (`Vehicle` model, `VehicleRepository`)
- **Acción**: Implementar controller

#### Mascotas - Registrar Animales
- **Funcionalidad**: CRUD de mascotas
- **Endpoint Requerido**: `GET/POST/PUT/DELETE /api/home/pets`
- **Estado**: ❌ NO EXISTE
- **Código Backend**: ✅ EXISTE (`Pet` model, `PetRepository`)
- **Acción**: Implementar controller

---

### 4. 🛡️ VISITAS FRECUENTES (Whitelist)

#### Gestión de Lista Blanca
- **Funcionalidad**: CRUD de personas de confianza
- **Endpoint Requerido**: `GET/POST/PUT/DELETE /api/whitelist`
- **Estado**: ❌ NO EXISTE
- **Código Backend**: ✅ EXISTE (`WhitelistContact` model, `WhitelistService`)
- **Acción**: Implementar controller

---

### 5. 🔧 TICKETS Y SOLICITUDES (Tickets)

#### Crear Reportes de Mantención
- **Funcionalidad**: Crear nuevo ticket/reclamo
- **Endpoint Requerido**: `POST /api/tickets`
- **Estado**: ✅ EXISTE
- **Verificación**: OK - Funciona correctamente

#### Seguimiento del Estado
- **Funcionalidad**: Ver estado de reclamos
- **Endpoint Requerido**: `GET /api/tickets`
- **Estado**: ✅ EXISTE
- **Verificación**: OK - Funciona correctamente

---

### 6. 📂 DOCUMENTOS (Documents)

#### Descargar Documentos
- **Funcionalidad**: Acceso a reglamento, actas, circulares
- **Endpoint Requerido**: `GET /api/documents`, `GET /api/documents/{id}/download`
- **Estado**: ❌ NO EXISTE
- **Código Backend**: ✅ EXISTE (`DocumentEntity` model, `DocumentService`)
- **Acción**: Implementar controller

---

### 7. 📦 HISTORIAL DE PAQUETES (MyPackages)

#### Tabla Histórica de Paquetes
- **Funcionalidad**: Ver paquetes recibidos
- **Endpoint Requerido**: `GET /api/parcels/my-pending`
- **Estado**: ❌ NO EXISTE
- **Código Backend**: ⚠️ PARCIAL (existe `ParcelService` pero falta endpoint)
- **Acción**: Implementar endpoint GET

---

### 8. 💌 INVITACIONES (MyInvitations)

#### Crear y Gestionar Invitaciones
- **Funcionalidad**: CRUD de invitaciones para visitas
- **Endpoint Requerido**: `GET/POST/DELETE /api/invitations`
- **Estado**: ❌ NO EXISTE
- **Código Backend**: ✅ EXISTE (`Invitation` model, `InvitationService`)
- **Acción**: Implementar controller

---

## 📊 RESUMEN DE ESTADO

| Funcionalidad | Backend Code | Controller | Endpoint | Status |
|--------------|--------------|-----------|----------|--------|
| Familia | ✅ | ❌ | ❌ | 33% |
| Vehículos | ✅ | ❌ | ❌ | 33% |
| Mascotas | ✅ | ❌ | ❌ | 33% |
| Lista Blanca | ✅ | ❌ | ❌ | 33% |
| Documentos | ✅ | ❌ | ❌ | 33% |
| Tickets | ✅ | ✅ | ✅ | 100% |
| Invitaciones | ✅ | ❌ | ❌ | 33% |
| Finanzas | ⚠️ | ❌ | ❌ | 0% |
| Reservas | ⚠️ | ❌ | ❌ | 0% |
| Paquetes | ✅ | ❌ | ❌ | 33% |

---

## 🎯 PLAN DE ACCIÓN

### PRIORIDAD 1 (Crítica) - Completar Backend
1. ✅ Implementar `HomeController` con endpoints:
   - `GET/POST/PUT/DELETE /api/home/family`
   - `GET/POST/PUT/DELETE /api/home/pets`
   - `GET/POST/PUT/DELETE /api/home/vehicles`

2. ✅ Implementar `DocumentController` con endpoints:
   - `GET /api/documents`
   - `GET /api/documents/{id}/download`

3. ✅ Implementar `WhitelistController` con endpoints:
   - `GET/POST/PUT/DELETE /api/whitelist`

4. ✅ Implementar `ReservationController` con endpoints:
   - `GET /api/reservations/common-areas`
   - `POST /api/reservations`
   - `GET /api/reservations/my-reservations`

### PRIORIDAD 2 (Alta) - Completar Endpoints
5. Implementar `FinanceController` con endpoints:
   - `GET /api/finance/units/{unitId}/debt`
   - `GET /api/finance/bills/unit/{unitId}/year/{year}`
   - `POST /api/finance/payments`

6. Implementar `InvitationController` con endpoints:
   - `GET /api/invitations`
   - `POST /api/invitations`
   - `DELETE /api/invitations/{id}`

7. Implementar `ParcelController` con endpoints:
   - `GET /api/parcels/my-pending`
   - `GET /api/parcels/{id}`

### PRIORIDAD 3 (Media) - Frontend Integration
8. Actualizar servicios en frontend
9. Validar componentes con datos reales
10. Testing completo

---

## 📝 NOTAS IMPORTANTES

- **Backend Controllers Faltantes (CRÍTICOS)**:
  - HomeController (Familia, Mascotas, Vehículos) → 80% del código existe
  - DocumentController → 80% del código existe
  - WhitelistController → 70% del código existe
  - ReservationController → 60% del código existe

- **Frontend**:
  - Componentes ya existen y están bien estructurados
  - Solo faltan los endpoints del backend

- **Timing**:
  - Los servicios en frontend ya apuntan a los endpoints correctos
  - Solo falta que el backend responda en esos endpoints

---

**Generado**: 15 de Enero de 2026  
**Estado**: Análisis Completado - Listo para Implementación
