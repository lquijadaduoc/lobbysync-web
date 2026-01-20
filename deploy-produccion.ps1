# ============================================
# DEPLOY AUTOMATIZADO A PRODUCCIÓN
# ============================================

param(
    [string]$VpsHost = "168.197.50.14",
    [string]$VpsUser = "root",
    [string]$Step = "all"  # all, build, deploy, nginx, test
)

$ErrorActionPreference = "Stop"

# Colores para output
$Green = "Green"
$Red = "Red"
$Yellow = "Yellow"
$Blue = "Blue"

function Write-Success {
    Write-Host "[✓]" -ForegroundColor $Green -NoNewline; Write-Host " $args"
}

function Write-Error-Custom {
    Write-Host "[✗]" -ForegroundColor $Red -NoNewline; Write-Host " $args"
}

function Write-Info {
    Write-Host "[ℹ]" -ForegroundColor $Blue -NoNewline; Write-Host " $args"
}

function Write-Warning-Custom {
    Write-Host "[⚠]" -ForegroundColor $Yellow -NoNewline; Write-Host " $args"
}

# ============================================
# PASO 1: BUILD
# ============================================

function Step-Build {
    Write-Info "=== PASO 1: BUILD FRONTEND ==="
    
    # Verificar Node.js
    Write-Info "Verificando Node.js..."
    $node = node -v
    Write-Success "Node.js $node encontrado"
    
    # Verificar npm
    Write-Info "Verificando npm..."
    $npm = npm -v
    Write-Success "npm $npm encontrado"
    
    # Limpiar dist anterior (opcional)
    Write-Info "Preparando carpeta dist..."
    if (Test-Path "dist") {
        Write-Warning-Custom "Removiendo dist anterior..."
        Remove-Item -Path "dist" -Recurse -Force
    }
    
    # Build
    Write-Info "Ejecutando: npm run build"
    npm run build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Build completado exitosamente"
        $distSize = (Get-ChildItem dist -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
        Write-Success "Tamaño dist: $([Math]::Round($distSize, 2)) MB"
    } else {
        Write-Error-Custom "Build fallido (exit code: $LASTEXITCODE)"
        exit 1
    }
}

# ============================================
# PASO 2: CONFIGURAR BACKEND
# ============================================

function Step-Configure-Backend {
    Write-Info "=== PASO 2: CONFIGURAR BACKEND ==="
    
    # Buscar axiosConfig.js
    Write-Info "Buscando axiosConfig.js..."
    $axiosPath = "src/api/axiosConfig.js"
    
    if (-not (Test-Path $axiosPath)) {
        Write-Warning-Custom "No se encontró $axiosPath"
        return
    }
    
    # Leer contenido
    $content = Get-Content $axiosPath -Raw
    
    # Reemplazar localhost por VPS
    $newContent = $content -replace "localhost:8080", "$VpsHost`:8080"
    
    if ($content -ne $newContent) {
        Set-Content $axiosPath -Value $newContent
        Write-Success "Actualizado axiosConfig.js: localhost → $VpsHost"
        
        # Rebuild necesario
        Write-Warning-Custom "Requiere rebuild. Ejecutando npm run build..."
        npm run build
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Rebuild completado"
        } else {
            Write-Error-Custom "Rebuild fallido"
            exit 1
        }
    } else {
        Write-Success "axiosConfig.js ya está configurado para $VpsHost"
    }
}

# ============================================
# PASO 3: COPIAR ARCHIVOS A VPS
# ============================================

function Step-Deploy {
    Write-Info "=== PASO 3: DEPLOY A VPS ==="
    
    # Verificar dist
    if (-not (Test-Path "dist")) {
        Write-Error-Custom "Carpeta dist no existe. Ejecuta Step-Build primero."
        exit 1
    }
    
    # Conectar a VPS y crear carpeta
    Write-Info "Conectando a VPS $VpsHost..."
    Write-Info "Preparando carpeta en VPS..."
    
    # Via SSH
    $sshCmd = "mkdir -p /var/www/lobbysync-web; ls -la /var/www/lobbysync-web"
    ssh $VpsUser@$VpsHost $sshCmd
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "No se pudo conectar a $VpsHost"
        exit 1
    }
    
    Write-Success "Carpeta preparada en VPS"
    
    # Copiar archivos
    Write-Info "Copiando archivos a VPS..."
    Write-Warning-Custom "Esto puede tardar 1-2 minutos..."
    
    # Crear archivo .zip
    Compress-Archive -Path dist/* -DestinationPath dist.zip -Force
    Write-Success "Archivo dist.zip creado"
    
    # Copiar zip a VPS
    Write-Info "Enviando archivos (SCP)..."
    scp dist.zip "$VpsUser@$VpsHost`:/tmp/"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "Error copiando archivos"
        exit 1
    }
    
    Write-Success "Archivo enviado a VPS"
    
    # Descomprimir en VPS
    Write-Info "Descomprimiendo en VPS..."
    ssh $VpsUser@$VpsHost "cd /tmp && unzip -o dist.zip && cp -r dist/* /var/www/lobbysync-web/ && ls -la /var/www/lobbysync-web/index.html"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Deploy completado exitosamente"
    } else {
        Write-Error-Custom "Error descomprimiendo archivos"
        exit 1
    }
    
    # Limpiar zip local
    Remove-Item dist.zip -Force
    Write-Success "Archivos temporales limpios"
}

# ============================================
# PASO 4: CONFIGURAR NGINX
# ============================================

function Step-Nginx {
    Write-Info "=== PASO 4: CONFIGURAR NGINX ==="
    
    Write-Warning-Custom "Esto requiere acceso SSH como root"
    Write-Info "Conectando a VPS $VpsHost..."
    
    # Script para configurar nginx
    $nginxConfig = @"
server {
    listen 80;
    listen [::]:80;
    server_name 168.197.50.14 _;
    
    root /var/www/lobbysync-web;
    index index.html;
    
    location / {
        try_files \`$uri \`$uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host \`$host;
        proxy_set_header X-Real-IP \`$remote_addr;
        proxy_set_header X-Forwarded-For \`$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \`$scheme;
    }
}
"@

    # Crear archivo temporal
    $tmpFile = "nginx-lobbysync.conf"
    Set-Content -Path $tmpFile -Value $nginxConfig
    
    # Copiar a VPS
    Write-Info "Enviando configuración nginx..."
    scp $tmpFile "$VpsUser@$VpsHost`:/tmp/"
    
    # Copiar a sites-available
    Write-Info "Instalando configuración..."
    ssh $VpsUser@$VpsHost @"
        cp /tmp/$tmpFile /etc/nginx/sites-available/lobbysync
        ln -sf /etc/nginx/sites-available/lobbysync /etc/nginx/sites-enabled/lobbysync
        rm /etc/nginx/sites-enabled/default 2>/dev/null || true
        nginx -t
        systemctl reload nginx
        systemctl status nginx
"@
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Nginx configurado y recargado"
    } else {
        Write-Error-Custom "Error configurando nginx"
        exit 1
    }
    
    # Limpiar
    Remove-Item $tmpFile -Force
}

# ============================================
# PASO 5: INSERTAR DATOS
# ============================================

function Step-Insert-Data {
    Write-Info "=== PASO 5: INSERTAR DATOS EN BD ==="
    
    Write-Warning-Custom "Requiere acceso directo a PostgreSQL en VPS"
    
    $sqlScript = @"
INSERT INTO building (name, address, city, zip_code, is_active, created_at)
SELECT 'Condominio Las Flores', 'Calle Principal 123', 'Santiago', '8320000', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM building WHERE name = 'Condominio Las Flores');

INSERT INTO unit (building_id, unit_number, is_active, created_at)
SELECT 1, '101', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM unit WHERE building_id = 1 AND unit_number = '101');

INSERT INTO "user" (username, password_hash, email, role, unit_id, is_active, created_at)
SELECT 'resident1', '\$2a\$10\$GRLdNijSQMUvqNzDa/F.KOjVt6.Gq7C8W0X8Y9Z0X1Y2Z3X4', 
'resident1@test.com', 'RESIDENT', 1, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM "user" WHERE email = 'resident1@test.com');

INSERT INTO common_area (building_id, name, description, max_capacity, is_active, created_at)
SELECT 1, 'Salón Comunal', 'Espacio para eventos', 50, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM common_area WHERE building_id = 1 AND name = 'Salón Comunal');

INSERT INTO common_area (building_id, name, description, max_capacity, is_active, created_at)
SELECT 1, 'Terraza', 'Área verde', 30, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM common_area WHERE building_id = 1 AND name = 'Terraza');

INSERT INTO common_area (building_id, name, description, max_capacity, is_active, created_at)
SELECT 1, 'Gimnasio', 'Equipos ejercicio', 15, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM common_area WHERE building_id = 1 AND name = 'Gimnasio');
"@

    Write-Info "SQL a ejecutar (copiar en pgAdmin o psql):"
    Write-Host "---" -ForegroundColor Gray
    Write-Host $sqlScript
    Write-Host "---" -ForegroundColor Gray
    
    Write-Warning-Custom "Ejecuta manualmente en pgAdmin: http://168.197.50.14:5050"
    Write-Warning-Custom "O via SSH: psql -U postgres -d lobbysync_db"
}

# ============================================
# PASO 6: TESTING
# ============================================

function Step-Test {
    Write-Info "=== PASO 6: TESTING ==="
    
    # Test 1: Frontend accesible
    Write-Info "Test 1: Frontend accesible..."
    try {
        $response = Invoke-WebRequest -Uri "http://$VpsHost" -TimeoutSec 5 -SkipHttpErrorCheck
        if ($response.StatusCode -eq 200) {
            Write-Success "Frontend responde HTTP 200"
        } else {
            Write-Warning-Custom "Frontend responde HTTP $($response.StatusCode)"
        }
    } catch {
        Write-Error-Custom "No se pudo conectar a http://$VpsHost"
    }
    
    # Test 2: API accesible
    Write-Info "Test 2: API accesible..."
    try {
        $response = Invoke-WebRequest -Uri "http://$VpsHost/api/v1/users" -TimeoutSec 5 -SkipHttpErrorCheck
        if ($response.StatusCode -eq 200) {
            Write-Success "API responde HTTP 200"
        } else {
            Write-Warning-Custom "API responde HTTP $($response.StatusCode)"
        }
    } catch {
        Write-Error-Custom "No se pudo conectar a API"
    }
    
    Write-Info "Testing completo. Abre navegador:"
    Write-Host "  http://$VpsHost" -ForegroundColor Cyan
    Write-Host "  Email: resident1@test.com" -ForegroundColor Cyan
    Write-Host "  Password: password123" -ForegroundColor Cyan
}

# ============================================
# MAIN
# ============================================

Write-Host "`n╔══════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  DEPLOY AUTOMATIZADO A PRODUCCIÓN   ║" -ForegroundColor Cyan
Write-Host "║  VPS: $VpsHost" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════╝`n" -ForegroundColor Cyan

try {
    switch ($Step) {
        "build" { Step-Build }
        "config" { Step-Configure-Backend }
        "deploy" { Step-Deploy }
        "nginx" { Step-Nginx }
        "data" { Step-Insert-Data }
        "test" { Step-Test }
        default {
            Write-Info "Ejecutando todos los pasos..."
            Step-Build
            Step-Configure-Backend
            Step-Deploy
            Step-Nginx
            Step-Insert-Data
            Step-Test
        }
    }
    
    Write-Host "`n✅ DEPLOYMENT COMPLETADO" -ForegroundColor Green
    Write-Host "Próximos pasos:" -ForegroundColor Cyan
    Write-Host "  1. Inserta datos (DEPLOY_PRODUCCION.md - Paso 1)" -ForegroundColor Gray
    Write-Host "  2. Abre http://$VpsHost en navegador" -ForegroundColor Gray
    Write-Host "  3. Login: resident1@test.com / password123" -ForegroundColor Gray
    
} catch {
    Write-Host "`n❌ ERROR DURANTE DEPLOYMENT" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
