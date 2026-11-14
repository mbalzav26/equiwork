const { TipoActividad } = require('../models');

class TipoActividadRepository {
  async listActivos() {
    return TipoActividad.findAll({
      where: { activo: true },
      order: [['nombre', 'ASC']],
    });
  }

  async listAll() {
    return TipoActividad.findAll({ order: [['nombre', 'ASC']] });
  }

  async findByNombre(nombre) {
    return TipoActividad.findOne({ where: { nombre } });
  }

  async findActivoByNombre(nombre) {
    return TipoActividad.findOne({ where: { nombre, activo: true } });
  }

  async findById(id) {
    return TipoActividad.findByPk(id);
  }

  async create({ nombre, descripcion = null }) {
    return TipoActividad.create({ nombre, descripcion, activo: true });
  }

  async setActivo(id, activo) {
    const row = await TipoActividad.findByPk(id);
    if (!row) return null;
    row.activo = activo;
    await row.save();
    return row;
  }
}

module.exports = new TipoActividadRepository();
