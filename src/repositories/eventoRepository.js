const { Evento, RegistroQuincenal, Colaborador, Quincena } = require('../models');

class EventoRepository {
  async create(data) {
    return Evento.create(data);
  }

  async findById(id) {
    return Evento.findByPk(id, {
      include: [
        {
          model: RegistroQuincenal,
          as: 'registro',
          include: [
            { model: Colaborador, as: 'colaborador' },
            { model: Quincena, as: 'quincena' },
          ],
        },
      ],
    });
  }

  async deleteById(id) {
    const evento = await Evento.findByPk(id);
    if (!evento) return null;
    await evento.destroy();
    return evento;
  }
}

module.exports = new EventoRepository();
