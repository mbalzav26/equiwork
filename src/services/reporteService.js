const registroRepository = require('../repositories/registroRepository');
const quincenaService = require('./quincenaService');
const dashboardService = require('./dashboardService');

class ReporteService {
  async resumenQuincenal(quincenaId) {
    await quincenaService.obtenerPorId(quincenaId);
    const balance = await dashboardService.obtenerBalance(quincenaId);
    const detalle = await registroRepository.listarDetalleQuincena(quincenaId);

    return {
      generado_en: new Date().toISOString(),
      balance,
      registros: detalle.map((reg) => ({
        colaborador: reg.colaborador
          ? `${reg.colaborador.nombres} ${reg.colaborador.apellidos}`
          : '',
        email: reg.colaborador?.email,
        estado: reg.estado,
        eventos: (reg.eventos || []).map((ev) => ({
          fecha: ev.fecha_evento,
          tipo: ev.tipo_evento,
          descripcion: ev.descripcion,
          horas: Number(ev.horas),
        })),
        total_horas: (reg.eventos || []).reduce((s, e) => s + Number(e.horas), 0),
      })),
    };
  }

  resumenQuincenalCsv(quincenaId) {
    return this.resumenQuincenal(quincenaId).then((data) => {
      const lineas = [
        'Colaborador,Email,Fecha,Tipo,Descripcion,Horas,Estado registro',
      ];
      for (const reg of data.registros) {
        for (const ev of reg.eventos) {
          const fila = [
            this._csv(reg.colaborador),
            this._csv(reg.email),
            ev.fecha,
            ev.tipo,
            this._csv(ev.descripcion),
            ev.horas,
            reg.estado,
          ];
          lineas.push(fila.join(','));
        }
        if (reg.eventos.length === 0) {
          lineas.push(
            [this._csv(reg.colaborador), this._csv(reg.email), '', '', '', '0', reg.estado].join(
              ','
            )
          );
        }
      }
      return lineas.join('\n');
    });
  }

  _csv(valor) {
    const s = String(valor ?? '');
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  }
}

module.exports = new ReporteService();
