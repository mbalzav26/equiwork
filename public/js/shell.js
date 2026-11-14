(function () {
  const STORAGE_KEY = 'equiwork-sidebar-collapsed';

  function injectSidebarIcons() {
    if (!window.Heroicons) return;
    document.querySelectorAll('.ew-sidebar-link[data-icon]').forEach((link) => {
      const iconEl = link.querySelector('.ew-sidebar-icon');
      if (iconEl) iconEl.innerHTML = Heroicons.outline(link.dataset.icon, 'h-5 w-5');
    });
    document.querySelectorAll('.ew-sidebar-user-icon[data-icon]').forEach((el) => {
      el.innerHTML = Heroicons.outline(el.dataset.icon, 'h-5 w-5');
    });
    document.querySelectorAll('.ew-perfil-foto--placeholder[data-icon]').forEach((el) => {
      el.innerHTML = Heroicons.outline(el.dataset.icon, 'h-10 w-10');
    });
    document.querySelectorAll('#sidebarCollapseBtn [data-icon], #sidebarMobileOpen [data-icon]').forEach((el) => {
      el.innerHTML = Heroicons.outline(el.dataset.icon, 'h-5 w-5');
    });
    document.querySelectorAll('.ew-btn-logout-icon[data-icon]').forEach((el) => {
      el.innerHTML = Heroicons.outline(el.dataset.icon, 'h-5 w-5');
    });
  }

  function markActiveNav() {
    const page = document.body.dataset.page;
    if (!page) return;
    document.querySelectorAll('[data-nav]').forEach((link) => {
      if (link.dataset.nav === page) {
        link.classList.add('ew-sidebar-link-active');
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  function initSidebar() {
    const app = document.getElementById('ewApp');
    const sidebar = document.getElementById('ewSidebar');
    const collapseBtn = document.getElementById('sidebarCollapseBtn');
    const mobileOpen = document.getElementById('sidebarMobileOpen');
    const backdrop = document.getElementById('sidebarBackdrop');
    if (!app || !sidebar) return;

    const saved = localStorage.getItem(STORAGE_KEY) === '1';
    if (saved) app.classList.add('sidebar-collapsed');

    function setCollapsed(collapsed) {
      app.classList.toggle('sidebar-collapsed', collapsed);
      localStorage.setItem(STORAGE_KEY, collapsed ? '1' : '0');
      const icon = collapseBtn?.querySelector('[data-icon]');
      if (icon) {
        icon.setAttribute('data-icon', collapsed ? 'chevron-right' : 'chevron-left');
        icon.innerHTML = Heroicons.outline(icon.getAttribute('data-icon'), 'h-5 w-5');
      }
    }

    collapseBtn?.addEventListener('click', () => {
      setCollapsed(!app.classList.contains('sidebar-collapsed'));
    });

    function openMobile() {
      sidebar.classList.add('sidebar-open');
      backdrop.hidden = false;
    }

    function closeMobile() {
      sidebar.classList.remove('sidebar-open');
      backdrop.hidden = true;
    }

    mobileOpen?.addEventListener('click', openMobile);
    backdrop?.addEventListener('click', closeMobile);

    if (saved && collapseBtn) {
      const icon = collapseBtn.querySelector('[data-icon]');
      if (icon) {
        icon.setAttribute('data-icon', 'chevron-right');
        icon.innerHTML = Heroicons.outline('chevron-right', 'h-5 w-5');
      }
    }
  }

  function initFotoLightbox() {
    function abrir(trigger) {
      const src = trigger.currentSrc || trigger.src;
      if (!src || trigger.classList.contains('hidden')) return;
      EquiWorkUi.openImageLightbox(src, trigger.alt || 'Foto de perfil');
    }

    document.addEventListener('click', (ev) => {
      const trigger = ev.target.closest('.ew-foto-ampliar');
      if (!trigger || trigger.tagName !== 'IMG') return;
      ev.preventDefault();
      ev.stopPropagation();
      abrir(trigger);
    });

    document.addEventListener('keydown', (ev) => {
      if (ev.key !== 'Enter' && ev.key !== ' ') return;
      const trigger = ev.target.closest?.('.ew-foto-ampliar');
      if (!trigger || trigger.tagName !== 'IMG') return;
      ev.preventDefault();
      abrir(trigger);
    });
  }

  function initModals() {
    document.querySelectorAll('[data-modal]').forEach((modal) => {
      modal.addEventListener('click', (ev) => {
        if (ev.target.matches('[data-modal-backdrop], [data-modal-close]')) {
          EquiWorkUi.modal.close(modal.id);
        }
      });
    });

    document.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape') {
        document.querySelectorAll('[data-modal]:not(.hidden)').forEach((modal) => {
          EquiWorkUi.modal.close(modal.id);
        });
        const sidebar = document.getElementById('ewSidebar');
        if (sidebar?.classList.contains('sidebar-open')) {
          sidebar.classList.remove('sidebar-open');
          const backdrop = document.getElementById('sidebarBackdrop');
          if (backdrop) backdrop.hidden = true;
        }
      }
    });
  }

  async function initColabNotificaciones() {
    const link = document.querySelector('[data-colab-notif="encuesta"]');
    if (!link || !window.EquiWorkApi) return;
    try {
      const { data } = await EquiWorkApi.get('/colaborador/notificaciones');
      const alta = (data.items || []).filter((i) => i.prioridad === 'alta').length;
      if (alta > 0) {
        link.classList.add('ew-sidebar-link--alert');
        const label = link.querySelector('.ew-sidebar-label');
        if (label && !label.querySelector('.ew-nav-badge')) {
          label.insertAdjacentHTML(
            'beforeend',
            ` <span class="ew-nav-badge" aria-label="${alta} avisos">!</span>`
          );
        }
      }
    } catch {
      /* sin rol colaborador o API no disponible */
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    injectSidebarIcons();
    markActiveNav();
    initSidebar();
    initModals();
    initFotoLightbox();
    initColabNotificaciones();
    window.EquiWorkTheme?.syncToggleButtons();
  });
})();
