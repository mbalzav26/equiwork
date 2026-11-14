const path = require('path');
const { Sequelize } = require('sequelize');
const env = require('./env');

const commonDefine = {
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
};

function createSequelize() {
  if (env.db.dialect === 'mysql') {
    return new Sequelize(env.db.name, env.db.user, env.db.password, {
      host: env.db.host,
      port: env.db.port,
      dialect: 'mysql',
      logging: env.nodeEnv === 'development' ? console.log : false,
      define: commonDefine,
      pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
    });
  }

  const storagePath = path.isAbsolute(env.db.storage)
    ? env.db.storage
    : path.join(process.cwd(), env.db.storage);

  return new Sequelize({
    dialect: 'sqlite',
    storage: storagePath,
    logging: env.nodeEnv === 'development' ? console.log : false,
    define: commonDefine,
  });
}

const sequelize = createSequelize();

module.exports = sequelize;
