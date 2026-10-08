const { ANOMALY_RULES } = require('./config');

function evaluarSospecha(actual, anterior) {
  if (!anterior) {
    return { sospechosa: false, motivos: [] };
  }

  const motivos = [];
  ANOMALY_RULES.forEach((regla) => {
    const a = actual[regla.campo];
    const b = anterior[regla.campo];
    // El firmware usa CO2=0 cuando aún no hay muestras, no como lectura ambiental.
    if (regla.campo === 'concentracion_CO2_ppm' && (a === 0 || b === 0)) return;
    if (typeof a === 'number' && typeof b === 'number') {
      const delta = Math.abs(a - b);
      if (delta >= regla.umbral) {
        motivos.push(`${regla.etiqueta} (Δ=${delta.toFixed(2)})`);
      }
    }
  });

  return { sospechosa: motivos.length > 0, motivos };
}

module.exports = { evaluarSospecha };
