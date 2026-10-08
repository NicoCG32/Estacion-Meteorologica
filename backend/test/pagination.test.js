const test = require('node:test');
const assert = require('node:assert/strict');
const { fixture, sample } = require('./helpers.cjs');

test('páginas recientes admiten offset y orden explícito sin cambiar ?limit=', async (t) => {
  const records = [9, 3, 7, 1, 5].map((id) => ({ id, ...sample }));
  const f = await fixture(t, { records });
  for (const [query, expected] of [
    ['', records],
    ['?limit=2', records.slice(-2)],
    ['?limit=2&offset=0&order=asc', records.slice(-2)],
    ['?limit=2&offset=0&order=desc', records.slice(-2).reverse()],
    ['?limit=2&offset=2&order=asc', records.slice(1, 3)],
    ['?limit=2&offset=2&order=desc', records.slice(1, 3).reverse()],
    ['?offset=2', records.slice(0, 3)],
    ['?limit=2&offset=5', []],
    ['?limit=20', records],
    ['?order=desc', records.slice().reverse()],
  ])
    assert.deepEqual((await f.request('/api/mediciones' + query)).body, expected, query);
  assert.deepEqual((await f.request('/api/mediciones')).body, records);
});

test('consultas inválidas no aceptan fracciones, repeticiones, estructuras o enteros inseguros', async (t) => {
  const f = await fixture(t);
  for (const query of [
    'limit=0',
    'limit=',
    'limit=1e2',
    'limit=2x',
    'limit=2.5',
    'limit=9007199254740992',
    'limit=1&limit=2',
    'offset=-1',
    'offset=1.2',
    'offset=0x2',
    'offset=',
    'offset=9007199254740992',
    'order=other',
    'order=asc&order=desc',
  ]) {
    const response = await f.request('/api/mediciones?' + query);
    assert.equal(response.status, 400, query);
    assert.equal(response.body.ok, false);
  }
});

test('exportación rechaza fechas imposibles, sin zona horaria y repetidas', async (t) => {
  const f = await fixture(t, { records: [] });
  for (const query of [
    'from=2026-02-30',
    'from=2026-01-01T10:00:00',
    'from=2026-01-01&from=2026-01-02',
    'from=2026-01-02&to=2026-01-01',
  ]) {
    const response = await f.request('/api/mediciones/export?' + query);
    assert.equal(response.status, 400, query);
    assert.equal(response.body.ok, false);
  }
});
