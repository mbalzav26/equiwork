const TIPOS_DOCUMENTO = Object.freeze([
  { code: 'CC', label: 'Cédula de ciudadanía (CC)' },
  { code: 'CE', label: 'Cédula de extranjería (CE)' },
  { code: 'TI', label: 'Tarjeta de identidad (TI)' },
  { code: 'PA', label: 'Pasaporte (PA)' },
  { code: 'PPT', label: 'Permiso por protección temporal (PPT)' },
  { code: 'RC', label: 'Registro civil (RC)' },
]);

const CODES = new Set(TIPOS_DOCUMENTO.map((t) => t.code));

function normalizarNumero(numero) {
  return String(numero ?? '').replace(/\s+/g, '').trim();
}

function validarDocumento(tipo, numero) {
  const tipoUp = String(tipo ?? '').toUpperCase();
  if (!CODES.has(tipoUp)) {
    return 'Tipo de documento inválido';
  }
  const n = normalizarNumero(numero);
  if (!n) return 'Número de documento requerido';
  if (!/^[A-Za-z0-9.-]+$/.test(n)) {
    return 'El documento solo puede contener letras, números, puntos o guiones';
  }
  if (['CC', 'TI', 'CE', 'RC'].includes(tipoUp) && !/^\d{5,12}$/.test(n)) {
    return 'Para CC/TI/CE/RC use entre 5 y 12 dígitos';
  }
  if (tipoUp === 'PA' && n.length < 5) {
    return 'Pasaporte demasiado corto';
  }
  if (tipoUp === 'PPT' && !/^\d{6,12}$/.test(n)) {
    return 'PPT: entre 6 y 12 dígitos';
  }
  return null;
}

module.exports = { TIPOS_DOCUMENTO, validarDocumento, normalizarNumero };