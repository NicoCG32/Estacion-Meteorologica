const { REQUIRED_FIELDS, MEASUREMENT_RULES } = require('./config');
const { HttpError } = require('./errors');

function validateMeasurement(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new HttpError(400, 'El cuerpo debe ser un objeto JSON con las mediciones.');
  }
  const missing = REQUIRED_FIELDS.filter((field) => !Object.hasOwn(data, field));
  if (missing.length) {
    throw new HttpError(400, 'Faltan campos obligatorios en el JSON recibido.', {
      campos_faltantes: missing,
    });
  }
  const unknown = Object.keys(data).filter((field) => !Object.hasOwn(MEASUREMENT_RULES, field));
  if (unknown.length) {
    throw new HttpError(400, 'Hay campos no permitidos en el JSON recibido.', {
      campos_no_permitidos: unknown,
    });
  }
  const errors = [];
  for (const [field, value] of Object.entries(data)) {
    if (value === null) continue;
    const rule = MEASUREMENT_RULES[field];
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      errors.push({ campo: field, mensaje: 'Debe ser un numero finito o null.' });
    } else if (value < rule.min || value > rule.max || (rule.integer && !Number.isInteger(value))) {
      errors.push({
        campo: field,
        mensaje: `Debe ser ${rule.integer ? 'un entero' : 'un numero'} entre ${rule.min} y ${rule.max}, o null.`,
      });
    }
  }
  if (errors.length) throw new HttpError(400, 'Mediciones invalidas.', { errores: errors });
  return data;
}

module.exports = { validateMeasurement };
