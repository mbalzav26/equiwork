const colaboradorRepository = require('../repositories/colaboradorRepository');
const colaboradorCuentaService = require('./colaboradorCuentaService');
const AppError = require('../utils/AppError');
const { validarDocumento, normalizarNumero } = require('../utils/documentoColombia');
const { usuarioTieneRol } = require('../utils/rolesHelper');
const { Usuario } = require('../models');

class ColaboradorService {
  validarDatosDocumento(datos, excludeId = null) {
    const tipo = String(datos.tipo_documento || 'CC').toUpperCase();
    const numero = normalizarNumero(datos.numero_documento);
    const err = validarDocumento(tipo, numero);
    if (err) {
      throw new AppError(err, 400, 'VALIDATION_ERROR');
    }
    return { tipo_documento: tipo, numero_documento: numero };
  }

  async listar(opciones) {
    const filas = await colaboradorRepository.findAll(opciones);
    return filas.map((c) => colaboradorCuentaService.serializarColaborador(c));
  }

  async obtenerPorId(id) {
    const colaborador = await colaboradorRepository.findById(id);
    if (!colaborador) {
      throw new AppError('Colaborador no encontrado', 404, 'COLABORADOR_NOT_FOUND');
    }
    return colaborador;
  }

  async crear(payload, actorUsuario) {
    const {
      crear_cuenta_encuesta,
      password_encuesta,
      roles_cuenta,
      rol_cuenta,
      ...datosColaborador
    } = payload;

    const doc = this.validarDatosDocumento(datosColaborador);
    Object.assign(datosColaborador, doc);

    const existente = await colaboradorRepository.findByEmail(datosColaborador.email);
    if (existente) {
      throw new AppError('El correo ya está registrado', 409, 'EMAIL_DUPLICATE');
    }
    const dupDoc = await colaboradorRepository.findByDocumento(
      datosColaborador.tipo_documento,
      datosColaborador.numero_documento
    );
    if (dupDoc) {
      throw new AppError('Ya existe un colaborador con ese documento', 409, 'DOCUMENT_DUPLICATE');
    }

    const colaborador = await colaboradorRepository.create({ ...datosColaborador, activo: true });

    let cuentaUsuario = null;
    if (crear_cuenta_encuesta) {
      const actorRol = actorUsuario?.rol || Usuario.ROLES.ADMINISTRADOR;
      cuentaUsuario = await colaboradorCuentaService.crearCuentaUsuario(
        colaborador.id,
        password_encuesta,
        roles_cuenta,
        usuarioTieneRol(actorUsuario, Usuario.ROLES.ADMINISTRADOR)
          ? Usuario.ROLES.ADMINISTRADOR
          : actorRol,
        rol_cuenta
      );
    }

    const conCuenta = await colaboradorRepository.findByIdWithCuenta(colaborador.id);
    const serializado = colaboradorCuentaService.serializarColaborador(conCuenta || colaborador);
    return { ...serializado, cuenta_encuesta: cuentaUsuario };
  }

  async actualizar(id, payload) {
    const { crear_cuenta_encuesta, password_encuesta, roles_cuenta, rol_cuenta, ...datosColaborador } =
      payload;
    await this.obtenerPorId(id);

    if (datosColaborador.tipo_documento || datosColaborador.numero_documento) {
      const actual = await colaboradorRepository.findById(id);
      const merged = {
        tipo_documento: datosColaborador.tipo_documento || actual.tipo_documento,
        numero_documento: datosColaborador.numero_documento || actual.numero_documento,
      };
      const doc = this.validarDatosDocumento(merged, id);
      Object.assign(datosColaborador, doc);
      const dupDoc = await colaboradorRepository.findByDocumento(doc.tipo_documento, doc.numero_documento, id);
      if (dupDoc) {
        throw new AppError('Ya existe un colaborador con ese documento', 409, 'DOCUMENT_DUPLICATE');
      }
    }

    if (datosColaborador.email) {
      const existente = await colaboradorRepository.findByEmail(datosColaborador.email, id);
      if (existente) {
        throw new AppError('El correo ya está registrado', 409, 'EMAIL_DUPLICATE');
      }
    }
    return colaboradorRepository.update(id, datosColaborador);
  }

  async desactivar(id) {
    await this.obtenerPorId(id);
    return colaboradorRepository.softDelete(id);
  }
}

module.exports = new ColaboradorService();