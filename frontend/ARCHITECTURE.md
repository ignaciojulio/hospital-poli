# 🏛️ ARQUITECTURA VISUAL - Hospital EL POLI

## Estructura de Carpetas

```
hospital-poli/
├── backend/                  # Node.js + Express (servidor)
│   ├── server.js
│   ├── package.json
│   └── .env
│
└── frontend/                 # React + HTML/CSS (cliente)
    ├── src/
    │   ├── 📁 components/    # ⭐ Componentes React
    │   │   ├── VideoButton.jsx
    │   │   ├── AppointmentForm.jsx
    │   │   ├── EspecialistasSection.jsx
    │   │   ├── AdminPanel.jsx
    │   │   └── AdminTableRow.jsx
    │   │
    │   ├── 📁 hooks/         # ⭐ Custom Hooks (lógica reutilizable)
    │   │   ├── useFetchPacientes.js    # Para READ
    │   │   └── usePacientesCRUD.js     # Para CREATE, UPDATE, DELETE
    │   │
    │   ├── 📁 utils/         # ⭐ Funciones puras
    │   │   ├── apiClient.js  # Clase PacientesAPI
    │   │   └── dateUtils.js  # Formateo de fechas
    │   │
    │   ├── 📁 constants/     # ⭐ Datos y configuración
    │   │   ├── api.js        # Config de API
    │   │   └── especialistas.js # Datos estáticos
    │   │
    │   ├── 📁 styles/        # (Para futuros estilos modulares)
    │   │
    │   ├── index.js          # Archivo principal (renderizador)
    │   ├── index.html        # Estructura HTML
    │   ├── style.css         # Estilos globales
    │   ├── script.js         # [DEPRECATED - versión antigua]
    │   └── README.md         # Documentación
    │
    ├── REFACTOR_GUIDE.md     # Guía de refactorización
    └── ...
```

---

## Flujo de Datos CRUD

### CREATE (Registrar Cita) 📝
```
usuario escribe en formulario
         ↓
   AppointmentForm.jsx
         ↓
   handleSubmit() captura datos
         ↓
   fetch() POST a /api/pacientes
         ↓
   Backend: INSERT en BD
         ↓
   Modal de confirmación ✓
```

### READ (Listar Pacientes) 📖
```
Usuario entra a "Administración"
         ↓
   AdminPanel monta (mounted)
         ↓
   useFetchPacientes() hook dispara
         ↓
   fetch() GET a /api/pacientes
         ↓
   Backend: SELECT * FROM pacientes
         ↓
   setState(pacientes) → Tabla renderiza
```

### UPDATE (Editar Paciente) ✏️
```
Usuario click "✔ Atender"
         ↓
   handleEdit() activa modo edición
         ↓
   Inputs editables aparecen
         ↓
   Usuario modifica campos
         ↓
   Click "💾 Guardar"
         ↓
   handleUpdate() captura cambios
         ↓
   fetch() PUT a /api/pacientes/:id
         ↓
   Backend: UPDATE pacientes
         ↓
   setPacientes() actualiza tabla
```

### DELETE (Eliminar Paciente) 🗑️
```
Usuario click "🗑 Borrar"
         ↓
   window.confirm() (confirmación)
         ↓
   handleDelete() ejecuta
         ↓
   fetch() DELETE a /api/pacientes/:id
         ↓
   Backend: DELETE FROM pacientes
         ↓
   setPacientes(filter) → Fila desaparece
```

---

## Dependencias Entre Archivos

```
index.html
    ↓
    ├─→ style.css (estilos globales)
    └─→ index.js (orquestador)
            ↓
            ├─→ components/VideoButton.jsx
            │
            ├─→ components/AppointmentForm.jsx
            │       ├─→ utils/dateUtils.js
            │       └─→ (fetch inline a API)
            │
            ├─→ components/EspecialistasSection.jsx
            │       └─→ constants/especialistas.js
            │
            └─→ components/AdminPanel.jsx
                    ├─→ components/AdminTableRow.jsx
                    │       └─→ constants/especialistas.js
                    ├─→ hooks/useFetchPacientes.js
                    │       └─→ utils/apiClient.js
                    └─→ hooks/usePacientesCRUD.js
                            └─→ utils/apiClient.js
```

---

## Diagrama de Componentes (Component Tree)

```
<App>  (renderizado en index.js)
│
├── <VideoButton />
│   └── <VideoModal />
│
├── <AppointmentForm />
│   └── <ConfirmModal />
│
├── <EspecialistasSection />
│   └── map() {
│       <DoctorCard />
│       }
│
└── <AdminPanel />
    ├── <select /> (filtro)
    └── <table>
        <tbody>
            map() {
            <AdminTableRow />
            }
        </tbody>
        </table>
```

---

## Flujo HTTP (Frontend ↔ Backend)

```
┌─────────────────────────────────────┐
│         Frontend (React)             │
│  https://hospital-poli-frontend..   │
└─────────────────────────────────────┘
           │
           │ HTTP
           ↓
    ┌──────────────────┐
    │   POST Request   │
    │ /api/pacientes   │
    │ { name, email }  │
    └──────────────────┘
           │
           ↓
┌─────────────────────────────────────┐
│      Backend (Node + Express)       │
│ https://hospital-poli-backend...    │
│                                     │
│  POST /api/pacientes →              │
│    INSERT INTO pacientes            │
│    RETURNING *                      │
└─────────────────────────────────────┘
           │
           ↓
    ┌──────────────────┐
    │  200 Response    │
    │  { id, name... } │
    └──────────────────┘
           │
           ↓
    Frontend recibe & actualiza UI
```

---

## Capas (Layered Architecture)

```
┌─────────────────────────────────────────┐
│          PRESENTACIÓN (UI)              │
│  components/ (VideoButton, AdminPanel)  │
└─────────────────────────────────────────┘
                   ↕
┌─────────────────────────────────────────┐
│          LÓGICA DE NEGOCIO              │
│    hooks/ (useFetchPacientes, etc)      │
└─────────────────────────────────────────┘
                   ↕
┌─────────────────────────────────────────┐
│       ACCESO A DATOS / API              │
│  utils/apiClient.js (PacientesAPI)      │
└─────────────────────────────────────────┘
                   ↕
┌─────────────────────────────────────────┐
│      CONFIGURACIÓN / CONSTANTES         │
│  constants/ (api.js, especialistas.js)  │
└─────────────────────────────────────────┘
                   ↕
┌─────────────────────────────────────────┐
│         BACKEND (Node + Express)        │
│  🔗 https://hospital-poli-backend...    │
└─────────────────────────────────────────┘
```

---

## Responsabilidades de Cada Carpeta

| Carpeta | Responsabilidad | Ejemplo |
|---------|-----------------|---------|
| `components/` | Renderizar UI | Mostrar tabla, botones, modales |
| `hooks/` | Lógica React | Fetch, estado, lifecycle |
| `utils/` | Funciones puras | API calls, formateo de fechas |
| `constants/` | Datos estáticos | URLs, opciones, especialistas |
| `styles/` | Estilos modulares | CSS por componente (futuro) |

---

## Patrones de Programación Usados

### 1. **Component Pattern** 📦
Cada componente es una pieza visual independiente
```jsx
<VideoButton />
<AppointmentForm />
<AdminPanel />
```

### 2. **Custom Hook Pattern** 🎣
Lógica reutilizable
```js
const { pacientes, loading } = useFetchPacientes();
const { crear, actualizar, eliminar } = usePacientesCRUD();
```

### 3. **API Client Pattern** 📡
Centraliza peticiones HTTP
```js
class PacientesAPI {
  static async obtenerPacientes() { ... }
  static async crearPaciente(datos) { ... }
}
```

### 4. **Constants Pattern** 🔐
Configuración centralizada
```js
export const API_URL = '...';
export const ESPECIALISTAS = [...];
```

---

## Performance & Optimizaciones

- ✅ **Componentes perezosos** - Solo se renderiza lo visible
- ✅ **Fetch eficiente** - Una llamada por acción
- ✅ **Re-renders minimizados** - useEffect con dependencias
- ✅ **State management simplificado** - useState + hooks personalizados
- ✅ **Código sin duplicados** - DRY principle

---

## Escalabilidad Futura

Si necesitas agregar features:

### Agregar nueva página
1. Crea componente en `components/`
2. Importa en `index.js`
3. ¡Listo!

### Agregar nueva API endpoint
1. Agrega método a `PacientesAPI` en `utils/apiClient.js`
2. Usa en componentes
3. ¡Listo!

### Agregar nuevo hook
1. Crea en `hooks/`
2. Importa en componentes que lo necesiten
3. ¡Listo!

---

**Arquitectura clara y profesional = Código mantenible y escalable** ✨
