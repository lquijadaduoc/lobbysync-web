# Script para agregar datos de prueba al backend
Write-Host "📊 Agregando Datos de Prueba al Backend..." -ForegroundColor Cyan
Write-Host ""

$backendURL = "http://168.197.50.14:8080"

# Verificar backend
Write-Host "🔍 Verificando Backend..." -ForegroundColor Yellow
try {
    $test = Invoke-WebRequest -Uri "$backendURL/api/v1/buildings" -Method Get -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Backend conectado" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend no responde: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🏢 Creando Edificios..." -ForegroundColor Cyan

# Edificio 1
$edificio1 = @{
    name = "Torre Central"
    address = "Av. Libertador Bernardo O'Higgins 1234"
    city = "Santiago"
    country = "Chile"
    floors = 15
    totalUnits = 60
    active = $true
} | ConvertTo-Json

try {
    $result1 = Invoke-RestMethod -Uri "$backendURL/api/v1/buildings" -Method Post -Body $edificio1 -ContentType "application/json"
    Write-Host "  ✓ Torre Central creado (ID: $($result1.id))" -ForegroundColor Green
    $buildingId1 = $result1.id
} catch {
    Write-Host "  ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Edificio 2
$edificio2 = @{
    name = "Edificio Norte"
    address = "Calle Agustinas 456"
    city = "Santiago"
    country = "Chile"
    floors = 10
    totalUnits = 40
    active = $true
} | ConvertTo-Json

try {
    $result2 = Invoke-RestMethod -Uri "$backendURL/api/v1/buildings" -Method Post -Body $edificio2 -ContentType "application/json"
    Write-Host "  ✓ Edificio Norte creado (ID: $($result2.id))" -ForegroundColor Green
    $buildingId2 = $result2.id
} catch {
    Write-Host "  ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Edificio 3
$edificio3 = @{
    name = "Condominio Sur"
    address = "Pasaje Los Aromos 789"
    city = "Santiago"
    country = "Chile"
    floors = 8
    totalUnits = 32
    active = $true
} | ConvertTo-Json

try {
    $result3 = Invoke-RestMethod -Uri "$backendURL/api/v1/buildings" -Method Post -Body $edificio3 -ContentType "application/json"
    Write-Host "  ✓ Condominio Sur creado (ID: $($result3.id))" -ForegroundColor Green
    $buildingId3 = $result3.id
} catch {
    Write-Host "  ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🏠 Creando Unidades..." -ForegroundColor Cyan

# Unidades Torre Central
$unidad1 = @{
    unitNumber = "101"
    floor = 1
    buildingId = $buildingId1
    type = "APARTMENT"
    bedrooms = 2
    bathrooms = 1
    squareMeters = 65.5
    status = "OCCUPIED"
} | ConvertTo-Json

try {
    $u1 = Invoke-RestMethod -Uri "$backendURL/api/v1/units" -Method Post -Body $unidad1 -ContentType "application/json"
    Write-Host "  ✓ Unidad 101 creada" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Error unidad 101: $($_.Exception.Message)" -ForegroundColor Red
}

$unidad2 = @{
    unitNumber = "102"
    floor = 1
    buildingId = $buildingId1
    type = "APARTMENT"
    bedrooms = 3
    bathrooms = 2
    squareMeters = 85.0
    status = "OCCUPIED"
} | ConvertTo-Json

try {
    $u2 = Invoke-RestMethod -Uri "$backendURL/api/v1/units" -Method Post -Body $unidad2 -ContentType "application/json"
    Write-Host "  ✓ Unidad 102 creada" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Error unidad 102: $($_.Exception.Message)" -ForegroundColor Red
}

$unidad3 = @{
    unitNumber = "201"
    floor = 2
    buildingId = $buildingId1
    type = "APARTMENT"
    bedrooms = 2
    bathrooms = 2
    squareMeters = 70.0
    status = "AVAILABLE"
} | ConvertTo-Json

try {
    $u3 = Invoke-RestMethod -Uri "$backendURL/api/v1/units" -Method Post -Body $unidad3 -ContentType "application/json"
    Write-Host "  ✓ Unidad 201 creada" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Error unidad 201: $($_.Exception.Message)" -ForegroundColor Red
}

$unidad4 = @{
    unitNumber = "301"
    floor = 3
    buildingId = $buildingId1
    type = "PENTHOUSE"
    bedrooms = 4
    bathrooms = 3
    squareMeters = 150.0
    status = "OCCUPIED"
} | ConvertTo-Json

try {
    $u4 = Invoke-RestMethod -Uri "$backendURL/api/v1/units" -Method Post -Body $unidad4 -ContentType "application/json"
    Write-Host "  ✓ Unidad 301 creada" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Error unidad 301: $($_.Exception.Message)" -ForegroundColor Red
}

# Unidades Edificio Norte
$unidad5 = @{
    unitNumber = "101"
    floor = 1
    buildingId = $buildingId2
    type = "APARTMENT"
    bedrooms = 2
    bathrooms = 1
    squareMeters = 60.0
    status = "OCCUPIED"
} | ConvertTo-Json

try {
    $u5 = Invoke-RestMethod -Uri "$backendURL/api/v1/units" -Method Post -Body $unidad5 -ContentType "application/json"
    Write-Host "  ✓ Unidad 101 (Edificio Norte) creada" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Error unidad 101 Norte: $($_.Exception.Message)" -ForegroundColor Red
}

$unidad6 = @{
    unitNumber = "102"
    floor = 1
    buildingId = $buildingId2
    type = "APARTMENT"
    bedrooms = 3
    bathrooms = 2
    squareMeters = 80.0
    status = "AVAILABLE"
} | ConvertTo-Json

try {
    $u6 = Invoke-RestMethod -Uri "$backendURL/api/v1/units" -Method Post -Body $unidad6 -ContentType "application/json"
    Write-Host "  ✓ Unidad 102 (Edificio Norte) creada" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Error unidad 102 Norte: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🔍 Verificando datos..." -ForegroundColor Yellow

$buildings = Invoke-RestMethod -Uri "$backendURL/api/v1/buildings" -Method Get
$units = Invoke-RestMethod -Uri "$backendURL/api/v1/units" -Method Get

Write-Host ""
Write-Host "✅ COMPLETADO" -ForegroundColor Green
Write-Host "  • Edificios: $($buildings.Count)" -ForegroundColor White
Write-Host "  • Unidades: $($units.Count)" -ForegroundColor White
Write-Host ""
Write-Host "🎯 Recarga la aplicación web para ver los datos reales" -ForegroundColor Cyan
