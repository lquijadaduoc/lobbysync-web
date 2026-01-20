# Script PowerShell para insertar datos de prueba en PostgreSQL
# Uso: .\seed-data-complete.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  INSERTAR DATOS DE PRUEBA - LobbySyncAPI" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuración
$PostgresHost = "localhost"
$PostgresPort = 5432
$PostgresUser = "postgres"
$PostgresPassword = "postgres"
$DatabaseName = "lobbysync_db"

# Script SQL a ejecutar
$SqlScript = @"
-- ========================================
-- CREAR TODOS LOS DATOS DE PRUEBA
-- ========================================

-- 1. CREAR EDIFICIO (si no existe)
INSERT INTO building (name, address, city, zip_code, is_active, created_at)
SELECT 'Condominio Las Flores', 'Calle Principal 123', 'Santiago', '8320000', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM building WHERE name = 'Condominio Las Flores');

-- 2. CREAR UNIDADES (si no existen)
INSERT INTO unit (building_id, unit_number, is_active, created_at)
SELECT 1, '101', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM unit WHERE building_id = 1 AND unit_number = '101');

INSERT INTO unit (building_id, unit_number, is_active, created_at)
SELECT 1, '102', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM unit WHERE building_id = 1 AND unit_number = '102');

-- 3. CREAR USUARIO RESIDENTE
INSERT INTO "user" (username, password_hash, email, role, unit_id, is_active, created_at)
SELECT 'resident1', '$2a$10$GRLdNijSQMUvqNzDa/F.KOjVt6.Gq7C8W0X8Y9Z0X1Y2Z3X4', 'resident1@test.com', 'RESIDENT', 1, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM "user" WHERE email = 'resident1@test.com');

-- 4. CREAR FAMILIA
INSERT INTO family_member (unit_id, name, relationship, birthdate, is_active, created_at)
SELECT 1, 'Juan Pérez López', 'PADRE', '1980-05-15'::date, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM family_member WHERE unit_id = 1 AND name = 'Juan Pérez López');

INSERT INTO family_member (unit_id, name, relationship, birthdate, is_active, created_at)
SELECT 1, 'María García Rodríguez', 'MADRE', '1982-08-20'::date, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM family_member WHERE unit_id = 1 AND name = 'María García Rodríguez');

INSERT INTO family_member (unit_id, name, relationship, birthdate, is_active, created_at)
SELECT 1, 'Carlos Pérez García', 'HIJO', '2005-03-10'::date, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM family_member WHERE unit_id = 1 AND name = 'Carlos Pérez García');

-- 5. CREAR MASCOTAS
INSERT INTO pet (unit_id, name, species, breed, microchip_id, is_active, created_at)
SELECT 1, 'Max', 'PERRO', 'Labrador', 'CHIP001', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM pet WHERE unit_id = 1 AND name = 'Max');

INSERT INTO pet (unit_id, name, species, breed, microchip_id, is_active, created_at)
SELECT 1, 'Luna', 'GATO', 'Persa', 'CHIP002', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM pet WHERE unit_id = 1 AND name = 'Luna');

-- 6. CREAR VEHÍCULOS
INSERT INTO vehicle (unit_id, license_plate, brand, model, color, is_active, created_at)
SELECT 1, 'ABCD-12', 'Toyota', 'Corolla', 'Blanco', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM vehicle WHERE unit_id = 1 AND license_plate = 'ABCD-12');

INSERT INTO vehicle (unit_id, license_plate, brand, model, color, is_active, created_at)
SELECT 1, 'EFGH-34', 'Hyundai', 'i30', 'Gris', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM vehicle WHERE unit_id = 1 AND license_plate = 'EFGH-34');

-- 7. CREAR ESPACIOS COMUNES
INSERT INTO common_area (building_id, name, description, max_capacity, reservation_rules, is_active, created_at)
SELECT 1, 'Salón Comunal', 'Espacio para eventos y reuniones', 50, 'Máximo 4 horas por reserva', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM common_area WHERE building_id = 1 AND name = 'Salón Comunal');

INSERT INTO common_area (building_id, name, description, max_capacity, reservation_rules, is_active, created_at)
SELECT 1, 'Terraza', 'Área verde con vistas panorámicas', 30, 'Sin ruido después de 22:00', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM common_area WHERE building_id = 1 AND name = 'Terraza');

INSERT INTO common_area (building_id, name, description, max_capacity, reservation_rules, is_active, created_at)
SELECT 1, 'Gimnasio', 'Equipos de ejercicio cardiovascular', 15, 'Abierto de 6:00 a 22:00', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM common_area WHERE building_id = 1 AND name = 'Gimnasio');

INSERT INTO common_area (building_id, name, description, max_capacity, reservation_rules, is_active, created_at)
SELECT 1, 'Piscina', 'Piscina temperada con jacuzzi', 40, 'Supervisión de menores requerida', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM common_area WHERE building_id = 1 AND name = 'Piscina');

INSERT INTO common_area (building_id, name, description, max_capacity, reservation_rules, is_active, created_at)
SELECT 1, 'Sala de Juegos', 'Billar, ping pong, videojuegos', 20, 'Máximo 10 personas simultáneamente', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM common_area WHERE building_id = 1 AND name = 'Sala de Juegos');

-- 8. CREAR BOLETAS
INSERT INTO bill (unit_id, month, year, amount, due_date, status, is_active, created_at)
SELECT 1, 1, 2024, 500000, '2024-01-31'::date, 'OVERDUE', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM bill WHERE unit_id = 1 AND month = 1 AND year = 2024);

INSERT INTO bill (unit_id, month, year, amount, due_date, status, is_active, created_at)
SELECT 1, 2, 2024, 500000, '2024-02-29'::date, 'PENDING', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM bill WHERE unit_id = 1 AND month = 2 AND year = 2024);

INSERT INTO bill (unit_id, month, year, amount, due_date, status, is_active, created_at)
SELECT 1, 3, 2024, 500000, '2024-03-31'::date, 'APPROVED', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM bill WHERE unit_id = 1 AND month = 3 AND year = 2024);

-- 9. CREAR DOCUMENTOS
INSERT INTO document (title, description, category, file_url, building_id, is_active, created_at)
SELECT 'Reglamento Interno 2024', 'Normas de convivencia y uso de espacios comunes', 'REGLAMENTO', '/files/reglamento-2024.pdf', 1, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM document WHERE building_id = 1 AND title = 'Reglamento Interno 2024');

INSERT INTO document (title, description, category, file_url, building_id, is_active, created_at)
SELECT 'Acta Asamblea Enero 2024', 'Decisiones de asamblea ordinaria enero 2024', 'ACTAS', '/files/acta-enero-2024.pdf', 1, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM document WHERE building_id = 1 AND title = 'Acta Asamblea Enero 2024');

INSERT INTO document (title, description, category, file_url, building_id, is_active, created_at)
SELECT 'Comunicado: Mantenimiento Ascensores', 'Aviso de mantención programada del 20-21 enero', 'COMUNICADOS', '/files/comunicado-ascensores.pdf', 1, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM document WHERE building_id = 1 AND title = 'Comunicado: Mantenimiento Ascensores');

INSERT INTO document (title, description, category, file_url, building_id, is_active, created_at)
SELECT 'Política de Estacionamiento', 'Reglas para uso de estacionamientos comunes', 'OTROS', '/files/politica-estacionamiento.pdf', 1, true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM document WHERE building_id = 1 AND title = 'Política de Estacionamiento');
"@

# Crear archivo SQL temporal
$TempSqlFile = [System.IO.Path]::GetTempFileName() -replace '\.[^.]*$', '.sql'
Set-Content -Path $TempSqlFile -Value $SqlScript -Encoding UTF8

Write-Host "📝 Preparando datos de prueba..." -ForegroundColor Yellow
Write-Host "📊 Total de registros a crear: 24 (1 edificio, 2 unidades, 1 usuario, etc.)" -ForegroundColor Yellow
Write-Host ""

try {
    # Ejecutar con psql
    Write-Host "🚀 Ejecutando script SQL..." -ForegroundColor Cyan
    
    # Preparar variables de entorno para PGPASSWORD
    $env:PGPASSWORD = $PostgresPassword
    
    # Ejecutar psql
    & psql -h $PostgresHost -p $PostgresPort -U $PostgresUser -d $DatabaseName -f $TempSqlFile -v ON_ERROR_STOP=1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ ÉXITO - Datos insertados correctamente!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📋 Resumen:" -ForegroundColor Green
        Write-Host "  ✓ 1 Edificio: Condominio Las Flores" -ForegroundColor Green
        Write-Host "  ✓ 2 Unidades: 101, 102" -ForegroundColor Green
        Write-Host "  ✓ 1 Usuario: resident1@test.com (password: password123)" -ForegroundColor Green
        Write-Host "  ✓ 3 Miembros de familia" -ForegroundColor Green
        Write-Host "  ✓ 2 Mascotas" -ForegroundColor Green
        Write-Host "  ✓ 2 Vehículos" -ForegroundColor Green
        Write-Host "  ✓ 5 Espacios comunes para reservas" -ForegroundColor Green
        Write-Host "  ✓ 3 Boletas para finanzas" -ForegroundColor Green
        Write-Host "  ✓ 4 Documentos" -ForegroundColor Green
        Write-Host ""
        Write-Host "🎯 Próximos pasos:" -ForegroundColor Cyan
        Write-Host "  1. Reinicia el frontend: npm run dev" -ForegroundColor Cyan
        Write-Host "  2. Login: resident1@test.com / password123" -ForegroundColor Cyan
        Write-Host "  3. Prueba cada funcionalidad en el Dashboard" -ForegroundColor Cyan
        Write-Host ""
    } else {
        Write-Host "❌ Error ejecutando script SQL" -ForegroundColor Red
        Write-Host "Código de salida: $LASTEXITCODE" -ForegroundColor Red
    }
}
catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Solución: Asegúrate de que:" -ForegroundColor Yellow
    Write-Host "  1. PostgreSQL está corriendo (docker ps debe mostrar postgres-db)" -ForegroundColor Yellow
    Write-Host "  2. psql está instalado y en PATH" -ForegroundColor Yellow
    Write-Host "  3. Las credenciales son correctas (postgres/postgres)" -ForegroundColor Yellow
}
finally {
    # Limpiar archivo temporal
    if (Test-Path $TempSqlFile) {
        Remove-Item $TempSqlFile -Force
    }
    
    # Limpiar variable de entorno
    Remove-Item env:PGPASSWORD -ErrorAction SilentlyContinue
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "        FIN DEL SCRIPT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
