(function () {
  const loading = document.getElementById('catLoading');
  const lista = document.getElementById('catLista');
  const vacio = document.getElementById('catVacio');

  async function cargar() {
    EquiWorkUi.setLoading(loading, true);
    try {
      const { data } = await EquiWorkApi.get('/tipos-actividad');
      if (!data.length) {
        lista.innerHTML = '';
        vacio.classList.remove('hidden');
        return;
      }
      vacio.classList.add('hidden');
      lista.innerHTML = data
        .map(
          (t) => `<li class="ew-tipo-row ew-tipo-row--detalle">
            <div class="min-w-0 flex-1">
              <p class="font-semibold text-slate-900">${t.nombre}</p>
              <p class="mt-1 text-sm text-slate-600">${t.descripcion || 'Sin descripción.'}</p>
            </div>
          </li>`
        )
        .join('');
    } catch (e) {
      EquiWorkUi.toast(e.message, 'danger');
    } finally {
      EquiWorkUi.setLoading(loading, false);
    }
  }

  cargar();
})();