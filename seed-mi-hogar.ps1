# Script para insertar datos de MI HOGAR en produccion
# VPS: 168.197.50.14

param(
    [string]$VpsHost = "168.197.50.14",
    [string]$VpsUser = "root",
    [string]$VpsPassword = "SebaErica12.18"
)

$ErrorActionPreference = "Stop"

function WriteOK { Write-Host "[OK] " -ForegroundColor Green -NoNewline; Write-Host $args }
function WriteERROR { Write-Host "[ERROR] " -ForegroundColor Red -NoNewline; Write-Host $args }
function WriteINFO { Write-Host "[INFO] " -ForegroundColor Blue -NoNewline; Write-Host $args }

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " INSERTAR DATOS MI HOGAR - PRODUCCION" -ForegroundColor Cyan
Write-Host " VPS: $VpsHost" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

WriteINFO "Verificando archivo SQL..."
$SqlPath = "..\lobbysync-api\seed_my_home_data.sql"
if (!(Test-Path $SqlPath)) {
    WriteERROR "No se encontro el archivo: $SqlPath"
    exit 1
}
WriteOK "Archivo SQL encontrado"

WriteINFO "Verificando herramientas..."
try {
    $null = & plink -V 2>&1
    WriteOK "Plink (PuTTY) encontrado"
} catch {
    WriteERROR "Plink no encontrado. Instala PuTTY desde: https://www.putty.org/"
    exit 1
}

WriteINFO "Copiando archivo SQL al VPS..."
$scpTarget = "$VpsUser" + "@" + "$VpsHost" + ":/tmp/seed_my_home_data.sql"
& pscp -pw $VpsPassword -batch $SqlPath $scpTarget 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    WriteOK "Archivo copiado"
} else {
    WriteERROR "Error al copiar archivo"
    exit 1
}

WriteINFO "Ejecutando script SQL..."
$cmd1 = "docker cp /tmp/seed_my_home_data.sql postgres_db:/tmp/seed_my_home_data.sql"
$cmd2 = "docker exec -i postgres_db psql -U postgres -d lobbysync -f /tmp/seed_my_home_data.sql"
$cmd3 = 'docker exec -i postgres_db psql -U postgres -d lobbysync -c "SELECT COUNT(*) FROM family_members; SELECT COUNT(*) FROM pets; SELECT COUNT(*) FROM vehicles;"'

$sshTarget = "$VpsUser" + "@" + "$VpsHost"
$result1 = & plink -pw $VpsPassword -batch $sshTarget $cmd1 2>&1
$result2 = & plink -pw $VpsPassword -batch $sshTarget $cmd2 2>&1
$result3 = & plink -pw $VpsPassword -batch $sshTarget $cmd3 2>&1

WriteOK "Comandos ejecutados"
Write-Host ""
Write-Host "Resultado:" -ForegroundColor Gray
Write-Host $result2 -ForegroundColor Gray
Write-Host $result3 -ForegroundColor Green
Write-Host ""

WriteINFO "Limpiando..."
& plink -pw $VpsPassword -batch $sshTarget "rm -f /tmp/seed_my_home_data.sql" 2>&1 | Out-Null
WriteOK "Limpieza completada"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "         PROCESO COMPLETADO" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Datos insertados: Familia, Mascotas, Vehiculos" -ForegroundColor Cyan
Write-Host "Verifica en la app web -> Mi Hogar" -ForegroundColor Cyan
Write-Host ""
