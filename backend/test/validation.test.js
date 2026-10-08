const test = require('node:test');
const assert = require('node:assert/strict');
const { validateMeasurement } = require('../src/validation');
const { fixture, sample } = require('./helpers.cjs');

const cases = [
  ['temperatura_aire_celsius', -50, 85],
  ['humedad_aire_porcentaje', 0, 100],
  ['presion_atmosferica_hPa', 300, 1200],
  ['concentracion_CO2_ppm', 0, 40000],
  ['incertidumbre_temperatura_celsius', 0, 135],
  ['incertidumbre_humedad_porcentaje', 0, 100],
  ['latitud_grados', -90, 90],
  ['longitud_grados', -180, 180],
  ['numero_satelites', 0, 255],
];
for (const [field, min, max] of cases) {
  test(`validación de ${field}: límites, null, tipos y valores no finitos`, () => {
    for (const value of [null, min, max])
      assert.doesNotThrow(() => validateMeasurement({ ...sample, [field]: value }));
    for (const value of [min - 1, max + 1, NaN, Infinity, -Infinity, '12', true, {}, []]) {
      assert.throws(
        () => validateMeasurement({ ...sample, [field]: value }),
        (err) => err.status === 400 && err.details.errores[0].campo === field
      );
    }
  });
}

test('campos requeridos deben ser propios y satélites un entero', () => {
  assert.throws(
    () => validateMeasurement(Object.create(sample)),
    (err) => err.details.campos_faltantes.length === 4
  );
  assert.throws(
    () => validateMeasurement({ ...sample, numero_satelites: 1.5 }),
    (err) => err.status === 400
  );
});

test('API rechaza todos los metadatos reservados y campos extra sin guardar', async (t) => {
  const f = await fixture(t);
  for (const field of ['id', 'timestamp', 'sospechosa', 'motivos_sospecha', 'extra', '__proto__']) {
    const response = await f.post({ ...sample, [field]: 'cliente' });
    assert.equal(response.status, 400);
    assert.deepEqual(response.body.campos_no_permitidos, [field]);
  }
  assert.equal((await f.request('/api/status')).body.mediciones_totales, 0);
  const accepted = await f.post({
    ...sample,
    incertidumbre_temperatura_celsius: null,
    incertidumbre_humedad_porcentaje: null,
    latitud_grados: null,
    longitud_grados: null,
    numero_satelites: 0,
  });
  assert.equal(accepted.status, 201);
});

test('API enumera errores de tipo/rango y conserva estado ante rechazo', async (t) => {
  const f = await fixture(t);
  const response = await f.post({
    ...sample,
    temperatura_aire_celsius: '20',
    humedad_aire_porcentaje: 101,
    numero_satelites: 2.5,
  });
  assert.equal(response.status, 400);
  assert.deepEqual(
    response.body.errores.map((err) => err.campo),
    ['temperatura_aire_celsius', 'humedad_aire_porcentaje', 'numero_satelites']
  );
  assert.equal((await f.request('/api/status')).body.mediciones_totales, 0);
});
