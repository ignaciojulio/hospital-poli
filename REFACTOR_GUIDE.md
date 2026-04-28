# 🔧 GUÍA DE REFACTORIZACIÓN - Script.js → Arquitectura Modular

## ¿Qué Pasó?

Tu `script.js` original (~700 líneas) fue refactorizado en una arquitectura profesional con múltiples archivos especializados.

---

## 📊 ANTES vs DESPUÉS

### ANTES (script.js monolítico)
```
script.js (700 líneas)
├── VideoButton component
├── AppointmentConfirm component
├── EspecialistasSection component
├── AdminPanel component (¡todo mezclado!)
├── Configuración de API (al final)
├── Funciones de fecha (inline)
└── Lógica de fetch (sin separación)
```

### DESPUÉS (Arquitectura profesional)
```
📁 components/ (Componentes React)
├── VideoButton.jsx
├── AppointmentForm.jsx
├── EspecialistasSection.jsx
├── AdminPanel.jsx
├── AdminTableRow.jsx
└── index.js (orquestador)

📁 hooks/ (Lógica React reutilizable)
├── useFetchPacientes.js (para READ)
└── usePacientesCRUD.js (para CREATE, UPDATE, DELETE)

📁 utils/ (Funciones puras)
├── apiClient.js (PacientesAPI class)
└── dateUtils.js (formatDate, etc)

📁 constants/ (Datos estáticos)
├── api.js
└── especialistas.js
```

---

## 🔄 Mapeo de Cambios

### VideoButton Component
**Antes:** 30 líneas en script.js
**Después:** `components/VideoButton.jsx` (30 líneas)
**Cambio:** Solo cambió el archivo, lógica igual

### AppointmentForm Component
**Antes:** AppointmentConfirm en script.js (lógica POST inline)
**Después:** `components/AppointmentForm.jsx` + `hooks/usePacientesCRUD.js`
**Cambio:** 
- La lógica de fetch sigue siendo la misma
- Pero ahora es reutilizable en otros componentes

### AdminPanel Component
**Antes:** AdminPanel gigante (~300 líneas) en script.js
**Después:** 
- `components/AdminPanel.jsx` (~120 líneas)
- `components/AdminTableRow.jsx` (~80 líneas)
- `hooks/useFetchPacientes.js` (carga de datos)
- `hooks/usePacientesCRUD.js` (UPDATE/DELETE)
**Cambio:**
- Mucho más legible
- Lógica separada de presentación
- Componentes reutilizables

---

## 🎯 Decisiones de Arquitectura Explicadas

### 1️⃣ ¿Por qué separar en carpetas?

**Problema antiguo:**
```
Abres script.js → 700 líneas → ¿Dónde está el componente X?
```

**Solución nueva:**
```
Necesito AdminTableRow → Voy a components/AdminTableRow.jsx
```

### 2️⃣ ¿Por qué Custom Hooks?

**Problema antiguo:**
```javascript
// En AdminPanel (código duplicado)
useEffect(() => {
  const fetchPacientes = async () => { ... };
  fetchPacientes();
}, []);
```

**Solución nueva:**
```javascript
// Reutilizable en cualquier componente
const { pacientes, loading } = useFetchPacientes();
```

### 3️⃣ ¿Por qué PacientesAPI Class?

**Problema antiguo:**
```javascript
// Fetch duplicado en múltiples componentes
fetch(`${API_URL}/api/pacientes`, { method: 'POST', ... })
fetch(`${API_URL}/api/pacientes`, { method: 'GET', ... })
fetch(`${API_URL}/api/pacientes/${id}`, { method: 'PUT', ... })
```

**Solución nueva:**
```javascript
// Centralizado y reutilizable
PacientesAPI.crearPaciente(datos);
PacientesAPI.obtenerPacientes();
PacientesAPI.actualizarPaciente(id, datos);
```

### 4️⃣ ¿Por qué Constants?

**Problema antiguo:**
```javascript
// Especialistas hardcodeados en el componente
const especialistas = [{ id: 1, ... }, ...]
// Si cambias aquí, afecta solo este componente
```

**Solución nueva:**
```javascript
// En constants/especialistas.js
export const ESPECIALISTAS = [...]

// Importable en cualquier componente
import { ESPECIALISTAS } from '../constants/especialistas.js'
```

---

## 📝 Cambios en Cada Archivo

### `constants/api.js` (NUEVO)
```javascript
// Antes: API_URL = 'https://...' estaba al final de script.js
// Ahora: Centralizado y documentado
export const API_URL = 'https://hospital-poli-backend.onrender.com';
export const API_ENDPOINTS = {
  PACIENTES: '/api/pacientes',
  PACIENTE_BY_ID: (id) => `/api/pacientes/${id}`,
};
```

### `hooks/useFetchPacientes.js` (NUEVO)
```javascript
// Antes: useEffect con fetch estaba en AdminPanel
// Ahora: Hook reutilizable
export const useFetchPacientes = () => {
  // Encapsula toda la lógica de fetch
};
```

### `utils/apiClient.js` (NUEVO)
```javascript
// Antes: fetch() llamadas dispersas en componentes
// Ahora: Clase centralizada
export class PacientesAPI {
  static async obtenerPacientes() { ... }
  static async crearPaciente() { ... }
  static async actualizarPaciente() { ... }
  static async eliminarPaciente() { ... }
}
```

### `components/AdminPanel.jsx` (REFACTORIZADO)
```javascript
// Antes: 300+ líneas con todo mezclado
// Ahora: ~120 líneas solo con lógica de componente
import { useFetchPacientes } from '../hooks/useFetchPacientes.js';
import { usePacientesCRUD } from '../hooks/usePacientesCRUD.js';

export const AdminPanel = () => {
  // Usa hooks en lugar de useEffect directo
  const { pacientes, setPacientes } = useFetchPacientes();
  const { actualizarPaciente, eliminarPaciente } = usePacientesCRUD();
  // Resto del código...
};
```

---

## 🚀 Ventajas de la Nueva Arquitectura

| Métrica | Antes | Después |
|---------|-------|---------|
| Archivos | 1 (script.js) | 12+ |
| Líneas por archivo | 700 | 50-150 |
| Reutilización hooks | 0 | 2 |
| Constantes centralizadas | No | Sí |
| Fácil agregar features | 😟 | 😊 |
| Fácil para testing | 😟 | 😊 |

---

## 💡 Ejemplos Prácticos

### Usar componentes en otros lugares

**Antes:** No era posible, estaban ligados a script.js

**Ahora:**
```javascript
import { AdminPanel } from './components/AdminPanel.jsx';
import { EspecialistasSection } from './components/EspecialistasSection.jsx';

// Úsalos donde quieras
```

### Agregar nuevo método a API

**Antes:** Modificabas fetch en cada componente

**Ahora:**
```javascript
// En utils/apiClient.js
static async buscarPacientesPorNombre(nombre) {
  return await fetch(`${API_URL}/api/pacientes?nombre=${nombre}`);
}

// En cualquier componente
const resultado = await PacientesAPI.buscarPacientesPorNombre('Juan');
```

### Cambiar URL de API

**Antes:** Buscabas y reemplazabas en todo script.js

**Ahora:**
```javascript
// Cambio en constants/api.js (1 archivo)
export const API_URL = 'https://nueva-url.com';
// ¡Listo! Todos los componentes usan la nueva URL
```

---

## 🔗 Cómo Se Conecta Todo

```
index.html
   ↓
index.js (orquestador)
   ├── importa VideoButton
   ├── importa AppointmentForm
   │    ├── usa usePacientesCRUD (hook)
   │    └── usa utils/apiClient.js
   ├── importa EspecialistasSection
   │    └── usa constants/especialistas.js
   └── importa AdminPanel
        ├── usa useFetchPacientes (hook)
        ├── usa usePacientesCRUD (hook)
        ├── importa AdminTableRow
        └── usa utils/apiClient.js
```

---

## ✨ Mejores Prácticas Aplicadas

- ✅ **Separation of Concerns** - Cada archivo tiene una responsabilidad
- ✅ **DRY (Don't Repeat Yourself)** - Sin código duplicado
- ✅ **Composición sobre herencia** - Componentes pequeños y combinables
- ✅ **Single Responsibility Principle** - Un archivo, una razón para cambiar
- ✅ **Documentation** - Código comentado y documentado
- ✅ **Scalability** - Fácil agregar nuevas features

---

## 🎓 Para Tu Sustentación

**Puedes decir:**

> "Refactoricé el código siguiendo mejores prácticas de React. Separé responsabilidades en:
> - **Componentes:** Renderización de UI
> - **Hooks:** Lógica reutilizable
> - **Utils:** Funciones puras
> - **Constants:** Datos estáticos
> 
> Esto hace el código más mantenible, escalable y fácil de testear."

---

**✅ Refactorización completada con éxito** 🎉
