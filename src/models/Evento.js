const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Evento = sequelize.define(
  'Evento',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    registro_quincenal_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    tipo_evento: {
      type: DataTypes.STRING(80),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    horas: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      validate: { min: 0.25, max: 24 },
    },
    fecha_evento: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    nombre_empresa: {
      type: DataTypes.STRING(120),
      allowNull: true,
    },
    direccion: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    auxilio_transporte: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    comentarios_transporte: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
  },
  {
    tableName: 'eventos',
    indexes: [
      { fields: ['registro_quincenal_id'] },
      { fields: ['fecha_evento'] },
      { fields: ['tipo_evento'] },
    ],
  }
);

module.exports = Evento;
