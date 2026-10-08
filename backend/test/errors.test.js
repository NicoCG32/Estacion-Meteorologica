const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { Readable } = require('node:stream');
const { fixture, sample } = require('./helpers.cjs');
const { createLogger } = require('../src/logger');
const http = require('node:http');
const { once } = require('node:events');

test('charset y codificación no soportados retornan 415 JSON', async (t) => {
  const f = await fixture(t);
  for (const [headers, mensaje] of [
    [
      { 'Content-Type': 'application/json; charset=iso-8859-1' },
      'Charset del cuerpo no soportado.',
    ],
    [
      { 'Content-Type': 'application/json', 'Content-Encoding': 'unknown' },
      'Codificacion del cuerpo no soportada.',
    ],
  ]) {
    const response = await fetch(f.url + '/api/mediciones', {
      method: 'POST',
      headers,
      body: JSON.stringify(sample),
    });
    assert.equal(response.status, 415);
    assert.deepEqual(await response.json(), { ok: false, mensaje });
  }
});

test('cliente que corta un POST incompleto no guarda ni impide atender nuevas solicitudes', async (t) => {
  const f = await fixture(t);
  const req = http.request(f.url + '/api/mediciones', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': 100 },
  });
  req.on('error', () => {});
  const closed = new Promise((resolve) => req.once('close', resolve));
  const received = once(f.server, 'request');
  req.write('{');
  const [incoming] = await received;
  const aborted = once(incoming, 'aborted');
  req.destroy();
  await Promise.all([closed, aborted]);
  assert.equal((await f.request('/api/status')).body.mediciones_totales, 0);
  assert.equal((await f.post()).status, 201);
});

test('JSON malformado, primitivos, límite y tipos de contenido tienen errores JSON', async (t) => {
  const f = await fixture(t);
  const cases = [
    ['{', 'application/json', 400, 'JSON invalido.'],
    ['null', 'application/json', 400, 'El cuerpo debe ser un objeto JSON con las mediciones.'],
    ['42', 'application/json', 400, 'El cuerpo debe ser un objeto JSON con las mediciones.'],
    ['"text"', 'application/json', 400, 'El cuerpo debe ser un objeto JSON con las mediciones.'],
    [JSON.stringify(sample), 'text/plain', 415, 'Content-Type debe ser application/json.'],
    [
      JSON.stringify({ huge: 'x'.repeat(102400) }),
      'application/json',
      413,
      'El cuerpo excede el limite de 100kb.',
    ],
  ];
  for (const [body, type, status, mensaje] of cases) {
    const response = await fetch(f.url + '/api/mediciones', {
      method: 'POST',
      headers: { 'Content-Type': type },
      body,
    });
    assert.equal(response.status, status);
    assert.match(response.headers.get('content-type'), /application\/json/);
    assert.deepEqual(await response.json(), { ok: false, mensaje });
  }
  const overflow = await fetch(f.url + '/api/mediciones', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sample).replace('20', '1e400'),
  });
  assert.equal(overflow.status, 400);
  assert.equal((await overflow.json()).errores[0].campo, 'temperatura_aire_celsius');
  assert.equal((await f.request('/api/status')).body.mediciones_totales, 0);
  assert.equal((await f.post()).status, 201);
});

test('fallo de lectura tras enviar datos interrumpe la descarga y el servidor sigue activo', async (t) => {
  const events = [];
  const f = await fixture(t, {
    records: [{ id: 1, ...sample }],
    appOptions: { logger: createLogger({ sink: (line) => events.push(JSON.parse(line)) }) },
  });
  t.mock.method(fs, 'createReadStream', () => {
    let started = false;
    const stream = new Readable({
      read() {
        if (started) return;
        started = true;
        this.push(JSON.stringify({ id: 1, ...sample }) + '\n');
        setTimeout(() => this.destroy(Object.assign(new Error('private'), { code: 'EIO' })), 30);
      },
    });
    process.nextTick(() => stream.emit('open', 0));
    return stream;
  });
  const response = await fetch(f.url + '/api/mediciones/export?format=jsonl');
  await assert.rejects(response.text());
  assert.equal((await f.request('/api/status')).status, 200);
  assert.ok(events.some((event) => event.event === 'http.stream_error' && event.code === 'EIO'));
  assert.ok(!JSON.stringify(events).includes('private'));
});

test('rutas API desconocidas responden JSON sin alterar el dashboard', async (t) => {
  const f = await fixture(t);
  const response = await f.request('/api/no-existe');
  assert.equal(response.status, 404);
  assert.deepEqual(response.body, { ok: false, mensaje: 'Ruta API no encontrada.' });
  assert.equal((await f.request('/')).status, 200);
});

test('exportación con fallo al abrir retorna JSON 500 sin filtrar rutas internas', async (t) => {
  const f = await fixture(t, { records: [{ id: 1, ...sample }] });
  const mocked = t.mock.method(fs, 'createReadStream', () => {
    const stream = new Readable({ read() {} });
    process.nextTick(() =>
      stream.destroy(Object.assign(new Error('private path'), { code: 'EACCES' }))
    );
    return stream;
  });
  for (const format of ['csv', 'jsonl']) {
    const response = await f.request('/api/mediciones/export?format=' + format);
    assert.equal(response.status, 500);
    assert.deepEqual(response.body, { ok: false, mensaje: 'Error interno del servidor.' });
    assert.ok(!response.text.includes('private'));
  }
  mocked.mock.restore();
  assert.equal((await f.request('/api/mediciones/export?format=jsonl')).status, 200);
});
