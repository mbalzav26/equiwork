const sequelize = require('../config/database');
const Usuario = require('./Usuario');
const Colaborador = require('./Colaborador');
const Quincena = require('./Quincena');
const RegistroQuincenal = require('./RegistroQuincenal');
const Evento = require('./Evento');
const TipoActividad = require('./TipoActividad');
const QuejaSugerencia = require('./QuejaSugerencia');

Colaborador.hasMany(RegistroQuincenal, { foreignKey: 'colaborador_id', as: 'registros' });
RegistroQuincenal.belongsTo(Colaborador, { foreignKey: 'colaborador_id', as: 'colaborador' });

Quincena.hasMany(RegistroQuincenal, { foreignKey: 'quincena_id', as: 'registros' });
RegistroQuincenal.belongsTo(Quincena, { foreignKey: 'quincena_id', as: 'quincena' });

RegistroQuincenal.hasMany(Evento, { foreignKey: 'registro_quincenal_id', as: 'eventos' });
Evento.belongsTo(RegistroQuincenal, { foreignKey: 'registro_quincenal_id', as: 'registro' });

Colaborador.hasOne(Usuario, { foreignKey: 'colaborador_id', as: 'cuenta' });
Usuario.belongsTo(Colaborador, { foreignKey: 'colaborador_id', as: 'colaborador' });

Usuario.hasMany(QuejaSugerencia, { foreignKey: 'usuario_id', as: 'quejas' });
QuejaSugerencia.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
QuejaSugerencia.belongsTo(Colaborador, { foreignKey: 'colaborador_id', as: 'colaborador' });

module.exports = {
  sequelize,
  Usuario,
  Colaborador,
  Quincena,
  RegistroQuincenal,
  Evento,
  TipoActividad,
  QuejaSugerencia,
};
