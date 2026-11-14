const authService = require('../services/authService');
const env = require('../config/env');
const { homePathForRole, redirectAfterLogin } = require('../utils/authHelper');

function authCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.nodeEnv === 'production',
    maxAge: 8 * 60 * 60 * 1000,
  };
}

class AuthController {
  showLogin(req, res) {
    if (req.cookies?.equiwork_token) {
      try {
        const payload = authService.verifyToken(req.cookies.equiwork_token);
        if (payload.debe_cambiar_password) {
          return res.redirect('/cambiar-contrasena');
        }
        return res.redirect(homePathForRole(payload.rol));
      } catch {
        res.clearCookie('equiwork_token');
      }
    }
    res.render('pages/login', { title: 'Iniciar sesión', error: null });
  }

  async loginWeb(req, res, next) {
    try {
      const { email, password } = req.body;
      const { token, usuario } = await authService.login(email, password);
      res.cookie('equiwork_token', token, authCookieOptions());
      if (req.session) req.session.usuario = usuario;
      res.redirect(redirectAfterLogin(usuario));
    } catch (err) {
      res.status(401).render('pages/login', {
        title: 'Iniciar sesión',
        error: err.message,
      });
    }
  }

  async loginApi(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  logout(req, res) {
    res.clearCookie('equiwork_token');
    if (req.session) req.session.destroy(() => {});
    res.redirect('/login');
  }

  me(req, res) {
    res.json({ success: true, data: req.usuario });
  }

  showChangePassword(req, res) {
    if (!req.usuario?.debe_cambiar_password) {
      return res.redirect(redirectAfterLogin(req.usuario));
    }
    res.render('pages/cambiar-contrasena', {
      title: 'Nueva contraseña',
      error: null,
      usuario: req.usuario,
    });
  }

  async changePasswordWeb(req, res, next) {
    try {
      const { password_actual, password_nueva } = req.body;
      const usuario = await authService.cambiarPassword(
        req.usuario.id,
        password_actual,
        password_nueva
      );
      if (req.session) req.session.usuario = usuario;
      res.redirect(redirectAfterLogin(usuario));
    } catch (err) {
      res.status(400).render('pages/cambiar-contrasena', {
        title: 'Nueva contraseña',
        error: err.message,
        usuario: req.usuario,
      });
    }
  }

  async changePasswordApi(req, res, next) {
    try {
      const { password_actual, password_nueva } = req.body;
      const usuario = await authService.cambiarPassword(
        req.usuario.id,
        password_actual,
        password_nueva
      );
      res.json({ success: true, data: usuario });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
