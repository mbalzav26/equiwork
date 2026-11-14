(function () {
  const modalId = 'modalColaborador';
  const form = document.getElementById('formColaborador');
  const loading = document.getElementById('colabLoading');
  const esAdmin = window.EQUIWORK_USER_ES_ADMIN === true;
  const bloqueCuenta = document.getElementById('bloqueCuentaEncuesta');
  const inputBuscar = document.getElementById('colabBuscar');
  const hintBuscar = document.getElementById('colabBuscarHint');
  let buscarTimer = null;

  function rolesFromForm() {
    const roles = [];
    if (document.getElementById('colabRolColaborador')?.checked) roles.push('COLABORADOR');
    if (document.getElementById('colabRolAdmin')?.checked) roles.push('ADMINISTRADOR');
    return roles;
  }

  function payloadFromForm() {
    const payload = {
      nombres: document.getElementById('colabNombres').value.trim(),
      apellidos: document.getElementById('colabApellidos').value.trim(),
      email: document.getElementById('colabEmail').value.trim(),
      tipo_documento: document.getElementById('colabTipoDoc').value,
      numero_documento: document.getElementById('colabNumDoc').value.trim(),
      cargo: document.getElementById('colabCargo').value.trim(),
      area: document.getElementById('colabArea').value.trim(),
    };
    const id = document.getElementById('colabId').value;
    if (!id && document.getElementById('colabCrearCuenta').checked) {
      payload.crear_cuenta_encuesta = true;
      payload.password_encuesta = document.getElementById('colabPasswordEncuesta').value.trim();
      payload.roles_cuenta = rolesFromForm();
    }
    return payload;
  }

  function abrirNuevo() {
    document.getElementById('modalColaboradorTitulo').textContent = 'Nuevo colaborador';
    document.getElementById('colabId').value = '';
    form.reset();
    document.getElementById('colabCrearCuenta').checked = true;
    document.getElementById('colabCargo').value = 'recreador';
    document.getElementById('colabTipoDoc').value = 'CC';
    document.getElementById('colabPasswordEncuesta').value = 'Colab123!';
    document.getElementById('colabRolColaborador').checked = true;
    const rolAdmin = document.getElementById('colabRolAdmin');
    if (rolAdmin) rolAdmin.checked = false;
    bloqueCuenta.classList.remove('hidden');
  }

  function editarColaborador(colab) {
    document.getElementById('modalColaboradorTitulo').textContent = 'Editar colaborador';
    document.getElementById('colabId').value = colab.id;
    document.getElementById('colabNombres').value = colab.nombres;
    document.getElementById('colabApellidos').value = colab.apellidos;
    document.getElementById('colabEmail').value = colab.email;
    document.getElementById('colabTipoDoc').value = colab.tipo_documento || 'CC';
    document.getElementById('colabNumDoc').value = colab.numero_documento || '';
    document.getElementById('colabCargo').value = colab.cargo;
    document.getElementById('colabArea').value = colab.area;
    bloqueCuenta.classList.add('hidden');
    EquiWorkUi.modal.open(modalId);
  }

  async function crearCuentaEncuesta(id, email) {
    const password = window.prompt(
      `Contraseña temporal para ${email} (mín. 8 caracteres):`,
      'Colab123!'
    );
    if (password === null) return;
    const roles = ['COLABORADOR'];
    if (
      esAdmin &&
      window.confirm('¿Incluir también rol ADMINISTRADOR? (Aceptar = sí)')
    ) {
      roles.push('ADMINISTRADOR');
    }
    try {
      const res = await EquiWorkApi.post(`/colaboradores/${id}/cuenta-encuesta`, {
        password,
        roles_cuenta: roles,
      });
      EquiWorkUi.toast(
        `Usuario: ${res.data.email} / ${res.data.password_temporal} (roles: ${(res.data.roles || []).join(', ')})`
      );
      await listar();
    } catch (e) {
      EquiWorkUi.toast(e.message, 'danger');
    }
  }

  async function desactivarColaborador(id) {
    if (!confirm('¿Desactivar este colaborador?')) return;
    try {
      await EquiWorkApi.delete(`/colaboradores/${id}`);
      EquiWorkUi.toast('Colaborador desactivado');
      await listar();
    } catch (e) {
      EquiWorkUi.toast(e.message, 'danger');
    }
  }

  function celdaEncuesta(c) {
    if (c.acceso_sistema) {
      const roles = c.cuenta_roles?.length ? c.cuenta_roles.join(' + ') : c.cuenta_rol || '—';
      return `<span class="ew-badge-equilibrado">${roles}</span>`;
    }
    return `<button type="button" class="ew-btn-secondary min-h-9 px-3 py-1.5 text-xs" data-action="cuenta" data-id="${c.id}" data-email="${c.email}">Crear usuario</button>`;
  }

  function docLabel(c) {
    return `${c.tipo_documento || 'CC'} ${c.numero_documento || '—'}`;
  }

  async function listar(opciones = {}) {
    const silencioso = opciones.silencioso === true;
    if (!silencioso) EquiWorkUi.setLoading(loading, true);
    const q = esAdmin && inputBuscar ? inputBuscar.value.trim() : '';
    try {
      let path = '/colaboradores';
      if (q) path += `?q=${encodeURIComponent(q)}`;
      const { data } = await EquiWorkApi.get(path);
      const tbody = document.querySelector('#tablaColaboradores tbody');
      if (hintBuscar) {
        if (!q) {
          hintBuscar.textContent = '';
        } else if (!data.length) {
          hintBuscar.textContent = 'Sin coincidencias';
        } else {
          hintBuscar.textContent =
            data.length === 1 ? '1 coincidencia' : `${data.length} coincidencias`;
        }
      }
      tbody.innerHTML = data
        .map((c) => {
          const acciones = `<button type="button" class="ew-btn-ghost mr-2 min-h-9 px-3 py-1.5 text-xs" data-action="edit" data-id="${c.id}">Editar</button>${
            esAdmin
              ? `<button type="button" class="ew-btn-danger min-h-9 px-3 py-1.5 text-xs" data-action="delete" data-id="${c.id}">Desactivar</button>`
              : ''
          }`;
          return `<tr data-colab="${encodeURIComponent(JSON.stringify(c))}">
            <td><span class="font-medium text-slate-900">${c.nombres} ${c.apellidos}</span></td>
            <td><span class="text-sm text-slate-600">${docLabel(c)}</span></td>
            <td>${c.email}</td>
            <td>${c.cargo}</td>
            <td><span class="ew-badge-neutral">${c.area}</span></td>
            <td>${celdaEncuesta(c)}</td>
            <td class="text-right">${acciones}</td>
          </tr>`;
        })
        .join('');
    } catch (e) {
      if (!silencioso) EquiWorkUi.toast(e.message, 'danger');
    } finally {
      if (!silencioso) EquiWorkUi.setLoading(loading, false);
    }
  }

  function programarBusqueda() {
    clearTimeout(buscarTimer);
    buscarTimer = setTimeout(() => listar({ silencioso: true }), 250);
  }

  const tablaBody = document.querySelector('#tablaColaboradores tbody');
  tablaBody.addEventListener('click', (ev) => {
    const btn = ev.target.closest('button[data-action]');
    if (!btn) return;
    const row = btn.closest('tr');
    if (btn.dataset.action === 'edit') {
      editarColaborador(JSON.parse(decodeURIComponent(row.dataset.colab)));
    } else if (btn.dataset.action === 'delete') {
      desactivarColaborador(btn.dataset.id);
    } else if (btn.dataset.action === 'cuenta') {
      crearCuentaEncuesta(btn.dataset.id, btn.dataset.email);
    }
  });

  document.getElementById('btnNuevoColaborador').addEventListener('click', () => {
    abrirNuevo();
    EquiWorkUi.modal.open(modalId);
  });

  inputBuscar?.addEventListener('input', programarBusqueda);
  inputBuscar?.addEventListener('search', () => {
    clearTimeout(buscarTimer);
    listar({ silencioso: true });
  });

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const id = document.getElementById('colabId').value;
    const payload = payloadFromForm();
    if (!id && payload.crear_cuenta_encuesta && !payload.roles_cuenta.length) {
      EquiWorkUi.toast('Selecciona al menos un rol para el usuario', 'danger');
      return;
    }
    try {
      if (id) {
        await EquiWorkApi.put(`/colaboradores/${id}`, payload);
        EquiWorkUi.toast('Colaborador actualizado');
      } else {
        const res = await EquiWorkApi.post('/colaboradores', payload);
        if (res.data?.cuenta_encuesta) {
          const ce = res.data.cuenta_encuesta;
          EquiWorkUi.toast(
            `Colaborador creado. Usuario: ${ce.email} / ${ce.password_temporal} (roles: ${(ce.roles || []).join(', ')})`
          );
        } else {
          EquiWorkUi.toast('Colaborador creado');
        }
      }
      EquiWorkUi.modal.close(modalId);
      await listar();
    } catch (e) {
      EquiWorkUi.toast(e.message, 'danger');
    }
  });

  listar();
})();