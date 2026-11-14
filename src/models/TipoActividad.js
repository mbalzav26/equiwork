const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TipoActividad = sequelize.define(
  'TipoActividad',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING(80),
      allowNull: false,
      unique: true,
    },
    descripcion: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: 'tipos_actividad',
    indexes: [{ unique: true, fields: ['nombre'] }, { fields: ['activo'] }],
  }
);

module.exports = TipoActividad;
