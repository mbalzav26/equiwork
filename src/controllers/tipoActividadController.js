const tipoActividadService = require('../services/tipoActividadService');

class TipoActividadController {
  async pageActividades(req, res, next) {
    try {
      res.render('pages/actividades', {
        title: 'Catálogo de actividades',
        usuario: req.usuario,
      });
    } catch (err) {
      next(err);
    }
  }

  async listApi(req, res, next) {
    try {
      const data = await tipoActividadService.listarActivos();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async listAdminApi(req, res, next) {
    try {
      const data = await tipoActividadService.listarTodosAdmin();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async createApi(req, res, next) {
    try {
      const data = await tipoActividadService.crear(req.body.nombre, req.body.descripcion);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async deactivateApi(req, res, next) {
    try {
      const data = await tipoActividadService.desactivar(req.params.id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async activateApi(req, res, next) {
    try {
      const data = await tipoActividadService.activar(req.params.id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async updateDescripcionApi(req, res, next) {
    try {
      const data = await tipoActividadService.actualizarDescripcion(req.params.id, req.body.descripcion);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new TipoActividadController();
