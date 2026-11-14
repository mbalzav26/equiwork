const { Usuario } = require('../models');

const ORDEN_PRIORIDAD = [
  Usuario.ROLES.ADMINISTRADOR,
  Usuario.ROLES.SUPERVISOR,
  Usuario.ROLES.COLABORADOR,
];

function parseRolesAsignados(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function rolesDeUsuario(usuarioOrSesion) {
  const base = usuarioOrSesion?.rol;
  const extra = parseRolesAsignados(usuarioOrSesion?.roles_asignados);
  const set = new Set([base, ...extra].filter(Boolean));
  return [...set];
}

function rolPrincipal(usuarioOrSesion) {
  const roles = rolesDeUsuario(usuarioOrSesion);
  for (const r of ORDEN_PRIORIDAD) {
    if (roles.includes(r)) return r;
  }
  return usuarioOrSesion?.rol || Usuario.ROLES.COLABORADOR;
}

function usuarioTieneRol(usuarioOrSesion, rol) {
  return rolesDeUsuario(usuarioOrSesion).includes(rol);
}

function usuarioEsSoloColaborador(usuarioOrSesion) {
  const roles = rolesDeUsuario(usuarioOrSesion);
  return roles.length === 1 && roles[0] === Usuario.ROLES.COLABORADOR;
}

function serializarRolesAsignados(roles) {
  const limpio = [...new Set(roles)].filter((r) =>
    [Usuario.ROLES.COLABORADOR, Usuario.ROLES.ADMINISTRADOR, Usuario.ROLES.SUPERVISOR].includes(r)
  );
  return JSON.stringify(limpio);
}

module.exports = {
  rolesDeUsuario,
  rolPrincipal,
  usuarioTieneRol,
  usuarioEsSoloColaborador,
  serializarRolesAsignados,
  parseRolesAsignados,
};