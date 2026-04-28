/**
 * SERVIDOR BACKEND - HOSPITAL EL POLI
 *
 * Este archivo levanta un servidor con Express.js, se conecta a una base de datos
 * PostgreSQL en Render y expone una API REST para gestionar los pacientes (citas).
 *
 * @author Ignacio Julio Posada (y equipo)
 * @version 1.0.0
 */

// =================================================================
// 1. IMPORTACIÓN DE MÓDULOS
// =================================================================

const express = require('express'); // Framework para crear servidores y rutas API.
const cors = require('cors');       // Middleware para permitir peticiones desde otros orígenes (el frontend).
const { Pool } = require('pg');     // Driver oficial de Node.js para PostgreSQL.

// =================================================================
// 2. CONFIGURACIÓN INICIAL
// =================================================================

const app = express();
const PORT = process.env.PORT || 3000; // El puerto se toma de las variables de entorno de Render, o 3000 para desarrollo local.

/**
 * Configuración del Pool de Conexiones a PostgreSQL.
 * ¿Por qué un "Pool"? En lugar de crear una conexión por cada petición, un pool
 * mantiene un conjunto de conexiones abiertas y las reutiliza. Es mucho más eficiente
 * y es la práctica recomendada para aplicaciones en producción.
 */
const pool = new Pool({
  // Render provee la URL de conexión en una variable de entorno llamada DATABASE_URL.
  // El driver `pg` la detecta automáticamente.
  connectionString: process.env.DATABASE_URL,
  // Para producción en Render, es crucial requerir una conexión SSL.
  ssl: {
    rejectUnauthorized: false,
  },
});

// =================================================================
// 3. MIDDLEWARE
// =================================================================

/**
 * Uso de CORS (Cross-Origin Resource Sharing).
 * ¿Por qué? Por seguridad, los navegadores bloquean peticiones a un dominio
 * diferente (ej. frontend en `render.app` pidiendo datos a backend en `onrender.com`).
 * `cors()` le dice al navegador que nuestro backend SÍ permite estas peticiones.
 */
app.use(cors());

/**
 * Middleware para parsear JSON.
 * ¿Por qué? Las peticiones POST y PUT envían datos en el cuerpo (body) en formato JSON.
 * `express.json()` toma ese JSON y lo convierte en un objeto JavaScript accesible
 * en `req.body` dentro de nuestras rutas.
 */
app.use(express.json());

// =================================================================
// 4. RUTAS DE LA API (ENDPOINTS)
// =================================================================

/**
 * @route   GET /api/pacientes
 * @desc    Obtener todos los pacientes (citas) de la base de datos.
 * @access  Public
 * @returns {Array<Object>} Un array de objetos, donde cada objeto es un paciente.
 */
app.get('/api/pacientes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pacientes ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del Servidor');
  }
});

/**
 * @route   POST /api/pacientes
 * @desc    Crear un nuevo paciente (cita).
 * @access  Public
 * @param   {Object} req.body - Objeto con {nombre, email, fecha_cita}.
 * @returns {Object} El objeto del paciente recién creado, incluyendo su nuevo `id`.
 */
app.post('/api/pacientes', async (req, res) => {
  try {
    const { nombre, email, fecha_cita } = req.body;
    const newPaciente = await pool.query(
      'INSERT INTO pacientes (nombre, email, fecha_cita) VALUES ($1, $2, $3) RETURNING *',
      [nombre, email, fecha_cita]
    );
    res.status(201).json(newPaciente.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del Servidor');
  }
});

/**
 * @route   PUT /api/pacientes/:id
 * @desc    Actualizar un paciente existente (generalmente su estado o fecha).
 * @access  Public
 * @param   {string} req.params.id - El ID del paciente a actualizar.
 * @param   {Object} req.body - Objeto con los campos a actualizar, ej. {fecha_cita, estado}.
 * @returns {Object} El objeto del paciente con los datos ya actualizados.
 */
app.put('/api/pacientes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha_cita, estado } = req.body;
    const updatedPaciente = await pool.query(
      'UPDATE pacientes SET fecha_cita = $1, estado = $2 WHERE id = $3 RETURNING *',
      [fecha_cita, estado, id]
    );
    if (updatedPaciente.rows.length === 0) {
      return res.status(404).json({ msg: 'Paciente no encontrado' });
    }
    res.json(updatedPaciente.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del Servidor');
  }
});

/**
 * @route   DELETE /api/pacientes/:id
 * @desc    Eliminar un paciente de la base de datos.
 * @access  Public
 * @param   {string} req.params.id - El ID del paciente a eliminar.
 * @returns {Object} Un mensaje de confirmación.
 */
app.delete('/api/pacientes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleteOp = await pool.query('DELETE FROM pacientes WHERE id = $1 RETURNING *', [id]);
    if (deleteOp.rows.length === 0) {
      return res.status(404).json({ msg: 'Paciente no encontrado' });
    }
    res.json({ msg: 'Paciente eliminado correctamente' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del Servidor');
  }
});

// =================================================================
// 5. INICIO DEL SERVIDOR
// =================================================================

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});