const test = require('node:test');
const assert = require('node:assert/strict');
const { evaluarSospecha } = require('../src/anomalias');
const { sample } = require('./helpers.cjs');

test('CO2=0 indica ausencia y no dispara saltos al perder o recuperar muestras', () => {
  for (const [current, previous] of [
    [{ ...sample, concentracion_CO2_ppm: 0 }, sample],
    [sample, { ...sample, concentracion_CO2_ppm: 0 }],
  ]) {
    assert.deepEqual(evaluarSospecha(current, previous), { sospechosa: false, motivos: [] });
  }
  assert.deepEqual(
    evaluarSospecha({ ...sample, concentracion_CO2_ppm: 0, temperatura_aire_celsius: 25 }, sample),
    { sospechosa: true, motivos: ['Cambio brusco en temperatura (Δ=5.00)'] }
  );
});

const cases = [
  ['temperatura_aire_celsius', 5, 'Cambio brusco en temperatura'],
  ['humedad_aire_porcentaje', 15, 'Cambio brusco en humedad'],
  ['presion_atmosferica_hPa', 5, 'Cambio brusco en presion'],
  ['concentracion_CO2_ppm', 400, 'Cambio brusco en CO2'],
];

for (const [field, threshold, label] of cases) {
  test(`${field}: saltos positivos y negativos por debajo, en y sobre el umbral`, () => {
    for (const sign of [-1, 1]) {
      for (const delta of [threshold - 1, threshold, threshold + 1]) {
        const current = { ...sample, [field]: sample[field] + sign * delta };
        assert.deepEqual(evaluarSospecha(current, sample), {
          sospechosa: delta >= threshold,
          motivos: delta >= threshold ? [`${label} (Δ=${delta.toFixed(2)})`] : [],
        });
      }
    }
  });
}

test('primera medición y lecturas iguales no son sospechosas', () => {
  assert.deepEqual(evaluarSospecha(sample, null), { sospechosa: false, motivos: [] });
  assert.deepEqual(evaluarSospecha(sample, sample), { sospechosa: false, motivos: [] });
});

test('null, strings y campos ausentes no se convierten a números', () => {
  for (const value of [null, '10000', undefined]) {
    for (const [field] of cases) {
      assert.deepEqual(evaluarSospecha({ ...sample, [field]: value }, sample), {
        sospechosa: false,
        motivos: [],
      });
      assert.deepEqual(evaluarSospecha(sample, { ...sample, [field]: value }), {
        sospechosa: false,
        motivos: [],
      });
    }
  }
});
