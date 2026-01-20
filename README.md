# 🏢 LobbySync Frontend - Property Management Web Application

Aplicación web moderna para gestión de propiedades residenciales y comerciales. Construida con **React 18**, **Vite 7**, **Bootstrap 5**, **React Bootstrap** y **Firebase Authentication**.

## 🎯 Características Principales

### 🔐 Autenticación & Seguridad
- **Firebase Authentication** con email/password
- Sistema de roles (Admin, Conserje, Residente, Finance)
- Rutas protegidas por rol con React Router
- Persistencia de sesión con localStorage
- Token JWT desde backend
- Refresh token automático

### 👨‍💼 Panel de Administrador (v1.1.0) ✨

#### 👥 Gestión Completa de Usuarios - NUEVO
- **Crear Usuarios**: Modal con integración Firebase
  - Campos: Email, contraseña, nombre, apellido, teléfono, rol
  - Asignación de departamento (solo para residentes)
  - Validación de formularios
  - Creación simultánea en Firebase + PostgreSQL
  
- **Editar Usuarios**: Modal de edición completo
  - Editar nombre, apellido, teléfono, rol, departamento
  - Cambiar estado (activo/inactivo)
  - Email no editable (restricción Firebase)
  - Actualización sincronizada con Firebase displayName
  
- **Cambiar Contraseña**: Modal dedicado
  - Indicador de fortaleza de contraseña (débil/regular/buena/fuerte)
  - Barra de progreso visual (roja/amarilla/azul/verde)
  - Confirmación de contraseña
  - Actualización directa en Firebase
  
- **Eliminar Usuarios**: 
  - Confirmación con doble clic
  - Eliminación bidireccional (Firebase + PostgreSQL)
  - Prevención de eliminación accidental

- **Lista de Usuarios**:
  - Tabla con email, nombre, rol, teléfono, estado
  - Dropdown de acciones por usuario (Editar, Cambiar Contraseña, Eliminar)
  - Badges de rol con colores
  - Badges de estado activo/inactivo

#### 🏢 Gestión de Edificios
- CRUD completo de edificios
- Dashboard con métricas
- Gestión de unidades por edificio
- Detalles: pisos, unidades, amenidades

#### 📊 Dashboard
- Estadísticas en tiempo real
- Métricas de usuarios, edificios, paquetes
- Gráficos visuales

### 🔔 Panel de Conserje
- **Bitácora de Eventos**: Registro con prioridades (alta/media/baja)
- **Gestión de Paquetes**: 
  - Estados: Recibido, Entregado, Pendiente
  - Notificaciones automáticas
  - Timestamps de entrada/salida
- **Registro de Visitantes**: Control de acceso con check-in/check-out
- **Invitaciones**: Validación de códigos QR

### 👤 Portal de Residente
- **Mis Paquetes**: Ver estado de mis entregas
- **Invitaciones**: Crear códigos para visitantes
- **Reservas**: Áreas comunes (gym, piscina, salón de eventos)
- **Notificaciones**: Alertas de paquetes y aprobaciones

## 🚀 Quick Start

### Requisitos
- Node.js 18+
- npm 9+
- Cuenta Firebase (para autenticación)

### Instalación
```bash
# Clonar repositorio
git clone https://github.com/lquijadaduoc/lobbysync-web.git
cd lobbysync-web

# Instalar dependencias
npm install

# Configurar Firebase (ver sección siguiente)
# Editar src/config/firebase.js con tus credenciales

# Iniciar desarrollo
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173)

## 🔥 Configuración Firebase

### Paso 1: Crear Proyecto Firebase

1. Ir a [Firebase Console](https://console.firebase.google.com)
2. Crear proyecto: `lobbysync-91db0` (o tu nombre)
3. Habilitar **Authentication** → **Email/Password**

### Paso 2: Obtener Configuración Web

1. Project Settings → General
2. Scroll a **Your apps** → Web app (</> icon)
3. Copiar `firebaseConfig` object

### Paso 3: Configurar en el Proyecto

Editar [src/config/firebase.js](src/config/firebase.js):

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD...",
  authDomain: "lobbysync-91db0.firebaseapp.com",
  projectId: "lobbysync-91db0",
  storageBucket: "lobbysync-91db0.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:xxxxx"
};
```

## 🔗 Configuración Backend

Editar [src/api/axiosConfig.js](src/api/axiosConfig.js):

```javascript
const axiosInstance = axios.create({
  baseURL: 'http://168.197.50.14:8080',  // URL de producción
  // o
  baseURL: 'http://localhost:8080',      // URL de desarrollo local
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
});
```

## 👥 Credenciales de Prueba

```
Email: admin@lobbysync.com    | Password: password123  | Rol: ADMIN
Email: conserje@lobbysync.com | Password: password123  | Rol: CONCIERGE  
Email: residente@lobbysync.com| Password: password123  | Rol: RESIDENT
```

**IMPORTANTE**: Estos usuarios deben existir en Firebase Authentication. Ver [GUIA_FIREBASE_SETUP.md](GUIA_FIREBASE_SETUP.md) en el backend para crearlos.

## 📦 Build & Deployment

### Build para Producción
```bash
# Generar build optimizado
npm run build          # Crea carpeta dist/

# Probar build localmente
npm run preview        # http://localhost:4173
```

### Deploy a Vercel
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel deploy --prod
```

### Deploy a Netlify
```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

### Deploy Manual (VPS)
```bash
# Compilar
npm run build

# Copiar a servidor
scp -r dist/* usuario@servidor:/var/www/html/

# O usando rsync
rsync -avz --delete dist/ usuario@servidor:/var/www/html/
```

## 🏗️ Estructura del Proyecto

```
src/
├── api/                          ← Servicios HTTP
│   ├── axiosConfig.js           ← Configuración Axios con interceptors
│   ├── authService.js           ← Login, logout, refresh token
│   ├── adminService.js          ← Usuarios, edificios, unidades
│   ├── conciergeService.js      ← Paquetes, bitácora, visitantes
│   ├── residentService.js       ← Mis paquetes, invitaciones, reservas
│   ├── jwtHelper.js             ← Decodificación JWT
│   └── mockAdapter.js           ← Mock data para desarrollo
│
├── auth/                        ← Autenticación
│   └── AuthProvider.jsx         ← Context API con Firebase
│
├── components/                  ← Componentes reutilizables
│   ├── AppNavbar.jsx           ← Navbar responsive
│   ├── AddUserModal.jsx        ← ✨ Modal crear usuario
│   ├── EditUserModal.jsx       ← ✨ Modal editar usuario (NUEVO v1.1.0)
│   ├── ChangePasswordModal.jsx ← ✨ Modal cambiar contraseña (NUEVO v1.1.0)
│   ├── AddBuildingModal.jsx    ← Modal crear edificio
│   ├── ProtectedRoute.jsx      ← HOC para rutas protegidas
│   └── ...                      ← Otros componentes
│
├── config/                      ← Configuración
│   └── firebase.js              ← Configuración Firebase SDK
│
├── pages/                       ← Vistas principales
│   ├── admin/
│   │   ├── AdminDashboard.jsx  ← Dashboard con métricas
│   │   ├── Buildings.jsx       ← Gestión edificios
│   │   ├── Units.jsx           ← Gestión unidades
│   │   ├── Users.jsx           ← ✨ Gestión usuarios CRUD completo (v1.1.0)
│   │   └── ...
│   ├── concierge/
│   │   ├── Logbook.jsx         ← Bitácora de eventos
│   │   ├── Parcels.jsx         ← Gestión paquetes
│   │   └── Visitors.jsx        ← Control visitantes
│   ├── resident/
│   │   ├── MyParcels.jsx       ← Mis paquetes
│   │   ├── Invitations.jsx     ← Mis invitaciones
│   │   └── Reservations.jsx    ← Reservar áreas comunes
│   └── Login.jsx                ← Login con Firebase
│
├── routes/                      ← Configuración rutas
│   └── AppRoutes.jsx           ← React Router con roles
│
├── utils/                       ← Utilidades
│   └── validators.js           ← Validación de formularios
│
├── App.jsx                      ← Componente raíz
├── main.jsx                     ← Entry point (ReactDOM)
└── index.css                    ← Estilos globales
```

## 🔑 Roles y Funcionalidades

| Rol | Funcionalidades |
|-----|-----------------|
| **ADMIN** | • CRUD usuarios con Firebase<br>• Gestión edificios y unidades<br>• Dashboard completo<br>• Cambiar contraseñas<br>• Asignar departamentos |
| **CONCIERGE** | • Gestión de paquetes<br>• Registro de visitantes<br>• Bitácora de eventos<br>• Control de acceso |
| **RESIDENT** | • Ver mis paquetes<br>• Crear invitaciones<br>• Reservar áreas comunes<br>• Recibir notificaciones |
| **FINANCE** | • Ver facturas<br>• Generar cobros<br>• Reportes financieros |

## 🛠️ Scripts Disponibles

```bash
npm run dev          # Desarrollo con hot reload (http://localhost:5173)
npm run build        # Build de producción (carpeta dist/)
npm run preview      # Probar build localmente
npm run lint         # ESLint para código
```

## 📚 Dependencias Principales

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.x",
  "react-bootstrap": "^2.10.0",
  "bootstrap": "^5.3.2",
  "axios": "^1.6.0",
  "firebase": "^11.1.0",
  "vite": "^7.3.0"
}
```

## 📝 Changelog

### v1.1.0 (2026-01-20) ✨ NUEVO
- ✅ **Gestión Completa de Usuarios con Firebase**
  - Componente `AddUserModal.jsx` mejorado con campo unitId
  - Componente `EditUserModal.jsx` nuevo con edición completa
  - Componente `ChangePasswordModal.jsx` nuevo con indicador de fortaleza
  - Página `Users.jsx` refactorizada con dropdown de acciones
  - Integración bidireccional Firebase ↔ PostgreSQL
  - adminService.js actualizado con endpoints CRUD completos
  
- 🐛 **Correcciones**
  - Fixed modal positioning (fuera del loop map)
  - Fixed missing Button import en AdminDashboard.jsx
  - Mejorada validación de formularios en todos los modals

### v1.0.0 (2026-01-15)
- ✅ Sistema base con Firebase Authentication
- ✅ Panel Admin con gestión básica
- ✅ Panel Conserje con paquetería
- ✅ Portal Residente con invitaciones
- ✅ Rutas protegidas por rol
- ✅ Dashboard con métricas

## 🔧 Desarrollo

### Agregar Nueva Funcionalidad

1. **Crear servicio en /api/**
```javascript
// api/miServicio.js
import axiosInstance from './axiosConfig';

export const miServicio = {
  listar: () => axiosInstance.get('/api/mi-endpoint'),
  crear: (data) => axiosInstance.post('/api/mi-endpoint', data)
};
```

2. **Crear componente en /pages/** o **/components/**
```jsx
import { useState, useEffect } from 'react';
import { miServicio } from '../api/miServicio';

function MiComponente() {
  const [datos, setDatos] = useState([]);
  
  useEffect(() => {
    miServicio.listar()
      .then(res => setDatos(res.data))
      .catch(err => console.error(err));
  }, []);
  
  return <div>{/* UI aquí */}</div>;
}
```

3. **Agregar ruta en /routes/AppRoutes.jsx**
```jsx
<Route path="/mi-ruta" element={
  <ProtectedRoute allowedRoles={['ADMIN']}>
    <MiComponente />
  </ProtectedRoute>
} />
```

## 🚨 Troubleshooting

### Error: Firebase Auth No Inicializado
```bash
# Verificar que firebase.js esté configurado
# Revisar firebaseConfig en src/config/firebase.js
```

### Error: CORS Backend
```javascript
// El backend debe tener habilitado CORS:
// @CrossOrigin(origins = "http://localhost:5173")
```

### Error: Token Expirado
```javascript
// El AuthProvider maneja refresh automático
// Si persiste, hacer logout y login nuevamente
```

### Usuarios No Aparecen
```sql
-- Verificar en PostgreSQL:
SELECT id, email, first_name, role, firebase_uid FROM users;

-- Verificar en Firebase Authentication:
-- Firebase Console → Authentication → Users
```

## 🔗 Enlaces Útiles

- **Backend API**: http://168.197.50.14:8080
- **Swagger Docs**: http://168.197.50.14:8080/swagger-ui.html
- **Firebase Console**: https://console.firebase.google.com
- **GitHub Backend**: https://github.com/lquijadaduoc/lobbysync-api
- **GitHub Frontend**: https://github.com/lquijadaduoc/lobbysync-web

## 📄 Licencia

Este proyecto es privado y está bajo desarrollo para uso interno.

## 👥 Equipo

- **Frontend Lead**: Sebastian
- **Firebase Integration**: Sebastian
- **UI/UX**: Sebastian
