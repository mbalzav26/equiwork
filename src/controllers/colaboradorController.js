const colaboradorService = require('../services/colaboradorService');
const colaboradorCuentaService = require('../services/colaboradorCuentaService');
const { usuarioTieneRol } = require('../utils/rolesHelper');
const { Usuario } = require('../models');

class ColaboradorController {
  async listApi(req, res, next) {
    try {
      const busqueda =
        usuarioTieneRol(req.usuario, Usuario.ROLES.ADMINISTRADOR) && req.query.q
          ? String(req.query.q).trim()
          : null;
      const data = await colaboradorService.listar({
        incluirInactivos: req.query.inactivos === '1',
        busqueda,
      });
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getApi(req, res, next) {
    try {
      const data = await colaboradorService.obtenerPorId(req.params.id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async createApi(req, res, next) {
    try {
      const data = await colaboradorService.crear(req.body, req.usuario);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async updateApi(req, res, next) {
    try {
      const data = await colaboradorService.actualizar(req.params.id, req.body);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async deleteApi(req, res, next) {
    try {
      await colaboradorService.desactivar(req.params.id);
      res.json({ success: true, message: 'Colaborador desactivado' });
    } catch (err) {
      next(err);
    }
  }

  async crearCuentaEncuestaApi(req, res, next) {
    try {
      const password = req.body?.password;
      const data = await colaboradorCuentaService.crearCuentaUsuario(
        req.params.id,
        password,
        req.body?.roles_cuenta,
        req.usuario.rol,
        req.body?.rol_cuenta
      );
      res.status(201).json({
        success: true,
        data,
        message: 'Usuario de encuesta listo para pruebas',
      });
    } catch (err) {
      next(err);
    }
  }

  async pageList(req, res, next) {
    try {
      res.render('pages/colaboradores', {
        title: 'Colaboradores',
        usuario: req.usuario,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ColaboradorController();
