const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Colaborador = sequelize.define(
  'Colaborador',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    nombres: {
      type: DataTypes.STRING(80),
      allowNull: false,
    },
    apellidos: {
      type: DataTypes.STRING(80),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    tipo_documento: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'CC',
    },
    numero_documento: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    cargo: {
      type: DataTypes.STRING(80),
      allowNull: false,
    },
    area: {
      type: DataTypes.STRING(80),
      allowNull: false,
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: 'colaboradores',
    indexes: [
      { unique: true, fields: ['email'] },
      { fields: ['activo'] },
      { fields: ['area'] },
      { fields: ['tipo_documento', 'numero_documento'] },
    ],
  }
);

Colaborador.prototype.nombreCompleto = function nombreCompleto() {
  return `${this.nombres} ${this.apellidos}`;
};

module.exports = Colaborador;
