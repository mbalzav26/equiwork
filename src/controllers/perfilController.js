const perfilService = require('../services/perfilService');

class PerfilController {
  async pagePerfil(req, res, next) {
    try {
      res.render('pages/perfil', {
        title: 'Mi perfil',
        usuario: req.usuario,
      });
    } catch (err) {
      next(err);
    }
  }

  async getApi(req, res, next) {
    try {
      const data = await perfilService.obtener(req.usuario.id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async updateApi(req, res, next) {
    try {
      const data = await perfilService.actualizar(req.usuario.id, req.body);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async uploadFotoApi(req, res, next) {
    try {
      if (!req.file) {
        const AppError = require('../utils/AppError');
        return next(new AppError('Selecciona una imagen', 400, 'VALIDATION_ERROR'));
      }
      const data = await perfilService.actualizarFoto(
        req.usuario.id,
        req.file.filename
      );
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async changePasswordApi(req, res, next) {
    try {
      const { password_actual, password_nueva } = req.body;
      const data = await perfilService.cambiarPassword(
        req.usuario.id,
        password_actual,
        password_nueva
      );
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new PerfilController();
