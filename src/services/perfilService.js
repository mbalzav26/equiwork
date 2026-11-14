const bcrypt = require('bcryptjs');
const usuarioRepository = require('../repositories/usuarioRepository');
const colaboradorRepository = require('../repositories/colaboradorRepository');
const AppError = require('../utils/AppError');
const { mapUsuarioSesion } = require('../utils/authHelper');
const { TIPOS_DOCUMENTO } = require('../utils/documentoColombia');

function etiquetaTipoDocumento(code) {
  const tipo = TIPOS_DOCUMENTO.find((t) => t.code === code);
  return tipo ? tipo.label : code || '—';
}

class PerfilService {
  async obtener(usuarioId) {
    const usuario = await usuarioRepository.findById(usuarioId);
    if (!usuario || !usuario.activo) {
      throw new AppError('Usuario no encontrado', 404, 'NOT_FOUND');
    }

    let colaborador = null;
    if (usuario.colaborador_id) {
      colaborador = await colaboradorRepository.findById(usuario.colaborador_id);
    }

    return {
      usuario: mapUsuarioSesion(usuario),
      colaborador: colaborador
        ? {
            id: colaborador.id,
            nombres: colaborador.nombres,
            apellidos: colaborador.apellidos,
            email: colaborador.email,
            cargo: colaborador.cargo,
            area: colaborador.area,
            tipo_documento: colaborador.tipo_documento,
            tipo_documento_label: etiquetaTipoDocumento(colaborador.tipo_documento),
            numero_documento: colaborador.numero_documento,
          }
        : null,
    };
  }

  async actualizarFoto(usuarioId, filename) {
    const usuario = await usuarioRepository.findById(usuarioId);
    if (!usuario || !usuario.activo) {
      throw new AppError('Usuario no encontrado', 404, 'NOT_FOUND');
    }
    const foto_url = `/uploads/avatars/${filename}`;
    await usuario.update({ foto_url });
    await usuario.reload();
    return mapUsuarioSesion(usuario);
  }

  async actualizar(usuarioId, payload) {
    const usuario = await usuarioRepository.findById(usuarioId);
    if (!usuario || !usuario.activo) {
      throw new AppError('Usuario no encontrado', 404, 'NOT_FOUND');
    }

    const nombre = String(payload.nombre ?? '').trim();
    const email = String(payload.email ?? '').trim().toLowerCase();

    if (nombre.length < 2 || nombre.length > 100) {
      throw new AppError('El nombre debe tener entre 2 y 100 caracteres', 400, 'VALIDATION_ERROR');
    }

    const otro = await usuarioRepository.findByEmailIncludingInactive(email);
    if (otro && otro.id !== usuario.id) {
      throw new AppError('El correo ya está en uso', 409, 'EMAIL_IN_USE');
    }

    await usuario.update({ nombre, email });

    if (usuario.colaborador_id && payload.colaborador) {
      const colab = await colaboradorRepository.findById(usuario.colaborador_id);
      if (colab) {
        const nombres = String(payload.colaborador.nombres ?? colab.nombres).trim();
        const apellidos = String(payload.colaborador.apellidos ?? colab.apellidos).trim();
        const cargo = String(payload.colaborador.cargo ?? colab.cargo).trim();
        const area = String(payload.colaborador.area ?? colab.area).trim();

        const emailColab = email;
        const dupColab = await colaboradorRepository.findByEmail(emailColab, colab.id);
        if (dupColab) {
          throw new AppError('El correo ya está registrado en colaboradores', 409, 'EMAIL_DUPLICATE');
        }

        await colab.update({
          nombres,
          apellidos,
          email: emailColab,
          cargo,
          area,
        });

        await usuario.update({ nombre: `${nombres} ${apellidos}`.trim() });
      }
    }

    return this.obtener(usuarioId);
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
      throw new AppError('La nueva contraseña debe ser diferente a la actual', 400, 'VALIDATION_ERROR');
    }

    const passwordHash = await bcrypt.hash(passwordNueva, 10);
    await usuario.update({
      password_hash: passwordHash,
      debe_cambiar_password: false,
    });
    await usuario.reload();

    return mapUsuarioSesion(usuario);
  }
}

module.exports = new PerfilService();
