(function () {
  const loading = document.getElementById('mcLoading');
  const contenido = document.getElementById('mcContenido');
  const sel = document.getElementById('mcQuincena');
  let quincenas = [];

  const ESTADO_ENCUESTA = {
    sin_registros: 'Sin registros en esta quincena',
    pendiente: 'Pendiente — quincena cerrada sin datos',
    en_progreso: 'En progreso',
    enviado: 'Registro enviado',
  };

  function badgeCarga(estado) {
    return EquiWorkUi.badgeEstadoCarga(estado);
  }

  function renderNotificaciones(data) {
    const wrap = document.getElementById('mcNotificaciones');
    if (!data?.items?.length) {
      wrap.classList.add('hidden');
      wrap.innerHTML = '';
      return;
    }
    wrap.classList.remove('hidden');
    wrap.innerHTML = data.items
      .map(
        (n) => `<a href="${n.href}" class="block rounded-xl border border-brand-200 bg-brand-50/80 px-4 py-3 text-sm text-slate-800 transition hover:bg-brand-50">
          <span class="font-medium">${n.mensaje}</span>
        </a>`
      )
      .join('');
  }

  function renderCalendario(eventos) {
    const ul = document.getElementById('mcCalendario');
    if (!eventos?.length) {
      ul.innerHTML = '<li class="ew-empty">No hay actividades en esta quincena.</li>';
      return;
    }
    const ordenados = [...eventos].sort((a, b) => String(a.fecha_evento).localeCompare(String(b.fecha_evento)));
    ul.innerHTML = ordenados
      .map(
        (ev) => `<li class="ew-tipo-row flex items-center justify-between gap-3">
          <div class="min-w-0">
            <p class="text-sm font-medium text-slate-900">${ev.fecha_evento} · ${ev.tipo_evento}</p>
            <p class="truncate text-xs text-slate-500">${ev.descripcion || '—'}</p>
          </div>
          <span class="ew-badge-neutral shrink-0">${Number(ev.horas).toFixed(1)} h</span>
        </li>`
      )
      .join('');
  }

  function renderMiCarga(data) {
    document.getElementById('mcEstadoCarga').innerHTML = badgeCarga(data.estado_carga);
    document.getElementById('mcTotalHoras').textContent = `${Number(data.total_horas).toFixed(1)} h`;
    document.getElementById('mcTotalEventos').textContent = data.total_eventos;
    document.getElementById('mcMeta').textContent = `${data.meta_horas} h`;
    document.getElementById('mcArea').textContent = data.colaborador?.area || '—';
    document.getElementById('mcPromedioArea').textContent = `${Number(data.promedio_horas_area).toFixed(1)} h`;
    const diff = data.diferencia_vs_area;
    const diffEl = document.getElementById('mcDiffArea');
    if (diff > 0) diffEl.textContent = `Estás ${diff.toFixed(1)} h por encima del promedio de tu área.`;
    else if (diff < 0) diffEl.textContent = `Estás ${Math.abs(diff).toFixed(1)} h por debajo del promedio de tu área.`;
    else diffEl.textContent = 'Tu carga coincide con el promedio de tu área.';
    document.getElementById('mcEstadoEncuesta').textContent =
      ESTADO_ENCUESTA[data.estado_encuesta] || data.estado_encuesta;
    const q = data.quincena;
    if (q) {
      document.getElementById('mcRangoQuincena').textContent = `${EquiWorkUi.etiquetaQuincena(q)} · ${q.fecha_inicio} a ${q.fecha_fin}`;
    }
    renderCalendario(data.eventos_calendario);
  }

  function renderHistorial(filas) {
    const tbody = document.querySelector('#mcTablaHistorial tbody');
    tbody.innerHTML = filas
      .map((h) => {
        const etiqueta = EquiWorkUi.etiquetaQuincena(h);
        return `<tr>
          <td><span class="font-medium text-slate-900">${etiqueta}</span></td>
          <td><span class="text-sm text-slate-600">${ESTADO_ENCUESTA[h.estado_encuesta] || h.estado_encuesta}</span></td>
          <td>${badgeCarga(h.estado_carga)}</td>
          <td>${Number(h.total_horas).toFixed(1)} h</td>
          <td>${h.total_eventos}</td>
          <td class="text-right">
            <button type="button" class="ew-btn-ghost min-h-9 px-2 py-1 text-xs" data-mc-ver="${h.quincena_id}">Seleccionar</button>
          </td>
        </tr>`;
      })
      .join('');
    tbody.querySelectorAll('[data-mc-ver]').forEach((btn) => {
      btn.addEventListener('click', () => {
        sel.value = btn.dataset.mcVer;
        cargarMiCarga();
      });
    });
  }

  async function cargarMiCarga() {
    const quincenaId = sel.value;
    if (!quincenaId) return;
    EquiWorkUi.setBusy(contenido, true);
    try {
      const { data } = await EquiWorkApi.get(`/colaborador/mi-carga?quincenaId=${quincenaId}`);
      renderMiCarga(data);
    } catch (e) {
      EquiWorkUi.toast(e.message, 'danger');
    } finally {
      EquiWorkUi.setBusy(contenido, false);
    }
  }

  async function init() {
    EquiWorkUi.setLoading(loading, true);
    try {
      await EquiWorkApi.post('/quincenas/actual', {});
      const [qRes, notifRes, histRes] = await Promise.all([
        EquiWorkApi.get('/quincenas'),
        EquiWorkApi.get('/colaborador/notificaciones'),
        EquiWorkApi.get('/colaborador/historial-quincenas'),
      ]);
      quincenas = qRes.data;
      sel.innerHTML = quincenas.map((q) => `<option value="${q.id}">${EquiWorkUi.etiquetaQuincena(q)}</option>`).join('');
      renderNotificaciones(notifRes.data);
      renderHistorial(histRes.data);
      await cargarMiCarga();
    } catch (e) {
      EquiWorkUi.toast(e.message, 'danger');
    } finally {
      EquiWorkUi.setLoading(loading, false);
    }
  }

  sel.addEventListener('change', cargarMiCarga);

  document.getElementById('mcExportJson').addEventListener('click', () => {
    const id = sel.value;
    if (!id) return;
    window.open(`/api/colaborador/mi-carga/export/${id}`, '_blank');
  });

  init();
})();