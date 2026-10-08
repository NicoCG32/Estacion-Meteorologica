const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const net = require('node:net');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const { setTimeout: delay } = require('node:timers/promises');

async function availablePort() {
  const server = net.createServer().listen(0, '127.0.0.1');
  await once(server, 'listening');
  const port = server.address().port;
  await new Promise((resolve) => server.close(resolve));
  return port;
}

for (const mode of ['dev', 'esp32']) {
  test(`arranque ${mode}: carga .env y respeta prioridad del entorno del proceso`, async (t) => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'meteo-startup-'));
    const port = await availablePort();
    const dataFile = path.join(root, 'fixture.jsonl');
    const env = { ...process.env };
    for (const key of ['PORT', 'HOST', 'DATA_FILE', 'LOG_LEVEL']) delete env[key];
    // Dev verifica .env; ESP32 verifica que las variables del proceso prevalezcan.
    const overrides = mode === 'esp32';
    await fs.writeFile(
      path.join(root, '.env'),
      overrides
        ? 'PORT=1\nHOST=192.0.2.1\nDATA_FILE=unused.jsonl\n'
        : `PORT=${port}\nHOST=127.0.0.1\nDATA_FILE=${dataFile.replace(/\\/g, '/')}\n`
    );
    if (overrides)
      Object.assign(env, { PORT: String(port), HOST: '127.0.0.1', DATA_FILE: dataFile });
    const child = spawn(
      process.execPath,
      ['--env-file-if-exists=.env', path.join(__dirname, '..', 'servers', `${mode}.js`)],
      {
        cwd: root,
        env,
        windowsHide: true,
        stdio: ['ignore', 'pipe', 'pipe'],
      }
    );
    let output = '';
    child.stdout.on('data', (data) => {
      output += data;
    });
    child.stderr.on('data', (data) => {
      output += data;
    });
    let spawnError;
    child.on('error', (err) => {
      spawnError = err;
    });
    t.after(async () => {
      if (child.exitCode === null && child.signalCode === null && child.pid) {
        const exited = once(child, 'exit');
        child.kill();
        await exited;
      }
      assert.equal(path.dirname(root), path.resolve(os.tmpdir()));
      assert.ok(path.basename(root).startsWith('meteo-startup-'));
      await fs.rm(root, { recursive: true, force: true });
    });
    let status;
    for (let attempt = 0; attempt < 100; attempt += 1) {
      if (spawnError) throw spawnError;
      assert.equal(child.exitCode, null, output);
      try {
        const response = await fetch(`http://127.0.0.1:${port}/api/status`, {
          signal: AbortSignal.timeout(200),
        });
        status = await response.json();
        break;
      } catch {
        await delay(20);
      }
    }
    assert.ok(status, output);
    assert.equal(path.resolve(status.archivo_datos), dataFile);
    assert.equal(status.mediciones_totales, 0);
    assert.equal(status.max_en_memoria, 1000);
    assert.ok(
      output.includes(
        mode === 'dev' ? 'Servidor local de pruebas escuchando' : 'Servidor ESP32 escuchando'
      )
    );
    assert.equal(output.includes('Con el PC conectado al AP del ESP32'), overrides);
  });
}
