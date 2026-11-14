const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const usuarioRepository = require('../repositories/usuarioRepository');
const AppError = require('../utils/AppError');
const { mapUsuarioSesion } = require('../utils/authHelper');
const { usuarioTieneRol } = require('../utils/rolesHelper');
const { Usuario } = require('../models');

class AuthService {
  async login(email, password) {
    const usuario = await usuarioRepository.findByEmail(email);
    if (!usuario) {
      throw new AppError('Credenciales inválidas', 401, 'AUTH_INVALID');
    }

    const valido = await bcrypt.compare(password, usuario.password_hash);
    if (!valido) {
      throw new AppError('Credenciales inválidas', 401, 'AUTH_INVALID');
    }

    if (usuarioTieneRol(mapUsuarioSesion(usuario), Usuario.ROLES.COLABORADOR) && !usuario.colaborador_id) {
      throw new AppError('Cuenta de colaborador incompleta. Contacte al supervisor.', 403, 'AUTH_INCOMPLETE');
    }

    const sesion = mapUsuarioSesion(usuario);
    const token = jwt.sign(
      {
        sub: sesion.id,
        email: sesion.email,
        rol: sesion.rol,
        roles: sesion.roles,
        nombre: sesion.nombre,
        colaborador_id: sesion.colaborador_id,
        foto_url: sesion.foto_url,
      },
      env.jwt.secret,
      { expiresIn: env.jwt.expiresIn }
    );

    return { token, usuario: sesion };
  }

  async cambiarPassword(usuarioId, passwordActual, passwordNueva) {
    const usuario = await usuarioRepository.findById(usuarioId);
    if (!usuario || !usuario.activo) {
      throw new AppError('Usuario no encontrado', 404, 'NOT_FOUND');
    }

    const valido = await bcrypt.compare(passwordActual, usuario.password_hash);
    if (!valido) {
      throw new AppError('La contraseña actual no es correcta', 400, 'AUTH_INVALID');
    }

    if (!passwordNueva || passwordNueva.length < 8) {
      throw new AppError('La nueva contraseña debe tener al menos 8 caracteres', 400, 'VALIDATION_ERROR');
    }

    if (passwordActual === passwordNueva) {
      throw new AppError('La nueva contraseña debe ser diferente a la temporal', 400, 'VALIDATION_ERROR');
    }

    const passwordHash = await bcrypt.hash(passwordNueva, 10);
    await usuario.update({
      password_hash: passwordHash,
      debe_cambiar_password: false,
    });
    await usuario.reload();

    return mapUsuarioSesion(usuario);
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, env.jwt.secret);
    } catch {
      throw new AppError('Sesión expirada o inválida', 401, 'AUTH_EXPIRED');
    }
  }
}

module.exports = new AuthService();
