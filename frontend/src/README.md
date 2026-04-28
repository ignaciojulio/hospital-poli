# 📁 Estructura del Proyecto Hospital EL POLI - Frontend

## 🏗️ Arquitectura Profesional

Este proyecto sigue las mejores prácticas de React con una estructura modular y escalable.

```
src/
├── constants/          # Constantes y datos estáticos
│   ├── api.js         # Configuración de API (URLs, métodos HTTP)
│   └── especialistas.js # Datos de especialistas y opciones
│
├── utils/             # Funciones utilitarias reutilizables
│   ├── apiClient.js   # Clase PacientesAPI para peticiones HTTP
│   └── dateUtils.js   # Funciones para formatear fechas
│
├── hooks/             # Custom Hooks de React
│   ├── useFetchPacientes.js   # Hook para cargar lista de pacientes (READ)
│   └── usePacientesCRUD.js    # Hook para CREATE, UPDATE, DELETE
│
├── components/        # Componentes React
│   ├── VideoButton.jsx        # Botón y modal de video
│   ├── AppointmentForm.jsx    # Formulario de citas (CREATE)
│   ├── EspecialistasSection.jsx # Grid de especialistas
│   ├── AdminPanel.jsx         # Panel de administración (READ, UPDATE, DELETE)
│   └── AdminTableRow.jsx      # Fila individual de tabla
│
├── styles/           # Estilos modulares (opcional)
│   └── (estilos por componente)
│
├── index.js          # Archivo principal - renderiza todos los componentes
├── index.html        # HTML principal
├── style.css         # Estilos globales
└── script.js         # [DEPRECATED] - Versión anterior (puede eliminarse)
```

---

## 🔄 Flujo CRUD - Cómo Funciona Todo

### 📝 CREATE (POST) - Registrar Cita
**Componente:** `AppointmentForm.jsx`
```
Usuario llena formulario → handleSubmit → POST /api/pacientes → Confirmación modal
```

### 📖 READ (GET) - Listar Pacientes
**Componente:** `AdminPanel.jsx` + Hook: `useFetchPacientes.js`
```
AdminPanel monta → useEffect dispara → GET /api/pacientes → setPacientes → Tabla renderiza
```

### ✏️ UPDATE (PUT) - Editar Paciente
**Componente:** `AdminPanel.jsx` + Hook: `usePacientesCRUD.js`
```
Click "Atender" → handleEdit (modo edición) → Edita inputs → Click "Guardar" → PUT /api/pacientes/:id → Actualiza tabla
```

### 🗑️ DELETE (DELETE) - Eliminar Paciente
**Componente:** `AdminPanel.jsx` + Hook: `usePacientesCRUD.js`
```
Click "Borrar" → Confirmación → DELETE /api/pacientes/:id → Elimina fila de tabla
```

---

## 🎯 Beneficios de esta Arquitectura

| Beneficio | Explicación |
|-----------|-------------|
| **Modular** | Cada componente tiene una responsabilidad clara |
| **Reutilizable** | Hooks pueden usarse en múltiples componentes |
| **Mantenible** | Código organizado y fácil de encontrar |
| **Escalable** | Agregar nuevas features es simple |
| **Testing** | Cada archivo puede testearse independientemente |
| **Legible** | Código limpio y documentado |

---

## 📦 Importancia de Cada Carpeta

### `constants/`
**¿Por qué?** Centraliza datos y configuraciones que se usan en múltiples lugares.
**Ventaja:** Si cambia la URL del API, solo cambias 1 archivo.

### `utils/`
**¿Por qué?** Funciones puras que no dependen de React.
**Ventaja:** Pueden reutilizarse en Node.js, tests, etc.

### `hooks/`
**¿Por qué?** Lógica de React encapsulada y reutilizable.
**Ventaja:** Componentes más limpios, sin lógica de fetch.

### `components/`
**¿Por qué?** Cada componente es una pieza visual.
**Ventaja:** Componentes enfocados y fáciles de entender.

---

## 🚀 Cómo Usar Este Proyecto

### Desarrollar Localmente
```bash
# El servidor Node.js debe estar corriendo en puerto 3000
cd ../backend
npm start

# Luego abre el frontend en navegador
# Si usas Live Server: Abre src/index.html
```

### Agregar Nuevo Componente
1. Crea archivo en `components/MiComponente.jsx`
2. Importa en `index.js`
3. Renderiza en el hook `renderApp()`

### Agregar Nueva Constante
1. Crea o edita en `constants/`
2. Importa donde la necesites
3. Usa en componentes

### Agregar Nuevo Hook
1. Crea en `hooks/miHook.js`
2. Importa en el componente que lo necesita
3. Usa con: `const { ... } = miHook()`

---

## 📊 Estadísticas del Código

- **Líneas antes:** ~700 líneas en 1 archivo (`script.js`)
- **Líneas después:** Distribuidas en 10+ archivos (~600 líneas totales)
- **Componentes:** 5 componentes independientes
- **Hooks:** 2 custom hooks reutilizables
- **Utilidades:** 2 módulos de funciones puras
- **Constantes:** 2 archivos de configuración

---

## 🔗 Referencias y Links

- **React Docs:** https://react.dev
- **Custom Hooks:** https://react.dev/learn/reusing-logic-with-custom-hooks
- **Fetch API:** https://developer.mozilla.org/es/docs/Web/API/Fetch_API
- **Babel:** https://babeljs.io (convierte JSX a JavaScript)

---

## ✅ Checklist para Sustentación

- [x] Código organizado en carpetas
- [x] Componentes reutilizables
- [x] Hooks custom para lógica
- [x] Funciones puras en utils
- [x] Constantes centralizadas
- [x] CRUD completamente funcional
- [x] Documentado y comentado

---

**Desarrollado con ❤️ por Ignacio Julio Posada**
