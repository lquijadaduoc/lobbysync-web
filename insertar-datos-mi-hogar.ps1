# ============================================
# INSERTAR DATOS DE "MI HOGAR" EN PRODUCCIÓN
# ============================================
# Este script inserta datos de prueba para:
# - Miembros de familia (family_members)
# - Mascotas (pets)
# - Vehículos (vehicles)

param(
    [string]$VpsHost = "168.197.50.14",
    [string]$VpsUser = "root",
    [string]$DbUser = "postgres",
    [string]$DbName = "lobbysync_db",
    [string]$SqlFile = "seed_my_home_data.sql"
)

$ErrorActionPreference = "Stop"

# Colores
function Write-Success { Write-Host "[✓]" -ForegroundColor Green -NoNewline; Write-Host " $args" }
function Write-Error-Custom { Write-Host "[✗]" -ForegroundColor Red -NoNewline; Write-Host " $args" }
function Write-Info { Write-Host "[ℹ]" -ForegroundColor Blue -NoNewline; Write-Host " $args" }
function Write-Warning-Custom { Write-Host "[⚠]" -ForegroundColor Yellow -NoNewline; Write-Host " $args" }

Write-Host "`n╔════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  INSERTAR DATOS 'MI HOGAR' - PRODUCCIÓN  ║" -ForegroundColor Cyan
Write-Host "║  VPS: $VpsHost" -ForegroundColor Cyan
Write-Host "║  BD:  $DbName" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# ============================================
# PASO 1: VERIFICAR ARCHIVO SQL
# ============================================

Write-Info "Verificando archivo SQL..."

$SqlPath = Join-Path $PSScriptRoot "seed_my_home_data.sql"
if (!(Test-Path $SqlPath)) {
    $SqlPath = "..\lobbysync-api\seed_my_home_data.sql"
    if (!(Test-Path $SqlPath)) {
        Write-Error-Custom "No se encontró el archivo: $SqlFile"
        Write-Host "Buscado en: $SqlPath"
        exit 1
    }
}

Write-Success "Archivo SQL encontrado: $SqlPath"

# ============================================
# PASO 2: VERIFICAR CONECTIVIDAD SSH
# ============================================

Write-Info "Verificando conectividad con VPS..."

try {
    $testConn = ssh -o ConnectTimeout=10 $VpsUser@$VpsHost "echo 'OK'" 2>&1
    if ($testConn -match "OK") {
        Write-Success "Conexión SSH exitosa"
    } else {
        throw "No se recibió respuesta válida"
    }
} catch {
    Write-Error-Custom "No se pudo conectar a $VpsHost via SSH"
    Write-Host "`nAsegúrate de:"
    Write-Host "  1. Tener OpenSSH instalado"
    Write-Host "  2. Poder hacer ping a $VpsHost"
    Write-Host "  3. Tener las credenciales SSH configuradas"
    Write-Host "`nPrueba manualmente con: ssh $VpsUser@$VpsHost"
    exit 1
}

# ============================================
# PASO 3: VERIFICAR UNIDADES EXISTENTES
# ============================================

Write-Info "Verificando unidades existentes en la BD..."

$checkUnitsQuery = "SELECT id, unit_number, building_id FROM units ORDER BY id LIMIT 5;"

try {
    $escapedQuery = $checkUnitsQuery.Replace('"', '\"')
    $result = ssh $VpsUser@$VpsHost "export PGPASSWORD=postgres && psql -U $DbUser -d $DbName -c \`"$escapedQuery\`"" 2>&1
    
    if ($result -match "id") {
        Write-Success "Unidades encontradas en la base de datos"
        Write-Host "`n$result`n" -ForegroundColor Gray
    } else {
        Write-Warning-Custom "No se encontraron unidades. Asegúrate de que existan units en la BD."
        $continue = Read-Host "¿Deseas continuar de todas formas? (s/n)"
        if ($continue -ne "s") {
            exit 0
        }
    }
} catch {
    Write-Warning-Custom "No se pudo verificar las unidades: $_"
}

# ============================================
# PASO 4: COPIAR ARCHIVO SQL AL VPS
# ============================================

Write-Info "Copiando archivo SQL al VPS..."

try {
    scp $SqlPath "${VpsUser}@${VpsHost}:/tmp/seed_my_home_data.sql" 2>&1 | Out-Null
    Write-Success "Archivo SQL copiado exitosamente"
} catch {
    Write-Error-Custom "Error al copiar archivo: $_"
    exit 1
}

# ============================================
# PASO 5: EJECUTAR SCRIPT SQL
# ============================================

Write-Info "Ejecutando script SQL en producción..."
Write-Warning-Custom "Insertando datos de Familia, Mascotas y Vehículos..."

try {
    $result = ssh $VpsUser@$VpsHost "export PGPASSWORD=postgres && psql -U $DbUser -d $DbName -f /tmp/seed_my_home_data.sql" 2>&1
    
    if ($LASTEXITCODE -eq 0 -or $result -match "INSERT") {
        Write-Success "Script ejecutado exitosamente"
        Write-Host "`nResultado:`n" -ForegroundColor Gray
        Write-Host $result -ForegroundColor Gray
    } else {
        Write-Warning-Custom "El script se ejecutó pero hubo advertencias:"
        Write-Host $result -ForegroundColor Yellow
    }
} catch {
    Write-Error-Custom "Error al ejecutar el script SQL: $_"
    Write-Host $result -ForegroundColor Red
    exit 1
}

# ============================================
# PASO 6: VERIFICAR DATOS INSERTADOS
# ============================================

Write-Info "Verificando datos insertados..."

$verifyQuery = @"
SELECT 'FAMILY_MEMBERS' as tabla, COUNT(*) as total FROM family_members
UNION ALL
SELECT 'PETS' as tabla, COUNT(*) as total FROM pets
UNION ALL
SELECT 'VEHICLES' as tabla, COUNT(*) as total FROM vehicles;
"@

try {
    $escapedQuery = $verifyQuery.Replace('"', '\"')
    $result = ssh $VpsUser@$VpsHost "export PGPASSWORD=postgres && psql -U $DbUser -d $DbName -c \`"$escapedQuery\`"" 2>&1
    Write-Success "Datos verificados"
    Write-Host "`n$result`n" -ForegroundColor Green
} catch {
    Write-Warning-Custom "No se pudo verificar los datos: $_"
}

# ============================================
# PASO 7: LIMPIAR ARCHIVO TEMPORAL
# ============================================

Write-Info "Limpiando archivos temporales..."

try {
    ssh $VpsUser@$VpsHost "rm -f /tmp/seed_my_home_data.sql" 2>&1 | Out-Null
    Write-Success "Archivos temporales eliminados"
} catch {
    Write-Warning-Custom "No se pudo eliminar el archivo temporal"
}

# ============================================
# FINALIZACIÓN
# ============================================

Write-Host "`n╔════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║         ✓ PROCESO COMPLETADO              ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Green

Write-Host "`n📝 Datos insertados:" -ForegroundColor Cyan
Write-Host "   • Miembros de familia (family_members)" -ForegroundColor White
Write-Host "   • Mascotas (pets)" -ForegroundColor White
Write-Host "   • Vehículos (vehicles)" -ForegroundColor White

Write-Host "`n🌐 Verifica en el frontend:" -ForegroundColor Cyan
Write-Host "   1. Inicia sesión como residente" -ForegroundColor White
Write-Host "   2. Ve a la sección 'Mi Hogar'" -ForegroundColor White
Write-Host "   3. Revisa las pestañas: Grupo Familiar, Mascotas, Vehículos" -ForegroundColor White

Write-Host "`n✅ ¡Listo para probar la funcionalidad 'Mi Hogar'!" -ForegroundColor Green
Write-Host ""
