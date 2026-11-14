const app = require('./app');
const env = require('./config/env');
const { sequelize } = require('./models');
const { bootstrapOnStartup } = require('./bootstrap/databaseBootstrap');

async function start() {
  try {
    await sequelize.authenticate();
    await bootstrapOnStartup();
    console.log('[EquiWork] Conexión a base de datos establecida');

    app.listen(env.port, '0.0.0.0', () => {
      console.log(`[EquiWork] Servidor en el puerto ${env.port}`);
    });
  } catch (err) {
    console.error('[EquiWork] No se pudo iniciar el servidor:', err.message);
    process.exit(1);
  }
}

start();