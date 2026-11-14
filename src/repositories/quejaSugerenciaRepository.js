const { QuejaSugerencia, Usuario, Colaborador } = require('../models');

class QuejaSugerenciaRepository {
  async create(data) {
    return QuejaSugerencia.create(data);
  }

  async listByUsuarioId(usuarioId) {
    return QuejaSugerencia.findAll({
      where: { usuario_id: usuarioId },
      order: [['created_at', 'DESC']],
      attributes: ['id', 'tipo', 'mensaje', 'anonimo', 'created_at'],
    });
  }

  async listAllAdmin() {
    return QuejaSugerencia.findAll({
      order: [['created_at', 'DESC']],
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'email'],
          required: true,
        },
        {
          model: Colaborador,
          as: 'colaborador',
          attributes: ['id', 'nombres', 'apellidos', 'area'],
          required: false,
        },
      ],
    });
  }
}

module.exports = new QuejaSugerenciaRepository();
