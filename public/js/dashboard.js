(function () {
  let chartHoras = null;
  let chartEventos = null;

  const sel = document.getElementById('selectQuincena');
  const loading = document.getElementById('dashboardLoading');

  async function cargarQuincenas() {
    await EquiWorkApi.post('/quincenas/actual', {});
    const { data } = await EquiWorkApi.get('/quincenas');
    sel.innerHTML = data
      .map((q) => `<option value="${q.id}">${EquiWorkUi.etiquetaQuincena(q)}</option>`)
      .join('');
  }

  function renderTabla(items) {
    const tbody = document.querySelector('#tablaBalance tbody');
    tbody.innerHTML = items
      .map(
        (c) => `<tr>
        <td><span class="font-medium text-slate-900">${c.nombre}</span><br><span class="text-xs text-slate-500">${c.cargo}</span></td>
        <td><span class="ew-badge-neutral">${c.area}</span></td>
        <td class="font-semibold text-slate-900">${c.total_horas.toFixed(1)} h</td>
        <td>${c.total_eventos}</td>
        <td>${EquiWorkUi.badgeEstadoCarga(c.estado_carga)}</td>
      </tr>`
      )
      .join('');
  }

  function renderCharts(items, meta) {
    const labels = items.map((c) => c.nombre.split(' ')[0]);
    const horas = items.map((c) => c.total_horas);
    const eventos = items.map((c) => c.total_eventos);
    const colors = items.map((c) => {
      if (c.estado_carga === 'sobrecarga') return '#ef4444';
      if (c.estado_carga === 'subasignado') return '#f59e0b';
      return '#0474C4';
    });

    if (chartHoras) chartHoras.destroy();
    if (chartEventos) chartEventos.destroy();

    chartHoras = new Chart(document.getElementById('chartHoras'), {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Horas',
            data: horas,
            backgroundColor: colors,
          },
          {
            type: 'line',
            label: 'Meta',
            data: labels.map(() => meta),
            borderColor: '#06457F',
            borderDash: [6, 4],
            fill: false,
            pointRadius: 0,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          tooltip: {
            callbacks: {
              label(ctx) {
                return `${ctx.dataset.label}: ${ctx.parsed.y}`;
              },
            },
          },
        },
        scales: { y: { beginAtZero: true, title: { display: true, text: 'Horas' } } },
      },
    });

    chartEventos = new Chart(document.getElementById('chartEventos'), {
      type: 'bar',
      data: {
        labels,
        datasets: [{ label: 'Eventos', data: eventos, backgroundColor: '#5379AE' }],
      },
      options: {
        responsive: true,
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
      },
    });
  }

  let primeraCargaBalance = true;

  async function cargarBalance() {
    const quincenaId = sel.value;
    if (!quincenaId) return;
    const content = document.querySelector('[data-page-content]');
    if (primeraCargaBalance) {
      EquiWorkUi.setLoading(loading, true);
    } else {
      EquiWorkUi.setBusy(content, true);
    }
    try {
      const { data } = await EquiWorkApi.get(`/dashboard/balance/${quincenaId}`);
      document.getElementById('kpiPromedio').textContent = `${data.promedio_horas} h`;
      document.getElementById('kpiMeta').textContent = `${data.meta_horas} h`;
      document.getElementById('kpiPeriodo').textContent = data.quincena.etiqueta;
      renderTabla(data.colaboradores);
      renderCharts(data.colaboradores, data.meta_horas);
    } catch (e) {
      EquiWorkUi.toast(e.message, 'danger');
    } finally {
      if (primeraCargaBalance) {
        EquiWorkUi.setLoading(loading, false);
        primeraCargaBalance = false;
      } else {
        EquiWorkUi.setBusy(content, false);
      }
    }
  }

  document.getElementById('btnFiltrarQuincena').addEventListener('click', cargarBalance);

  (async function init() {
    try {
      await cargarQuincenas();
      await cargarBalance();
    } catch (e) {
      EquiWorkUi.toast(e.message, 'danger');
    }
  })();
})();
