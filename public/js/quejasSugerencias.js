(function () {
  const form = document.getElementById('formQueja');
  const lista = document.getElementById('listaMisQuejas');
  const loadingMias = document.getElementById('misQuejasLoading');

  function fmtFecha(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });
  }

  async function cargarMias() {
    EquiWorkUi.setLoading(loadingMias, true);
    try {
      const { data } = await EquiWorkApi.get('/quejas-sugerencias/mias');
      if (!data.length) {
        lista.innerHTML = '<li class="ew-empty">Aún no has enviado mensajes.</li>';
        return;
      }
      lista.innerHTML = data
        .map((q) => {
          const tipo = q.tipo === 'QUEJA' ? 'Queja' : 'Sugerencia';
          const extracto =
            q.mensaje.length > 180 ? `${q.mensaje.slice(0, 180)}…` : q.mensaje;
          const anon = q.anonimo ? ' · Anónimo' : '';
          return `<li class="ew-tipo-row ew-tipo-row--detalle items-start">
            <div class="min-w-0 flex-1">
              <p class="text-xs font-semibold uppercase tracking-wide text-brand-600">${tipo}${anon}</p>
              <p class="mt-1 text-sm text-slate-800">${extracto}</p>
              <p class="mt-1 text-xs text-slate-500">${fmtFecha(q.created_at)} · ${q.estado}</p>
            </div>
          </li>`;
        })
        .join('');
    } catch (e) {
      lista.innerHTML = `<li class="ew-alert-error">${e.message}</li>`;
    } finally {
      EquiWorkUi.setLoading(loadingMias, false);
    }
  }

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const tipo = document.querySelector('input[name="tipoQueja"]:checked')?.value;
    try {
      await EquiWorkApi.post('/quejas-sugerencias', {
        tipo,
        mensaje: document.getElementById('quejaMensaje').value.trim(),
        anonimo: document.getElementById('quejaAnonimo').checked,
      });
      EquiWorkUi.toast('Mensaje enviado. Gracias por tu retroalimentación.');
      form.reset();
      document.querySelector('input[name="tipoQueja"][value="QUEJA"]').checked = true;
      await cargarMias();
    } catch (e) {
      EquiWorkUi.toast(e.message, 'danger');
    }
  });

  cargarMias();
})();
