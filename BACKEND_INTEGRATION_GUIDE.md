# 🔌 Guía de Integración con Backend Real

## 📝 Resumen

Este documento te guiará en los cambios necesarios para conectar la aplicación LobbySync a un backend real en lugar del mock adapter.

---

## 🚀 Paso 1: Desactivar Mock Adapter

### Archivo: `src/api/axiosConfig.js`

**Cambio:**
```javascript
// ANTES (línea ~5):
import mockAdapter from './mockAdapter';

// Y en la configuración (línea ~30):
if (import.meta.env.MODE === 'development') {
  const adapter = await mockAdapter(axiosInstance);
  axiosInstance.defaults.adapter = adapter;
}

// DESPUÉS: Comenta o elimina
// import mockAdapter from './mockAdapter';
// Y comenta el bloque if

// Resultado:
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080/api', // O tu URL real
  timeout: 5000, // Aumenta a 5 segundos para backend real
  headers: {
    'Content-Type': 'application/json',
  },
});
```

---

## 🔑 Paso 2: Actualizar Login Endpoint

### Archivo: `src/api/authService.js`

**Cambio:**
```javascript
// ANTES (login mock):
export const loginRequest = async (credentials) => {
  const response = await axiosInstance.post('/auth/login', {
    username: credentials.username,
    email: credentials.email,
  });
  return response;
};

// DESPUÉS: Ajustar según respuesta real del backend
export const loginRequest = async (credentials) => {
  // Si tu backend espera diferente formato:
  const response = await axiosInstance.post('/auth/login', {
    // username: credentials.username, // Cambiar según tu API
    // email: credentials.email,
    // O si usa 'user' + 'password':
    // user: credentials.username,
    // password: credentials.password,
  });
  return response;
};

// Verificar que respuesta tenga: token + rol + email
// {
//   "token": "eyJhbGc...",
//   "role": "ADMIN",  // O "rol", "authority", etc.
//   "email": "admin@example.com"
// }
```

---

## 🔐 Paso 3: Verificar Token Mapping

### Archivo: `src/auth/AuthProvider.jsx`

**Verificar que soporta tu formato de token:**

```javascript
const decodeRole = (token) => {
  const decoded = jwtDecode(token);
  
  // Tu backend usa estos campos?
  // ✓ decoded.role → "ADMIN"
  // ✓ decoded.rol → "ADMIN"
  // ✓ decoded.authority → "ROLE_ADMIN"
  // ✓ decoded.authorities → ["ROLE_ADMIN"]
  
  // Retorna el primero que encuentre:
  return decoded.role || 
         decoded.rol || 
         decoded.authority || 
         decoded.roleName ||
         decoded.authorities?.[0] || 
         'USER';
};

const decodeEmail = (token) => {
  const decoded = jwtDecode(token);
  
  // Tu backend usa estos campos?
  // ✓ decoded.email → "user@example.com"
  // ✓ decoded.sub → "user@example.com"
  // ✓ decoded.username → "user@example.com"
  
  return decoded.email || 
         decoded.sub || 
         decoded.username || 
         'unknown@lobbysync.com';
};

// Si necesitas ajustar, hazlo aquí
```

---

## 🔄 Paso 4: Actualizar Endpoints de Servicios

### Archivo: `src/api/adminService.js`

**Cambio de estructura:**

```javascript
// ANTES (mock):
export const adminUsers = {
  list: (params) => axiosInstance.get('/users', { params }),
  // ...
};

// DESPUÉS: Ajustar según tu backend
export const adminUsers = {
  // Si tu backend usa '/api/admin/users' en lugar de '/api/users':
  list: (params) => axiosInstance.get('/admin/users', { params }),
  // O si paginación es diferente:
  // list: (params) => axiosInstance.get('/users', { params: { page: params.page || 0, size: params.limit || 10 } }),
  
  get: (id) => axiosInstance.get(`/admin/users/${id}`),
  create: (data) => axiosInstance.post('/admin/users', data),
  update: (id, data) => axiosInstance.put(`/admin/users/${id}`, data),
  delete: (id) => axiosInstance.delete(`/admin/users/${id}`),
};

export const adminBuildings = {
  list: (params) => axiosInstance.get('/admin/buildings', { params }),
  // ... etc
};
```

### Archivo: `src/api/conciergeService.js`

```javascript
export const conciergeLogbook = {
  list: (params) => axiosInstance.get('/concierge/logbook', { params }),
  // Si tu backend usa endpoints diferentes:
  // list: (params) => axiosInstance.get('/logbook/entries', { params }),
  
  get: (id) => axiosInstance.get(`/concierge/logbook/${id}`),
  create: (data) => axiosInstance.post('/concierge/logbook', data),
  // ... etc
};
```

---

## 📊 Paso 5: Mapear Respuestas de API

Si tu backend retorna campos con nombres diferentes, actualiza los componentes:

### Ejemplo: `src/pages/admin/Users.jsx`

```javascript
// Si el backend retorna:
// {
//   "userId": 1,
//   "fullName": "Juan Perez",
//   "userEmail": "juan@example.com",
//   "userRole": "ROLE_RESIDENT"
// }

// Mapea en el componente:
const getStatusBadge = (user) => {
  // Ajusta según campos reales
  const status = user.status || user.active ? 'active' : 'inactive';
  return status === 'active' ? 
    <Badge bg="success">Activo</Badge> : 
    <Badge bg="danger">Inactivo</Badge>;
};

// En la tabla:
{users.map((user) => (
  <tr key={user.userId || user.id}>  {/* Ajusta field */}
    <td>{user.fullName || user.name}</td>  {/* Ajusta field */}
    <td>{user.userEmail || user.email}</td>  {/* Ajusta field */}
    <td>{getRoleBadge(user.userRole || user.role)}</td>  {/* Ajusta field */}
  </tr>
))}
```

---

## 🛡️ Paso 6: Configurar CORS (Backend)

Tu backend debe permitir requests desde localhost:5173:

### Ejemplo: Spring Boot
```java
@Configuration
public class CorsConfig {
  @Bean
  public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(Arrays.asList("http://localhost:5173"));
    config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE"));
    config.setAllowedHeaders(Arrays.asList("*"));
    config.setAllowCredentials(true);
    
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);
    return source;
  }
}
```

### Ejemplo: Node/Express
```javascript
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
```

---

## 🔌 Paso 7: Actualizar Variable de Entorno

### Archivo: `.env.local` (crear si no existe)

```
VITE_API_URL=http://localhost:8080/api
VITE_API_TIMEOUT=5000
```

### Archivo: `src/api/axiosConfig.js`

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '5000');

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  // ...
});
```

---

## ✅ Paso 8: Testing de Integración

### 1. Verifica Login
```bash
npm run dev
# Navega a http://localhost:5173/
# Intenta login con credenciales reales
```

**Verificar en Console:**
- ✅ Se llama POST a `/auth/login`
- ✅ Respuesta contiene `token`
- ✅ Token se guarda en localStorage
- ✅ Se redirige a dashboard

### 2. Verifica Endpoints de Usuario
```javascript
// En Console:
const token = localStorage.getItem('token');
console.log('Token:', token); // Debe existir

// Si hay error 401, token está inválido
// Si hay error 403, usuario no tiene rol
```

### 3. Verifica Respuestas
```javascript
// Abre DevTools → Network
// Haz click en "Usuarios"
// Deberías ver:
// - GET /admin/users con status 200
// - Response con array de usuarios
```

---

## 🐛 Paso 9: Debugging Común

### Problema: "CORS error"
**Solución:**
1. Verifica que backend permite origin `http://localhost:5173`
2. Comprueba que endpoint existe en backend
3. Revisa Console → Network tab para ver error exacto

### Problema: "401 Unauthorized"
**Solución:**
1. Token no se está enviando → Verifica localStorage
2. Token expirado → Implementa refresh token
3. Backend rechaza token → Verifica formato JWT

### Problema: "404 Not Found"
**Solución:**
1. Endpoint URL es incorrecta → Verifica en adminService.js
2. Backend no tiene ese endpoint → Implementa en backend
3. URL tiene typo → Busca con Ctrl+F en servicios

### Problema: "Response fields mismatch"
**Solución:**
1. Backend retorna diferentes nombres de campos
2. Mapea en el componente (ver Paso 5)
3. O ajusta en AuthProvider si es rol/email

---

## 🚀 Paso 10: Deployment a Producción

### 1. Build
```bash
npm run build
```
Genera carpeta `dist/` con app optimizada.

### 2. Configurar URL de Producción
```
# .env.production
VITE_API_URL=https://api.lobbysync.com/api
```

### 3. Servir Build
```bash
# Opción 1: Vercel, Netlify, GitHub Pages
npm run build && vercel deploy

# Opción 2: Manual en servidor
npm run build
# Copiar dist/ a servidor web (nginx, apache, etc.)
```

---

## 📋 Checklist de Integración

- [ ] Mock adapter desactivado
- [ ] Endpoint de login actualizado
- [ ] Token mapping verificado (rol y email)
- [ ] Endpoints de servicios ajustados
- [ ] Respuestas de API mapeadas en componentes
- [ ] CORS configurado en backend
- [ ] Variables de entorno actualizadas
- [ ] Login funciona con credenciales reales
- [ ] Usuarios se cargan desde backend
- [ ] Edificios se cargan desde backend
- [ ] Logbook se carga desde backend
- [ ] Crear entrada funciona
- [ ] Logout funciona correctamente
- [ ] Rutas protegidas funcionan
- [ ] Sin console errors
- [ ] Build sin errores

---

## 🔗 Recursos Útiles

| Recurso | URL |
|---------|-----|
| JWT.io | https://jwt.io |
| Axios Docs | https://axios-http.com |
| React Router | https://reactrouter.com |
| Bootstrap React | https://react-bootstrap.github.io |
| CORS Explainer | https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS |

---

## 📞 Soporte

Si encuentras problemas:

1. **Verifica Console (F12)** para errores específicos
2. **Revisa Network tab** para ver requests/responses
3. **Compara endpoints** con documentación de tu backend
4. **Valida token JWT** en jwt.io
5. **Aumenta timeout** en axiosConfig si backend es lento

---

## 📝 Notas Importantes

- El mock adapter usa `localStorage` - el backend real puede usar `sessionStorage` o cookies
- Los timings serán más lentos con backend real (típicamente 100-500ms)
- Implementa refresh token para mantener sesión activa
- Considera agregar interceptor para manejar errores globales
- Implementa loading global en AppRouter si es necesario

---

## 🎯 Siguientes Pasos

1. ✅ Conectar backend real
2. ✅ Implementar refresh token
3. ✅ Agregar validaciones adicionales
4. ✅ Implementar CRUD completo (edición/eliminación)
5. ✅ Agregar tests unitarios
6. ✅ Agregar tests E2E
7. ✅ Deploy a producción

