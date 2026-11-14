const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TIPOS = Object.freeze({
  QUEJA: 'QUEJA',
  SUGERENCIA: 'SUGERENCIA',
});

const QuejaSugerencia = sequelize.define(
  'QuejaSugerencia',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    usuario_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    colaborador_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    tipo: {
      type: DataTypes.ENUM(TIPOS.QUEJA, TIPOS.SUGERENCIA),
      allowNull: false,
    },
    mensaje: {
      type: DataTypes.STRING(2000),
      allowNull: false,
    },
    anonimo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: 'quejas_sugerencias',
    indexes: [{ fields: ['created_at'] }, { fields: ['tipo'] }, { fields: ['usuario_id'] }],
  }
);

QuejaSugerencia.TIPOS = TIPOS;

module.exports = QuejaSugerencia;
