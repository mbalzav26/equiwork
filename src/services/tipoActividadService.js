const tipoActividadRepository = require('../repositories/tipoActividadRepository');
const AppError = require('../utils/AppError');

const TIPOS_BASE = Object.freeze([
  'Recreación',
  'Personaje general',
  'Personaje navideño',
  'Show deportivo',
  'Operador de feria',
  'Rumbaterapia',
  'Aquazumba',
]);

class TipoActividadService {
  async listarActivos() {
    return tipoActividadRepository.listActivos();
  }

  async listarTodosAdmin() {
    return tipoActividadRepository.listAll();
  }

  async assertTipoActivo(nombre) {
    const tipo = await tipoActividadRepository.findActivoByNombre(String(nombre).trim());
    if (!tipo) {
      throw new AppError('Tipo de actividad inválido o inactivo', 400, 'TIPO_ACTIVIDAD_INVALIDO');
    }
    return tipo;
  }

  normalizeDescripcion(descripcion) {
    const desc = String(descripcion ?? '').trim();
    if (desc.length < 10) {
      throw new AppError('La descripción debe tener al menos 10 caracteres', 400, 'VALIDATION_ERROR');
    }
    if (desc.length > 500) {
      throw new AppError('La descripción es demasiado larga', 400, 'VALIDATION_ERROR');
    }
    return desc;
  }

  async crear(nombre, descripcion) {
    const limpio = String(nombre).trim();
    if (limpio.length < 2) {
      throw new AppError('El nombre debe tener al menos 2 caracteres', 400, 'VALIDATION_ERROR');
    }
    if (limpio.length > 80) {
      throw new AppError('El nombre es demasiado largo', 400, 'VALIDATION_ERROR');
    }
    const desc = this.normalizeDescripcion(descripcion);
    const existe = await tipoActividadRepository.findByNombre(limpio);
    if (existe) {
      if (!existe.activo) {
        existe.activo = true;
        existe.descripcion = desc;
        await existe.save();
        return existe;
      }
      throw new AppError('Ya existe un tipo de actividad con ese nombre', 409, 'DUPLICATE');
    }
    return tipoActividadRepository.create({ nombre: limpio, descripcion: desc });
  }

  async actualizarDescripcion(id, descripcion) {
    const row = await tipoActividadRepository.findById(id);
    if (!row) {
      throw new AppError('Tipo de actividad no encontrado', 404, 'NOT_FOUND');
    }
    row.descripcion = this.normalizeDescripcion(descripcion);
    await row.save();
    return row;
  }

  async desactivar(id) {
    const row = await tipoActividadRepository.setActivo(id, false);
    if (!row) {
      throw new AppError('Tipo de actividad no encontrado', 404, 'NOT_FOUND');
    }
    return row;
  }

  async activar(id) {
    const row = await tipoActividadRepository.setActivo(id, true);
    if (!row) {
      throw new AppError('Tipo de actividad no encontrado', 404, 'NOT_FOUND');
    }
    return row;
  }

  async seedTiposBase() {
    for (const nombre of TIPOS_BASE) {
      const existe = await tipoActividadRepository.findByNombre(nombre);
      if (!existe) {
        await tipoActividadRepository.create({ nombre });
      } else if (!existe.activo) {
        existe.activo = true;
        await existe.save();
      }
    }
  }
}

module.exports = new TipoActividadService();
module.exports.TIPOS_BASE = TIPOS_BASE;
