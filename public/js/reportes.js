(function () {
  const sel = document.getElementById('repQuincena');
  const preview = document.getElementById('reportePreview');
  const loading = document.getElementById('reporteLoading');
  const btnExport = document.getElementById('btnExportarCsv');

  async function cargarQuincenas() {
    await EquiWorkApi.post('/quincenas/actual', {});
    const { data } = await EquiWorkApi.get('/quincenas');
    sel.innerHTML = data
      .map((q) => `<option value="${q.id}">${EquiWorkUi.etiquetaQuincena(q)}</option>`)
      .join('');
    actualizarExportLink();
  }

  function actualizarExportLink() {
    btnExport.href = `/api/reportes/${sel.value}/export/csv`;
  }

  sel.addEventListener('change', actualizarExportLink);

  document.getElementById('btnVistaPrevia').addEventListener('click', async () => {
    EquiWorkUi.setLoading(loading, true);
    try {
      const { data } = await EquiWorkApi.get(`/reportes/${sel.value}`);
      preview.textContent = JSON.stringify(data, null, 2);
      EquiWorkUi.toast('Reporte generado');
    } catch (e) {
      EquiWorkUi.toast(e.message, 'danger');
    } finally {
      EquiWorkUi.setLoading(loading, false);
    }
  });

  cargarQuincenas().catch((e) => EquiWorkUi.toast(e.message, 'danger'));
})();
