const miCargaService = require('../services/miCargaService');

class MiCargaController {
  async pageMiCarga(req, res, next) {
    try {
      res.render('pages/mi-carga', {
        title: 'Mi carga',
        usuario: req.usuario,
      });
    } catch (err) {
      next(err);
    }
  }

  async pageCatalogoActividades(req, res, next) {
    try {
      res.render('pages/catalogo-actividades', {
        title: 'Catálogo de actividades',
        usuario: req.usuario,
      });
    } catch (err) {
      next(err);
    }
  }

  async miCargaApi(req, res, next) {
    try {
      const quincenaId = req.query.quincenaId || null;
      const data = await miCargaService.obtenerMiCarga(req.usuario, quincenaId);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async historialQuincenasApi(req, res, next) {
    try {
      const data = await miCargaService.historialQuincenas(req.usuario);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async notificacionesApi(req, res, next) {
    try {
      const data = await miCargaService.notificaciones(req.usuario);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async exportJsonApi(req, res, next) {
    try {
      const data = await miCargaService.exportarQuincenaJson(req.usuario, req.params.quincenaId);
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="equiwork-mi-carga-q${req.params.quincenaId}.json"`
      );
      res.send(JSON.stringify(data, null, 2));
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new MiCargaController();