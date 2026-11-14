const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ROLES = Object.freeze({
  ADMINISTRADOR: 'ADMINISTRADOR',
  SUPERVISOR: 'SUPERVISOR',
  COLABORADOR: 'COLABORADOR',
});

const Usuario = sequelize.define(
  'Usuario',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    rol: {
      type: DataTypes.ENUM(ROLES.ADMINISTRADOR, ROLES.SUPERVISOR, ROLES.COLABORADOR),
      allowNull: false,
      defaultValue: ROLES.SUPERVISOR,
    },
    colaborador_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    debe_cambiar_password: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    foto_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    roles_asignados: {
      type: DataTypes.STRING(120),
      allowNull: true,
    },
  },
  {
    tableName: 'usuarios',
    indexes: [
      { unique: true, fields: ['email'] },
      { fields: ['colaborador_id'] },
      { fields: ['rol'] },
    ],
  }
);

Usuario.ROLES = ROLES;

module.exports = Usuario;
