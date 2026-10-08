const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createStore } = require('../src/store');
const { fixture, sample } = require('./helpers.cjs');

test('almacenamiento crea un directorio anidado ausente al iniciar', async (t) => {
  const f = await fixture(t);
  const dataFile = path.join(f.root, 'new', 'nested', 'data.jsonl');
  const store = createStore({ dataFile, maxInMemory: 2 });
  assert.ok(fs.statSync(path.dirname(dataFile)).isDirectory());
  assert.equal(store.getTotal(), 0);
  assert.equal(store.getLast(), null);
  const created = await store.append((id) => ({ id, ...sample }));
  assert.equal(created.id, 1);
  assert.deepEqual(JSON.parse(fs.readFileSync(dataFile, 'utf8')), created);
});

test('recarga omite primitivos y arrays históricos sin reescribir el archivo', async (t) => {
  const record = { id: 7, ...sample };
  const raw = 'null\n[]\n123\n"text"\ninvalid\n' + JSON.stringify(record) + '\n';
  const f = await fixture(t, { raw });
  assert.deepEqual((await f.request('/api/mediciones')).body, [record]);
  assert.equal((await f.request('/api/status')).body.mediciones_totales, 1);
  assert.equal(fs.readFileSync(f.dataFile, 'utf8'), raw);
});

test('ID histórico al máximo seguro bloquea nuevas escrituras sin desbordamiento', async (t) => {
  const f = await fixture(t, { records: [{ id: Number.MAX_SAFE_INTEGER, ...sample }] });
  const before = fs.readFileSync(f.dataFile);
  assert.equal((await f.post()).status, 503);
  assert.deepEqual(fs.readFileSync(f.dataFile), before);
  assert.equal((await f.request('/api/status')).body.mediciones_totales, 1);
});

test('fallo repetido al cerrar no causa rechazo sin manejar ni actualización de memoria', async (t) => {
  const f = await fixture(t, { records: [{ id: 1, ...sample }] });
  const before = fs.readFileSync(f.dataFile);
  const open = fs.promises.open.bind(fs.promises);
  t.mock.method(fs.promises, 'open', async (...args) => {
    const handle = await open(...args);
    const close = handle.close.bind(handle);
    t.mock.method(handle, 'close', async () => {
      await close();
      throw Object.assign(new Error('close failed'), { code: 'EIO' });
    });
    return handle;
  });
  assert.equal((await f.post()).status, 500);
  assert.deepEqual(fs.readFileSync(f.dataFile), before);
  assert.equal((await f.request('/api/status')).body.mediciones_totales, 1);
});
