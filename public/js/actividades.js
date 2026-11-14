(function () {
  const lista = document.getElementById('listaTiposActividadAdmin');
  const loading = document.getElementById('actividadesLoading');
  const form = document.getElementById('formNuevoTipo');

  function esc(text) {
    const d = document.createElement('div');
    d.textContent = text ?? '';
    return d.innerHTML;
  }

  function descripcionHtml(descripcion) {
    if (descripcion && String(descripcion).trim()) {
      return `<p class="mt-1 text-xs leading-relaxed text-slate-600">${esc(descripcion)}</p>`;
    }
    return '<p class="mt-1 text-xs italic text-slate-400">Sin descripción — edítala para orientar al equipo.</p>';
  }

  function bindRowActions() {
    lista.querySelectorAll('button[data-tipo-action="desactivar"]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (!confirm('¿Desactivar este tipo de actividad?')) return;
        try {
          await EquiWorkApi.delete(`/tipos-actividad/${btn.dataset.tipoId}`);
          EquiWorkUi.toast('Tipo desactivado');
          await cargarLista();
        } catch (e) {
          EquiWorkUi.toast(e.message, 'danger');
        }
      });
    });

    lista.querySelectorAll('button[data-tipo-action="activar"]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        try {
          await EquiWorkApi.post(`/tipos-actividad/${btn.dataset.tipoId}/activar`, {});
          EquiWorkUi.toast('Tipo activado');
          await cargarLista();
        } catch (e) {
          EquiWorkUi.toast(e.message, 'danger');
        }
      });
    });

    lista.querySelectorAll('button[data-tipo-action="editar-desc"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.tipoId;
        const panel = lista.querySelector(`[data-desc-panel="${id}"]`);
        if (panel) panel.classList.toggle('hidden');
      });
    });

    lista.querySelectorAll('form[data-desc-form]').forEach((f) => {
      f.addEventListener('submit', async (ev) => {
        ev.preventDefault();
        const id = f.dataset.descForm;
        const ta = f.querySelector('textarea');
        try {
          await EquiWorkApi.patch(`/tipos-actividad/${id}`, { descripcion: ta.value.trim() });
          EquiWorkUi.toast('Descripción actualizada');
          await cargarLista();
        } catch (e) {
          EquiWorkUi.toast(e.message, 'danger');
        }
      });
    });
  }

  async function cargarLista() {
    EquiWorkUi.setLoading(loading, true);
    try {
      const { data } = await EquiWorkApi.get('/tipos-actividad/admin');
      if (!data.length) {
        lista.innerHTML =
          '<li class="rounded-xl border border-dashed border-slate-200 py-12 text-center text-sm text-slate-500">No hay actividades registradas.</li>';
        return;
      }
      lista.innerHTML = data
        .map((t) => {
          const desc = t.descripcion || '';
          return `<li class="ew-tipo-row ew-tipo-row--detalle ${t.activo ? '' : 'ew-tipo-row--inactive'}">
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <span class="font-semibold ${t.activo ? 'text-slate-900' : 'text-slate-500 line-through'}">${esc(t.nombre)}</span>
                ${
                  t.activo
                    ? '<span class="ew-badge-success text-[10px]">Activa</span>'
                    : '<span class="ew-badge-neutral text-[10px]">Inactiva</span>'
                }
              </div>
              <div data-desc-view="${t.id}">${descripcionHtml(desc)}</div>
              <div class="mt-3 hidden space-y-2 rounded-lg border border-brand-100 bg-brand-50/40 p-3" data-desc-panel="${t.id}">
                <label class="ew-label mb-0 text-xs">Editar descripción</label>
                <form data-desc-form="${t.id}">
                  <textarea class="ew-input min-h-[5rem] resize-y py-2 text-sm" maxlength="500" required>${esc(desc)}</textarea>
                  <div class="mt-2 flex gap-2">
                    <button type="submit" class="ew-btn-primary px-3 py-1.5 text-xs">Guardar</button>
                    <button type="button" class="ew-btn-secondary px-3 py-1.5 text-xs" data-tipo-action="editar-desc" data-tipo-id="${t.id}">Cancelar</button>
                  </div>
                </form>
              </div>
            </div>
            <div class="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-start">
              <button type="button" class="ew-btn-secondary px-2 py-1 text-xs" data-tipo-action="editar-desc" data-tipo-id="${t.id}">Editar</button>
              ${
                t.activo
                  ? `<button type="button" class="ew-btn-secondary shrink-0 px-2 py-1 text-xs" data-tipo-action="desactivar" data-tipo-id="${t.id}">Desactivar</button>`
                  : `<button type="button" class="ew-btn-success shrink-0 px-2 py-1 text-xs" data-tipo-action="activar" data-tipo-id="${t.id}">Activar</button>`
              }
            </div>
          </li>`;
        })
        .join('');
      bindRowActions();
    } catch (e) {
      EquiWorkUi.toast(e.message, 'danger');
    } finally {
      EquiWorkUi.setLoading(loading, false);
    }
  }

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const nombre = document.getElementById('nuevoTipoNombre');
    const descripcion = document.getElementById('nuevoTipoDescripcion');
    try {
      await EquiWorkApi.post('/tipos-actividad', {
        nombre: nombre.value.trim(),
        descripcion: descripcion.value.trim(),
      });
      EquiWorkUi.toast('Actividad creada');
      nombre.value = '';
      descripcion.value = '';
      await cargarLista();
    } catch (e) {
      EquiWorkUi.toast(e.message, 'danger');
    }
  });

  document.getElementById('btnRefrescarActividades').addEventListener('click', cargarLista);

  cargarLista();
})();
