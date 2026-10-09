const test = require('node:test');
const assert = require('node:assert/strict');

const modules = Promise.all([
  import('../frontend/assets/js/state.mjs'),
  import('../frontend/assets/js/api.mjs'),
]);
const now = Date.parse('2026-10-07T12:00:00Z');
const latest = { id: 1, timestamp: new Date(now).toISOString(), temperatura_aire_celsius: 20 };
const status = {
  status: 'ok',
  mediciones_totales: 1,
  ventana_en_memoria: 1,
  max_en_memoria: 1000,
  ultima_medicion: latest,
};

test('frontend distingue carga, vacío, muestra reciente y servidor degradado', async () => {
  const [state] = await modules;
  assert.equal(state.describeState(state.initialState(), now).kind, 'loading');
  assert.equal(
    state.describeState(
      state.applySnapshot(state.initialState(), {
        status: { ...status, ultima_medicion: null },
        history: [],
      }),
      now
    ).kind,
    'empty'
  );
  const ready = state.applySnapshot(state.initialState(), { status, history: [latest] });
  assert.equal(state.describeState(ready, now).kind, 'fresh');
  assert.equal(
    state.describeState({ ...ready, status: { ...status, status: 'degraded' } }, now).kind,
    'error'
  );
});

test('vigencia respeta límite de 90 segundos y no interpreta fechas ausentes/futuras como salud', async () => {
  const [state] = await modules;
  const ready = state.applySnapshot(state.initialState(), { status, history: [latest] });
  assert.equal(state.describeState(ready, now + 90000).kind, 'fresh');
  assert.equal(state.describeState(ready, now + 90001).kind, 'stale');
  for (const timestamp of [undefined, 'invalid', new Date(now + 20000).toISOString()])
    assert.equal(
      state.describeState({ ...ready, latest: { ...latest, timestamp } }, now).kind,
      'unknown'
    );
});

test('error conserva últimas mediciones y recuperación elimina estado de fallo', async () => {
  const [state] = await modules;
  const ready = state.applySnapshot(state.initialState(), { status, history: [latest] });
  const failed = state.applyFailure(ready, new Error('Consulta fallida'));
  assert.deepEqual(failed.history, [latest]);
  assert.deepEqual(failed.latest, latest);
  assert.equal(state.describeState(failed, now).kind, 'error');
  assert.equal(state.applySnapshot(failed, { status, history: [latest] }).error, null);
});

test('historial conserva 60 puntos y compara ID/timestamp completos sin duplicar sondeos', async () => {
  const [state] = await modules;
  const history = Array.from({ length: 65 }, (_, id) => ({
    id,
    timestamp: new Date(now + id * 20000).toISOString(),
  }));
  const result = state.applySnapshot(state.initialState(), {
    status: { ...status, ultima_medicion: history.at(-1) },
    history,
  });
  assert.equal(result.history.length, 60);
  assert.deepEqual(result.history, history.slice(-60));
  assert.deepEqual(
    state.applySnapshot(result, { status: { ...status, ultima_medicion: history.at(-1) }, history })
      .history,
    result.history
  );
  const next = { id: 66, timestamp: new Date(now + 86400000).toISOString() };
  assert.deepEqual(
    state
      .applySnapshot(result, {
        status: { ...status, ultima_medicion: next },
        history: result.history,
      })
      .history.at(-1),
    next
  );
});

test('cliente API consulta estado e historial y valida la estructura', async () => {
  const [, api] = await modules;
  const urls = [];
  const client = api.createApiClient(async (url) => {
    urls.push(url);
    return { ok: true, json: async () => (url === '/api/status' ? status : [latest]) };
  });
  assert.deepEqual(await client.getSnapshot(), { status, history: [latest] });
  assert.deepEqual(urls, ['/api/status', '/api/mediciones?limit=60']);
  await assert.rejects(
    api.createApiClient(async () => ({ ok: true, json: async () => ({}) })).getSnapshot(),
    /formato/
  );
});

test('cliente API muestra fallos HTTP, de red y JSON ilegible sin exponer detalles internos', async () => {
  const [, api] = await modules;
  await assert.rejects(
    api.createApiClient(async () => ({ ok: false, status: 503 })).getSnapshot(),
    /HTTP 503/
  );
  await assert.rejects(
    api
      .createApiClient(async () => {
        throw new TypeError('private detail');
      })
      .getSnapshot(),
    { message: 'No se pudo consultar el servidor.' }
  );
  await assert.rejects(
    api
      .createApiClient(async () => ({
        ok: true,
        json: async () => {
          throw new Error('private');
        },
      }))
      .getSnapshot(),
    { message: 'No se pudo consultar el servidor.' }
  );
});

test('cliente API aborta consultas que exceden su plazo', async () => {
  const [, api] = await modules;
  const client = api.createApiClient(
    (url, { signal }) =>
      new Promise((resolve, reject) =>
        signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true })
      ),
    10
  );
  await assert.rejects(client.getSnapshot(), /tardo demasiado/);
});
