const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { once } = require('node:events');
const { createApp } = require('../src/app');

const sample = {
  temperatura_aire_celsius: 20,
  humedad_aire_porcentaje: 50,
  presion_atmosferica_hPa: 1010,
  concentracion_CO2_ppm: 600,
};

async function fixture(t, { records, raw, maxInMemory = 1000, appOptions = {} } = {}) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'meteo-test-'));
  const dataFile = path.join(root, 'data', 'mediciones.jsonl');
  await fs.mkdir(path.dirname(dataFile));
  if (raw !== undefined || records !== undefined) {
    await fs.writeFile(
      dataFile,
      raw ?? records.map((record) => JSON.stringify(record) + '\n').join('')
    );
  }
  t.mock.method(console, 'log', () => {});
  t.mock.method(console, 'error', () => {});
  let server = null;
  t.after(async () => {
    if (server)
      await new Promise((resolve, reject) =>
        server.close((err) => (err ? reject(err) : resolve()))
      );
    assert.equal(path.dirname(root), path.resolve(os.tmpdir()));
    assert.ok(path.basename(root).startsWith('meteo-test-'));
    await fs.rm(root, { recursive: true, force: true });
  });
  const app = createApp({
    dataFile,
    staticDir: path.join(__dirname, '..', 'frontend'),
    maxInMemory,
    logRequests: false,
    ...appOptions,
  });
  server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const url = `http://127.0.0.1:${server.address().port}`;
  async function request(route, body) {
    const response = await fetch(
      url + route,
      body === undefined
        ? undefined
        : {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          }
    );
    const text = await response.text();
    return {
      status: response.status,
      headers: response.headers,
      text,
      body: response.headers.get('content-type')?.includes('application/json')
        ? JSON.parse(text)
        : undefined,
    };
  }
  async function post(body = sample) {
    const response = await request('/api/mediciones', body);
    if (response.status === 201) {
      // Un 201 ya debe corresponder a una línea completa; no esperar ni reintentar.
      const line = JSON.stringify(response.body.medicion) + '\n';
      assert.ok(
        (await fs.readFile(dataFile, 'utf8')).includes(line),
        '201 debe confirmar la línea completa en disco'
      );
    }
    return response;
  }
  return { root, dataFile, url, request, post, server };
}

module.exports = { fixture, sample };
