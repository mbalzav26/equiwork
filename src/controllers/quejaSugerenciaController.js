const quejaSugerenciaService = require('../services/quejaSugerenciaService');

class QuejaSugerenciaController {
  async pageColaborador(req, res, next) {
    try {
      res.render('pages/quejas-sugerencias', {
        title: 'Quejas y sugerencias',
        usuario: req.usuario,
      });
    } catch (err) {
      next(err);
    }
  }

  async pageAdmin(req, res, next) {
    try {
      res.render('pages/quejas-admin', {
        title: 'Quejas y sugerencias',
        usuario: req.usuario,
      });
    } catch (err) {
      next(err);
    }
  }

  async createApi(req, res, next) {
    try {
      const data = await quejaSugerenciaService.crear(req.usuario, req.body);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async listAdminApi(req, res, next) {
    try {
      const data = await quejaSugerenciaService.listarAdmin();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async listMiasApi(req, res, next) {
    try {
      const data = await quejaSugerenciaService.listarMias(req.usuario.id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new QuejaSugerenciaController();
