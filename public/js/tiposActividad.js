window.EquiWorkTiposActividad = {
  async fetchActivos() {
    const { data } = await EquiWorkApi.get('/tipos-actividad');
    return data;
  },

  fillSelect(selectEl, tipos) {
    if (!selectEl) return;
    if (!tipos.length) {
      selectEl.innerHTML = '<option value="">Sin tipos disponibles</option>';
      return;
    }
    selectEl.innerHTML = tipos
      .map((t) => {
        const title = t.descripcion ? ` title="${String(t.descripcion).replace(/"/g, '&quot;')}"` : '';
        return `<option value="${String(t.nombre).replace(/"/g, '&quot;')}"${title}>${t.nombre}</option>`;
      })
      .join('');
  },

  bindDescripcionHint(selectEl, hintEl, tipos) {
    if (!selectEl || !hintEl) return;
    const update = () => {
      const tipo = tipos.find((t) => t.nombre === selectEl.value);
      const text = tipo?.descripcion?.trim() || '';
      hintEl.textContent = text;
      hintEl.classList.toggle('hidden', !text);
    };
    selectEl.removeEventListener('change', selectEl._ewTipoHintHandler);
    selectEl._ewTipoHintHandler = update;
    selectEl.addEventListener('change', update);
    update();
  },
};
