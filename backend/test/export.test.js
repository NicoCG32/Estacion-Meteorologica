const test = require('node:test');
const assert = require('node:assert/strict');
const { escapeCsv, parseDateParam, inRange } = require('../src/export');

test('CSV conserva ceros, vacíos, comas, comillas y saltos de línea', () => {
  assert.equal(escapeCsv(null), '');
  assert.equal(escapeCsv(undefined), '');
  assert.equal(escapeCsv(0), '0');
  assert.equal(escapeCsv('plain'), 'plain');
  assert.equal(escapeCsv('a,b'), '"a,b"');
  assert.equal(escapeCsv('a"b'), '"a""b"');
  assert.equal(escapeCsv('a\nb'), '"a\nb"');
});

test('fechas vacías o inválidas no producen límites; las zonas horarias se respetan', () => {
  for (const value of [undefined, '', 'invalid']) assert.equal(parseDateParam(value), null);
  assert.equal(
    parseDateParam('2026-01-01T03:00:00+03:00').toISOString(),
    '2026-01-01T00:00:00.000Z'
  );
});

test('rango inclusivo acepta extremos y rechaza fechas ausentes o fuera del intervalo', () => {
  const from = new Date('2026-01-01T00:00:00Z');
  const to = new Date('2026-01-02T00:00:00Z');
  assert.equal(inRange(from.toISOString(), from, to), true);
  assert.equal(inRange(to.toISOString(), from, to), true);
  assert.equal(inRange('2025-12-31T23:59:59Z', from, to), false);
  assert.equal(inRange('2026-01-02T00:00:01Z', from, to), false);
  assert.equal(inRange(undefined, from, to), false);
  assert.equal(inRange('invalid', from, to), false);
  assert.equal(inRange(undefined, null, null), true);
  assert.equal(inRange(to.toISOString(), from, null), true);
  assert.equal(inRange(from.toISOString(), null, to), true);
});
