(function () {
  const lista = document.getElementById('listaQuejasAdmin');
  const loading = document.getElementById('quejasLoading');
  const modalId = 'modalQuejaDetalle';
  const modalCuerpo = document.getElementById('modalQuejaCuerpo');
  const modalTitulo = document.getElementById('modalQuejaTitulo');
  let quejasCache = [];

  function esc(text) {
    const d = document.createElement('div');
    d.textContent = text ?? '';
    return d.innerHTML;
  }

  function fmtFecha(iso) {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleString('es-CO', {
        dateStyle: 'full',
        timeStyle: 'short',
      });
    } catch {
      return iso;
    }
  }

  function tipoLabel(tipo) {
    return tipo === 'QUEJA' ? 'Queja' : 'Sugerencia';
  }

  function abrirDetalle(q) {
    modalTitulo.textContent = tipoLabel(q.tipo);
    modalCuerpo.innerHTML = `
      <dl class="space-y-3">
        <div><dt class="ew-label mb-0">Tipo</dt><dd class="font-medium text-slate-900">${esc(tipoLabel(q.tipo))}</dd></div>
        <div><dt class="ew-label mb-0">Fecha de envío</dt><dd class="text-slate-700">${esc(fmtFecha(q.created_at))}</dd></div>
        <div><dt class="ew-label mb-0">Remitente</dt><dd class="text-slate-700">${
          q.anonimo
            ? '<span class="ew-badge-neutral">Anónimo</span> — sin datos del colaborador'
            : esc(q.autor.etiqueta)
        }</dd></div>
        ${
          !q.anonimo
            ? `<div><dt class="ew-label mb-0">Correo</dt><dd>${esc(q.autor.email || '—')}</dd></div>
               <div><dt class="ew-label mb-0">Área</dt><dd>${esc(q.autor.area || '—')}</dd></div>
               <div><dt class="ew-label mb-0">Documento</dt><dd>${esc(q.autor.documento || '—')}</dd></div>`
            : ''
        }
        <div>
          <dt class="ew-label mb-0">Mensaje</dt>
          <dd class="mt-1 rounded-xl border border-slate-200 bg-slate-50 p-4 leading-relaxed text-slate-800 whitespace-pre-wrap">${esc(q.mensaje)}</dd>
        </div>
      </dl>`;
    EquiWorkUi.modal.open(modalId);
  }

  async function cargar() {
    EquiWorkUi.setLoading(loading, true);
    try {
      const { data } = await EquiWorkApi.get('/quejas-sugerencias/admin');
      quejasCache = data;
      if (!data.length) {
        lista.innerHTML =
          '<li class="rounded-2xl border border-dashed border-slate-200 py-16 text-center text-sm text-slate-500">Aún no hay quejas ni sugerencias.</li>';
        return;
      }
      lista.innerHTML = data
        .map(
          (q, i) => `<li>
          <button type="button" class="ew-card ew-queja-card w-full text-left transition hover:shadow-md" data-queja-index="${i}">
            <div class="ew-card-body space-y-3">
              <div class="flex flex-wrap items-center gap-2">
                <span class="ew-badge-neutral">${esc(q.tipo)}</span>
                ${
                  q.anonimo
                    ? '<span class="ew-badge-neutral">Anónimo</span>'
                    : `<span class="text-sm font-semibold text-slate-900">${esc(q.autor.etiqueta)}</span>`
                }
                <span class="text-xs text-slate-500 ml-auto">${fmtFecha(q.created_at)}</span>
              </div>
              <p class="line-clamp-3 text-sm leading-relaxed text-slate-700">${esc(q.mensaje)}</p>
              <p class="text-xs font-medium text-brand-600">Ver detalle →</p>
            </div>
          </button>
        </li>`
        )
        .join('');
    } catch (e) {
      EquiWorkUi.toast(e.message, 'danger');
    } finally {
      EquiWorkUi.setLoading(loading, false);
    }
  }

  lista.addEventListener('click', (ev) => {
    const btn = ev.target.closest('[data-queja-index]');
    if (!btn) return;
    const q = quejasCache[Number(btn.dataset.quejaIndex)];
    if (q) abrirDetalle(q);
  });

  document.getElementById('btnRefrescarQuejas').addEventListener('click', cargar);
  cargar();
})();