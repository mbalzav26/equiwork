require('dotenv').config();
const { syncSchema } = require('../bootstrap/databaseBootstrap');

async function sync() {
  try {
    await syncSchema();
    console.log('[EquiWork] Esquema sincronizado correctamente');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

sync();