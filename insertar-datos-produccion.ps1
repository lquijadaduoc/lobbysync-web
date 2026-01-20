# ============================================
# INSERTAR DATOS EN PRODUCCIÓN (BD PostgreSQL)
# ============================================

param(
    [string]$VpsHost = "168.197.50.14",
    [string]$VpsUser = "root",
    [string]$DbUser = "postgres",
    [string]$DbName = "lobbysync_db"
)

$ErrorActionPreference = "Stop"

# Colores
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

Write-Host "`n╔══════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  INSERTAR DATOS EN PRODUCCIÓN       ║" -ForegroundColor Cyan
Write-Host "║  VPS: $VpsHost" -ForegroundColor Cyan
Write-Host "║  BD: $DbName" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════╝`n" -ForegroundColor Cyan

# ============================================
# PASO 1: VERIFICAR CONECTIVIDAD
# ============================================

Write-Info "=== PASO 1: VERIFICAR CONECTIVIDAD ==="

Write-Info "Intentando conectar a $VpsHost..."
try {
    $testConn = ssh $VpsUser@$VpsHost "echo 'OK'"
    if ($testConn -eq "OK") {
        Write-Success "Conexión SSH exitosa"
    }
} catch {
    Write-Error-Custom "No se pudo conectar a $VpsHost via SSH"
    Write-Host "Asegúrate de:"
    Write-Host "  1. Tener OpenSSH instalado"
    Write-Host "  2. Poder hacer ping a $VpsHost"
    Write-Host "  3. Tener las credenciales SSH correctas"
    exit 1
}

# ============================================
# PASO 2: PREPARAR SQL
# ============================================

Write-Info "=== PASO 2: PREPARAR SQL ==="

$sqlContent = @"
-- Insertar building
INSERT INTO building (name, address, city, zip_code, is_active, created_at)
SELECT 'Condominio Las Flores', 'Calle Principal 123', 'Santiago', '8320000', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM building WHERE name = 'Condominio Las Flores');

-- Insertar unit
INSERT INTO unit (building_id, unit_number, is_active, created_at)
SELECT 1, '101', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM unit WHERE building_id = 1 AND unit_number = '101');

-- Insertar usuario
INSERT INTO "user" (username, password_hash, email, role, unit_id, is_active, created_at)
SELECT 'resident1', '\$2a\$10\$GRLdNijSQMUvqNzDa/F.KOjVt6.Gq7C8W0X8Y9Z0X1Y2Z3X4', 'resident1@test.com', 'RESIDENT', 1, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM "user" WHERE email = 'resident1@test.com');

-- Insertar familia
INSERT INTO family_member (unit_id, name, relationship, birthdate, is_active, created_at)
SELECT 1, 'Juan Pérez López', 'PADRE', '1980-05-15'::date, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM family_member WHERE unit_id = 1 AND name = 'Juan Pérez López');

INSERT INTO family_member (unit_id, name, relationship, birthdate, is_active, created_at)
SELECT 1, 'María García Rodríguez', 'MADRE', '1982-08-20'::date, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM family_member WHERE unit_id = 1 AND name = 'María García Rodríguez');

-- Insertar mascota
INSERT INTO pet (unit_id, name, species, breed, microchip_id, is_active, created_at)
SELECT 1, 'Max', 'PERRO', 'Labrador', 'CHIP001', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM pet WHERE unit_id = 1 AND name = 'Max');

-- Insertar espacios comunes
INSERT INTO common_area (building_id, name, description, max_capacity, is_active, created_at)
SELECT 1, 'Salón Comunal', 'Espacio para eventos', 50, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM common_area WHERE building_id = 1 AND name = 'Salón Comunal');

INSERT INTO common_area (building_id, name, description, max_capacity, is_active, created_at)
SELECT 1, 'Terraza', 'Área verde', 30, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM common_area WHERE building_id = 1 AND name = 'Terraza');

INSERT INTO common_area (building_id, name, description, max_capacity, is_active, created_at)
SELECT 1, 'Gimnasio', 'Equipos ejercicio', 15, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM common_area WHERE building_id = 1 AND name = 'Gimnasio');

INSERT INTO common_area (building_id, name, description, max_capacity, is_active, created_at)
SELECT 1, 'Piscina', 'Piscina temperada', 40, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM common_area WHERE building_id = 1 AND name = 'Piscina');

INSERT INTO common_area (building_id, name, description, max_capacity, is_active, created_at)
SELECT 1, 'Sala de Juegos', 'Billar, ping pong', 20, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM common_area WHERE building_id = 1 AND name = 'Sala de Juegos');

-- Insertar boletas
INSERT INTO bill (unit_id, month, year, amount, due_date, status, is_active, created_at)
SELECT 1, 1, 2024, 500000, '2024-01-31'::date, 'OVERDUE', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM bill WHERE unit_id = 1 AND month = 1 AND year = 2024);

INSERT INTO bill (unit_id, month, year, amount, due_date, status, is_active, created_at)
SELECT 1, 2, 2024, 500000, '2024-02-29'::date, 'PENDING', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM bill WHERE unit_id = 1 AND month = 2 AND year = 2024);

INSERT INTO bill (unit_id, month, year, amount, due_date, status, is_active, created_at)
SELECT 1, 3, 2024, 500000, '2024-03-31'::date, 'PENDING', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM bill WHERE unit_id = 1 AND month = 3 AND year = 2024);

-- Insertar documentos
INSERT INTO document (title, description, category, file_url, building_id, is_active, created_at)
SELECT 'Reglamento Interno 2024', 'Normas de convivencia', 'REGLAMENTO', '/files/reglamento.pdf', 1, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM document WHERE building_id = 1 AND title = 'Reglamento Interno 2024');

INSERT INTO document (title, description, category, file_url, building_id, is_active, created_at)
SELECT 'Acta Asamblea Enero 2024', 'Decisiones asamblea', 'ACTAS', '/files/acta-enero.pdf', 1, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM document WHERE building_id = 1 AND title = 'Acta Asamblea Enero 2024');

-- Verificaciones
SELECT '=== VERIFICACIÓN ===' as resultado;
SELECT COUNT(*) as "Usuarios" FROM "user" WHERE unit_id = 1;
SELECT COUNT(*) as "Familia" FROM family_member WHERE unit_id = 1;
SELECT COUNT(*) as "Mascotas" FROM pet WHERE unit_id = 1;
SELECT COUNT(*) as "Espacios Comunes" FROM common_area WHERE building_id = 1;
SELECT COUNT(*) as "Boletas" FROM bill WHERE unit_id = 1;
SELECT COUNT(*) as "Documentos" FROM document WHERE building_id = 1;
"@

Write-Success "SQL preparado ($([Math]::Round($sqlContent.Length / 1KB, 2)) KB)"

# ============================================
# PASO 3: CREAR ARCHIVO TEMPORAL
# ============================================

Write-Info "=== PASO 3: CREAR ARCHIVO SQL TEMPORAL ==="

$tmpFile = "insert_data_$(Get-Random).sql"
$sqlContent | Out-File -FilePath $tmpFile -Encoding UTF8
Write-Success "Archivo temporal creado: $tmpFile"

# ============================================
# PASO 4: COPIAR A VPS
# ============================================

Write-Info "=== PASO 4: COPIAR SQL A VPS ==="

Write-Info "Copiando archivo a VPS..."
try {
    scp $tmpFile "$VpsUser@$VpsHost`:/tmp/" 2>$null
    Write-Success "Archivo copiado a /tmp/$tmpFile"
} catch {
    Write-Error-Custom "Error al copiar archivo"
    Remove-Item $tmpFile -Force
    exit 1
}

# ============================================
# PASO 5: EJECUTAR SQL EN VPS
# ============================================

Write-Info "=== PASO 5: EJECUTAR SQL EN VPS ==="

Write-Warning-Custom "Ejecutando SQL en PostgreSQL..."

try {
    ssh $VpsUser@$VpsHost "psql -U $DbUser -d $DbName -f /tmp/$tmpFile -q" 2>$null
    Write-Success "SQL ejecutado exitosamente"
} catch {
    Write-Error-Custom "Error al ejecutar SQL"
    Write-Host "Intenta manualmente:"
    Write-Host "  ssh $VpsUser@$VpsHost"
    Write-Host "  psql -U $DbUser -d $DbName -f /tmp/$tmpFile"
    Remove-Item $tmpFile -Force
    exit 1
}

# ============================================
# PASO 6: LIMPIAR
# ============================================

Write-Info "=== PASO 6: LIMPIAR ARCHIVOS TEMPORALES ==="

Write-Info "Limpiando archivos..."
try {
    ssh $VpsUser@$VpsHost "rm -f /tmp/$tmpFile"
    Remove-Item $tmpFile -Force
    Write-Success "Archivos temporales eliminados"
} catch {
    Write-Warning-Custom "No se pudieron eliminar archivos temporales"
}

# ============================================
# PASO 7: VERIFICAR
# ============================================

Write-Info "=== PASO 7: VERIFICAR DATOS INSERTADOS ==="

Write-Info "Consultando base de datos..."
try {
    $verification = ssh $VpsUser@$VpsHost "psql -U $DbUser -d $DbName -t -c 'SELECT COUNT(*) FROM family_member WHERE unit_id = 1; SELECT COUNT(*) FROM common_area WHERE building_id = 1; SELECT COUNT(*) FROM bill WHERE unit_id = 1; SELECT COUNT(*) FROM document WHERE building_id = 1;'" 2>$null
    
    Write-Success "Datos verificados:"
    Write-Host "  Familia: $(($verification -split ' ')[0]) (esperado: 2)" -ForegroundColor Cyan
    Write-Host "  Espacios: $(($verification -split ' ')[1]) (esperado: 5)" -ForegroundColor Cyan
    Write-Host "  Boletas: $(($verification -split ' ')[2]) (esperado: 3)" -ForegroundColor Cyan
    Write-Host "  Documentos: $(($verification -split ' ')[3]) (esperado: 2)" -ForegroundColor Cyan
} catch {
    Write-Warning-Custom "No se pudieron verificar datos"
}

# ============================================
# RESULTADO FINAL
# ============================================

Write-Host "`n╔══════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║     ✅ DATOS INSERTADOS              ║" -ForegroundColor Green
Write-Host "║     Base de datos actualizada        ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "Próximos pasos:" -ForegroundColor Cyan
Write-Host "  1. Abre navegador: http://$VpsHost" -ForegroundColor Gray
Write-Host "  2. Login: resident1@test.com / password123" -ForegroundColor Gray
Write-Host "  3. Ve a Mi Hogar" -ForegroundColor Gray
Write-Host "  4. Deberías ver familia, mascotas, espacios, etc." -ForegroundColor Gray

Write-Host "`n✨ Datos listos para testing!" -ForegroundColor Green
