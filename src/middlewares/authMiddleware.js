const authService = require('../services/authService');
const AppError = require('../utils/AppError');
const { Usuario } = require('../models');
const { mapUsuarioSesion } = require('../utils/authHelper');
const { usuarioTieneRol, usuarioEsSoloColaborador } = require('../utils/rolesHelper');

function extractToken(req) {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    return header.slice(7);
  }
  return req.cookies?.equiwork_token || null;
}

async function authenticate(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) {
      throw new AppError('Autenticación requerida', 401, 'AUTH_REQUIRED');
    }
    const payload = authService.verifyToken(token);
    const usuario = await Usuario.findByPk(payload.sub);
    if (!usuario || !usuario.activo) {
      throw new AppError('Usuario no autorizado', 401, 'AUTH_FORBIDDEN');
    }
    req.usuario = mapUsuarioSesion(usuario);
    next();
  } catch (err) {
    next(err);
  }
}

function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.usuario || !roles.some((rol) => usuarioTieneRol(req.usuario, rol))) {
      return next(new AppError('No tiene permisos para esta acción', 403, 'FORBIDDEN'));
    }
    next();
  };
}

/** Para vistas HTML: redirige a login si no hay cookie JWT válida. */
async function authenticateWeb(req, res, next) {
  try {
    const token = req.cookies?.equiwork_token;
    if (!token) {
      return res.redirect('/login');
    }
    const payload = authService.verifyToken(token);
    const usuario = await Usuario.findByPk(payload.sub);
    if (!usuario || !usuario.activo) {
      res.clearCookie('equiwork_token');
      return res.redirect('/login');
    }
    req.usuario = mapUsuarioSesion(usuario);
    return next();
  } catch {
    res.clearCookie('equiwork_token');
    return res.redirect('/login');
  }
}

function denyColaboradorStaff(req, res, next) {
  if (usuarioEsSoloColaborador(req.usuario)) {
    return res.redirect('/encuesta');
  }
  next();
}

function requireColaborador(req, res, next) {
  if (!usuarioTieneRol(req.usuario, Usuario.ROLES.COLABORADOR)) {
    return next(new AppError('Acceso reservado para colaboradores', 403, 'FORBIDDEN'));
  }
  next();
}

function requireColaboradorWeb(req, res, next) {
  if (!usuarioTieneRol(req.usuario, Usuario.ROLES.COLABORADOR)) {
    return res.redirect('/dashboard');
  }
  next();
}

function requireAdminWeb(req, res, next) {
  if (!usuarioTieneRol(req.usuario, Usuario.ROLES.ADMINISTRADOR)) {
    return res.redirect('/dashboard');
  }
  next();
}

function requirePasswordChangeWeb(req, res, next) {
  if (!req.usuario?.debe_cambiar_password) {
    return next();
  }
  const path = req.path.replace(/\/$/, '') || '/';
  if (path === '/cambiar-contrasena' || path === '/logout') {
    return next();
  }
  return res.redirect('/cambiar-contrasena');
}

function requirePasswordChangedApi(req, res, next) {
  if (!req.usuario?.debe_cambiar_password) {
    return next();
  }
  const allowed = new Set([
    '/auth/cambiar-contrasena',
    '/auth/me',
    '/perfil/foto',
    '/perfil',
    '/perfil/cambiar-contrasena',
  ]);
  if (allowed.has(req.path)) {
    return next();
  }
  return next(
    new AppError('Debe cambiar su contraseña antes de continuar', 403, 'PASSWORD_CHANGE_REQUIRED')
  );
}

module.exports = {
  authenticate,
  authenticateWeb,
  requireRoles,
  denyColaboradorStaff,
  requireColaborador,
  requireColaboradorWeb,
  requireAdminWeb,
  requirePasswordChangeWeb,
  requirePasswordChangedApi,
};