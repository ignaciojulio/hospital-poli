# 🏥 Hospital EL POLI - Gestión de Citas Médicas

Un proyecto Full-Stack desarrollado para la clase de Front-End, enfocado en la gestión de citas médicas con calidad humana y excelencia tecnológica. La aplicación permite a los usuarios solicitar citas y a los administradores gestionarlas a través de un panel de control interactivo.

---

## 🛠️ Tecnologías Utilizadas (Tech Stack)

| Categoría      | Tecnología                                                                                                                            | Descripción                                                                                             |
| :------------- | :------------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------ |
| **Frontend**   | <img src="https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black" alt="React">                                           | Librería principal para construir la interfaz de usuario, cargada vía CDN para agilidad.                |
|                | <img src="https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white" alt="HTML5">                                           | Estructura semántica de la aplicación web.                                                              |
|                | <img src="https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white" alt="CSS3">                                             | Estilos personalizados, animaciones y diseño responsivo para una experiencia de usuario moderna.      |
| **Backend**    | <img src="https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white" alt="Node.js">                                   | Entorno de ejecución para el servidor, basado en el motor V8 de Chrome.                                 |
|                | <img src="https://img.shields.io/badge/Express-000000?logo=express&logoColor=white" alt="Express">                                     | Framework minimalista para construir la API RESTful y gestionar las rutas del servidor.                 |
| **Base de Datos** | <img src="https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL">                             | Sistema de gestión de base de datos relacional para persistir los datos de los pacientes.               |
| **Despliegue** | <img src="https://img.shields.io/badge/Render-46E3B7?logo=render&logoColor=white" alt="Render">                                         | Plataforma en la nube para desplegar tanto el **Web Service** (Backend) como el **Static Site** (Frontend). |

---

## ✨ Funcionalidades Implementadas (CRUD)

El núcleo del proyecto es un sistema CRUD completo para la gestión de citas médicas:

### 📝 **CREATE (Crear)**
*   **Funcionalidad:** Los usuarios pueden solicitar una nueva cita médica a través de un formulario intuitivo en la página principal.
*   **Implementación:** El componente `AppointmentForm` (dentro de `script.js`) captura los datos del usuario (nombre, email, fecha) y realiza una petición `POST` a `/api/pacientes`. El backend inserta el nuevo registro en la base de datos PostgreSQL.

### 📖 **READ (Leer)**
*   **Funcionalidad:** El personal administrativo puede visualizar una lista completa y actualizada de todas las citas registradas en el sistema.
*   **Implementación:** El componente `AdminPanel` (dentro de `script.js`) utiliza el hook `useFetchPacientes` para realizar una petición `GET` a `/api/pacientes` al cargar. Los datos se renderizan en una tabla organizada.

### 🔄 **UPDATE (Actualizar)**
*   **Funcionalidad:** Permite a los administradores cambiar el estado de una cita (de `Pendiente` a `Atendido` o `Cancelado`) y modificar la fecha de la misma.
*   **Implementación:** Cada fila de la tabla (`AdminTableRow` en `script.js`) tiene un modo de edición que, al guardar, dispara una petición `PUT` a `/api/pacientes/:id` con los nuevos datos. La interfaz se actualiza en tiempo real.

### 🗑️ **DELETE (Eliminar)**
*   **Funcionalidad:** Ofrece la capacidad de eliminar permanentemente el registro de una cita, por ejemplo, en caso de cancelación.
*   **Implementación:** Un botón de "Borrar" en cada fila solicita confirmación y, si se acepta, envía una petición `DELETE` a `/api/pacientes/:id`. El registro se elimina de la UI y de la base de datos.

---

## 🏛️ Arquitectura del Proyecto

El proyecto está diseñado con una clara **separación de responsabilidades** entre el cliente y el servidor.

*   **Backend (Servidor):**
    *   Construido con **Node.js y Express**, actúa como una API RESTful.
    *   Su única responsabilidad es gestionar la lógica de negocio: interactuar con la base de datos PostgreSQL, validar datos y exponer los endpoints CRUD (`/api/pacientes`).
    *   No tiene conocimiento sobre la interfaz de usuario.

*   **Frontend (Cliente):**
    *   Construido con **React (vía CDN)**, es una Single Page Application (SPA) que consume la API del backend.
    *   Se encarga exclusivamente de la capa de presentación: renderizar la interfaz, gestionar el estado de los componentes y ofrecer una experiencia de usuario interactiva.
    *   Para simplificar el despliegue en Render, todo el código JavaScript del frontend se ha unificado en un único archivo (`script.js`) que es transpilado en el navegador por Babel Standalone. Este archivo contiene los componentes de React, los hooks, el cliente de API y las constantes.

---

## 🚀 Instalación y Ejecución Local

Sigue estos pasos para levantar el proyecto en tu máquina local.

### Requisitos Previos
*   Node.js (v18 o superior)
*   npm
*   Una base de datos PostgreSQL (local o en la nube).
*   La extensión Live Server para VS Code.

### 1. Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/hospital-poli.git
cd hospital-poli
```

### 2. Configurar y Levantar el Backend
```bash
# Navega a la carpeta del backend
cd backend

# Instala las dependencias
npm install

# Crea un archivo .env en la raíz de /backend y añade tu URL de conexión a PostgreSQL
# Ejemplo de .env:
# DATABASE_URL="postgresql://user:password@host:port/database"

# Inicia el servidor
npm start
```
El backend estará corriendo en `http://localhost:3000`.

### 3. Levantar el Frontend
```bash
# Abre la carpeta del proyecto en VS Code
code .

# Navega al archivo /frontend/src/index.html
# Haz clic derecho y selecciona "Open with Live Server"
```
El frontend se abrirá en tu navegador, generalmente en `http://127.0.0.1:5500`.

---

## 🌐 Enlaces de Producción

*   **Frontend (Static Site):** https://hospital-poli-frontend.onrender.com/
*   **API Backend (Web Service):** https://hospital-poli-backend.onrender.com/api/pacientes

---

## 👨‍💻 Desarrollado por (Subgrupo 9)

Este proyecto fue creado con dedicación y trabajo en equipo por:

*   **Ignacio Julio Posada**
*   **Luis Alejandro Murcia Pimiento**
*   **Christian Alejandro Granada Dorado**
*   **Emmanuel López Velandia**

¡Gracias por revisar nuestro proyecto! ✨