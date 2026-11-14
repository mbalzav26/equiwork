window.EquiWorkUi = {
  toast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const id = `toast-${Date.now()}`;
    const styles =
      type === 'success'
        ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
        : 'border-red-200 bg-red-50 text-red-900';

    container.insertAdjacentHTML(
      'beforeend',
      `<div id="${id}" class="pointer-events-auto animate-[fadeInUp_0.25s_ease] rounded-xl border px-4 py-3 text-sm shadow-lg ${styles}" role="status">
        <div class="flex items-start justify-between gap-3">
          <p class="font-medium">${message}</p>
          <button type="button" class="rounded-md px-1 text-current/70 hover:text-current" aria-label="Cerrar" data-toast-close>&times;</button>
        </div>
      </div>`
    );

    const el = document.getElementById(id);
    const close = () => {
      el.classList.add('opacity-0', 'translate-y-1');
      setTimeout(() => el.remove(), 180);
    };
    el.querySelector('[data-toast-close]').addEventListener('click', close);
    setTimeout(close, 4200);
  },

  setLoading(el, visible) {
    if (!el) return;
    el.classList.toggle('hidden', !visible);
    el.setAttribute('aria-busy', visible ? 'true' : 'false');
    if (el.dataset.loadingScope === 'page') {
      const page = el.closest('.ew-page') || el.closest('main');
      const content = page?.querySelector('[data-page-content]');
      if (content) {
        content.classList.toggle('hidden', visible);
        content.setAttribute('aria-hidden', visible ? 'true' : 'false');
      }
    } else if (el.dataset.loadingScope === 'section' && el.parentElement) {
      [...el.parentElement.children].forEach((child) => {
        if (child === el) return;
        child.classList.toggle('invisible', visible);
        child.setAttribute('aria-hidden', visible ? 'true' : 'false');
      });
      el.classList.toggle('ew-section-loading--overlay', visible);
    }
  },

  setBusy(el, visible) {
    if (!el) return;
    el.classList.toggle('ew-is-busy', visible);
    el.setAttribute('aria-busy', visible ? 'true' : 'false');
  },

  MESES_ES: [
    'ENERO',
    'FEBRERO',
    'MARZO',
    'ABRIL',
    'MAYO',
    'JUNIO',
    'JULIO',
    'AGOSTO',
    'SEPTIEMBRE',
    'OCTUBRE',
    'NOVIEMBRE',
    'DICIEMBRE',
  ],

  /** Ej: QUINCENA 2 OCTUBRE */
  etiquetaQuincena(q) {
    const mes = this.MESES_ES[(q.mes || 1) - 1] || '';
    return `QUINCENA ${q.numero_quincena} ${mes}`;
  },

  /** Texto auxiliar con año y rango de fechas */
  detalleQuincena(q) {
    return `${q.anio} · ${q.fecha_inicio} a ${q.fecha_fin}`;
  },

  badgeEstadoCarga(estado) {
    const labels = {
      sobrecarga: 'Sobrecarga',
      equilibrado: 'Equilibrado',
      subasignado: 'Subasignado',
    };
    const cls = {
      sobrecarga: 'ew-badge-sobrecarga',
      equilibrado: 'ew-badge-equilibrado',
      subasignado: 'ew-badge-subasignado',
    };
    return `<span class="${cls[estado] || 'ew-badge-neutral'}">${labels[estado] || estado}</span>`;
  },

  modal: {
    open(id) {
      const modal = document.getElementById(id);
      if (!modal) return;
      modal.classList.remove('hidden');
      document.body.classList.add('overflow-hidden');
      const firstInput = modal.querySelector('input:not([type="hidden"]), select, textarea');
      if (firstInput) setTimeout(() => firstInput.focus(), 50);
    },
    close(id) {
      const modal = document.getElementById(id);
      if (!modal) return;
      modal.classList.add('hidden');
      if (!document.querySelector('[data-modal]:not(.hidden)')) {
        document.body.classList.remove('overflow-hidden');
      }
    },
  },

  openImageLightbox(src, alt = 'Foto de perfil') {
    const img = document.getElementById('modalFotoAmpliadaImg');
    if (!img || !src) return;
    img.src = src;
    img.alt = alt;
    this.modal.open('modalFotoAmpliada');
  },
};
