async function ensureTiposActividadDescripcion(sequelize) {
  if (sequelize.getDialect() !== 'sqlite') {
    return;
  }
  const [columns] = await sequelize.query('PRAGMA table_info(tipos_actividad);');
  const names = new Set(columns.map((col) => col.name));
  if (!names.has('descripcion')) {
    await sequelize.query('ALTER TABLE tipos_actividad ADD COLUMN descripcion VARCHAR(500);');
  }
}

async function ensureUsuarioDebeCambiarPassword(sequelize) {
  if (sequelize.getDialect() !== 'sqlite') {
    return;
  }
  const [columns] = await sequelize.query('PRAGMA table_info(usuarios);');
  const names = new Set(columns.map((col) => col.name));
  if (!names.has('debe_cambiar_password')) {
    await sequelize.query(
      'ALTER TABLE usuarios ADD COLUMN debe_cambiar_password TINYINT NOT NULL DEFAULT 0;'
    );
  }
}

async function ensureUsuarioFotoYRoles(sequelize) {
  if (sequelize.getDialect() !== 'sqlite') return;
  const [columns] = await sequelize.query('PRAGMA table_info(usuarios);');
  const names = new Set(columns.map((col) => col.name));
  if (!names.has('foto_url')) {
    await sequelize.query('ALTER TABLE usuarios ADD COLUMN foto_url VARCHAR(255);');
  }
  if (!names.has('roles_asignados')) {
    await sequelize.query('ALTER TABLE usuarios ADD COLUMN roles_asignados VARCHAR(120);');
  }
}

async function ensureColaboradorDocumento(sequelize) {
  if (sequelize.getDialect() !== 'sqlite') return;
  const [columns] = await sequelize.query('PRAGMA table_info(colaboradores);');
  const names = new Set(columns.map((col) => col.name));
  if (!names.has('tipo_documento')) {
    await sequelize.query(
      "ALTER TABLE colaboradores ADD COLUMN tipo_documento VARCHAR(10) NOT NULL DEFAULT 'CC';"
    );
  }
  if (!names.has('numero_documento')) {
    await sequelize.query(
      "ALTER TABLE colaboradores ADD COLUMN numero_documento VARCHAR(20) NOT NULL DEFAULT '0000000000';"
    );
  }
  await sequelize.query(
    `UPDATE colaboradores SET numero_documento = printf('1%09d', id) WHERE numero_documento = '0000000000' OR numero_documento = '' OR numero_documento IS NULL;`
  );
}

module.exports = {
  ensureTiposActividadDescripcion,
  ensureUsuarioDebeCambiarPassword,
  ensureUsuarioFotoYRoles,
  ensureColaboradorDocumento,
};
