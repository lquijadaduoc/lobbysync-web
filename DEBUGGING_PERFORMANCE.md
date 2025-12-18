# 🔍 Guía de Debugging - Dónde está el delay de la API

## 📊 Cómo medir

La aplicación ahora registra automáticamente en la consola del navegador:

1. **Tiempo de REQUEST**: Cuánto tarda en llegar la respuesta de la API
2. **Tiempo de RENDER**: Cuánto tarda React en dibujar el componente
3. **Tiempo TOTAL**: Desde que se monta el componente hasta que se renderiza

### 🔧 Abre la Consola del Navegador

```
En Windows:
- F12 para abrir Developer Tools
- Ve a la pestaña "Console"
- Filtra por emojis: ⚡ ⏱️ 🎨 📝 📦 🏢
```

---

## 📈 Qué verás en los logs

### Logs de REQUEST (tiempo de API):
```
⚡ GET /users: 2.45ms         ← MUY RÁPIDO (< 100ms)
⏱️  GET /buildings: 150ms      ← MODERADO (100-500ms)
🐢 GET /logbook: 1250ms       ← LENTO (> 500ms)
```

### Logs de RENDER (tiempo de React):
```
🎨 AdminUsers component render: 45.23ms
🎨 AdminBuildings component render: 78.90ms
🎨 ConciergeLogbook component render: 120.45ms
```

### Específicos por página:
```
📊 Users API response: 3.12ms      ← Tiempo de consulta
🏢 Buildings API response: 2.88ms
📝 Logbook API response: 4.15ms
📦 Packages API response: 5.23ms
```

---

## 🔎 Cómo identificar el cuello de botella

### **Caso 1: Delay en API**
Si ves:
```
🐢 GET /users: 2500ms
📊 Users API response: 2500ms
🎨 AdminUsers component render: 15ms
```
→ El delay es de la **API/Backend** (no es nuestra culpa)

### **Caso 2: Delay en Render**
Si ves:
```
⚡ GET /users: 5ms
📊 Users API response: 5ms
🎨 AdminUsers component render: 3000ms
```
→ El delay es del **componente React** (hay que optimizar el renderizado)

### **Caso 3: Delay en Mock Data**
Si está usando mock data con delay simulado:
```
📦 Mock: GET /users (+500ms delay)
```
→ Puedes cambiar `MOCK_DELAY` en `src/api/mockInterceptor.js`

---

## ⚙️ Simular latencia (para testing)

En `src/api/mockInterceptor.js`, cambia esta línea:

```javascript
const MOCK_DELAY = 0; // Cambiar a 500, 1000, etc.
```

Ejemplo:
```javascript
const MOCK_DELAY = 2000; // Simula 2 segundos de latencia
```

Esto te permite testear la UI con delays de red realistas.

---

## 🧪 Pasos para debugging

### 1️⃣ **Abre la consola (F12)**
```
Filtro: Filtra por "mock" o "GET" para ver solo requests
```

### 2️⃣ **Navega a una página (ej: Admin > Usuarios)**
Verás en la consola:
```
💡 Modo desarrollo: Usando mock data si el backend no responde
⚠️  Backend no disponible, usando mock data: Network Error
📦 Mock: GET /users
⚡ GET /users: 2.15ms
📊 Users API response: 2.15ms
🎨 AdminUsers component render: 32.89ms
```

### 3️⃣ **Analiza los números**
- Si todos están < 100ms → ✅ Rápido
- Si API > 500ms → 🐢 Backend lento
- Si Render > 200ms → 🎨 Componente ineficiente

---

## 📋 Tabla de referencia de tiempos normales

| Evento | Rápido | Normal | Lento |
|--------|--------|--------|-------|
| **API Request** | <50ms | 50-500ms | >500ms |
| **Component Render** | <50ms | 50-200ms | >200ms |
| **Total (Request + Render)** | <100ms | 100-700ms | >700ms |

---

## 💡 Cómo optimizar según lo que encuentres

### Si el delay es de API:
```javascript
// En axiosConfig.js, aumentar timeout
timeout: 30000 // De 10s a 30s si el backend es lento
```

### Si el delay es de Render:
```javascript
// Usar useMemo para memoizar datos
const memoizedUsers = useMemo(() => users, [users]);

// O usar React.memo en componentes hijo
export default React.memo(UserRow);
```

### Si es mock data:
```javascript
// En mockInterceptor.js, reducir o eliminar delay
const MOCK_DELAY = 0; // Sin delay
```

---

## 🎯 Resumen rápido

**Para saber si es lento:**
1. Abre F12
2. Busca las líneas con `📝 API response` y `🎨 render`
3. Si API response < 100ms y render < 100ms → ✅ Tu app es rápida
4. Si alguno > 500ms → Ese es el culpable

**Para reportar el problema:**
```
"El delay está en [API/Render]. Tarda ~XXXms."
```

Esto me ayuda a saber exactamente dónde optimizar.

---

**Última actualización:** 18 de Diciembre, 2025
