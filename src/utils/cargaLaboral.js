/** Meta de horas quincenales (80 h ≈ 10 días × 8 h). */
const META_HORAS_QUINCENA = 80;

function estadoCargaDesdeHoras(totalHoras) {
  const h = Number(totalHoras) || 0;
  if (h > META_HORAS_QUINCENA * 1.15) return 'sobrecarga';
  if (h < META_HORAS_QUINCENA * 0.6) return 'subasignado';
  return 'equilibrado';
}

module.exports = { META_HORAS_QUINCENA, estadoCargaDesdeHoras };