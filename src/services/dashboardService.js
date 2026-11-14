const registroRepository = require('../repositories/registroRepository');
const quincenaService = require('./quincenaService');
const { META_HORAS_QUINCENA, estadoCargaDesdeHoras } = require('../utils/cargaLaboral');

class DashboardService {
  async obtenerBalance(quincenaId) {
    const quincena = await quincenaService.obtenerPorId(quincenaId);
    const filas = await registroRepository.resumenPorQuincena(quincenaId);

    const colaboradores = filas.map((col) => {
      const totalHoras = Number(col.get('total_horas'));
      const totalEventos = Number(col.get('total_eventos'));
      const estadoCarga = estadoCargaDesdeHoras(totalHoras);

      return {
        colaborador_id: col.id,
        nombre: `${col.nombres} ${col.apellidos}`,
        cargo: col.cargo,
        area: col.area,
        total_horas: totalHoras,
        total_eventos: totalEventos,
        estado_carga: estadoCarga,
        meta_horas: META_HORAS_QUINCENA,
      };
    });

    const promedio =
      colaboradores.length > 0
        ? colaboradores.reduce((acc, c) => acc + c.total_horas, 0) / colaboradores.length
        : 0;

    return {
      quincena: {
        id: quincena.id,
        etiqueta: `Q${quincena.numero_quincena} · ${quincena.mes}/${quincena.anio}`,
        fecha_inicio: quincena.fecha_inicio,
        fecha_fin: quincena.fecha_fin,
      },
      meta_horas: META_HORAS_QUINCENA,
      promedio_horas: Math.round(promedio * 100) / 100,
      colaboradores,
    };
  }
}

module.exports = new DashboardService();
