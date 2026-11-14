const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ESTADOS = Object.freeze({
  BORRADOR: 'BORRADOR',
  ENVIADO: 'ENVIADO',
});

const RegistroQuincenal = sequelize.define(
  'RegistroQuincenal',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    colaborador_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    quincena_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    estado: {
      type: DataTypes.ENUM(ESTADOS.BORRADOR, ESTADOS.ENVIADO),
      allowNull: false,
      defaultValue: ESTADOS.BORRADOR,
    },
    observaciones: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
  },
  {
    tableName: 'registros_quincenales',
    indexes: [
      { unique: true, fields: ['colaborador_id', 'quincena_id'] },
      { fields: ['quincena_id'] },
      { fields: ['colaborador_id'] },
      { fields: ['estado'] },
    ],
  }
);

RegistroQuincenal.ESTADOS = ESTADOS;

module.exports = RegistroQuincenal;
