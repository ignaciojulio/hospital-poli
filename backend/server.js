require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Para poder recibir JSON desde el front-end

// Conexión a la base de datos PostgreSQL en Render
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Render requiere SSL
});

// ==========================================
// RUTAS DEL CRUD (Pacientes/Citas)
// ==========================================

// 1. LEER (Listar todos los pacientes) - GET
app.get("/api/pacientes", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM pacientes ORDER BY fecha_registro DESC",
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. CREAR (Registrar una nueva cita) - POST
app.post("/api/pacientes", async (req, res) => {
  const { nombre, email, fecha_cita } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO pacientes (nombre, email, fecha_cita) VALUES ($1, $2, $3) RETURNING *",
      [nombre, email, fecha_cita],
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. MODIFICAR (Actualizar estado o fecha de la cita) - PUT
app.put("/api/pacientes/:id", async (req, res) => {
  const { id } = req.params;
  const { fecha_cita, estado } = req.body;
  try {
    const result = await pool.query(
      "UPDATE pacientes SET fecha_cita = $1, estado = $2 WHERE id = $3 RETURNING *",
      [fecha_cita, estado, id],
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. ELIMINAR (Cancelar cita y borrar paciente) - DELETE
app.delete("/api/pacientes/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM pacientes WHERE id = $1", [id]);
    res.json({ mensaje: "Paciente eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando en el puerto ${PORT}`);
});
