const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { fixture, sample } = require('./helpers.cjs');
const { evaluarSospecha } = require('../src/anomalias');

test('fallo al abrir no modifica memoria; la cola se recupera y no consume ID', async (t) => {
  const f = await fixture(t, { records: [{ id: 40, ...sample }] });
  const before = fs.readFileSync(f.dataFile);
  const status = (await f.request('/api/status')).body;
  const original = fs.promises.open.bind(fs.promises);
  let failed = false;
  t.mock.method(fs.promises, 'open', async (...args) => {
    if (!failed) {
      failed = true;
      throw Object.assign(new Error('private'), { code: 'EACCES' });
    }
    return original(...args);
  });
  const response = await f.post();
  assert.equal(response.status, 500);
  assert.deepEqual(response.body, { ok: false, mensaje: 'No se pudo guardar la medicion.' });
  assert.deepEqual((await f.request('/api/status')).body, status);
  assert.deepEqual(fs.readFileSync(f.dataFile), before);
  assert.equal((await f.post()).body.medicion.id, 41);
});

test('201 y memoria esperan la escritura real, incluso con E/S demorada', async (t) => {
  const gate = Promise.withResolvers();
  t.after(() => gate.resolve());
  const f = await fixture(t);
  const original = fs.promises.open.bind(fs.promises);
  const entered = Promise.withResolvers();
  t.mock.method(fs.promises, 'open', async (...args) => {
    const handle = await original(...args);
    const write = handle.writeFile.bind(handle);
    t.mock.method(handle, 'writeFile', async (...writeArgs) => {
      entered.resolve();
      await gate.promise;
      return write(...writeArgs);
    });
    return handle;
  });
  let completed = false;
  const post = f.post().then((response) => {
    completed = true;
    return response;
  });
  await entered.promise;
  assert.equal(completed, false);
  assert.equal((await f.request('/api/status')).body.mediciones_totales, 0);
  assert.equal((await f.request('/api/mediciones/ultimo')).status, 404);
  gate.resolve();
  assert.equal((await post).status, 201);
  assert.equal((await f.request('/api/status')).body.mediciones_totales, 1);
});

test('escritura parcial se revierte byte a byte y permite reintentar', async (t) => {
  const f = await fixture(t, { records: [{ id: 1, ...sample }] });
  const before = fs.readFileSync(f.dataFile);
  const original = fs.promises.open.bind(fs.promises);
  let fail = true;
  t.mock.method(fs.promises, 'open', async (...args) => {
    const handle = await original(...args);
    const write = handle.writeFile.bind(handle);
    if (fail) {
      fail = false;
      t.mock.method(handle, 'writeFile', async (line) => {
        await write(line.slice(0, 15));
        throw Object.assign(new Error('disk full'), { code: 'ENOSPC' });
      });
    }
    return handle;
  });
  assert.equal((await f.post()).status, 500);
  assert.deepEqual(fs.readFileSync(f.dataFile), before);
  assert.equal((await f.request('/api/status')).body.mediciones_totales, 1);
  assert.equal((await f.post()).body.medicion.id, 2);
});

test('fallo de restauración bloquea ingesta posterior sin cambiar memoria', async (t) => {
  const f = await fixture(t, { records: [{ id: 1, ...sample }] });
  const original = fs.promises.open.bind(fs.promises);
  let opens = 0;
  t.mock.method(fs.promises, 'open', async (...args) => {
    opens += 1;
    const handle = await original(...args);
    const write = handle.writeFile.bind(handle);
    t.mock.method(handle, 'writeFile', async (line) => {
      await write(line.slice(0, 10));
      throw Object.assign(new Error('disk full'), { code: 'ENOSPC' });
    });
    return handle;
  });
  t.mock.method(fs.promises, 'truncate', async () => {
    throw Object.assign(new Error('denied'), { code: 'EACCES' });
  });
  assert.equal((await f.post()).status, 503);
  const bytesAfter = fs.readFileSync(f.dataFile);
  assert.equal((await f.post()).status, 503);
  assert.equal(opens, 1);
  assert.deepEqual(fs.readFileSync(f.dataFile), bytesAfter);
  assert.equal((await f.request('/api/status')).body.mediciones_totales, 1);
});

test('POST concurrentes generan IDs únicos, archivo ordenado y anomalías respecto del último confirmado', async (t) => {
  const f = await fixture(t, { maxInMemory: 7 });
  const responses = await Promise.all(
    Array.from({ length: 25 }, (_, index) =>
      f.post({ ...sample, concentracion_CO2_ppm: 500 + index * 400 })
    )
  );
  assert.ok(responses.every((response) => response.status === 201));
  assert.equal(new Set(responses.map((response) => response.body.medicion.id)).size, 25);
  const records = fs.readFileSync(f.dataFile, 'utf8').trim().split('\n').map(JSON.parse);
  assert.deepEqual(
    records.map((record) => record.id),
    Array.from({ length: 25 }, (_, i) => i + 1)
  );
  records.forEach((record, index) => {
    const suspicion = evaluarSospecha(record, records[index - 1]);
    assert.equal(record.sospechosa, suspicion.sospechosa);
    assert.deepEqual(record.motivos_sospecha || [], suspicion.motivos);
  });
  assert.deepEqual((await f.request('/api/mediciones')).body, records.slice(-7));
  assert.equal((await f.request('/api/status')).body.mediciones_totales, 25);
});

test('histórico sin salto final se separa y próximo ID supera el máximo histórico', async (t) => {
  const record = { id: 99, ...sample };
  const f = await fixture(t, { raw: JSON.stringify(record) });
  assert.equal((await f.post()).body.medicion.id, 100);
  const records = fs.readFileSync(f.dataFile, 'utf8').trim().split('\n').map(JSON.parse);
  assert.deepEqual(
    records.map((item) => item.id),
    [99, 100]
  );
});

test('fallo al cerrar revierte el append y no anuncia éxito', async (t) => {
  const f = await fixture(t, { records: [{ id: 1, ...sample }] });
  const before = fs.readFileSync(f.dataFile);
  const original = fs.promises.open.bind(fs.promises);
  t.mock.method(fs.promises, 'open', async (...args) => {
    const handle = await original(...args);
    const close = handle.close.bind(handle);
    let first = true;
    t.mock.method(handle, 'close', async () => {
      if (first) {
        first = false;
        throw Object.assign(new Error('close failed'), { code: 'EIO' });
      }
      return close();
    });
    return handle;
  });
  assert.equal((await f.post()).status, 500);
  assert.deepEqual(fs.readFileSync(f.dataFile), before);
  assert.equal((await f.request('/api/status')).body.mediciones_totales, 1);
});

test('reinicio reconstruye conteo y próximo ID desde el archivo confirmado', async (t) => {
  const f = await fixture(t, { records: [{ id: 99, ...sample }] });
  const created = (await f.post()).body.medicion;
  const { createStore } = require('../src/store');
  const restored = createStore({ dataFile: f.dataFile, maxInMemory: 1 });
  assert.equal(restored.getTotal(), 2);
  assert.deepEqual(restored.getLast(), created);
  assert.deepEqual(restored.getMeasurements(), [created]);
  const next = await restored.append((id) => ({ id, ...sample }));
  assert.equal(next.id, 101);
});
