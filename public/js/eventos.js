(function () {
  const selQuincena = document.getElementById('evQuincena');
  const rangoEl = document.getElementById('evRangoQuincena');
  const form = document.getElementById('formEvento');
  const historialLoading = document.getElementById('historialLoading');
  let quincenas = [];
  let colaboradorSearch;

  function quincenaActual() {
    return quincenas.find((q) => String(q.id) === selQuincena.value);
  }

  function actualizarRangoFecha() {
    const q = quincenaActual();
    if (!q) return;
    rangoEl.textContent = `Rango válido: ${EquiWorkUi.detalleQuincena(q)}`;
    const fechaInput = document.getElementById('evFecha');
    fechaInput.min = q.fecha_inicio;
    fechaInput.max = q.fecha_fin;
  }

  async function refrescarTiposSelect() {
    tiposActivos = await EquiWorkTiposActividad.fetchActivos();
    const sel = document.getElementById('evTipo');
    EquiWorkTiposActividad.fillSelect(sel, tiposActivos);
    EquiWorkTiposActividad.bindDescripcionHint(sel, document.getElementById('evTipoAyuda'), tiposActivos);
    return tiposActivos;
  }

  let tiposActivos = [];

  async function cargarCatalogos() {
    await EquiWorkApi.post('/quincenas/actual', {});
    const [qRes, cRes] = await Promise.all([
      EquiWorkApi.get('/quincenas'),
      EquiWorkApi.get('/colaboradores'),
    ]);
    quincenas = qRes.data;
    selQuincena.innerHTML = quincenas
      .map((q) => `<option value="${q.id}">${EquiWorkUi.etiquetaQuincena(q)}</option>`)
      .join('');
    colaboradorSearch.setColaboradores(cRes.data);
    actualizarRangoFecha();
    await refrescarTiposSelect();
  }

  async function cargarHistorial() {
    const quincenaId = selQuincena.value;
    const colaboradorId = colaboradorSearch.getValue();
    if (!quincenaId || !colaboradorId) return;
    EquiWorkUi.setLoading(historialLoading, true);
    try {
      const { data } = await EquiWorkApi.get(
        `/eventos/historial/${colaboradorId}/${quincenaId}`
      );
      const lista = document.getElementById('listaHistorial');
      const eventos = data.eventos || [];
      if (eventos.length === 0) {
        lista.innerHTML =
          '<li class="flex flex-1 flex-col items-center justify-center py-16 text-center">' +
          '<p class="text-sm font-medium text-slate-700">Sin actividades en esta quincena</p>' +
          '<p class="mt-1 max-w-xs text-xs text-slate-500">Elige colaborador y quincena, o registra el primer evento en el formulario.</p></li>';
        return;
      }
      lista.innerHTML = eventos
        .map(
          (ev) => `<li class="ew-history-item group">
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-sm font-semibold text-slate-900">${ev.fecha_evento}</span>
              <span class="inline-flex rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-medium text-brand-800">${ev.tipo_evento}</span>
            </div>
            <p class="mt-1.5 text-sm text-slate-600">${ev.descripcion}</p>
            <span class="ew-badge-neutral mt-2 inline-block">${ev.horas} h</span>
          </div>
          <button type="button" class="ew-btn-icon shrink-0 opacity-70 group-hover:opacity-100" data-id="${ev.id}" aria-label="Eliminar evento">×</button>
        </li>`
        )
        .join('');
      lista.querySelectorAll('button[data-id]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          try {
            await EquiWorkApi.delete(`/eventos/${btn.dataset.id}`);
            EquiWorkUi.toast('Evento eliminado');
            await cargarHistorial();
          } catch (e) {
            EquiWorkUi.toast(e.message, 'danger');
          }
        });
      });
    } catch (e) {
      EquiWorkUi.toast(e.message, 'danger');
    } finally {
      EquiWorkUi.setLoading(historialLoading, false);
    }
  }

  selQuincena.addEventListener('change', () => {
    actualizarRangoFecha();
    cargarHistorial();
  });

  document.getElementById('btnRefrescarHistorial').addEventListener('click', cargarHistorial);

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const colaboradorId = colaboradorSearch.getValue();
    if (!colaboradorId) {
      EquiWorkUi.toast('Selecciona un colaborador de la lista', 'danger');
      return;
    }
    const btn = document.getElementById('btnGuardarEvento');
    btn.disabled = true;
    try {
      await EquiWorkApi.post('/eventos', {
        colaborador_id: colaboradorId,
        quincena_id: Number(selQuincena.value),
        fecha_evento: document.getElementById('evFecha').value,
        tipo_evento: document.getElementById('evTipo').value,
        horas: Number(document.getElementById('evHoras').value),
        descripcion: document.getElementById('evDescripcion').value.trim(),
      });
      EquiWorkUi.toast('Evento registrado');
      document.getElementById('evFecha').value = '';
      document.getElementById('evHoras').value = '';
      document.getElementById('evDescripcion').value = '';
      actualizarRangoFecha();
      await cargarHistorial();
    } catch (e) {
      EquiWorkUi.toast(e.message, 'danger');
    } finally {
      btn.disabled = false;
    }
  });

  colaboradorSearch = new ColaboradorSearch({
    wrapId: 'evColaboradorWrap',
    searchInputId: 'evColaboradorSearch',
    hiddenInputId: 'evColaborador',
    listId: 'evColaboradorList',
    clearBtnId: 'evColaboradorClear',
    searchIconId: 'evColabSearchIcon',
    onChange: () => cargarHistorial(),
  });

  (async function init() {
    try {
      await cargarCatalogos();
      await cargarHistorial();
    } catch (e) {
      EquiWorkUi.toast(e.message, 'danger');
    }
  })();
})();
