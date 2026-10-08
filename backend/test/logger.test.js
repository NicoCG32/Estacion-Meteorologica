const test = require('node:test');
const assert = require('node:assert/strict');
const { createLogger } = require('../src/logger');
const { fixture } = require('./helpers.cjs');

test('niveles de logging filtran eventos y cada salida es una línea JSON', () => {
  for (const [level, expected] of [
    ['silent', []],
    ['error', ['error']],
    ['warn', ['error', 'warn']],
    ['info', ['error', 'warn', 'info']],
    ['debug', ['error', 'warn', 'info', 'debug']],
  ]) {
    const lines = [];
    const logger = createLogger({ level, sink: (line) => lines.push(line) });
    for (const severity of ['error', 'warn', 'info', 'debug']) logger[severity]('test', { id: 1 });
    assert.deepEqual(
      lines.map((line) => JSON.parse(line).level),
      expected
    );
    assert.ok(lines.every((line) => !line.includes('\n')));
    for (const line of lines) {
      const entry = JSON.parse(line);
      assert.equal(new Date(entry.timestamp).toISOString(), entry.timestamp);
      assert.equal(entry.event, 'test');
      assert.equal(entry.id, 1);
    }
  }
  assert.throws(() => createLogger({ level: 'invalid' }), /LOG_LEVEL/);
});

test('logs HTTP y de ingesta contienen estado/duración sin payload ni query', async (t) => {
  const events = [];
  const f = await fixture(t, {
    appOptions: {
      logRequests: true,
      logger: createLogger({ sink: (line) => events.push(JSON.parse(line)) }),
    },
  });
  assert.equal((await f.post()).status, 201);
  assert.equal((await f.request('/api/mediciones?limit=invalid&token=private')).status, 400);
  const accepted = events.find((event) => event.event === 'measurement.stored');
  assert.equal(accepted.id, 1);
  const requests = events.filter((event) => event.event === 'http.request');
  assert.deepEqual(
    requests.map((event) => event.status),
    [201, 400]
  );
  assert.ok(
    requests.every((event) => typeof event.duration_ms === 'number' && event.duration_ms >= 0)
  );
  assert.ok(!JSON.stringify(events).includes('private'));
  assert.ok(!JSON.stringify(events).includes('temperatura_aire_celsius'));
});

test('LOG_LEVEL del entorno puede silenciar toda la aplicación', async (t) => {
  const original = process.env.LOG_LEVEL;
  t.after(() => {
    if (original === undefined) delete process.env.LOG_LEVEL;
    else process.env.LOG_LEVEL = original;
  });
  process.env.LOG_LEVEL = 'silent';
  const lines = [];
  const f = await fixture(t, {
    appOptions: { logRequests: true, logger: createLogger({ sink: (line) => lines.push(line) }) },
  });
  assert.equal((await f.post()).status, 201);
  assert.deepEqual(lines, []);
});
