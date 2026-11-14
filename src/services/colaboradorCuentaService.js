const bcrypt = require('bcryptjs');
const colaboradorRepository = require('../repositories/colaboradorRepository');
const usuarioRepository = require('../repositories/usuarioRepository');
const AppError = require('../utils/AppError');
const { Usuario } = require('../models');
const {
  rolesDeUsuario,
  rolPrincipal,
  serializarRolesAsignados,
} = require('../utils/rolesHelper');

const PASSWORD_DEMO_DEFAULT = 'Colab123!';
const ROLES_CUENTA_VALIDOS = [Usuario.ROLES.COLABORADOR, Usuario.ROLES.ADMINISTRADOR];

class ColaboradorCuentaService {
  normalizarRolesCuenta(rolesCuenta, rolCuentaLegacy) {
    let roles = Array.isArray(rolesCuenta) ? [...rolesCuenta] : [];
    if (!roles.length && rolCuentaLegacy) {
      roles = [rolCuentaLegacy];
    }
    if (!roles.length) {
      roles = [Usuario.ROLES.COLABORADOR];
    }
    roles = [...new Set(roles)].filter((r) => ROLES_CUENTA_VALIDOS.includes(r));
    if (!roles.length) {
      throw new AppError('Debe seleccionar al menos un rol', 400, 'VALIDATION_ERROR');
    }
    if (roles.includes(Usuario.ROLES.ADMINISTRADOR) && !roles.includes(Usuario.ROLES.COLABORADOR)) {
      roles.unshift(Usuario.ROLES.COLABORADOR);
    }
    return roles;
  }

  assertRolesPermitidos(roles, actorRol) {
    if (roles.includes(Usuario.ROLES.ADMINISTRADOR) && actorRol !== Usuario.ROLES.ADMINISTRADOR) {
      throw new AppError('Solo un administrador puede asignar rol de administrador', 403, 'FORBIDDEN');
    }
  }

  async crearCuentaUsuario(
    colaboradorId,
    password = PASSWORD_DEMO_DEFAULT,
    rolesCuenta,
    actorRol,
    rolCuentaLegacy
  ) {
    const colaborador = await colaboradorRepository.findById(colaboradorId);
    if (!colaborador) {
      throw new AppError('Colaborador no encontrado', 404, 'COLABORADOR_NOT_FOUND');
    }
    if (!colaborador.activo) {
      throw new AppError('No se puede crear acceso para un colaborador inactivo', 400, 'COLABORADOR_INACTIVO');
    }

    if (!password || password.length < 8) {
      throw new AppError('La contraseña debe tener al menos 8 caracteres', 400, 'VALIDATION_ERROR');
    }

    const roles = this.normalizarRolesCuenta(rolesCuenta, rolCuentaLegacy);
    this.assertRolesPermitidos(roles, actorRol);
    const rolPrimario = rolPrincipal({ rol: roles[0], roles_asignados: serializarRolesAsignados(roles) });
    const rolesJson = serializarRolesAsignados(roles);

    const existente = await usuarioRepository.findByEmailIncludingInactive(colaborador.email);
    const passwordHash = await bcrypt.hash(password, 10);
    const nombre = `${colaborador.nombres} ${colaborador.apellidos}`;

    if (existente) {
      if (existente.colaborador_id && existente.colaborador_id !== colaborador.id) {
        throw new AppError('El correo ya está registrado con otro colaborador', 409, 'EMAIL_IN_USE');
      }

      await existente.update({
        colaborador_id: colaborador.id,
        password_hash: passwordHash,
        nombre,
        rol: rolPrimario,
        roles_asignados: rolesJson,
        activo: true,
        debe_cambiar_password: true,
      });

      return {
        email: existente.email,
        rol: rolPrimario,
        roles,
        password_temporal: password,
        actualizado: true,
      };
    }

    const usuario = await usuarioRepository.create({
      email: colaborador.email,
      password_hash: passwordHash,
      nombre,
      rol: rolPrimario,
      roles_asignados: rolesJson,
      colaborador_id: colaborador.id,
      activo: true,
      debe_cambiar_password: true,
    });

    return {
      email: usuario.email,
      rol: usuario.rol,
      roles,
      password_temporal: password,
      actualizado: false,
    };
  }

  serializarColaborador(colaborador) {
    const json = colaborador.toJSON();
    const cuenta = json.cuenta;
    const cuentaRoles = cuenta ? rolesDeUsuario(cuenta) : [];
    return {
      ...json,
      cuenta: undefined,
      acceso_encuesta: Boolean(
        cuenta && cuenta.activo && cuentaRoles.includes(Usuario.ROLES.COLABORADOR)
      ),
      acceso_sistema: Boolean(cuenta && cuenta.activo),
      cuenta_rol: cuenta?.rol || null,
      cuenta_roles: cuentaRoles,
      cuenta_encuesta_email: cuenta?.email || null,
    };
  }
}

module.exports = new ColaboradorCuentaService();