# 🔐 SOLUCIÓN: Usuario admin@lobbysync.com no puede entrar

## 🎯 PROBLEMA IDENTIFICADO

El sistema **LobbSync usa Firebase Authentication**, no autenticación tradicional con contraseñas en base de datos.

**Error:** El usuario `admin@lobbysync.com` **NO EXISTE en Firebase Authentication**.

---

## ✅ SOLUCIÓN RÁPIDA (3 Pasos)

### 📝 **Paso 1: Crear el usuario en Firebase Console**

1. Ir a: https://console.firebase.google.com/project/lobbysync-91db0/authentication/users
2. Hacer clic en **"Add user"** (Agregar usuario)
3. Ingresar:
   - **Email:** `admin@lobbysync.com`
   - **Password:** `admin123`
4. Click en **"Add user"**

### 🔍 **Paso 2: Obtener el Firebase UID**

Después de crear el usuario, Firebase genera un UID único. Necesitas copiarlo.

**Opción A - Desde Firebase Console:**
- En la lista de usuarios, busca `admin@lobbysync.com`
- Haz clic en el usuario
- Copia el **User UID** (algo como: `xJ4kL9mN2pQ5rS8tU1vW3xY6zA`)

**Opción B - Usando el checker HTML:**
1. Abrir: `firebase-uid-checker.html` en el navegador
2. Ingresar:
   - Email: `admin@lobbysync.com`
   - Password: `admin123`
3. Click en "Obtener Firebase UID"
4. Copiar el UID que se muestra

### 💾 **Paso 3: Actualizar usuario en PostgreSQL**

Ejecutar este SQL en la base de datos de producción:

```sql
-- Crear o actualizar el usuario admin
INSERT INTO users (
    email, 
    firebase_uid, 
    first_name, 
    last_name, 
    role, 
    is_active,
    created_at,
    updated_at
)
VALUES (
    'admin@lobbysync.com',
    'REEMPLAZAR_CON_UID_DE_FIREBASE',  -- ← Poner el UID real aquí
    'Admin',
    'Sistema',
    'ADMIN',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (email) 
DO UPDATE SET 
    firebase_uid = EXCLUDED.firebase_uid,
    is_active = true,
    role = 'ADMIN';
```

**Ejecutar desde SSH:**

```powershell
# Conectar al VPS
ssh root@168.197.50.14

# Ejecutar SQL dentro del contenedor PostgreSQL
docker exec -it postgres_db psql -U postgres -d lobbysync

# Pegar el SQL de arriba (con el UID correcto)
```

---

## 🚀 CREAR TODOS LOS USUARIOS DE PRUEBA

### 📋 Lista completa de usuarios necesarios

Crear estos 4 usuarios en **Firebase Authentication**:

| Email | Password | Rol | Nombre |
|-------|----------|-----|--------|
| `superadmin@lobbysync.com` | `admin123` | SUPER_ADMIN | Super Admin |
| `admin@lobbysync.com` | `admin123` | ADMIN | Admin Sistema |
| `concierge@lobbysync.com` | `admin123` | CONCIERGE | Conserje |
| `resident@lobbysync.com` | `admin123` | RESIDENT | Juan Pérez |

### 🔥 Script SQL completo (después de crear en Firebase)

```sql
-- 1. SUPER ADMIN
INSERT INTO users (email, firebase_uid, first_name, last_name, role, is_active, created_at, updated_at)
VALUES ('superadmin@lobbysync.com', 'FIREBASE_UID_AQUI', 'Super', 'Admin', 'SUPER_ADMIN', true, NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET firebase_uid = EXCLUDED.firebase_uid, is_active = true, role = 'SUPER_ADMIN';

-- 2. ADMIN
INSERT INTO users (email, firebase_uid, first_name, last_name, role, is_active, created_at, updated_at)
VALUES ('admin@lobbysync.com', 'FIREBASE_UID_AQUI', 'Admin', 'Sistema', 'ADMIN', true, NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET firebase_uid = EXCLUDED.firebase_uid, is_active = true, role = 'ADMIN';

-- 3. CONCIERGE
INSERT INTO users (email, firebase_uid, first_name, last_name, role, is_active, created_at, updated_at)
VALUES ('concierge@lobbysync.com', 'FIREBASE_UID_AQUI', 'Conserje', 'Principal', 'CONCIERGE', true, NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET firebase_uid = EXCLUDED.firebase_uid, is_active = true, role = 'CONCIERGE';

-- 4. RESIDENT (con unidad asignada)
INSERT INTO users (email, firebase_uid, first_name, last_name, role, unit_id, is_active, created_at, updated_at)
VALUES ('resident@lobbysync.com', 'FIREBASE_UID_AQUI', 'Juan', 'Pérez', 'RESIDENT', 1, true, NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET firebase_uid = EXCLUDED.firebase_uid, is_active = true, role = 'RESIDENT', unit_id = 1;

-- Verificar
SELECT id, email, firebase_uid, role, is_active FROM users WHERE email LIKE '%lobbysync.com';
```

---

## 🛠️ PROCESO AUTOMATIZADO CON POWERSHELL

### Script para obtener UID y actualizar BD

```powershell
# crear-usuarios-firebase.ps1

Write-Host "🔥 Creador de Usuarios LobbSync" -ForegroundColor Cyan
Write-Host ""

$usuarios = @(
    @{Email="superadmin@lobbysync.com"; Password="admin123"; Nombre="Super"; Apellido="Admin"; Rol="SUPER_ADMIN"},
    @{Email="admin@lobbysync.com"; Password="admin123"; Nombre="Admin"; Apellido="Sistema"; Rol="ADMIN"},
    @{Email="concierge@lobbysync.com"; Password="admin123"; Nombre="Conserje"; Apellido="Principal"; Rol="CONCIERGE"},
    @{Email="resident@lobbysync.com"; Password="admin123"; Nombre="Juan"; Apellido="Pérez"; Rol="RESIDENT"}
)

Write-Host "📋 Pasos a seguir:" -ForegroundColor Yellow
Write-Host "1. Ve a: https://console.firebase.google.com/project/lobbysync-91db0/authentication/users"
Write-Host "2. Crea estos 4 usuarios:"
Write-Host ""

foreach ($user in $usuarios) {
    Write-Host "   ▶ Email: $($user.Email) | Password: $($user.Password)" -ForegroundColor White
}

Write-Host ""
Write-Host "3. Después de crear cada usuario, copia su Firebase UID"
Write-Host "4. Ejecuta los SQLs que se generarán abajo"
Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

foreach ($user in $usuarios) {
    $uid = Read-Host "Ingresa el Firebase UID para $($user.Email)"
    
    if ($uid) {
        $sql = @"
-- Usuario: $($user.Email)
INSERT INTO users (email, firebase_uid, first_name, last_name, role, is_active, created_at, updated_at)
VALUES ('$($user.Email)', '$uid', '$($user.Nombre)', '$($user.Apellido)', '$($user.Rol)', true, NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET 
    firebase_uid = EXCLUDED.firebase_uid, 
    is_active = true, 
    role = '$($user.Rol)',
    first_name = '$($user.Nombre)',
    last_name = '$($user.Apellido)';

"@
        
        Write-Host "✅ SQL generado para $($user.Email)" -ForegroundColor Green
        
        # Guardar en archivo
        Add-Content -Path "usuarios_sql.sql" -Value $sql
    }
}

Write-Host ""
Write-Host "📄 SQL guardado en: usuarios_sql.sql" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Para ejecutar en el servidor:" -ForegroundColor Yellow
Write-Host "ssh root@168.197.50.14" -ForegroundColor White
Write-Host "docker exec -i postgres_db psql -U postgres -d lobbysync < usuarios_sql.sql" -ForegroundColor White
```

---

## 🔍 VERIFICACIÓN

### Probar el login:

1. Abrir el frontend: `http://localhost:5173` (o URL de producción)
2. Hacer clic en el botón **"🔑 Admin"** en la sección "Acceso Rápido"
3. Debería:
   - ✅ Autenticar con Firebase
   - ✅ Sincronizar con backend
   - ✅ Redirigir a `/admin`
   - ✅ Mostrar el dashboard del administrador

### Si aún falla, verificar:

```powershell
# 1. Verificar que el usuario existe en Firebase
# Ir a: https://console.firebase.google.com/project/lobbysync-91db0/authentication/users
# Buscar: admin@lobbysync.com

# 2. Verificar en PostgreSQL
ssh root@168.197.50.14
docker exec -it postgres_db psql -U postgres -d lobbysync

SELECT id, email, firebase_uid, role, is_active 
FROM users 
WHERE email = 'admin@lobbysync.com';

# Debe retornar:
# - email: admin@lobbysync.com
# - firebase_uid: (un string largo)
# - role: ADMIN
# - is_active: true

# 3. Verificar logs del backend
docker logs lobbysync-backend --tail 50
```

---

## 📌 RESUMEN

**Causa del problema:**
- ❌ El usuario NO existe en Firebase Authentication
- ⚠️ El sistema NO usa contraseñas en PostgreSQL
- ✅ Firebase es la única fuente de autenticación

**Solución:**
1. **Crear** el usuario en Firebase Console
2. **Copiar** el Firebase UID generado
3. **Actualizar** PostgreSQL con el UID

**Resultado:**
✅ `admin@lobbysync.com` podrá iniciar sesión con `admin123`

---

## 🎯 ALTERNATIVA: Usar Firebase Admin SDK para crear usuarios

Si tienes acceso al backend, puedes crear usuarios automáticamente:

```java
// En el backend (BackendApplication.java o similar)
@PostConstruct
public void createDefaultUsers() throws FirebaseAuthException {
    List<Map<String, String>> defaultUsers = List.of(
        Map.of("email", "admin@lobbysync.com", "password", "admin123", "role", "ADMIN"),
        Map.of("email", "concierge@lobbysync.com", "password", "admin123", "role", "CONCIERGE"),
        Map.of("email", "resident@lobbysync.com", "password", "admin123", "role", "RESIDENT")
    );

    for (Map<String, String> userData : defaultUsers) {
        try {
            UserRecord.CreateRequest request = new UserRecord.CreateRequest()
                .setEmail(userData.get("email"))
                .setPassword(userData.get("password"))
                .setEmailVerified(true);
            
            UserRecord userRecord = FirebaseAuth.getInstance().createUser(request);
            
            // Guardar en PostgreSQL
            User user = new User();
            user.setEmail(userData.get("email"));
            user.setFirebaseUid(userRecord.getUid());
            user.setRole(userData.get("role"));
            user.setIsActive(true);
            userRepository.save(user);
            
            System.out.println("✅ Usuario creado: " + userData.get("email"));
        } catch (Exception e) {
            System.out.println("Usuario ya existe: " + userData.get("email"));
        }
    }
}
```

---

**¿Necesitas ayuda para ejecutar alguno de estos pasos?** 🚀
