window.EquiWorkApi = {
  async request(path, options = {}) {
    const config = {
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
    };

    const res = await fetch(`/api${path}`, config);
    const isJson = res.headers.get('content-type')?.includes('application/json');
    const body = isJson ? await res.json() : null;

    if (!res.ok) {
      const message = body?.message || 'Error en la solicitud';
      const err = new Error(message);
      err.status = res.status;
      err.code = body?.code;
      throw err;
    }

    return body;
  },

  get(path) {
    return this.request(path);
  },

  post(path, data) {
    return this.request(path, { method: 'POST', body: JSON.stringify(data) });
  },

  put(path, data) {
    return this.request(path, { method: 'PUT', body: JSON.stringify(data) });
  },

  patch(path, data) {
    return this.request(path, { method: 'PATCH', body: JSON.stringify(data) });
  },

  delete(path) {
    return this.request(path, { method: 'DELETE' });
  },

  async upload(path, formData) {
    const res = await fetch(`/api${path}`, {
      method: 'POST',
      credentials: 'same-origin',
      body: formData,
    });
    const body = await res.json().catch(() => null);
    if (!res.ok) {
      const err = new Error(body?.message || 'Error al subir el archivo');
      err.status = res.status;
      throw err;
    }
    return body;
  },
};
