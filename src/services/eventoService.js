const eventoRepository = require('../repositories/eventoRepository');
const registroRepository = require('../repositories/registroRepository');
const quincenaService = require('./quincenaService');
const colaboradorService = require('./colaboradorService');
const { fechaEnRango } = require('../utils/quincenaHelper');
const AppError = require('../utils/AppError');

class EventoService {
  async registrarEvento(payload) {
    const colaborador = await colaboradorService.obtenerPorId(payload.colaborador_id);
    if (!colaborador.activo) {
      throw new AppError('El colaborador está inactivo', 400, 'COLABORADOR_INACTIVO');
    }

    const quincena = await quincenaService.obtenerPorId(payload.quincena_id);
    if (
      !fechaEnRango(payload.fecha_evento, quincena.fecha_inicio, quincena.fecha_fin)
    ) {
      throw new AppError(
        'La fecha del evento debe estar dentro del rango de la quincena seleccionada',
        400,
        'FECHA_INVALIDA'
      );
    }

    const registro = await registroRepository.findOrCreate(
      payload.colaborador_id,
      payload.quincena_id
    );

    return eventoRepository.create({
      registro_quincenal_id: registro.id,
      tipo_evento: payload.tipo_evento,
      descripcion: payload.descripcion,
      horas: payload.horas,
      fecha_evento: payload.fecha_evento,
      nombre_empresa: payload.nombre_empresa || null,
      direccion: payload.direccion || null,
      auxilio_transporte: Boolean(payload.auxilio_transporte),
      comentarios_transporte: payload.comentarios_transporte || null,
    });
  }

  async eliminarEvento(id) {
    const evento = await eventoRepository.deleteById(id);
    if (!evento) {
      throw new AppError('Evento no encontrado', 404, 'EVENTO_NOT_FOUND');
    }
    return evento;
  }

  async historialColaborador(colaboradorId, quincenaId) {
    await colaboradorService.obtenerPorId(colaboradorId);
    await quincenaService.obtenerPorId(quincenaId);
    const registro = await registroRepository.findOrCreate(colaboradorId, quincenaId);
    return registroRepository.findByIdWithRelations(registro.id);
  }
}

module.exports = new EventoService();
