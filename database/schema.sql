-- EquiWork — esquema de referencia (MySQL 8+)
CREATE DATABASE IF NOT EXISTS equiwork CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE equiwork;

-- Las tablas se crean vía Sequelize (npm run db:sync).
-- Índices clave (ORM):
--   usuarios.email (UNIQUE)
--   colaboradores.email (UNIQUE), activo, area
--   quincenas (anio, mes, numero_quincena UNIQUE), fechas
--   registros_quincenales (colaborador_id, quincena_id UNIQUE), FK indexes
--   eventos.registro_quincenal_id, fecha_evento, tipo_evento
