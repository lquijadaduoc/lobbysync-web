# Script para actualizar backend y agregar datos de prueba
# Ejecutar desde: lobbysync-web

Write-Host "🚀 Actualizando Backend y Agregando Datos..." -ForegroundColor Cyan
Write-Host ""

# ===== PASO 1: Actualizar Backend Real =====
Write-Host "📦 PASO 1: Actualizando Backend Real..." -ForegroundColor Yellow

$backendIP = "168.197.50.14"
$backendURL = "http://${backendIP}:8080"

# Nota: Esto requeriría SSH al servidor real. Por ahora, mostrar instrucciones.
Write-Host ""
Write-Host "⚠️  ACTUALIZACIÓN MANUAL REQUERIDA:" -ForegroundColor Red
Write-Host "   Si el backend está en un servidor remoto, ejecuta estos comandos en el servidor:" -ForegroundColor White
Write-Host ""
Write-Host "   ssh usuario@${backendIP}" -ForegroundColor Gray
Write-Host "   cd /ruta/al/proyecto" -ForegroundColor Gray
Write-Host "   git pull origin main" -ForegroundColor Gray
Write-Host "   docker-compose down" -ForegroundColor Gray
Write-Host "   docker-compose build --no-cache" -ForegroundColor Gray
Write-Host "   docker-compose up -d" -ForegroundColor Gray
Write-Host ""
Write-Host "   O si usa Maven directamente:" -ForegroundColor Gray
Write-Host "   git pull origin main" -ForegroundColor Gray
Write-Host "   mvn clean package" -ForegroundColor Gray
Write-Host "   java -jar target/backend-1.0.0.jar" -ForegroundColor Gray
Write-Host ""

$response = Read-Host "¿El backend ya está actualizado? (s/n)"
if ($response -ne "s" -and $response -ne "S") {
    Write-Host "❌ Por favor actualiza el backend primero." -ForegroundColor Red
    exit 1
}

# ===== PASO 2: Verificar Backend Disponible =====
Write-Host ""
Write-Host "🔍 PASO 2: Verificando Backend..." -ForegroundColor Yellow

try {
    $healthCheck = Invoke-WebRequest -Uri "${backendURL}/api/v1/buildings" -Method Get -UseBasicParsing -TimeoutSec 5
    if ($healthCheck.StatusCode -eq 200) {
        Write-Host "✅ Backend respondiendo correctamente" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Backend no responde en ${backendURL}" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# ===== PASO 3: Agregar Datos de Prueba =====
Write-Host ""
Write-Host "📊 PASO 3: Agregando Datos de Prueba..." -ForegroundColor Yellow
Write-Host ""

# Token de autenticación (ajustar según tu implementación)
# Por ahora, intentaremos sin token ya que algunos endpoints pueden estar públicos
$headers = @{
    "Content-Type" = "application/json"
}

# EDIFICIOS
Write-Host "🏢 Creando Edificios..." -ForegroundColor Cyan

$edificios = @(
    @{
        name = "Torre Central"
        address = "Av. Libertador Bernardo O'Higgins 1234"
        city = "Santiago"
        country = "Chile"
        floors = 15
        totalUnits = 60
        active = $true
    },
    @{
        name = "Edificio Norte"
        address = "Calle Agustinas 456"
        city = "Santiago"
        country = "Chile"
        floors = 10
        totalUnits = 40
        active = $true
    },
    @{
        name = "Condominio Sur"
        address = "Pasaje Los Aromos 789"
        city = "Santiago"
        country = "Chile"
        floors = 8
        totalUnits = 32
        active = $true
    }
)

$edificiosCreados = @()

foreach ($edificio in $edificios) {
    try {
        $body = $edificio | ConvertTo-Json -Depth 10
        $response = Invoke-RestMethod -Uri "${backendURL}/api/v1/buildings" -Method Post -Body $body -Headers $headers -ContentType "application/json"
        $edificiosCreados += $response
        Write-Host "  ✓ ${($edificio.name)} creado (ID: $($response.id))" -ForegroundColor Green
    } catch {
        Write-Host "  ✗ Error creando ${($edificio.name)}: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Start-Sleep -Seconds 1

# UNIDADES/DEPARTAMENTOS
Write-Host ""
Write-Host "🏠 Creando Unidades/Departamentos..." -ForegroundColor Cyan

if ($edificiosCreados.Count -eq 0) {
    Write-Host "  ⚠️  No se pudieron crear edificios. Saltando unidades." -ForegroundColor Yellow
} else {
    $unidades = @(
        @{
            unitNumber = "101"
            floor = 1
            buildingId = $edificiosCreados[0].id
            type = "APARTMENT"
            bedrooms = 2
            bathrooms = 1
            squareMeters = 65.5
            status = "OCCUPIED"
        },
        @{
            unitNumber = "102"
            floor = 1
            buildingId = $edificiosCreados[0].id
            type = "APARTMENT"
            bedrooms = 3
            bathrooms = 2
            squareMeters = 85.0
            status = "OCCUPIED"
        },
        @{
            unitNumber = "201"
            floor = 2
            buildingId = $edificiosCreados[0].id
            type = "APARTMENT"
            bedrooms = 2
            bathrooms = 2
            squareMeters = 70.0
            status = "AVAILABLE"
        },
        @{
            unitNumber = "301"
            floor = 3
            buildingId = $edificiosCreados[0].id
            type = "PENTHOUSE"
            bedrooms = 4
            bathrooms = 3
            squareMeters = 150.0
            status = "OCCUPIED"
        },
        @{
            unitNumber = "101"
            floor = 1
            buildingId = $edificiosCreados[1].id
            type = "APARTMENT"
            bedrooms = 2
            bathrooms = 1
            squareMeters = 60.0
            status = "OCCUPIED"
        },
        @{
            unitNumber = "102"
            floor = 1
            buildingId = $edificiosCreados[1].id
            type = "APARTMENT"
            bedrooms = 3
            bathrooms = 2
            squareMeters = 80.0
            status = "AVAILABLE"
        }
    )

    foreach ($unidad in $unidades) {
        try {
            $body = $unidad | ConvertTo-Json -Depth 10
            $response = Invoke-RestMethod -Uri "${backendURL}/api/v1/units" -Method Post -Body $body -Headers $headers -ContentType "application/json"
            Write-Host "  ✓ Unidad $($unidad.unitNumber) creada (ID: $($response.id))" -ForegroundColor Green
        } catch {
            Write-Host "  ✗ Error creando unidad $($unidad.unitNumber): $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# ===== PASO 4: Verificar Datos =====
Write-Host ""
Write-Host "🔍 PASO 4: Verificando Datos..." -ForegroundColor Yellow

try {
    $buildings = Invoke-RestMethod -Uri "${backendURL}/api/v1/buildings" -Method Get
    $units = Invoke-RestMethod -Uri "${backendURL}/api/v1/units" -Method Get
    
    Write-Host ""
    Write-Host "📊 Resumen:" -ForegroundColor Cyan
    Write-Host "  • Edificios: $($buildings.Count)" -ForegroundColor White
    Write-Host "  • Unidades: $($units.Count)" -ForegroundColor White
} catch {
    Write-Host "⚠️  No se pudieron verificar los datos: $($_.Exception.Message)" -ForegroundColor Yellow
}

# ===== FINALIZACIÓN =====
Write-Host ""
Write-Host "✅ PROCESO COMPLETADO" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Próximos pasos:" -ForegroundColor Cyan
Write-Host "  1. Recarga la aplicación web (F5)" -ForegroundColor White
Write-Host "  2. Ve a 'Deptos y Edificios'" -ForegroundColor White
Write-Host "  3. Deberías ver el indicador verde 'DATOS REALES'" -ForegroundColor White
Write-Host "  4. La tabla mostrará los edificios y departamentos" -ForegroundColor White
Write-Host ""
