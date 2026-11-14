const registroRepository = require('../repositories/registroRepository');
const colaboradorRepository = require('../repositories/colaboradorRepository');
const quincenaService = require('./quincenaService');
const encuestaService = require('./encuestaService');
const quincenaRepository = require('../repositories/quincenaRepository');
const AppError = require('../utils/AppError');
const { Usuario } = require('../models');
const { usuarioTieneRol } = require('../utils/rolesHelper');
const { META_HORAS_QUINCENA, estadoCargaDesdeHoras } = require('../utils/cargaLaboral');
const { RegistroQuincenal } = require('../models');

class MiCargaService {
  assertColaborador(usuario) {
    if (!usuarioTieneRol(usuario, Usuario.ROLES.COLABORADOR) || !usuario.colaborador_id) {
      throw new AppError('Acceso reservado para colaboradores con ficha', 403, 'FORBIDDEN');
    }
    return usuario.colaborador_id;
  }

  hoyISO() {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  }

  etiquetaEstadoEncuesta(quincena, totalEventos, registroEstado) {
    const hoy = this.hoyISO();
    if (totalEventos === 0) {
      if (hoy > quincena.fecha_fin) return 'pendiente';
      return 'sin_registros';
    }
    if (registroEstado === RegistroQuincenal.ESTADOS.ENVIADO) return 'enviado';
    return 'en_progreso';
  }

  async promedioArea(quincenaId, area) {
    const filas = await registroRepository.resumenPorQuincena(quincenaId);
    const delArea = filas.filter((c) => c.area === area);
    if (!delArea.length) return 0;
    const suma = delArea.reduce((acc, c) => acc + Number(c.get('total_horas') || 0), 0);
    return Math.round((suma / delArea.length) * 100) / 100;
  }

  async obtenerMiCarga(usuario, quincenaId) {
    const colaboradorId = this.assertColaborador(usuario);
    const colaborador = await colaboradorRepository.findById(colaboradorId);
    if (!colaborador) {
      throw new AppError('Colaborador no encontrado', 404, 'NOT_FOUND');
    }

    let quincena;
    if (quincenaId) {
      quincena = await quincenaService.obtenerPorId(quincenaId);
    } else {
      quincena = await quincenaService.asegurarQuincenaActual();
      quincenaId = quincena.id;
    }

    const resumen = await encuestaService.resumenEncuesta(usuario, quincenaId);
    const registro = await registroRepository.findByColaboradorYQuincena(colaboradorId, quincenaId);
    const totalHoras = resumen.total_horas;
    const promedioArea = await this.promedioArea(quincenaId, colaborador.area);
    const diferenciaArea = Math.round((totalHoras - promedioArea) * 100) / 100;

    const eventosCalendario = (resumen.eventos || []).map((ev) => ({
      id: ev.id,
      fecha_evento: ev.fecha_evento,
      tipo_evento: ev.tipo_evento,
      horas: ev.horas,
      descripcion: ev.descripcion,
    }));

    return {
      colaborador: {
        id: colaborador.id,
        nombre: `${colaborador.nombres} ${colaborador.apellidos}`,
        cargo: colaborador.cargo,
        area: colaborador.area,
      },
      quincena: resumen.quincena,
      meta_horas: META_HORAS_QUINCENA,
      total_eventos: resumen.total_eventos,
      total_horas: totalHoras,
      estado_carga: estadoCargaDesdeHoras(totalHoras),
      promedio_horas_area: promedioArea,
      diferencia_vs_area: diferenciaArea,
      registro_estado: registro?.estado || RegistroQuincenal.ESTADOS.BORRADOR,
      estado_encuesta: this.etiquetaEstadoEncuesta(
        quincena,
        resumen.total_eventos,
        registro?.estado
      ),
      eventos_calendario: eventosCalendario,
    };
  }

  async historialQuincenas(usuario, limite = 18) {
    const colaboradorId = this.assertColaborador(usuario);
    const [quincenas, registros] = await Promise.all([
      quincenaRepository.findAll(),
      registroRepository.historialResumenColaborador(colaboradorId, 48),
    ]);
    const porQuincena = new Map(registros.map((row) => [row.quincena_id, row]));

    return quincenas.slice(0, limite).map((q) => {
      const row = porQuincena.get(q.id);
      const eventos = row?.eventos || [];
      const totalHoras = eventos.reduce((acc, ev) => acc + Number(ev.horas || 0), 0);
      return {
        quincena_id: q.id,
        anio: q.anio,
        mes: q.mes,
        numero_quincena: q.numero_quincena,
        fecha_inicio: q.fecha_inicio,
        fecha_fin: q.fecha_fin,
        total_eventos: eventos.length,
        total_horas: Math.round(totalHoras * 100) / 100,
        estado_carga: estadoCargaDesdeHoras(totalHoras),
        registro_estado: row?.estado || RegistroQuincenal.ESTADOS.BORRADOR,
        estado_encuesta: this.etiquetaEstadoEncuesta(
          q,
          eventos.length,
          row?.estado || RegistroQuincenal.ESTADOS.BORRADOR
        ),
      };
    });
  }

  async notificaciones(usuario) {
    const colaboradorId = this.assertColaborador(usuario);
    const items = [];
    const quincena = await quincenaService.asegurarQuincenaActual();
    const resumen = await encuestaService.resumenEncuesta(usuario, quincena.id);
    const hoy = this.hoyISO();
    const enCurso = hoy >= quincena.fecha_inicio && hoy <= quincena.fecha_fin;

    if (enCurso && resumen.total_eventos === 0) {
      items.push({
        id: 'encuesta-sin-registros',
        tipo: 'aviso',
        prioridad: 'alta',
        mensaje: 'Aún no has registrado actividades en la quincena en curso.',
        href: '/encuesta',
      });
    } else if (enCurso && resumen.total_horas < META_HORAS_QUINCENA * 0.3) {
      items.push({
        id: 'carga-baja',
        tipo: 'info',
        prioridad: 'media',
        mensaje: 'Tu carga reportada está por debajo del 30% de la meta quincenal.',
        href: '/mi-carga',
      });
    }

    const estado = estadoCargaDesdeHoras(resumen.total_horas);
    if (enCurso && estado === 'sobrecarga') {
      items.push({
        id: 'sobrecarga',
        tipo: 'alerta',
        prioridad: 'alta',
        mensaje: 'Tu carga supera el umbral de sobrecarga para esta quincena.',
        href: '/mi-carga',
      });
    }

    const anteriores = await registroRepository.historialResumenColaborador(colaboradorId, 6);
    const pendienteAnterior = anteriores.find((row) => {
      const q = row.quincena;
      const n = (row.eventos || []).length;
      return n === 0 && hoy > q.fecha_fin;
    });
    if (pendienteAnterior) {
      const q = pendienteAnterior.quincena;
      items.push({
        id: `quincena-pendiente-${q.id}`,
        tipo: 'aviso',
        prioridad: 'media',
        mensaje: `Quedó una quincena anterior (${q.mes}/${q.anio} Q${q.numero_quincena}) sin registros.`,
        href: '/encuesta',
      });
    }

    return {
      total: items.length,
      items,
    };
  }

  async exportarQuincenaJson(usuario, quincenaId) {
    const data = await this.obtenerMiCarga(usuario, quincenaId);
    const hist = await encuestaService.miHistorial(usuario, quincenaId);
    return {
      exportado_en: new Date().toISOString(),
      colaborador: data.colaborador,
      quincena: data.quincena,
      resumen: {
        total_eventos: data.total_eventos,
        total_horas: data.total_horas,
        estado_carga: data.estado_carga,
        meta_horas: data.meta_horas,
        promedio_horas_area: data.promedio_horas_area,
      },
      eventos: hist.eventos || [],
    };
  }
}

module.exports = new MiCargaService();