const eventoService = require('../services/eventoService');

class EventoController {
  async pageRegistro(req, res, next) {
    try {
      res.render('pages/eventos', {
        title: 'Registro quincenal',
        usuario: req.usuario,
      });
    } catch (err) {
      next(err);
    }
  }

  async createApi(req, res, next) {
    try {
      const data = await eventoService.registrarEvento(req.body);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async deleteApi(req, res, next) {
    try {
      await eventoService.eliminarEvento(req.params.id);
      res.json({ success: true, message: 'Evento eliminado' });
    } catch (err) {
      next(err);
    }
  }

  async historialApi(req, res, next) {
    try {
      const { colaboradorId, quincenaId } = req.params;
      const data = await eventoService.historialColaborador(colaboradorId, quincenaId);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new EventoController();
