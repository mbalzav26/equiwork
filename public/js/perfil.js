(function () {
  const loading = document.getElementById('perfilLoading');
  const contenido = document.getElementById('perfilContenido');
  const bloqueColab = document.getElementById('bloqueColaboradorPerfil');
  const bloqueDoc = document.getElementById('bloqueDocumentoPerfil');
  let tieneColaborador = false;

  function setFotoPreview(url) {
    const img = document.getElementById('perfilFotoPreview');
    const ph = document.getElementById('perfilFotoPlaceholder');
    if (url) {
      img.src = url;
      img.alt = 'Tu foto de perfil';
      img.tabIndex = 0;
      img.classList.remove('hidden');
      ph.classList.add('hidden');
    } else {
      img.src = '';
      img.alt = '';
      img.tabIndex = -1;
      img.classList.add('hidden');
      ph.classList.remove('hidden');
    }
  }

  async function cargar() {
    EquiWorkUi.setLoading(loading, true);
    try {
      const { data } = await EquiWorkApi.get('/perfil');
      const u = data.usuario;
      document.getElementById('perfilNombre').value = u.nombre || '';
      document.getElementById('perfilEmail').value = u.email || '';
      document.getElementById('perfilRol').value = (u.roles || [u.rol]).join(' · ');
      setFotoPreview(u.foto_url);

      tieneColaborador = Boolean(data.colaborador);
      if (data.colaborador) {
        bloqueDoc.classList.remove('hidden');
        const c = data.colaborador;
        document.getElementById('perfilTipoDoc').value =
          c.tipo_documento_label || c.tipo_documento || '—';
        document.getElementById('perfilNumDoc').value = c.numero_documento || '—';
        bloqueColab.classList.remove('hidden');
        document.getElementById('perfilNombres').value = c.nombres;
        document.getElementById('perfilApellidos').value = c.apellidos;
        document.getElementById('perfilCargo').value = c.cargo;
        document.getElementById('perfilArea').value = c.area;
        ['perfilNombres', 'perfilApellidos', 'perfilCargo', 'perfilArea'].forEach((id) => {
          document.getElementById(id).required = true;
        });
      } else {
        bloqueDoc.classList.add('hidden');
        bloqueColab.classList.add('hidden');
      }
    } catch (e) {
      EquiWorkUi.toast(e.message, 'danger');
    } finally {
      EquiWorkUi.setLoading(loading, false);
    }
  }

  document.getElementById('perfilFotoInput').addEventListener('change', async (ev) => {
    const file = ev.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('foto', file);
    try {
      const res = await EquiWorkApi.upload('/perfil/foto', fd);
      setFotoPreview(res.data.foto_url);
      EquiWorkUi.toast('Foto actualizada. Recarga la página si no ves el cambio en el menú.');
    } catch (e) {
      EquiWorkUi.toast(e.message, 'danger');
    } finally {
      ev.target.value = '';
    }
  });

  document.getElementById('formPerfil').addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const payload = {
      nombre: document.getElementById('perfilNombre').value.trim(),
      email: document.getElementById('perfilEmail').value.trim(),
    };
    if (tieneColaborador) {
      payload.colaborador = {
        nombres: document.getElementById('perfilNombres').value.trim(),
        apellidos: document.getElementById('perfilApellidos').value.trim(),
        cargo: document.getElementById('perfilCargo').value.trim(),
        area: document.getElementById('perfilArea').value.trim(),
      };
    }
    try {
      await EquiWorkApi.put('/perfil', payload);
      EquiWorkUi.toast('Perfil actualizado');
      await cargar();
    } catch (e) {
      EquiWorkUi.toast(e.message, 'danger');
    }
  });

  document.getElementById('formPasswordPerfil').addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const password_nueva = document.getElementById('perfilPassNueva').value;
    const password_confirmacion = document.getElementById('perfilPassConfirm').value;
    if (password_nueva !== password_confirmacion) {
      EquiWorkUi.toast('La confirmación no coincide', 'danger');
      return;
    }
    try {
      await EquiWorkApi.post('/perfil/cambiar-contrasena', {
        password_actual: document.getElementById('perfilPassActual').value,
        password_nueva,
        password_confirmacion,
      });
      EquiWorkUi.toast('Contraseña actualizada');
      ev.target.reset();
    } catch (e) {
      EquiWorkUi.toast(e.message, 'danger');
    }
  });

  if (window.Heroicons) {
    const ph = document.getElementById('perfilFotoPlaceholder');
    if (ph?.dataset.icon) ph.innerHTML = Heroicons.outline(ph.dataset.icon, 'h-10 w-10');
  }

  cargar();
})();