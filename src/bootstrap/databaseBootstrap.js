const bcrypt = require('bcryptjs');
const { sequelize, Usuario } = require('../models');
const env = require('../config/env');
const tipoActividadService = require('../services/tipoActividadService');
const { serializarRolesAsignados } = require('../utils/rolesHelper');
const {
  ensureTiposActividadDescripcion,
  ensureUsuarioDebeCambiarPassword,
  ensureUsuarioFotoYRoles,
  ensureColaboradorDocumento,
} = require('../utils/dbSchemaPatches');

async function ensureEventoEncuestaColumns() {
  if (sequelize.getDialect() !== 'sqlite') {
    return;
  }
  const [columns] = await sequelize.query('PRAGMA table_info(eventos);');
  const names = new Set(columns.map((col) => col.name));
  const alters = [
    ['nombre_empresa', 'ALTER TABLE eventos ADD COLUMN nombre_empresa VARCHAR(120);'],
    ['direccion', 'ALTER TABLE eventos ADD COLUMN direccion VARCHAR(255);'],
    ['auxilio_transporte', 'ALTER TABLE eventos ADD COLUMN auxilio_transporte TINYINT NOT NULL DEFAULT 0;'],
    ['comentarios_transporte', 'ALTER TABLE eventos ADD COLUMN comentarios_transporte VARCHAR(500);'],
  ];
  for (const [name, sql] of alters) {
    if (!names.has(name)) {
      await sequelize.query(sql);
    }
  }
}

async function syncSchema() {
  await sequelize.sync();
  await ensureTiposActividadDescripcion(sequelize);
  await ensureUsuarioDebeCambiarPassword(sequelize);
  await ensureUsuarioFotoYRoles(sequelize);
  await ensureColaboradorDocumento(sequelize);
  await ensureEventoEncuestaColumns();
  await tipoActividadService.seedTiposBase();
}

async function ensureInitialAdmin() {
  const email = (process.env.ADMIN_INITIAL_EMAIL || 'admin@equiwork.local').trim().toLowerCase();
  const plainPassword = process.env.ADMIN_INITIAL_PASSWORD || 'Admin123!';
  const existing = await Usuario.findOne({ where: { email } });
  if (existing) {
    return { created: false, email };
  }
  const password_hash = await bcrypt.hash(plainPassword, 10);
  await Usuario.create({
    email,
    password_hash,
    nombre: process.env.ADMIN_INITIAL_NAME || 'Administrador',
    rol: Usuario.ROLES.ADMINISTRADOR,
    roles_asignados: serializarRolesAsignados([Usuario.ROLES.ADMINISTRADOR]),
    activo: true,
    debe_cambiar_password: true,
  });
  return { created: true, email };
}

async function bootstrapOnStartup() {
  await syncSchema();
  if (env.nodeEnv === 'production') {
    const admin = await ensureInitialAdmin();
    if (admin.created) {
      console.log(`[EquiWork] Administrador inicial creado: ${admin.email}`);
    }
  }
}

module.exports = { syncSchema, ensureInitialAdmin, bootstrapOnStartup };