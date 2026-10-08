const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { Writable } = require('node:stream');
const { streamJsonlAsCsv, streamJsonlFiltered } = require('../src/export');
const { createLogger } = require('../src/logger');

async function dataFile(t, raw) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'meteo-export-'));
  t.after(async () => {
    assert.equal(path.dirname(root), path.resolve(os.tmpdir()));
    assert.ok(path.basename(root).startsWith('meteo-export-'));
    await fs.rm(root, { recursive: true, force: true });
  });
  const file = path.join(root, 'data.jsonl');
  await fs.writeFile(file, raw);
  return file;
}

function response() {
  const chunks = [];
  const res = new Writable({
    highWaterMark: 1,
    write(chunk, encoding, callback) {
      chunks.push(chunk.toString());
      setImmediate(callback);
    },
  });
  return { res, text: () => chunks.join('') };
}

test('streams CSV/JSONL filtran extremos inclusivos, ignoran corruptos y conservan última línea sin salto', async (t) => {
  const record = {
    id: 2,
    timestamp: '2026-01-02T00:00:00Z',
    temperatura_aire_celsius: 'a,"b"\nc',
    humedad_aire_porcentaje: null,
  };
  const file = await dataFile(
    t,
    JSON.stringify({ id: 1, timestamp: '2026-01-01T00:00:00Z' }) +
      '\r\ninvalid\nnull\n[]\n\n' +
      JSON.stringify(record)
  );
  const from = new Date('2026-01-02T00:00:00Z');
  const to = new Date('2026-01-02T00:00:00Z');
  const logger = createLogger({ level: 'silent' });
  const jsonl = response();
  await streamJsonlFiltered(file, jsonl.res, from, to, logger);
  assert.equal(jsonl.text(), JSON.stringify(record) + '\n');
  const csv = response();
  await streamJsonlAsCsv(file, csv.res, from, to, logger);
  assert.ok(csv.text().startsWith('id,timestamp,temperatura_aire_celsius,'));
  assert.ok(csv.text().endsWith('2,2026-01-02T00:00:00Z,"a,""b""\nc",,,,,,,,\n'));
});

test('streams de archivo vacío emiten solo cabecera CSV o JSONL vacío', async (t) => {
  const file = await dataFile(t, '');
  const csv = response();
  await streamJsonlAsCsv(file, csv.res, null, null);
  assert.equal(csv.text().split('\n').length, 2);
  const jsonl = response();
  await streamJsonlFiltered(file, jsonl.res, null, null);
  assert.equal(jsonl.text(), '');
});

test('fallo al abrir stream rechaza antes de escribir datos', async (t) => {
  const file = await dataFile(t, '');
  await fs.unlink(file);
  for (const exportData of [streamJsonlAsCsv, streamJsonlFiltered]) {
    const output = response();
    await assert.rejects(exportData(file, output.res, null, null), { code: 'ENOENT' });
    assert.equal(output.text(), '');
    output.res.destroy();
  }
});

test('cierre del cliente cancela un stream detenido por backpressure', async (t) => {
  const file = await dataFile(t, JSON.stringify({ id: 1 }) + '\n');
  const res = new Writable({ highWaterMark: 1, write() {} });
  const operation = streamJsonlAsCsv(file, res, null, null);
  // El callback de write provoca el cierre durante la espera de drain.
  const write = res.write.bind(res);
  res.write = (...args) => {
    const result = write(...args);
    setImmediate(() => res.destroy());
    return result;
  };
  await assert.rejects(operation, { name: 'AbortError' });
});
