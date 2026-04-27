-- Creación de la tabla de pacientes para el Hospital EL POLI
CREATE TABLE pacientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    fecha_cita DATE NOT NULL,
    estado VARCHAR(20) DEFAULT 'Pendiente',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar un par de datos de prueba para que no empiece vacía
INSERT INTO pacientes (nombre, email, fecha_cita, estado)-- Creación de la tabla de pacientes para el Hospital EL POLI
CREATE TABLE pacientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    fecha_cita DATE NOT NULL,
    estado VARCHAR(20) DEFAULT 'Pendiente',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar un par de datos de prueba para que no empiece vacía
INSERT INTO pacientes (nombre, email, fecha_cita, estado)
VALUES 
    ('Ana María López', 'ana.lopez@email.com', '2026-05-10', 'Pendiente'),
    ('Carlos Arturo Ruiz', 'carlos.ruiz@email.com', '2026-05-12', 'Atendido');
VALUES 
    ('Ana María López', 'ana.lopez@email.com', '2026-05-10', 'Pendiente'),
    ('Carlos Arturo Ruiz', 'carlos.ruiz@email.com', '2026-05-12', 'Atendido');