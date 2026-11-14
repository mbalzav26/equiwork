const { Quincena } = require('../models');

class QuincenaRepository {
  async findAll() {
    return Quincena.findAll({
      order: [
        ['anio', 'DESC'],
        ['mes', 'DESC'],
        ['numero_quincena', 'DESC'],
      ],
    });
  }

  async findById(id) {
    return Quincena.findByPk(id);
  }

  async findOrCreateByPeriodo(anio, mes, numeroQuincena, rango) {
    const [quincena] = await Quincena.findOrCreate({
      where: { anio, mes, numero_quincena: numeroQuincena },
      defaults: {
        fecha_inicio: rango.fechaInicio,
        fecha_fin: rango.fechaFin,
      },
    });
    return quincena;
  }
}

module.exports = new QuincenaRepository();
