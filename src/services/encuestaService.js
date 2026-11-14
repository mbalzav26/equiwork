const eventoService = require('./eventoService');
const eventoRepository = require('../repositories/eventoRepository');
const quincenaService = require('./quincenaService');
const AppError = require('../utils/AppError');
const { Usuario } = require('../models');
const { usuarioTieneRol } = require('../utils/rolesHelper');

class EncuestaService {
  assertColaborador(usuario) {
    if (!usuarioTieneRol(usuario, Usuario.ROLES.COLABORADOR) || !usuario.colaborador_id) {
      throw new AppError('La encuesta es solo para colaboradores', 403, 'FORBIDDEN');
    }
    return usuario.colaborador_id;
  }

  async registrarMiEvento(usuario, payload) {
    const colaboradorId = this.assertColaborador(usuario);
    return eventoService.registrarEvento({
      ...payload,
      colaborador_id: colaboradorId,
    });
  }

  async miHistorial(usuario, quincenaId) {
    const colaboradorId = this.assertColaborador(usuario);
    return eventoService.historialColaborador(colaboradorId, quincenaId);
  }

  async eliminarMiEvento(usuario, eventoId) {
    const colaboradorId = this.assertColaborador(usuario);
    const evento = await eventoRepository.findById(eventoId);
    if (!evento) {
      throw new AppError('Evento no encontrado', 404, 'EVENTO_NOT_FOUND');
    }
    const dueñoId = evento.registro?.colaborador_id;
    if (dueñoId !== colaboradorId) {
      throw new AppError('No puede eliminar eventos de otro colaborador', 403, 'FORBIDDEN');
    }
    return eventoService.eliminarEvento(eventoId);
  }

  async resumenEncuesta(usuario, quincenaId) {
    const colaboradorId = this.assertColaborador(usuario);
    await quincenaService.obtenerPorId(quincenaId);
    const historial = await eventoService.historialColaborador(colaboradorId, quincenaId);
    const eventos = historial.eventos || [];
    const totalHoras = eventos.reduce((acc, ev) => acc + Number(ev.horas), 0);
    return {
      quincena: historial.quincena,
      total_eventos: eventos.length,
      total_horas: totalHoras,
      eventos,
    };
  }
}

module.exports = new EncuestaService();
