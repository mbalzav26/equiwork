const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Quincena = sequelize.define(
  'Quincena',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    anio: {
      type: DataTypes.SMALLINT.UNSIGNED,
      allowNull: false,
    },
    mes: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      validate: { min: 1, max: 12 },
    },
    numero_quincena: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      validate: { isIn: [[1, 2]] },
    },
    fecha_inicio: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    fecha_fin: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
  },
  {
    tableName: 'quincenas',
    indexes: [
      { unique: true, fields: ['anio', 'mes', 'numero_quincena'] },
      { fields: ['fecha_inicio', 'fecha_fin'] },
    ],
  }
);

module.exports = Quincena;
