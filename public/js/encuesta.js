(function () {
  const selQuincena = document.getElementById('encQuincena');
  const rangoEl = document.getElementById('encRangoQuincena');
  const form = document.getElementById('formEncuesta');
  const loading = document.getElementById('encLoading');
  const chkAuxilio = document.getElementById('encAuxilioTransporte');
  const wrapComentarios = document.getElementById('encComentariosTransporteWrap');
  const inputComentarios = document.getElementById('encComentariosTransporte');
  let quincenas = [];

  function esc(text) {
    return String(text ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function toggleComentariosTransporte() {
    const show = chkAuxilio.checked;
    wrapComentarios.classList.toggle('hidden', !show);
    inputComentarios.required = show;
    if (!show) inputComentarios.value = '';
  }

  chkAuxilio.addEventListener('change', toggleComentariosTransporte);

  function quincenaActual() {
    return quincenas.find((q) => String(q.id) === selQuincena.value);
  }

  function actualizarRangoFecha() {
    const q = quincenaActual();
    if (!q) return;
    rangoEl.textContent = `Fechas válidas: ${q.fecha_inicio} a ${q.fecha_fin}`;
    document.getElementById('encEtiquetaQuincena').textContent = EquiWorkUi.etiquetaQuincena(q);
    const fechaInput = document.getElementById('encFecha');
    fechaInput.min = q.fecha_inicio;
    fechaInput.max = q.fecha_fin;
  }

  function renderResumen(data) {
    document.getElementById('encTotalEventos').textContent = data.total_eventos ?? 0;
    document.getElementById('encTotalHoras').textContent = `${Number(data.total_horas || 0).toFixed(1)} h`;
  }

  async function cargarTiposActividad() {
    const tipos = await EquiWorkTiposActividad.fetchActivos();
    const sel = document.getElementById('encTipo');
    EquiWorkTiposActividad.fillSelect(sel, tipos);
    EquiWorkTiposActividad.bindDescripcionHint(sel, document.getElementById('encTipoAyuda'), tipos);
  }

  async function cargarQuincenas() {
    await EquiWorkApi.post('/quincenas/actual', {});
    const { data } = await EquiWorkApi.get('/quincenas');
    quincenas = data;
    selQuincena.innerHTML = quincenas
      .map((q) => `<option value="${q.id}">${EquiWorkUi.etiquetaQuincena(q)}</option>`)
      .join('');
    actualizarRangoFecha();
  }

  async function cargarHistorial() {
    const quincenaId = selQuincena.value;
    if (!quincenaId) return;
    EquiWorkUi.setLoading(loading, true);
    try {
      const [histRes, resumenRes] = await Promise.all([
        EquiWorkApi.get(`/encuesta/historial/${quincenaId}`),
        EquiWorkApi.get(`/encuesta/resumen/${quincenaId}`),
      ]);
      renderResumen(resumenRes.data);
      const lista = document.getElementById('listaEncuesta');
      const eventos = histRes.data.eventos || [];
      if (eventos.length === 0) {
        lista.innerHTML =
          '<li class="ew-empty">Aún no has registrado actividades en esta quincena.</li>';
        return;
      }
      lista.innerHTML = eventos
        .map(
          (ev) => {
            const empresa =
              ev.nombre_empresa
                ? `<p class="mt-1 text-xs text-slate-500">${esc(ev.nombre_empresa)}${ev.direccion ? ` · ${esc(ev.direccion)}` : ''}</p>`
                : '';
            const transporte =
              ev.auxilio_transporte
                ? `<p class="mt-1 text-xs text-brand-700">Auxilio de transporte${ev.comentarios_transporte ? `: ${esc(ev.comentarios_transporte)}` : ''}</p>`
                : '';
            return `<li class="ew-history-item">
          <div class="min-w-0">
            <p class="text-sm font-semibold text-slate-900">${esc(ev.fecha_evento)} · ${esc(ev.tipo_evento)}</p>
            <p class="mt-1 text-sm text-slate-600">${esc(ev.descripcion)}</p>
            ${empresa}
            ${transporte}
            <span class="ew-badge-neutral mt-2">${ev.horas} h</span>
          </div>
          <button type="button" class="ew-btn-icon" data-id="${ev.id}" aria-label="Eliminar actividad">×</button>
        </li>`;
          }
        )
        .join('');
      lista.querySelectorAll('button[data-id]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          if (!confirm('¿Eliminar esta actividad de tu encuesta?')) return;
          try {
            await EquiWorkApi.delete(`/encuesta/eventos/${btn.dataset.id}`);
            EquiWorkUi.toast('Actividad eliminada');
            await cargarHistorial();
          } catch (e) {
            EquiWorkUi.toast(e.message, 'danger');
          }
        });
      });
    } catch (e) {
      EquiWorkUi.toast(e.message, 'danger');
    } finally {
      EquiWorkUi.setLoading(loading, false);
    }
  }

  selQuincena.addEventListener('change', () => {
    actualizarRangoFecha();
    cargarHistorial();
  });
  document.getElementById('btnRefrescarEncuesta').addEventListener('click', cargarHistorial);

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const btn = document.getElementById('btnGuardarEncuesta');
    if (btn) btn.disabled = true;
    try {
      const auxilio = chkAuxilio.checked;
      await EquiWorkApi.post('/encuesta/eventos', {
        quincena_id: Number(selQuincena.value),
        fecha_evento: document.getElementById('encFecha').value,
        tipo_evento: document.getElementById('encTipo').value,
        horas: Number(document.getElementById('encHoras').value),
        descripcion: document.getElementById('encDescripcion').value.trim(),
        nombre_empresa: document.getElementById('encEmpresa').value.trim(),
        direccion: document.getElementById('encDireccion').value.trim(),
        auxilio_transporte: auxilio,
        comentarios_transporte: auxilio ? inputComentarios.value.trim() : null,
      });
      EquiWorkUi.toast('Actividad registrada en tu encuesta');
      form.reset();
      chkAuxilio.checked = false;
      toggleComentariosTransporte();
      actualizarRangoFecha();
      await cargarHistorial();
    } catch (e) {
      EquiWorkUi.toast(e.message, 'danger');
    } finally {
      if (btn) btn.disabled = false;
    }
  });

  async function cargarAvisos() {
    const wrap = document.getElementById('encAvisos');
    if (!wrap) return;
    try {
      const { data } = await EquiWorkApi.get('/colaborador/notificaciones');
      if (!data?.items?.length) {
        wrap.classList.add('hidden');
        return;
      }
      wrap.classList.remove('hidden');
      wrap.innerHTML = data.items
        .map(
          (n) => `<div class="rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-950">
            ${n.mensaje} <a href="${n.href}" class="font-semibold underline">Ver más</a>
          </div>`
        )
        .join('');
    } catch {
      wrap.classList.add('hidden');
    }
  }

  (async function init() {
    try {
      await cargarTiposActividad();
      await cargarQuincenas();
      await cargarAvisos();
      await cargarHistorial();
    } catch (e) {
      EquiWorkUi.toast(e.message, 'danger');
    }
  })();
})();
