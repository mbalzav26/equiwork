require('dotenv').config();
const bcrypt = require('bcryptjs');
const {
  sequelize,
  Usuario,
  Colaborador,
  Quincena,
  RegistroQuincenal,
  Evento,
} = require('../models');
const { obtenerRangoQuincena } = require('../utils/quincenaHelper');
const { syncSchema, ensureInitialAdmin } = require('../bootstrap/databaseBootstrap');

const profile = process.env.SEED_PROFILE || 'development';

async function seedDevelopmentExtras() {
  const supHash = await bcrypt.hash('Super123!', 10);
  await Usuario.findOrCreate({
    where: { email: 'supervisor@equiwork.local' },
    defaults: {
      password_hash: supHash,
      nombre: 'Supervisor General',
      rol: Usuario.ROLES.SUPERVISOR,
    },
  });

  const colaboradores = [
    {
      nombres: 'Ana',
      apellidos: 'Gómez',
      email: 'ana.gomez@empresa.local',
      tipo_documento: 'CC',
      numero_documento: '10000000001',
      cargo: 'Desarrolladora',
      area: 'TI',
    },
    {
      nombres: 'Carlos',
      apellidos: 'Ruiz',
      email: 'carlos.ruiz@empresa.local',
      tipo_documento: 'CC',
      numero_documento: '10000000002',
      cargo: 'Analista QA',
      area: 'Calidad',
    },
    {
      nombres: 'Laura',
      apellidos: 'Mendoza',
      email: 'laura.mendoza@empresa.local',
      tipo_documento: 'CC',
      numero_documento: '10000000003',
      cargo: 'Diseñadora UX',
      area: 'Producto',
    },
  ];

  for (const c of colaboradores) {
    await Colaborador.findOrCreate({ where: { email: c.email }, defaults: c });
  }

  const colabHash = await bcrypt.hash('Colab123!', 10);
  const perfilesColab = await Colaborador.findAll();
  for (const col of perfilesColab) {
    await Usuario.findOrCreate({
      where: { email: col.email },
      defaults: {
        password_hash: colabHash,
        nombre: `${col.nombres} ${col.apellidos}`,
        rol: Usuario.ROLES.COLABORADOR,
        colaborador_id: col.id,
        debe_cambiar_password: true,
      },
    });
  }

  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = hoy.getMonth() + 1;
  const numero = hoy.getDate() <= 15 ? 1 : 2;
  const rango = obtenerRangoQuincena(anio, mes, numero);
  const [quincena] = await Quincena.findOrCreate({
    where: { anio, mes, numero_quincena: numero },
    defaults: { fecha_inicio: rango.fechaInicio, fecha_fin: rango.fechaFin },
  });

  const todosColab = await Colaborador.findAll();
  const demoPorColaborador = [
    [
      { horas: 8, tipo: 'Recreación', descripcion: 'Actividad recreativa parque' },
      { horas: 8, tipo: 'Show deportivo', descripcion: 'Presentación escuela' },
    ],
    [
      { horas: 8, tipo: 'Personaje general', descripcion: 'Animación cumpleaños' },
      { horas: 8, tipo: 'Operador de feria', descripcion: 'Juegos mecánicos' },
    ],
    [
      { horas: 6, tipo: 'Personaje navideño', descripcion: 'Evento corporativo' },
    ],
  ];

  for (let i = 0; i < todosColab.length; i += 1) {
    const col = todosColab[i];
    const [registro] = await RegistroQuincenal.findOrCreate({
      where: { colaborador_id: col.id, quincena_id: quincena.id },
      defaults: { estado: RegistroQuincenal.ESTADOS.ENVIADO },
    });
    const eventosDemo = demoPorColaborador[i % demoPorColaborador.length];
    for (const demo of eventosDemo) {
      await Evento.findOrCreate({
        where: {
          registro_quincenal_id: registro.id,
          descripcion: demo.descripcion,
        },
        defaults: {
          tipo_evento: demo.tipo,
          horas: demo.horas,
          fecha_evento: rango.fechaInicio,
        },
      });
    }
  }
}

async function seed() {
  await syncSchema();
  const admin = await ensureInitialAdmin();
  if (profile === 'production') {
    console.log('[EquiWork] Seed producción: administrador inicial listo');
    console.log(`  Email: ${admin.email}`);
    console.log('  Contraseña: la definida en ADMIN_INITIAL_PASSWORD (o Admin123! por defecto)');
    process.exit(0);
    return;
  }

  await seedDevelopmentExtras();
  console.log('[EquiWork] Seed desarrollo completado');
  console.log(`  Admin: ${admin.email}`);
  console.log('  Supervisor: supervisor@equiwork.local / Super123!');
  console.log('  Colaborador: ana.gomez@empresa.local / Colab123!');
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});