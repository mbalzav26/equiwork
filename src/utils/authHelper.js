const { Usuario } = require('../models');
const { rolesDeUsuario, usuarioEsSoloColaborador } = require('./rolesHelper');

function homePathForRole(usuarioOrRol) {
  if (typeof usuarioOrRol === 'string') {
    if (usuarioOrRol === Usuario.ROLES.COLABORADOR) return '/encuesta';
    return '/dashboard';
  }
  if (usuarioEsSoloColaborador(usuarioOrRol)) return '/encuesta';
  return '/dashboard';
}

function mapUsuarioSesion(usuario) {
  const roles = rolesDeUsuario(usuario);
  return {
    id: usuario.id,
    email: usuario.email,
    nombre: usuario.nombre,
    rol: usuario.rol,
    roles,
    roles_asignados: usuario.roles_asignados ?? null,
    colaborador_id: usuario.colaborador_id ?? null,
    debe_cambiar_password: Boolean(usuario.debe_cambiar_password),
    foto_url: usuario.foto_url || null,
  };
}

function redirectAfterLogin(usuario) {
  if (usuario.debe_cambiar_password) {
    return '/cambiar-contrasena';
  }
  return homePathForRole(usuario);
}

module.exports = {
  homePathForRole,
  mapUsuarioSesion,
  redirectAfterLogin,
};