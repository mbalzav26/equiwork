window.EquiWorkTheme = {
  STORAGE_KEY: 'equiwork-theme',

  isDark() {
    return document.documentElement.classList.contains('ew-dark');
  },

  apply(dark) {
    document.documentElement.classList.toggle('ew-dark', dark);
    localStorage.setItem(this.STORAGE_KEY, dark ? 'dark' : 'light');
    this.syncToggleButtons();
  },

  init() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    const dark =
      saved === 'dark' || (saved !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('ew-dark', dark);
    if (!saved) {
      localStorage.setItem(this.STORAGE_KEY, dark ? 'dark' : 'light');
    }
    this.syncToggleButtons();
  },

  toggle() {
    this.apply(!this.isDark());
  },

  syncToggleButtons() {
    const dark = this.isDark();
    document.querySelectorAll('.ew-theme-switch').forEach((btn) => {
      btn.setAttribute('aria-checked', dark ? 'true' : 'false');
    });
    document.querySelectorAll('.ew-theme-widget').forEach((widget) => {
      widget.classList.toggle('ew-theme-widget--dark', dark);
    });
  },
};

(function () {
  function bindToggles() {
    document.querySelectorAll('.ew-theme-switch').forEach((btn) => {
      btn.addEventListener('click', () => EquiWorkTheme.toggle());
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    EquiWorkTheme.init();
    bindToggles();
  });
})();
