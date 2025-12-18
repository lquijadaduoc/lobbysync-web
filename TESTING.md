# LobbySync Web - Testing Guide

## 🚀 Iniciando la aplicación

```bash
npm install
npm run dev
```

La aplicación estará disponible en **http://localhost:5173/**

---

## 🔐 Credenciales de Prueba

Como el backend no está completamente disponible, la aplicación usa **mock data en modo desarrollo**. 

Puedes usar cualquiera de estas credenciales:

### **ADMIN**
- **Email/Usuario:** `admin@lobbysync.com`
- **Contraseña:** (cualquier contraseña - el mock acepta todas)
- **Acceso:** Dashboard administrativo, gestión de usuarios, edificios, métricas

### **CONCIERGE**
- **Email/Usuario:** `concierge@lobbysync.com`
- **Contraseña:** (cualquier contraseña)
- **Acceso:** Bitácora, paquetes, visitantes

### **RESIDENT**
- **Email/Usuario:** `resident@lobbysync.com`
- **Contraseña:** (cualquier contraseña)
- **Acceso:** Mis paquetes, reserva de amenidades, invitar visitantes

---

## 📋 Usuarios Mock Disponibles

| Email | Usuario | Rol | Estado |
|-------|---------|-----|--------|
| admin@lobbysync.com | admin | ADMIN | Activo |
| concierge@lobbysync.com | concierge | CONCIERGE | Activo |
| resident@lobbysync.com | resident | RESIDENT | Activo |
| maria@lobbysync.com | maria.lopez | ADMIN | Activo |
| luis@lobbysync.com | luis.torres | CONCIERGE | Pendiente |

---

## 🏢 Datos Mock Disponibles

### Edificios
- Torre Norte (8 pisos, 32 unidades)
- Torre Central (12 pisos, 48 unidades)
- Torre Sur (10 pisos, 40 unidades)

### Bitácora
- Entradas de ejemplo con timestamps
- Puedes crear nuevas notas (se guardan en memoria durante la sesión)

### Paquetes
- Amazon #1234 (En recepción)
- FedEx #8421 (Entregado)
- DHL #5678 (Pendiente)

### Amenidades
- Salón de reuniones (Capacidad: 20)
- Gym (Capacidad: 15)
- Piscina (Capacidad: 30)
- Cine (Capacidad: 25)

### Visitantes
- Pedro Martínez (Aprobado)
- Ana García (Pendiente)

---

## 🔄 Modo Mock vs Backend Real

### 📦 **Modo Mock (Desarrollo)**
- Se activa automáticamente si el backend no responde
- Usa datos simulados en `src/api/mockData.js`
- Perfecto para UI/UX testing sin backend
- Los cambios se pierden al refrescar (se guardan en memoria)

### 🌐 **Backend Real**
Cuando el backend esté disponible en `http://167.194.50.14:8080/api/v1`:
1. Comenta las líneas de mock en `axiosConfig.js`
2. O ajusta el `baseURL` según tu servidor
3. La aplicación usará los datos reales

---

## 🧪 Flujo de Testing

### 1. **Login**
```
1. Ve a http://localhost:5173/
2. Usa cualquiera de las credenciales arriba
3. Serás redirigido al dashboard según tu rol
```

### 2. **Admin Dashboard** (`/admin`)
- ✅ Ver lista de usuarios
- ✅ Ver edificios disponibles
- ✅ Métricas del sistema
- ✅ Gestión de unidades

### 3. **Concierge Dashboard** (`/concierge`)
- ✅ Ver bitácora de eventos
- ✅ Agregar nuevas notas
- ✅ Gestionar paquetes
- ✅ Registrar visitantes

### 4. **Resident Dashboard** (`/resident`)
- ✅ Ver mis paquetes
- ✅ Reservar amenidades
- ✅ Crear invitaciones de visitantes

### 5. **Logout**
- Limpia el token de `localStorage`
- Redirige al login

---

## 🛠️ Desarrollo

### Estructura de Servicios API

```
src/api/
├── authService.js         # Login, autenticación
├── usersService.js        # Gestión de usuarios
├── buildingsService.js    # Gestión de edificios
├── logbookService.js      # Bitácora
├── residentService.js     # Paquetes, amenidades, visitantes
├── axiosConfig.js         # Configuración de Axios + interceptores
├── mockData.js            # Datos mock para testing
├── mockInterceptor.js     # Interceptor para mock en desarrollo
└── jwtHelper.js           # Utilidades JWT para testing
```

### Agregar nuevos datos mock

Edita `src/api/mockData.js` para agregar:
- Más usuarios
- Más edificios
- Más paquetes
- Etc.

### Integrar con backend real

1. Actualiza el `baseURL` en `axiosConfig.js`
2. Asegúrate que tu backend devuelva el formato esperado
3. Ajusta los servicios si es necesario

---

## 🐛 Troubleshooting

### "No se puede iniciar sesión"
- Verifica que uses un email de la lista de usuarios mock
- El backend mock acepta cualquier contraseña

### "No hay datos disponibles"
- Verifica que el backend esté disponible o que el mock esté activado
- Revisa la consola (F12) para mensajes de debug

### "Token inválido o expirado"
- Los tokens mock no expiran en desarrollo
- En producción, configura tiempos de expiración reales

---

## 📚 URLs Importantes

- **App:** http://localhost:5173/
- **Backend (esperado):** http://167.194.50.14:8080/api/v1
- **Console (debug):** F12 en el navegador

---

## ✅ Checklist de Testing

- [ ] Login exitoso con cada rol (ADMIN, CONCIERGE, RESIDENT)
- [ ] Redireccionamiento correcto al dashboard según rol
- [ ] Visualización de datos en cada página
- [ ] Crear nuevas entradas en bitácora
- [ ] Logout y regreso al login
- [ ] Responsive design en mobile
- [ ] Error handling cuando no hay datos
- [ ] Loading states mientras se cargan datos

---

**Última actualización:** 18 de Diciembre, 2025
**Versión:** 0.0.0
**Estado:** Development
