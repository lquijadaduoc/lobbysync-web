# 🧪 Checklist Completo de Pruebas - LobbySync

## 📋 Tabla de Contenidos
1. [Preparación del Ambiente](#preparación-del-ambiente)
2. [Pruebas de Autenticación](#pruebas-de-autenticación)
3. [Pruebas de Administrador](#pruebas-de-administrador)
4. [Pruebas de Conserje](#pruebas-de-conserje)
5. [Pruebas de Residente](#pruebas-de-residente)
6. [Pruebas de Rutas Protegidas](#pruebas-de-rutas-protegidas)
7. [Pruebas de Performance](#pruebas-de-performance)
8. [Pruebas de Errores](#pruebas-de-errores)

---

## 🚀 Preparación del Ambiente

### Paso 1: Instalar Dependencias
```bash
npm install
```
**✓ Verificar:** Sin errores en la consola.

### Paso 2: Iniciar el Servidor de Desarrollo
```bash
npm run dev
```
**✓ Verificar:** 
- Servidor accesible en `http://localhost:5173/`
- Sin errores en la terminal
- Vite muestra "ready in XXms"

### Paso 3: Abrir la Aplicación
- Navega a `http://localhost:5173/`
- Abre DevTools (F12)
- Ve a la pestaña **Console** para ver logs de performance

**✓ Verificar:** 
- La página carga correctamente
- Se ve la pantalla de login
- Console muestra logs como "🚀 App loaded"

---

## 🔐 Pruebas de Autenticación

### T1.1: Login con Credenciales Válidas (Admin)
1. **Usuario:** `admin`
2. **Contraseña:** `password123`
3. **Acción:** Click en "Iniciar Sesión"

**✓ Verificar:**
- ✅ No hay errores en la consola
- ✅ Se redirige a `/admin/dashboard`
- ✅ En Console aparece: `✅ Login exitoso: admin` y timing del API
- ✅ El navbar muestra "Admin" o menú de administrador
- ✅ El token se guarda en localStorage

**Comando para verificar token:**
```javascript
// En Console (F12):
localStorage.getItem('token')
```
Debería retornar una cadena larga (JWT).

---

### T1.2: Login con Credenciales Válidas (Conserje)
1. **Usuario:** `conserje`
2. **Contraseña:** `password123`
3. **Acción:** Click en "Iniciar Sesión"

**✓ Verificar:**
- ✅ Se redirige a `/concierge/dashboard`
- ✅ Se muestra el rol "Conserje" en la UI

---

### T1.3: Login con Credenciales Válidas (Residente)
1. **Usuario:** `resident`
2. **Contraseña:** `password123`
3. **Acción:** Click en "Iniciar Sesión"

**✓ Verificar:**
- ✅ Se redirige a `/resident/dashboard`
- ✅ Se muestra el rol "Residente" en la UI

---

### T1.4: Login con Credenciales Inválidas
1. **Usuario:** `admin`
2. **Contraseña:** `wrongpassword`
3. **Acción:** Click en "Iniciar Sesión"

**✓ Verificar:**
- ✅ **NO** se redirige
- ✅ Aparece mensaje de error: "Credenciales inválidas"
- ✅ En Console: error específico con `❌` emoji
- ✅ El token NO se guarda en localStorage

---

### T1.5: Logout
1. **Acción:** Click en el botón de "Cerrar Sesión" (navbar)

**✓ Verificar:**
- ✅ Se redirige a la página de login
- ✅ localStorage.getItem('token') retorna `null`
- ✅ El formulario de login está vacío

---

### T1.6: Persistencia de Token (Refresh de Página)
1. **Acción:** Login como admin (T1.1)
2. **Acción:** F5 (refresh de página)

**✓ Verificar:**
- ✅ **No** se redirige al login
- ✅ Se mantiene en `/admin/dashboard`
- ✅ El token sigue siendo válido
- ✅ En Console: "📍 Token encontrado" al cargar la app

---

### T1.7: Token Expirado (Simulado)
1. **Acción:** Login como admin
2. **Acción:** En Console, ejecutar:
   ```javascript
   localStorage.removeItem('token');
   location.reload();
   ```

**✓ Verificar:**
- ✅ Se redirige automáticamente a `/auth/login`
- ✅ Se muestra mensaje o se detecta que no hay token

---

## 👨‍💼 Pruebas de Administrador

### T2.1: Acceder al Dashboard de Admin
1. **Acción:** Login como admin (T1.1)

**✓ Verificar:**
- ✅ URL es `/admin/dashboard`
- ✅ Se muestra panel de administrador con opciones:
  - Usuarios
  - Edificios
  - Unidades
  - Métricas

---

### T2.2: Listar Usuarios
1. **Acción:** Login como admin
2. **Acción:** Click en "Usuarios" (sidebar o navbar)

**✓ Verificar:**
- ✅ URL cambia a `/admin/users` (o similar)
- ✅ En Console: ⏱️ o ⚡ (timing <500ms)
- ✅ Se muestra tabla de usuarios con:
  - Nombre
  - Email
  - Rol (badge: Admin/Conserje/Residente)
  - Estado (badge: Activo/Inactivo)
- ✅ Mínimo 5 usuarios visibles
- ✅ Botones "Editar" y "Eliminar" presentes (aunque no funcionales)

**Usuarios esperados:**
| Usuario | Email | Rol |
|---------|-------|-----|
| admin | admin@lobbysync.com | Admin |
| conserje | conserje@lobbysync.com | Conserje |
| resident | resident@lobbysync.com | Residente |
| juan_perez | juan@lobbysync.com | Residente |
| maria_garcia | maria@lobbysync.com | Residente |

---

### T2.3: Listar Edificios
1. **Acción:** Click en "Edificios"

**✓ Verificar:**
- ✅ Se muestra tabla/lista de edificios con:
  - Nombre
  - Dirección
  - Badge: "X pisos"
  - Badge: "Y unidades"
  - Botones Editar/Eliminar
- ✅ Mínimo 3 edificios visibles

**Edificios esperados:**
| Nombre | Pisos | Unidades |
|--------|-------|----------|
| Edificio A | 5 | 20 |
| Edificio B | 8 | 32 |
| Edificio C | 3 | 12 |

---

### T2.4: Error en Carga de Usuarios
1. **Acción:** En Console, modificar la URL de API:
   ```javascript
   // Simular que el endpoint no existe
   window.location.href = '/admin/users?break=true';
   ```
2. **Acción:** Observar el resultado (puede que no se quiebre, es mock)

**✓ Verificar:**
- ✅ Si hay error, se muestra Alert con mensaje claro
- ✅ Spinner desaparece
- ✅ Tabla no se muestra

---

## 🔔 Pruebas de Conserje

### T3.1: Acceder al Dashboard de Conserje
1. **Acción:** Login como conserje (T1.2)

**✓ Verificar:**
- ✅ URL es `/concierge/dashboard`
- ✅ Se muestra panel de conserje con opciones:
  - Bitácora
  - Paquetes
  - Visitantes

---

### T3.2: Crear Entrada en Bitácora
1. **Acción:** Click en "Bitácora"
2. **Acción:** En el formulario de "Nueva Entrada":
   - Título: "Reparación de tubería"
   - Descripción: "Repararon la tubería del piso 3"
   - Prioridad: "Alta"
3. **Acción:** Click en "Guardar Entrada"

**✓ Verificar:**
- ✅ En Console: ✅ Create logbook entry timing
- ✅ Spinner muestra "Guardando..." temporalmente
- ✅ La entrada aparece inmediatamente en la lista
- ✅ El timestamp es la fecha/hora actual
- ✅ El formulario se limpia

---

### T3.3: Listar Entradas en Bitácora
1. **Acción:** Se carga la página de Bitácora

**✓ Verificar:**
- ✅ Se muestra tabla de entradas con:
  - Hora
  - Detalle (descripción)
  - Responsable (usuario que creó)
- ✅ Mínimo 4 entradas visibles
- ✅ Timestamps en formato español (HH:MM)

---

### T3.4: Listar Paquetes (Conserje)
1. **Acción:** Click en "Paquetes" (en Concierge)

**✓ Verificar:**
- ✅ Se muestra tabla de paquetes con:
  - Referencia (tracking number)
  - Proveedor/Carrier
  - Estado (badge: En recepción/Entregado/Pendiente)
- ✅ Mínimo 3 paquetes visibles

---

## 👤 Pruebas de Residente

### T4.1: Acceder al Dashboard de Residente
1. **Acción:** Login como resident (T1.3)

**✓ Verificar:**
- ✅ URL es `/resident/dashboard`
- ✅ Se muestra panel de residente con opciones:
  - Mis Paquetes
  - Crear Invitación
  - Reservar Amenidad

---

### T4.2: Ver Mis Paquetes
1. **Acción:** Click en "Mis Paquetes"

**✓ Verificar:**
- ✅ Se muestra tabla de paquetes con:
  - Referencia
  - Proveedor
  - Estado (badges con colores)
- ✅ Estados visibles:
  - 🔵 "En recepción" (badge info)
  - ✅ "Entregado" (badge success)
  - ⏳ "Pendiente" (badge warning)

---

### T4.3: Crear Invitación
1. **Acción:** Click en "Crear Invitación"
2. **Acción:** Completar formulario:
   - Nombre del visitante: "Juan Doe"
   - Email: "juan@example.com"
   - Teléfono: "555-1234"
3. **Acción:** Click en "Enviar Invitación"

**✓ Verificar:**
- ✅ Se muestra confirmación de envío
- ✅ El formulario se limpia o navega a lista

---

### T4.4: Reservar Amenidad
1. **Acción:** Click en "Reservar Amenidad"
2. **Acción:** Seleccionar amenidad y fecha

**✓ Verificar:**
- ✅ Se muestra calendario o selector de fechas
- ✅ Se puede seleccionar una amenidad
- ✅ Se puede confirmar la reserva

---

## 🛡️ Pruebas de Rutas Protegidas

### T5.1: Acceso sin Login
1. **Acción:** Logout (T1.5)
2. **Acción:** En la URL, ir a `http://localhost:5173/admin/users`

**✓ Verificar:**
- ✅ **Redirección automática** a `/auth/login`
- ✅ No se ve contenido del admin
- ✅ Se muestra página de login

---

### T5.2: Acceso como Rol Incorrecto (Admin intenta Conserje)
1. **Acción:** Login como admin (T1.1)
2. **Acción:** En la URL, ir a `http://localhost:5173/concierge/dashboard`

**✓ Verificar:**
- ✅ Se redirige a `/admin/dashboard` (su dashboard)
- O ✅ Se muestra página de "No Autorizado" (Unauthorized.jsx)
- ✅ **No** se ve el dashboard de conserje

---

### T5.3: Ruta No Existente
1. **Acción:** En la URL, ir a `http://localhost:5173/nonexistent`

**✓ Verificar:**
- ✅ Se muestra página 404 (NotFound.jsx)
- ✅ Hay botón para volver al inicio

---

## ⚡ Pruebas de Performance

### T6.1: Timing de API (Mock)
1. **Acción:** Login como admin
2. **Acción:** Ir a cualquier página (Usuarios, Edificios, etc.)
3. **Acción:** Abrir Console (F12)

**✓ Verificar Logs:**
```
⚡ Users API response: 32.45ms
🎨 AdminUsers component render: 156.78ms
```

**✓ Verificar Timing:**
- ✅ API response: < 100ms (⚡)
- ✅ Component render: < 200ms

---

### T6.2: Build Production
```bash
npm run build
```

**✓ Verificar:**
- ✅ Sin errores en la terminal
- ✅ Carpeta `dist/` creada
- ✅ Tamaño del build ~370KB (gzipped)
- ✅ Todos los assets incluidos

**Verificar tamaño:**
```bash
ls -lh dist/index.html
```

---

### T6.3: Preview Build
```bash
npm run preview
```

**✓ Verificar:**
- ✅ Servidor de preview inicia
- ✅ App carga correctamente en build production
- ✅ Funcionalidad completa sin cambios

---

## 🚨 Pruebas de Errores

### T7.1: Error de Conexión (Simular)
1. **Acción:** En Console:
   ```javascript
   // Simular timeout o error
   axios.defaults.timeout = 1; // 1ms
   location.reload();
   ```

**✓ Verificar:**
- ✅ Se muestra Alert de error
- ✅ Mensaje dice "Error al cargar"
- ✅ Spinner desaparece
- ✅ No hay console errors sin manejo

---

### T7.2: Validación en Login
1. **Acción:** Dejar campos vacíos
2. **Acción:** Click en "Iniciar Sesión"

**✓ Verificar:**
- ✅ Se muestra validación HTML5 o custom
- ✅ No se envía el formulario
- ✅ Enfoque en campo requerido

---

### T7.3: Mensajes de Error Específicos
1. **Acción:** Intentar varias acciones que fallen

**✓ Verificar Mensajes:**
- ✅ Login fallido: "Credenciales inválidas"
- ✅ API Error: "Error al cargar [recurso]"
- ✅ Validación: "Este campo es requerido"
- ✅ No Autorizado: "No tienes acceso a este recurso"

---

## 📊 Resumen de Pruebas

| # | Categoría | Pruebas | Estado |
|---|-----------|---------|--------|
| 1 | Autenticación | 7 | ☐ |
| 2 | Admin | 4 | ☐ |
| 3 | Conserje | 4 | ☐ |
| 4 | Residente | 4 | ☐ |
| 5 | Rutas Protegidas | 3 | ☐ |
| 6 | Performance | 3 | ☐ |
| 7 | Errores | 3 | ☐ |
| **Total** | - | **28 Pruebas** | ☐ |

---

## 🎯 Checklist Final

- [ ] Todas las 28 pruebas pasaron
- [ ] No hay console errors
- [ ] Build se completó sin errores
- [ ] App responde en <500ms
- [ ] Login funciona con 5 usuarios diferentes
- [ ] Rutas protegidas funcionan correctamente
- [ ] Logout limpia el token
- [ ] Refresh mantiene la sesión
- [ ] UI se ve bien en Desktop
- [ ] Mensajes de error son claros

---

## 🔗 Credenciales de Prueba

```
┌─────────────┬───────────────────────────┬──────────────┐
│   Usuario   │          Email            │   Rol        │
├─────────────┼───────────────────────────┼──────────────┤
│   admin     │ admin@lobbysync.com       │   Admin      │
│   conserje  │ conserje@lobbysync.com    │   Conserje   │
│   resident  │ resident@lobbysync.com    │   Residente  │
│ juan_perez  │ juan@lobbysync.com        │   Residente  │
│ maria_garcia│ maria@lobbysync.com       │   Residente  │
└─────────────┴───────────────────────────┴──────────────┘

Contraseña para todos: password123
```

---

## 📝 Notas

- **Mock API:** Todas las llamadas usan mock data, sin HTTP real
- **Timing:** Los logs muestran emoji de performance (⚡<100ms, ⏱️100-500ms, 🐢>500ms)
- **Tokens:** Se generan JWT dinámicamente con jwtHelper
- **Storage:** Todo se guarda en localStorage (no persiste entre navegadores)

---

## 🚀 Próximos Pasos

1. ✅ Completar todas las pruebas
2. ✅ Conectar a backend real
3. ✅ Ajustar endpoints según API reales
4. ✅ Implementar validaciones adicionales
5. ✅ Agregar tests unitarios con Jest/Vitest
6. ✅ Implementar tests E2E con Cypress/Playwright

