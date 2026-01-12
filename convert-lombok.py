#!/usr/bin/env python3
"""
Script para eliminar Lombok y generar getters, setters, constructores y builders manualmente.
Procesa archivos Java en el VPS vía SSH.
"""
import subprocess
import re

VPS_HOST = "root@168.197.50.14"
VPS_PASSWORD = "SebaErica12.18"
BASE_PATH = "/root/lobbysync-api/src/main/java/cl/lobbysync/backend"

# Lista de archivos críticos que necesitan conversión
critical_files = [
    ("model/sql/Bill.java", ["id", "unitId", "amount", "amountPaid", "billNumber", "dueDate", "issueDate", "status", "description"]),
    ("model/sql/Unit.java", ["id", "buildingId", "unitNumber", "floor", "size", "bedrooms", "bathrooms"]),
    ("model/mongo/MaintenanceTicket.java", ["id", "title", "description", "status", "priority", "assetId", "userId", "createdAt", "updatedAt"]),
    ("controller/MaintenanceController.java", None),  # Solo necesita @Slf4j removido
    ("service/FinanceService.java", None),  # Solo necesita @Slf4j removido
]

def remove_lombok_and_add_log(file_path):
    """Remueve @Slf4j y agrega logger manual"""
    cmd = f'echo "SebaErica12.18" | plink -batch -pw SebaErica12.18 {VPS_HOST} "sed -i \'/import lombok/d; s/@Slf4j//g; s/@Data//g; s/@Builder//g; s/@NoArgsConstructor//g; s/@AllArgsConstructor//g\' {BASE_PATH}/{file_path} && sed -i \'1a import org.slf4j.Logger;\\nimport org.slf4j.LoggerFactory;\\nprivate static final Logger log = LoggerFactory.getLogger(FinanceService.class);\' {BASE_PATH}/{file_path}"'
    subprocess.run(cmd, shell=True)

def generate_getters_setters_for_simple_dto(class_name, fields):
    """Genera código para DTOs/modelos simples"""
    getters_setters = []
    for field in fields:
        field_type = "String"  # Simplificado, asumir String por defecto
        if field == "id": field_type = "Long"
        if "amount" in field.lower() or "size" in field.lower(): field_type = "Double" 
        if field.endswith("Date"): field_type = "LocalDate"
        if field.endswith("At"): field_type = "LocalDateTime"
        if "bedrooms" in field or "bathrooms" in field or "floor" in field: field_type = "Integer"
        
        field_cap = field[0].upper() + field[1:]
        getters_setters.append(f"    public {field_type} get{field_cap}() {{ return {field}; }}")
        getters_setters.append(f"    public void set{field_cap}({field_type} {field}) {{ this.{field} = {field}; }}")
    return "\n".join(getters_setters)

print("Script listo para convertir archivos. Ejecuta manualmente por ahora.")
print("Los DTOs críticos ya fueron convertidos: LoginRequest, LoginResponse, UserData, User")
