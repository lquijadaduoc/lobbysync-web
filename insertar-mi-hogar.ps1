# ============================================
# INSERTAR DATOS DE "MI HOGAR" EN PRODUCCIÓN
# Script simplificado sin complicaciones de escape
# ============================================

param(
    [string]$VpsHost = "168.197.50.14",
    [string]$VpsUser = "root",
    [string]$SqlFile = "seed_my_home_data.sql"
)

$ErrorActionPreference = "Stop"

# Colores
function Write-Success { Write-Host "[OK]" -ForegroundColor Green -NoNewline; Write-Host " $args" }
function Write-Error-Custom { Write-Host "[ERROR]" -ForegroundColor Red -NoNewline; Write-Host " $args" }
function Write-Info { Write-Host "[INFO]" -ForegroundColor Blue -NoNewline; Write-Host " $args" }

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host " INSERTAR DATOS 'MI HOGAR' - PRODUCCIÓN" -ForegroundColor Cyan
Write-Host " VPS: $VpsHost" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# ============================================
# PASO 1: VERIFICAR ARCHIVO SQL
# ============================================

Write-Info "Verificando archivo SQL..."

$SqlPath = "..\lobbysync-api\seed_my_home_data.sql"
if (!(Test-Path $SqlPath)) {
    Write-Error-Custom "No se encontró el archivo: $SqlPath"
    exit 1
}

Write-Success "Archivo SQL encontrado"

# ============================================
# PASO 2: VERIFICAR CONECTIVIDAD SSH
# ============================================

Write-Info "Verificando conectividad SSH..."

try {
    $sshHost = $VpsUser + "@" + $VpsHost
    $null = ssh -o ConnectTimeout=10 $sshHost 'echo OK'
    Write-Success "Conexión SSH exitosa"
} catch {
    Write-Error-Custom "No se pudo conectar a $VpsHost"
    Write-Host "Prueba manualmente con: ssh $VpsUser@$VpsHost"
    exit 1
}

# ============================================
# PASO 3: COPIAR ARCHIVO SQL AL VPS
# ============================================

Write-Info "Copiando archivo SQL al VPS..."

try {
    $scpDest = $VpsUser + "@" + $VpsHost + ":/tmp/seed_my_home_data.sql"
    scp $SqlPath $scpDest
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Archivo copiado exitosamente"
    }
} catch {
    Write-Error-Custom "Error al copiar archivo"
    exit 1
}

# ============================================
# PASO 4: EJECUTAR SCRIPT SQL
# ============================================

Write-Info "Ejecutando script SQL en producción..."

$remoteScript = @'
export PGPASSWORD=postgres
psql -U postgres -d lobbysync_db -f /tmp/seed_my_home_data.sql
'@

# Crear archivo temporal con el script
$tempScript = [System.IO.Path]::GetTempFileName()
$remoteScript | Out-File -FilePath $tempScript -Encoding ASCII

try {
    # Copiar el script de ejecución al servidor
    $scpDest = $VpsUser + "@" + $VpsHost + ":/tmp/run_sql.sh"
    scp $tempScript $scpDest
    
    # Ejecutar el script remotamente
    $sshHost = $VpsUser + "@" + $VpsHost
    $result = ssh $sshHost 'bash /tmp/run_sql.sh 2>&1'
    
    Write-Success "Script ejecutado"
    Write-Host "`nResultado:" -ForegroundColor Gray
    Write-Host $result -ForegroundColor Gray
    
} catch {
    Write-Error-Custom "Error al ejecutar script: $_"
    exit 1
} finally {
    Remove-Item -Path $tempScript -ErrorAction SilentlyContinue
}

# ============================================
# PASO 5: VERIFICAR DATOS
# ============================================

Write-Info "Verificando datos insertados..."

$verifyScript = @'
export PGPASSWORD=postgres
psql -U postgres -d lobbysync_db -c "SELECT 'FAMILY_MEMBERS' as tabla, COUNT(*) as total FROM family_members UNION ALL SELECT 'PETS' as tabla, COUNT(*) as total FROM pets UNION ALL SELECT 'VEHICLES' as tabla, COUNT(*) as total FROM vehicles;"
'@

$tempVerify = [System.IO.Path]::GetTempFileName()
$verifyScript | Out-File -FilePath $tempVerify -Encoding ASCII

try {
    $scpDest = $VpsUser + "@" + $VpsHost + ":/tmp/verify_sql.sh"
    scp $tempVerify $scpDest
    $sshHost = $VpsUser + "@" + $VpsHost
    $result = ssh $sshHost 'bash /tmp/verify_sql.sh 2>&1'
    
    Write-Success "Verificación completada"
    Write-Host "`n$result`n" -ForegroundColor Green
    
} catch {
    Write-Error-Custom "Error en verificación: $_"
} finally {
    Remove-Item -Path $tempVerify -ErrorAction SilentlyContinue
}

# ============================================
# PASO 6: LIMPIAR
# ============================================

Write-Info "Limpiando archivos temporales..."

try {
    $sshHost = $VpsUser + "@" + $VpsHost
    ssh $sshHost 'rm -f /tmp/seed_my_home_data.sql /tmp/run_sql.sh /tmp/verify_sql.sh'
    Write-Success "Archivos temporales eliminados"
} catch {
    Write-Warning "No se pudo eliminar archivos temporales"
}

# ============================================
# FINALIZACIÓN
# ============================================

Write-Host "`n========================================"  -ForegroundColor Green
Write-Host "         PROCESO COMPLETADO" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "Datos insertados:" -ForegroundColor Cyan
Write-Host "  - Miembros de familia (family_members)" -ForegroundColor White
Write-Host "  - Mascotas (pets)" -ForegroundColor White
Write-Host "  - Vehículos (vehicles)" -ForegroundColor White

Write-Host "`nVerifica en el frontend:" -ForegroundColor Cyan
Write-Host "  1. Inicia sesión como residente" -ForegroundColor White
Write-Host "  2. Ve a 'Mi Hogar'" -ForegroundColor White
Write-Host "  3. Revisa las pestañas" -ForegroundColor White
Write-Host ""
