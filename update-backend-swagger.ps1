# Script para actualizar backend real con cambios de Swagger
Write-Host "🔄 Actualizando Backend Real en 168.197.50.14..." -ForegroundColor Cyan
Write-Host ""

$server = "168.197.50.14"
$user = "root"

# Primero, encontrar dónde está el proyecto
Write-Host "📍 Buscando proyecto lobbysync-api en el servidor..." -ForegroundColor Yellow
$findCmd = "find / -type d -name 'lobbysync-api' 2>/dev/null | head -1"
$projectPath = ssh ${user}@${server} $findCmd

if ([string]::IsNullOrWhiteSpace($projectPath)) {
    Write-Host "⚠️  No se encontró el proyecto automáticamente." -ForegroundColor Yellow
    $projectPath = Read-Host "Ingresa la ruta del proyecto en el servidor"
}

Write-Host "📂 Proyecto encontrado en: $projectPath" -ForegroundColor Green
Write-Host ""

# Crear script de actualización
$updateScript = @"
#!/bin/bash
set -e

echo '📂 Navegando al proyecto...'
cd $projectPath

echo '📥 Obteniendo últimos cambios de GitHub...'
git pull origin main

echo '🐳 Verificando si usa Docker...'
if [ -f 'docker-compose.yml' ]; then
    echo '🐳 Docker detectado - Reconstruyendo contenedores...'
    docker-compose down
    docker-compose build --no-cache backend
    docker-compose up -d
    echo '✅ Backend actualizado con Docker'
elif [ -f 'pom.xml' ]; then
    echo '☕ Maven detectado - Recompilando...'
    mvn clean package -DskipTests
    
    echo '🔄 Reiniciando backend...'
    # Buscar proceso Java y detenerlo
    pkill -f 'lobbysync.*jar' || true
    
    # Iniciar nuevo proceso
    nohup java -jar target/backend-*.jar > logs/backend.log 2>&1 &
    echo '✅ Backend recompilado y reiniciado'
else
    echo '❌ No se detectó método de build'
    exit 1
fi

echo ''
echo '⏳ Esperando que el backend inicie...'
sleep 5

echo '🔍 Verificando backend...'
curl -s http://localhost:8080/api/v1/buildings > /dev/null && echo '✅ Backend respondiendo correctamente' || echo '⚠️  Backend no responde aún'

echo ''
echo '📚 Swagger UI disponible en: http://168.197.50.14:8080/swagger-ui/index.html'
"@

# Guardar script temporalmente
$tempScript = [System.IO.Path]::GetTempFileName()
$updateScript | Out-File -FilePath $tempScript -Encoding UTF8

# Copiar y ejecutar en el servidor
Write-Host "🚀 Ejecutando actualización en el servidor..." -ForegroundColor Yellow
Write-Host ""

try {
    # Copiar script al servidor
    scp $tempScript ${user}@${server}:/tmp/update-backend.sh
    
    # Dar permisos de ejecución y ejecutar
    ssh ${user}@${server} "chmod +x /tmp/update-backend.sh && /tmp/update-backend.sh"
    
    Write-Host ""
    Write-Host "✅ BACKEND ACTUALIZADO EXITOSAMENTE" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔍 Verificando desde tu máquina..." -ForegroundColor Yellow
    
    Start-Sleep -Seconds 3
    
    $test = Invoke-WebRequest -Uri "http://168.197.50.14:8080/api/v1/buildings" -UseBasicParsing -TimeoutSec 10
    if ($test.StatusCode -eq 200) {
        Write-Host "✅ Backend respondiendo correctamente" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "📚 Swagger UI: http://168.197.50.14:8080/swagger-ui/index.html" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Error durante la actualización: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Intenta manualmente:" -ForegroundColor Yellow
    Write-Host "   ssh root@168.197.50.14" -ForegroundColor Gray
    Write-Host "   cd $projectPath" -ForegroundColor Gray
    Write-Host "   git pull origin main" -ForegroundColor Gray
    Write-Host "   docker-compose down && docker-compose build --no-cache && docker-compose up -d" -ForegroundColor Gray
} finally {
    # Limpiar archivo temporal
    Remove-Item $tempScript -ErrorAction SilentlyContinue
}
