/**
 * SERVIDOR BACKEND BLINDADO - HOSPITAL EL POLI
 *
 * Este archivo levanta un servidor con Express.js, se conecta a una base de datos
 * PostgreSQL en Render y expone una API REST para gestionar los pacientes (citas).
 *
 * @author Ignacio Julio Posada, Luis Alejandro Murcia Pimiento, Christian Alejandro Granada Dorado, Emmanuel López Velandia - Subgrupo 9
 * @version 1.0.0
 */
 
// =================================================================
// 1. IMPORTACIÓN DE MÓDULOS
// =================================================================

const express = require('express'); // Framework para crear servidores y rutas API.
const cors = require('cors');       // Middleware para permitir peticiones desde otros orígenes (el frontend).
const { Pool } = require('pg');     // Driver oficial de Node.js para PostgreSQL.
const helmet = require('helmet');   // [🛡️ SEGURIDAD] Middleware para asegurar los encabezados HTTP.
const rateLimit = require('express-rate-limit'); // [🛡️ SEGURIDAD] Middleware para limitar la tasa de peticiones (Rate Limiting).
const { body, validationResult } = require('express-validator'); // [🛡️ SEGURIDAD] Herramientas para validar y sanitizar datos.


// Cargar variables de entorno desde .env (si no se usa dotenv.config() explícito)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

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
// 3. MIDDLEWARE DE SEGURIDAD
// =================================================================

// [🛡️ SEGURIDAD] Usa Helmet para establecer encabezados HTTP seguros.
// Oculta información sensible (como `X-Powered-By`) y protege contra ataques como Clickjacking.
app.use(helmet());

// [🛡️ SEGURIDAD] Configuración estricta de CORS.
// Solo permite peticiones desde el dominio exacto de tu frontend en producción.
// Esto previene que otros sitios web maliciosos usen tu API desde el navegador de un usuario.
const corsOptions = {
  origin: 'https://hospital-poli-frontend.onrender.com',
  optionsSuccessStatus: 200 // Para compatibilidad con navegadores antiguos.
};
app.use(cors(corsOptions));

// [🛡️ SEGURIDAD] Rate Limiting global para mitigar ataques de fuerza bruta o DDoS.
// Limita a cada IP a 100 peticiones cada 15 minutos.
const globalLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutos
	max: 100, // Límite de 100 peticiones por IP en la ventana de tiempo.
	standardHeaders: true,
	legacyHeaders: false,
  message: 'Demasiadas peticiones desde esta IP, por favor intente de nuevo en 15 minutos.'
});
app.use(globalLimiter);

// [🛡️ SEGURIDAD] Rate Limiting más estricto para la creación de citas.
// Previene el spam en la base de datos. Limita a 5 creaciones de citas por IP cada 15 minutos.
const createAppointmentLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutos
	max: 5,
	standardHeaders: true,
	legacyHeaders: false,
  message: 'Demasiadas solicitudes de citas creadas desde esta IP. Límite: 5 cada 15 minutos.'
});

// =================================================================
// 4. MIDDLEWARE GENERAL
// =================================================================

// Middleware para parsear el cuerpo de las peticiones a JSON.
app.use(express.json());

// =================================================================
// 5. REGLAS DE VALIDACIÓN Y SANITIZACIÓN
// =================================================================

// [🛡️ SEGURIDAD] Middleware para manejar los errores de validación de express-validator.
// Centraliza la lógica de respuesta para no repetirla en cada ruta.
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next(); // Si no hay errores, continúa a la siguiente función (el controlador de la ruta).
  }
  // Si hay errores, los extrae y los devuelve en una respuesta 422.
  const extractedErrors = errors.array().map(err => ({ [err.param]: err.msg }));
  return res.status(422).json({ errors: extractedErrors });
};

// [🛡️ SEGURIDAD] Reglas para crear un paciente.
const createPacienteRules = () => [
  body('nombre')
    .trim() // Elimina espacios en blanco al inicio y al final.
    .isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres.')
    .escape(), // Convierte caracteres especiales de HTML (<, >, &, ', ") a sus entidades correspondientes para prevenir XSS.

  body('email')
    .isEmail().withMessage('Debe proporcionar un correo electrónico válido.')
    .normalizeEmail(), // Normaliza el email (ej. convierte 'GMAIL.COM' a 'gmail.com').

  body('fecha_cita')
    .isISO8601().withMessage('La fecha debe estar en formato YYYY-MM-DD.')
    .toDate() // Convierte la cadena a un objeto Date para la siguiente validación.
    .custom(value => {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Compara solo con el inicio del día actual.
      if (value < today) {
        throw new Error('La fecha de la cita no puede ser en el pasado.');
      }
      return true;
    }),
];

// [🛡️ SEGURIDAD] Reglas para actualizar un paciente (los campos son opcionales).
const updatePacienteRules = () => [
  body('fecha_cita').optional().isISO8601().withMessage('La fecha debe estar en formato YYYY-MM-DD.'),
  body('estado').optional().isIn(['Pendiente', 'Atendido', 'Cancelado']).withMessage('El estado no es válido.'),
];


// =================================================================
// 6. RUTAS DE LA API (ENDPOINTS)
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
    // [🛡️ SEGURIDAD] Loguea el error real para depuración interna.
    console.error(err.message);
    // [🛡️ SEGURIDAD] Envía una respuesta genérica al cliente.
    // NUNCA envíes `err.message` en producción, ya que puede filtrar detalles
    // sensibles sobre la estructura de tu base de datos o tu código.
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
app.post(
  '/api/pacientes',
  createAppointmentLimiter, // 1. Aplica el rate limit estricto.
  createPacienteRules(),    // 2. Define las reglas de validación.
  validate,                 // 3. Ejecuta la validación.
  async (req, res) => {     // 4. Si todo pasa, ejecuta el controlador.
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
  }
);

/**
 * @route   PUT /api/pacientes/:id
 * @desc    Actualizar un paciente existente (generalmente su estado o fecha).
 * @access  Public
 * @param   {string} req.params.id - El ID del paciente a actualizar.
 * @param   {Object} req.body - Objeto con los campos a actualizar, ej. {fecha_cita, estado}.
 * @returns {Object} El objeto del paciente con los datos ya actualizados.
 */
app.put(
  '/api/pacientes/:id',
  updatePacienteRules(), // 1. Define las reglas de validación para la actualización.
  validate,              // 2. Ejecuta la validación.
  async (req, res) => {  // 3. Si todo pasa, ejecuta el controlador.
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
  }
);

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
// 7. INICIO DEL SERVIDOR
// =================================================================

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
