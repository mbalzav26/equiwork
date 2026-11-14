/**
 * Combobox de colaboradores con búsqueda (Ley de Hick / Fitts).
 */
class ColaboradorSearch {
  constructor(config) {
    this.wrap = document.getElementById(config.wrapId);
    this.searchInput = document.getElementById(config.searchInputId);
    this.hiddenInput = document.getElementById(config.hiddenInputId);
    this.listEl = document.getElementById(config.listId);
    this.clearBtn = document.getElementById(config.clearBtnId);
    this.iconSearch = document.getElementById(config.searchIconId);
    this.colaboradores = [];
    this.selected = null;
    this.onChange = config.onChange || (() => {});

    if (this.iconSearch && window.Heroicons) {
      this.iconSearch.innerHTML = Heroicons.outline('magnifying-glass', 'h-5 w-5');
    }
    if (this.clearBtn && window.Heroicons) {
      this.clearBtn.innerHTML = Heroicons.outline('x-mark', 'h-4 w-4');
    }

    this.searchInput.addEventListener('input', () => this.onSearchInput());
    this.searchInput.addEventListener('focus', () => this.openList(this.filtered()));
    this.searchInput.addEventListener('keydown', (ev) => this.onKeyDown(ev));
    this.clearBtn.addEventListener('click', () => this.clear());
    document.addEventListener('click', (ev) => {
      if (!this.wrap.contains(ev.target)) this.closeList();
    });
  }

  setColaboradores(items) {
    this.colaboradores = items.map((c) => ({
      ...c,
      label: `${c.nombres} ${c.apellidos}`,
      search: `${c.nombres} ${c.apellidos} ${c.email} ${c.area} ${c.cargo}`.toLowerCase(),
    }));
    if (this.colaboradores.length > 0) {
      this.select(this.colaboradores[0], false);
    } else {
      this.clear(false);
    }
  }

  filtered(term) {
    const q = (term ?? this.searchInput.value).trim().toLowerCase();
    if (!q) return this.colaboradores.slice(0, 30);
    return this.colaboradores.filter((c) => c.search.includes(q)).slice(0, 30);
  }

  onSearchInput() {
    this.hiddenInput.value = '';
    this.selected = null;
    this.toggleClear(false);
    this.openList(this.filtered());
  }

  openList(items) {
    if (items.length === 0) {
      this.listEl.innerHTML = '<li class="ew-combobox-empty">Sin resultados</li>';
    } else {
      this.listEl.innerHTML = items
        .map(
          (c) => `<li>
            <button type="button" class="ew-combobox-option" data-id="${c.id}">
              <span class="ew-combobox-option-icon">${Heroicons.outline('user', 'h-4 w-4')}</span>
              <span class="min-w-0">
                <span class="block truncate font-medium text-slate-900">${c.label}</span>
                <span class="block truncate text-xs text-slate-500">${c.area} · ${c.cargo}</span>
              </span>
            </button>
          </li>`
        )
        .join('');
      this.listEl.querySelectorAll('[data-id]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const col = this.colaboradores.find((x) => String(x.id) === btn.dataset.id);
          if (col) this.select(col, true);
        });
      });
    }
    this.listEl.classList.remove('hidden');
  }

  closeList() {
    this.listEl.classList.add('hidden');
  }

  select(col, notify = true) {
    this.selected = col;
    this.hiddenInput.value = col.id;
    this.searchInput.value = col.label;
    this.toggleClear(true);
    this.closeList();
    if (notify) this.onChange(col);
  }

  clear(notify = true) {
    this.selected = null;
    this.hiddenInput.value = '';
    this.searchInput.value = '';
    this.toggleClear(false);
    this.closeList();
    if (notify) this.onChange(null);
  }

  toggleClear(visible) {
    this.clearBtn.classList.toggle('hidden', !visible);
  }

  onKeyDown(ev) {
    if (ev.key === 'Escape') {
      this.closeList();
      return;
    }
    if (ev.key === 'Enter') {
      const first = this.listEl.querySelector('[data-id]');
      if (first && !this.hiddenInput.value) {
        ev.preventDefault();
        first.click();
      }
    }
  }

  getValue() {
    return this.hiddenInput.value ? Number(this.hiddenInput.value) : null;
  }
}

window.ColaboradorSearch = ColaboradorSearch;
