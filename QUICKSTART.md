# 🚀 GUÍA RÁPIDA DE INICIO - LobbySync

## ⚡ Empezar en 2 Minutos

### 1. Instalar Dependencias
```bash
cd "c:\Users\Sebastian\Desktop\Examen Final\lobbysync-web"
npm install
```

### 2. Iniciar Servidor de Desarrollo
```bash
npm run dev
```

Verás:
```
VITE v7.3.0  ready in 558 ms
  ➜  Local:   http://localhost:5173/
```

### 3. Abrir en Navegador
- Navega a **http://localhost:5173/**
- Se abre la pantalla de login

### 4. Iniciar Sesión
**Usuario:** `admin`  
**Contraseña:** `password123`

¡Listo! Ya estás en el dashboard de administrador.

---

## 👥 Credenciales Disponibles

| Usuario | Contraseña | Rol | Dashboard |
|---------|-----------|-----|-----------|
| admin | password123 | Admin | /admin/dashboard |
| conserje | password123 | Conserje | /concierge/dashboard |
| resident | password123 | Residente | /resident/dashboard |
| juan_perez | password123 | Residente | /resident/dashboard |
| maria_garcia | password123 | Residente | /resident/dashboard |

---

## 📍 URLs Principales

```
http://localhost:5173/                    → Home / Redirect a login
http://localhost:5173/auth/login          → Login
http://localhost:5173/admin/dashboard     → Admin Dashboard
http://localhost:5173/admin/users         → Listar Usuarios
http://localhost:5173/admin/buildings     → Listar Edificios
http://localhost:5173/concierge/dashboard → Concierge Dashboard
http://localhost:5173/concierge/logbook   → Bitácora
http://localhost:5173/resident/dashboard  → Resident Dashboard
http://localhost:5173/resident/packages   → Mis Paquetes
```

---

## 🧪 Verificar Funcionalidad

### 1. Autenticación
- ✅ Login con admin/password123
- ✅ Se redirige a /admin/dashboard
- ✅ Token aparece en localStorage
- ✅ Click "Cerrar Sesión" borra token y redirige a login

### 2. Rutas Protegidas
- ✅ Sin login, ir a /admin/users → redirige a /auth/login
- ✅ Login como conserje → puede ir a /concierge/dashboard pero NO a /admin/users

### 3. Carga de Datos
- ✅ Ir a /admin/users → muestra tabla con usuarios
- ✅ Console muestra: `⚡ Users API response: XXms`
- ✅ Badges con roles (Admin/Conserje/Residente)

### 4. Crear Entrada
- ✅ Login como conserje
- ✅ Ir a /concierge/logbook
- ✅ Escribir título: "Test"
- ✅ Click "Guardar Entrada"
- ✅ Aparece en lista inmediatamente

---

## 📊 Verificar Performance

### Console Logs
1. Abre DevTools: **F12**
2. Ve a pestaña **Console**
3. Verás logs como:
```
⚡ Users API response: 32.45ms
🎨 AdminUsers component render: 156.78ms
```

### Network Tab
1. DevTools → **Network** tab
2. Recargar página
3. Verás requests como:
```
GET /users        → Status 200, ~30ms
GET /buildings    → Status 200, ~35ms
```

---

## 🛠️ Comandos Útiles

```bash
# Desarrollo
npm run dev           # Inicia servidor en localhost:5173

# Build
npm run build         # Crea carpeta dist/ optimizada
npm run preview       # Prueba build localmente

# Linting
npm run lint          # Verifica código

# Limpiar
npm run clean         # Elimina node_modules y cache
```

---

## 📝 Archivos Importantes

| Archivo | Propósito |
|---------|-----------|
| `README.md` | Documentación completa |
| `TESTING_CHECKLIST.md` | 28 pruebas manuales |
| `DELIVERY_SUMMARY.md` | Resumen de implementación |
| `BACKEND_INTEGRATION_GUIDE.md` | Conectar backend real |
| `src/api/adminService.js` | Servicios admin |
| `src/api/conciergeService.js` | Servicios conserje |

---

## 🐛 Troubleshooting

### "Port 5173 already in use"
```bash
# Opción 1: Matar proceso
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Opción 2: Usar diferente puerto
npm run dev -- --port 3000
```

### "Cannot find module..."
```bash
npm install
rm -r node_modules
npm install  # Reinstalar
```

### "Build failed"
```bash
npm run build     # Ver error exacto
npm install       # Reinstalar deps
npm run build     # Intentar nuevamente
```

---

## 🎯 Checklist de Verificación

- [ ] `npm install` completó sin errores
- [ ] `npm run dev` inicia sin errores
- [ ] Puedes acceder a http://localhost:5173/
- [ ] Login con admin/password123 funciona
- [ ] Se redirige a /admin/dashboard
- [ ] Token aparece en localStorage (F12 → Application → Storage)
- [ ] Tabla de usuarios aparece con datos
- [ ] Console muestra timing logs (⚡/⏱️/🐢)
- [ ] Click en "Cerrar Sesión" borra token
- [ ] `npm run build` termina exitosamente

---

## 📞 ¿Problemas?

1. **Verifica Console** (F12)
2. **Verifica Network** (F12 → Network)
3. **Lee documentación:**
   - [TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md)
   - [DEBUGGING_PERFORMANCE.md](./DEBUGGING_PERFORMANCE.md)
   - [BACKEND_INTEGRATION_GUIDE.md](./BACKEND_INTEGRATION_GUIDE.md)

---

## 🎓 Siguientes Pasos

1. ✅ Explorar todas las páginas
2. ✅ Ver [TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md) para 28 pruebas
3. ✅ Ver [BACKEND_INTEGRATION_GUIDE.md](./BACKEND_INTEGRATION_GUIDE.md) para conectar backend
4. ✅ Ver [DELIVERY_SUMMARY.md](./DELIVERY_SUMMARY.md) para detalles técnicos

---

**¡Listo para usar! 🚀**

