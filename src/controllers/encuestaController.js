const encuestaService = require('../services/encuestaService');

class EncuestaController {
  async pageEncuesta(req, res, next) {
    try {
      res.render('pages/encuesta', {
        title: 'Encuesta quincenal',
        usuario: req.usuario,
      });
    } catch (err) {
      next(err);
    }
  }

  async createApi(req, res, next) {
    try {
      const data = await encuestaService.registrarMiEvento(req.usuario, req.body);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async historialApi(req, res, next) {
    try {
      const data = await encuestaService.miHistorial(req.usuario, req.params.quincenaId);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async resumenApi(req, res, next) {
    try {
      const data = await encuestaService.resumenEncuesta(req.usuario, req.params.quincenaId);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async deleteApi(req, res, next) {
    try {
      await encuestaService.eliminarMiEvento(req.usuario, req.params.id);
      res.json({ success: true, message: 'Evento eliminado' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new EncuestaController();
