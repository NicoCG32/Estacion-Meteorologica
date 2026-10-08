const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const { createApp } = require('../src/app');
const { fixture, sample } = require('./helpers.cjs');

const headers =
  'id,timestamp,temperatura_aire_celsius,incertidumbre_temperatura_celsius,humedad_aire_porcentaje,incertidumbre_humedad_porcentaje,presion_atmosferica_hPa,concentracion_CO2_ppm,latitud_grados,longitud_grados,numero_satelites\n';

test('createApp requiere las rutas de datos y estáticos', () => {
  assert.throws(() => createApp({}), { message: 'dataFile es requerido.' });
  assert.throws(() => createApp({ dataFile: 'unused' }), { message: 'staticDir es requerido.' });
});

test('estado vacío y prioridad de errores de exportación', async (t) => {
  const f = await fixture(t);
  assert.deepEqual((await f.request('/api/status')).body, {
    status: 'ok',
    mediciones_totales: 0,
    ultima_medicion: null,
    ventana_en_memoria: 0,
    max_en_memoria: 1000,
    archivo_datos: f.dataFile,
  });
  assert.deepEqual((await f.request('/api/mediciones')).body, []);
  assert.deepEqual((await f.request('/api/mediciones/ultimo')).body, {
    ok: false,
    mensaje: 'No hay mediciones almacenadas todavia.',
  });
  assert.equal((await f.request('/api/mediciones/ultimo')).status, 404);
  assert.equal((await f.request('/api/mediciones/export?format=xml')).status, 404);
  assert.equal((await f.request('/api/mediciones/export?from=invalid')).status, 400);
});

test('POST, lectura y exportación conservan la misma medición y persisten JSONL', async (t) => {
  const f = await fixture(t);
  const result = await f.post();
  assert.equal(result.status, 201);
  assert.equal(result.body.ok, true);
  assert.equal(result.body.mensaje, 'Medicion almacenada correctamente (memoria + archivo).');
  const m = result.body.medicion;
  assert.deepEqual(m, { id: 1, timestamp: m.timestamp, ...sample, sospechosa: false });
  assert.equal(new Date(m.timestamp).toISOString(), m.timestamp);
  assert.deepEqual((await f.request('/api/mediciones')).body, [m]);
  assert.deepEqual((await f.request('/api/mediciones/ultimo')).body, m);
  assert.equal((await f.request('/api/status')).body.mediciones_totales, 1);
  const jsonl = await f.request('/api/mediciones/export?format=JSONL');
  assert.equal(jsonl.headers.get('content-type'), 'application/x-ndjson');
  assert.equal(jsonl.headers.get('content-disposition'), 'attachment; filename="mediciones.jsonl"');
  assert.equal(jsonl.text, JSON.stringify(m) + '\n');
  const csv = await f.request('/api/mediciones/export');
  assert.equal(csv.headers.get('content-type'), 'text/csv; charset=utf-8');
  assert.equal(csv.headers.get('content-disposition'), 'attachment; filename="mediciones.csv"');
  assert.equal(csv.text, headers + `1,${m.timestamp},20,,50,,1010,600,,,\n`);
  assert.equal(await fs.readFile(f.dataFile, 'utf8'), jsonl.text);
});

test('POST rechaza arrays y enumera campos ausentes sin alterar estado', async (t) => {
  const f = await fixture(t);
  const array = await f.post([]);
  assert.equal(array.status, 400);
  assert.deepEqual(array.body, {
    ok: false,
    mensaje: 'El cuerpo debe ser un objeto JSON con las mediciones.',
  });
  const missing = await f.post({ temperatura_aire_celsius: 0 });
  assert.equal(missing.status, 400);
  assert.deepEqual(missing.body, {
    ok: false,
    mensaje: 'Faltan campos obligatorios en el JSON recibido.',
    campos_faltantes: [
      'humedad_aire_porcentaje',
      'presion_atmosferica_hPa',
      'concentracion_CO2_ppm',
    ],
  });
  assert.equal((await f.request('/api/status')).body.mediciones_totales, 0);
  await assert.rejects(fs.stat(f.dataFile), { code: 'ENOENT' });
});

test('carga ignora líneas inválidas, limita memoria y exporta todo el histórico', async (t) => {
  const records = [1, 2, 3].map((id) => ({ id, timestamp: `2026-01-0${id}T00:00:00Z`, ...sample }));
  const f = await fixture(t, {
    raw:
      '\n' +
      JSON.stringify(records[0]) +
      '\r\ninvalid\n' +
      records.slice(1).map(JSON.stringify).join('\n') +
      '\n',
    maxInMemory: 2,
  });
  assert.deepEqual((await f.request('/api/mediciones')).body, records.slice(1));
  const status = (await f.request('/api/status')).body;
  assert.equal(status.mediciones_totales, 3);
  assert.equal(status.ventana_en_memoria, 2);
  assert.equal(status.max_en_memoria, 2);
  assert.deepEqual(status.ultima_medicion, records[2]);
  const exported = await f.request('/api/mediciones/export?format=jsonl');
  assert.deepEqual(exported.text.trim().split('\n').map(JSON.parse), records);
  const m = (await f.post()).body.medicion;
  assert.equal(m.id, 4);
  assert.deepEqual((await f.request('/api/mediciones')).body, [records[2], m]);
});

test('limit conserva orden de inserción y rechaza enteros parciales', async (t) => {
  const records = [9, 3, 7].map((id) => ({ id, ...sample }));
  const f = await fixture(t, { records });
  for (const limit of ['0', '-1', 'abc', '1abc', '1.8']) {
    const response = await f.request(`/api/mediciones?limit=${limit}`);
    assert.equal(response.status, 400);
    assert.deepEqual(response.body, {
      ok: false,
      mensaje: 'El parametro "limit" debe ser un entero positivo.',
    });
  }
  assert.deepEqual((await f.request('/api/mediciones?limit=2')).body, records.slice(-2));
});

test('exportación filtra fechas inclusivas y escapa comas, comillas y saltos', async (t) => {
  const records = [
    { id: 1, timestamp: '2026-01-01T00:00:00Z', ...sample },
    {
      id: 2,
      timestamp: '2026-01-02T00:00:00Z',
      ...sample,
      temperatura_aire_celsius: 'a,"b"\nc',
      latitud_grados: null,
    },
    { id: 3, timestamp: 'invalid', ...sample },
    { id: 4, ...sample },
  ];
  const f = await fixture(t, { records });
  const range = 'from=2026-01-02T00:00:00Z&to=2026-01-02T00:00:00Z';
  const jsonl = await f.request(`/api/mediciones/export?format=jsonl&${range}`);
  assert.equal(jsonl.text, JSON.stringify(records[1]) + '\n');
  const csv = await f.request(`/api/mediciones/export?${range}`);
  assert.equal(csv.text, headers + '2,2026-01-02T00:00:00Z,"a,""b""\nc",,50,,1010,600,,,\n');
  assert.equal(
    (await f.request('/api/mediciones/export?format=jsonl')).text.split('\n').filter(Boolean)
      .length,
    4
  );
  assert.equal(
    (await f.request('/api/mediciones/export?from=2026-01-03&to=2026-01-01')).status,
    400
  );
  for (const parameter of ['from', 'to']) {
    const response = await f.request(`/api/mediciones/export?${parameter}=invalid`);
    assert.equal(response.status, 400);
    assert.equal(response.body.ok, false);
    assert.ok(response.body.mensaje.includes(`Parametro "${parameter}" invalido.`));
  }
  assert.deepEqual((await f.request('/api/mediciones/export?format=xml')).body, {
    ok: false,
    mensaje: 'Formato no soportado. Usa format=csv o format=jsonl.',
  });
});

test('archivo vacío exporta cabecera CSV o cuerpo JSONL vacío', async (t) => {
  const f = await fixture(t, { records: [] });
  assert.equal((await f.request('/api/mediciones/export')).text, headers);
  assert.equal((await f.request('/api/mediciones/export?format=jsonl')).text, '');
});

test('saltos en los cuatro umbrales marcan sospecha sin descartar la medición', async (t) => {
  const f = await fixture(t, { records: [{ id: 1, ...sample }] });
  const m = (
    await f.post({
      temperatura_aire_celsius: 25,
      humedad_aire_porcentaje: 65,
      presion_atmosferica_hPa: 1015,
      concentracion_CO2_ppm: 1000,
    })
  ).body.medicion;
  assert.equal(m.sospechosa, true);
  assert.deepEqual(m.motivos_sospecha, [
    'Cambio brusco en temperatura (Δ=5.00)',
    'Cambio brusco en humedad (Δ=15.00)',
    'Cambio brusco en presion (Δ=5.00)',
    'Cambio brusco en CO2 (Δ=400.00)',
  ]);
  assert.deepEqual((await f.request('/api/mediciones/ultimo')).body, m);
});

test('sensores sin datos admiten null/CO2=0; los metadatos quedan a cargo del servidor', async (t) => {
  const f = await fixture(t, { records: [{ id: 99, ...sample }] });
  const body = {
    temperatura_aire_celsius: null,
    humedad_aire_porcentaje: null,
    presion_atmosferica_hPa: null,
    concentracion_CO2_ppm: 0,
  };
  const m = (await f.post(body)).body.medicion;
  assert.deepEqual(m, {
    ...body,
    id: 100,
    timestamp: m.timestamp,
    sospechosa: false,
  });
  const noJump = (await f.post(body)).body.medicion;
  assert.equal(noJump.sospechosa, false);
  assert.equal(Object.hasOwn(noJump, 'motivos_sospecha'), false);
  assert.equal((await f.request('/api/status')).body.mediciones_totales, 3);
});

test('instancias de createApp conservan estados y archivos independientes', async (t) => {
  const a = await fixture(t);
  const b = await fixture(t, { records: [{ id: 5, ...sample }] });
  const m = (await a.post()).body.medicion;
  assert.equal(m.id, 1);
  assert.deepEqual((await b.request('/api/mediciones')).body, [{ id: 5, ...sample }]);
  assert.equal((await a.request('/api/status')).body.mediciones_totales, 1);
  assert.equal((await b.request('/api/status')).body.mediciones_totales, 1);
});

test('createApp sigue sirviendo el dashboard y sus recursos', async (t) => {
  const f = await fixture(t);
  const page = await f.request('/');
  assert.equal(page.status, 200);
  assert.match(page.text, /assets\/js\/app.js/);
  assert.equal((await f.request('/assets/js/app.js')).status, 200);
  assert.equal((await f.request('/assets/css/styles.css')).status, 200);
});
