/**
 * Calcula el rango de fechas de una quincena (1: días 1-15, 2: 16-fin de mes).
 */
function obtenerRangoQuincena(anio, mes, numeroQuincena) {
  const ultimoDia = new Date(anio, mes, 0).getDate();
  const fechaInicio =
    numeroQuincena === 1
      ? `${anio}-${String(mes).padStart(2, '0')}-01`
      : `${anio}-${String(mes).padStart(2, '0')}-16`;
  const fechaFin =
    numeroQuincena === 1
      ? `${anio}-${String(mes).padStart(2, '0')}-15`
      : `${anio}-${String(mes).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`;
  return { fechaInicio, fechaFin };
}

function etiquetaQuincena(quincena) {
  return `Q${quincena.numero_quincena} · ${quincena.mes}/${quincena.anio}`;
}

function fechaEnRango(fecha, inicio, fin) {
  const f = new Date(fecha);
  const i = new Date(inicio);
  const finDia = new Date(fin);
  return f >= i && f <= finDia;
}

module.exports = {
  obtenerRangoQuincena,
  etiquetaQuincena,
  fechaEnRango,
};
