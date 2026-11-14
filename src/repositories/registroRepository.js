const { RegistroQuincenal, Evento, Colaborador, Quincena } = require('../models');
const { fn, col, literal } = require('sequelize');

class RegistroRepository {
  async findOrCreate(colaboradorId, quincenaId) {
    const [registro] = await RegistroQuincenal.findOrCreate({
      where: { colaborador_id: colaboradorId, quincena_id: quincenaId },
      defaults: { estado: RegistroQuincenal.ESTADOS.BORRADOR },
    });
    return registro;
  }

  async findByIdWithRelations(id) {
    return RegistroQuincenal.findByPk(id, {
      include: [
        { model: Colaborador, as: 'colaborador' },
        { model: Quincena, as: 'quincena' },
        { model: Evento, as: 'eventos', separate: true, order: [['fecha_evento', 'ASC']] },
      ],
    });
  }

  /**
   * Resumen agregado por colaborador activo (LEFT JOIN + GROUP BY, sin N+1).
   */
  async resumenPorQuincena(quincenaId) {
    return Colaborador.findAll({
      where: { activo: true },
      attributes: [
        'id',
        'nombres',
        'apellidos',
        'cargo',
        'area',
        [fn('COALESCE', fn('SUM', col('registros.eventos.horas')), 0), 'total_horas'],
        [fn('COUNT', col('registros.eventos.id')), 'total_eventos'],
      ],
      include: [
        {
          model: RegistroQuincenal,
          as: 'registros',
          attributes: [],
          where: { quincena_id: quincenaId },
          required: false,
          include: [
            {
              model: Evento,
              as: 'eventos',
              attributes: [],
              required: false,
            },
          ],
        },
      ],
      group: ['Colaborador.id'],
      order: [[literal('total_horas'), 'DESC']],
      subQuery: false,
    });
  }

  async findByColaboradorYQuincena(colaboradorId, quincenaId) {
    return RegistroQuincenal.findOne({
      where: { colaborador_id: colaboradorId, quincena_id: quincenaId },
    });
  }

  async historialResumenColaborador(colaboradorId, limite = 18) {
    return RegistroQuincenal.findAll({
      where: { colaborador_id: colaboradorId },
      include: [
        { model: Quincena, as: 'quincena', required: true },
        { model: Evento, as: 'eventos', required: false, attributes: ['id', 'horas'] },
      ],
      order: [
        [{ model: Quincena, as: 'quincena' }, 'anio', 'DESC'],
        [{ model: Quincena, as: 'quincena' }, 'mes', 'DESC'],
        [{ model: Quincena, as: 'quincena' }, 'numero_quincena', 'DESC'],
      ],
      limit: limite,
      subQuery: false,
    });
  }

  async listarDetalleQuincena(quincenaId) {
    return RegistroQuincenal.findAll({
      where: { quincena_id: quincenaId },
      include: [
        { model: Colaborador, as: 'colaborador' },
        { model: Quincena, as: 'quincena' },
        { model: Evento, as: 'eventos' },
      ],
      order: [
        [{ model: Colaborador, as: 'colaborador' }, 'apellidos', 'ASC'],
        [{ model: Evento, as: 'eventos' }, 'fecha_evento', 'ASC'],
      ],
    });
  }
}

module.exports = new RegistroRepository();
