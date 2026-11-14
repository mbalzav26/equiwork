const { Colaborador, Usuario } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../models');

class ColaboradorRepository {
  async findAll({ incluirInactivos = false, busqueda = null } = {}) {
    const where = incluirInactivos ? {} : { activo: true };
    if (busqueda) {
      const q = String(busqueda).trim();
      const like = `%${q}%`;
      where[Op.or] = [
        { nombres: { [Op.like]: like } },
        { apellidos: { [Op.like]: like } },
        { numero_documento: { [Op.like]: like } },
        sequelize.where(
          sequelize.fn(
            'lower',
            sequelize.fn('trim', sequelize.literal("nombres || ' ' || apellidos"))
          ),
          { [Op.like]: like.toLowerCase() }
        ),
      ];
    }
    return Colaborador.findAll({
      where,
      order: [['apellidos', 'ASC'], ['nombres', 'ASC']],
      include: [
        {
          model: Usuario,
          as: 'cuenta',
          required: false,
          attributes: ['id', 'email', 'activo', 'rol', 'roles_asignados'],
        },
      ],
    });
  }

  async findById(id) {
    return Colaborador.findByPk(id);
  }

  async findByIdWithCuenta(id) {
    return Colaborador.findByPk(id, {
      include: [
        {
          model: Usuario,
          as: 'cuenta',
          required: false,
          attributes: ['id', 'email', 'activo', 'rol', 'roles_asignados'],
        },
      ],
    });
  }

  async findByEmail(email, excludeId = null) {
    const where = { email };
    if (excludeId) {
      where.id = { [Op.ne]: excludeId };
    }
    return Colaborador.findOne({ where });
  }

  async findByDocumento(tipo_documento, numero_documento, excludeId = null) {
    const where = { tipo_documento, numero_documento };
    if (excludeId) {
      where.id = { [Op.ne]: excludeId };
    }
    return Colaborador.findOne({ where });
  }

  async create(data) {
    return Colaborador.create(data);
  }

  async update(id, data) {
    const colaborador = await this.findById(id);
    if (!colaborador) return null;
    return colaborador.update(data);
  }

  async softDelete(id) {
    return this.update(id, { activo: false });
  }
}

module.exports = new ColaboradorRepository();