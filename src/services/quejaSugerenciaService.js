const quejaSugerenciaRepository = require('../repositories/quejaSugerenciaRepository');
const AppError = require('../utils/AppError');
const { QuejaSugerencia } = require('../models');

class QuejaSugerenciaService {
  async crear(usuario, payload) {
    const mensaje = String(payload.mensaje ?? '').trim();
    if (mensaje.length < 10) {
      throw new AppError('El mensaje debe tener al menos 10 caracteres', 400, 'VALIDATION_ERROR');
    }
    if (mensaje.length > 2000) {
      throw new AppError('El mensaje es demasiado largo', 400, 'VALIDATION_ERROR');
    }
    const tipo = payload.tipo;
    if (![QuejaSugerencia.TIPOS.QUEJA, QuejaSugerencia.TIPOS.SUGERENCIA].includes(tipo)) {
      throw new AppError('Tipo inválido', 400, 'VALIDATION_ERROR');
    }

    return quejaSugerenciaRepository.create({
      usuario_id: usuario.id,
      colaborador_id: usuario.colaborador_id ?? null,
      tipo,
      mensaje,
      anonimo: Boolean(payload.anonimo),
    });
  }

  async listarMias(usuarioId) {
    const rows = await quejaSugerenciaRepository.listByUsuarioId(usuarioId);
    return rows.map((row) => {
      const json = row.toJSON();
      return {
        id: json.id,
        tipo: json.tipo,
        mensaje: json.mensaje,
        anonimo: json.anonimo,
        created_at: json.created_at,
        estado: 'recibida',
      };
    });
  }

  async listarAdmin() {
    const rows = await quejaSugerenciaRepository.listAllAdmin();
    return rows.map((row) => {
      const json = row.toJSON();
      const autor = json.anonimo
        ? { etiqueta: 'Anónimo', email: null, area: null, documento: null }
        : {
            etiqueta: json.usuario?.nombre || 'Colaborador',
            email: json.usuario?.email || null,
            area: json.colaborador?.area || null,
            documento: json.colaborador
              ? `${json.colaborador.tipo_documento} ${json.colaborador.numero_documento}`
              : null,
          };
      return {
        id: json.id,
        tipo: json.tipo,
        mensaje: json.mensaje,
        anonimo: json.anonimo,
        created_at: json.created_at,
        autor,
      };
    });
  }
}

module.exports = new QuejaSugerenciaService();
