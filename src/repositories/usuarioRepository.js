const { Usuario } = require('../models');

class UsuarioRepository {
  async findByEmail(email) {
    return Usuario.findOne({ where: { email, activo: true } });
  }

  async findById(id) {
    return Usuario.findByPk(id);
  }

  async create(data) {
    return Usuario.create(data);
  }

  async findByEmailIncludingInactive(email) {
    return Usuario.findOne({ where: { email } });
  }

  async findCuentaByColaboradorId(colaboradorId) {
    return Usuario.findOne({
      where: { colaborador_id: colaboradorId, rol: Usuario.ROLES.COLABORADOR },
    });
  }
}

module.exports = new UsuarioRepository();
