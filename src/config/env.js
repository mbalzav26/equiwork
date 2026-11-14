require('dotenv').config();

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3000,
  db: {
    dialect: process.env.DB_DIALECT || 'sqlite',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    name: process.env.DB_NAME || 'equiwork',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    storage: process.env.DB_STORAGE || 'database/equiwork.sqlite',
  },
  sessionSecret: process.env.SESSION_SECRET || 'dev-session-secret',
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-jwt-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  },
};

module.exports = env;
