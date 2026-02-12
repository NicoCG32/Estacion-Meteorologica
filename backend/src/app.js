const express = require('express');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

function createApp(options) {
  const {
    dataFile,
    staticDir,
    maxInMemory = 1000,
    logRequests = true
  } = options;

  const app = express();

  if (!dataFile) {
    throw new Error('dataFile es requerido.');
  }

  if (!staticDir) {
    throw new Error('staticDir es requerido.');
  }

  const dataDir = path.dirname(dataFile);

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log(`Carpeta de datos creada en: ${dataDir}`);
  }

  let mediciones = [];
  let totalMediciones = 0;
  let ultimaMedicion = null;

  function cargarDesdeArchivo() {
    if (!fs.existsSync(dataFile)) {
      console.log('No hay archivo de datos previo, se comenzara desde cero.');
      return;
    }
    console.log(`Cargando datos desde ${dataFile} ...`);
    const contenido = fs.readFileSync(dataFile, 'utf8');
    const lineas = contenido.split('\n').filter(linea => linea.trim().length > 0);
    for (const linea of lineas) {
      try {
        const obj = JSON.parse(linea);
        totalMediciones += 1;
        ultimaMedicion = obj;
        mediciones.push(obj);
        if (mediciones.length > maxInMemory) {
          mediciones.shift();
        }
      } catch (err) {
        console.error('Linea invalida en archivo de datos, se ignora:', linea);
      }
    }
    console.log(`Se cargaron ${mediciones.length} mediciones en memoria.`);
  }

  function guardarEnArchivo(medicion) {
    const linea = JSON.stringify(medicion) + '\n';
    fs.appendFile(dataFile, linea, (err) => {
      if (err) {
        console.error('Error al escribir en el archivo de datos:', err);
      }
    });
  }

  const CSV_HEADERS = [
    'id',
    'timestamp',
    'temperatura_aire_celsius',
    'incertidumbre_temperatura_celsius',
    'humedad_aire_porcentaje',
    'incertidumbre_humedad_porcentaje',
    'presion_atmosferica_hPa',
    'concentracion_CO2_ppm',
    'latitud_grados',
    'longitud_grados',
    'numero_satelites'
  ];

  function escapeCsv(value) {
    if (value === null || value === undefined) return '';
    const text = String(value);
    if (/[",\n]/.test(text)) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  }

  function parseDateParam(value) {
    if (!value) return null;
    const time = Date.parse(value);
    if (Number.isNaN(time)) return null;
    return new Date(time);
  }

  function inRange(timestamp, fromDate, toDate) {
    if (!fromDate && !toDate) return true;
    if (!timestamp) return false;
    const time = Date.parse(timestamp);
    if (Number.isNaN(time)) return false;
    if (fromDate && time < fromDate.getTime()) return false;
    if (toDate && time > toDate.getTime()) return false;
    return true;
  }

  function streamJsonlAsCsv(res, fromDate, toDate) {
    res.write(`${CSV_HEADERS.join(',')}\n`);

    const fileStream = fs.createReadStream(dataFile, { encoding: 'utf8' });
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    rl.on('line', (line) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      try {
        const obj = JSON.parse(trimmed);
        if (!inRange(obj.timestamp, fromDate, toDate)) return;
        const row = CSV_HEADERS.map((key) => escapeCsv(obj[key]));
        res.write(`${row.join(',')}\n`);
      } catch (err) {
        console.error('Linea invalida en JSONL durante exportacion, se ignora.');
      }
    });

    rl.on('close', () => {
      res.end();
    });

    rl.on('error', (err) => {
      console.error('Error al leer JSONL para exportacion:', err);
      if (!res.headersSent) {
        res.status(500).json({ ok: false, mensaje: 'Error al exportar datos.' });
      } else {
        res.end();
      }
    });

    fileStream.on('error', (err) => {
      console.error('Error al abrir JSONL para exportacion:', err);
      if (!res.headersSent) {
        res.status(500).json({ ok: false, mensaje: 'Error al exportar datos.' });
      } else {
        res.end();
      }
    });
  }

  function streamJsonlFiltered(res, fromDate, toDate) {
    const fileStream = fs.createReadStream(dataFile, { encoding: 'utf8' });
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    rl.on('line', (line) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      try {
        const obj = JSON.parse(trimmed);
        if (!inRange(obj.timestamp, fromDate, toDate)) return;
        res.write(`${JSON.stringify(obj)}\n`);
      } catch (err) {
        console.error('Linea invalida en JSONL durante exportacion, se ignora.');
      }
    });

    rl.on('close', () => {
      res.end();
    });

    rl.on('error', (err) => {
      console.error('Error al leer JSONL para exportacion:', err);
      if (!res.headersSent) {
        res.status(500).json({ ok: false, mensaje: 'Error al exportar datos.' });
      } else {
        res.end();
      }
    });

    fileStream.on('error', (err) => {
      console.error('Error al abrir JSONL para exportacion:', err);
      if (!res.headersSent) {
        res.status(500).json({ ok: false, mensaje: 'Error al exportar datos.' });
      } else {
        res.end();
      }
    });
  }

  cargarDesdeArchivo();

  app.use(express.json({ limit: '100kb' }));

  if (logRequests) {
    app.use((req, res, next) => {
      const now = new Date().toISOString();
      console.log(`[${now}] ${req.method} ${req.url}`);
      next();
    });
  }

  app.get('/api/status', (req, res) => {
    res.json({
      status: 'ok',
      mediciones_totales: totalMediciones,
      ultima_medicion: ultimaMedicion,
      ventana_en_memoria: mediciones.length,
      max_en_memoria: maxInMemory,
      archivo_datos: dataFile
    });
  });

  app.post('/api/mediciones', (req, res) => {
    const data = req.body;

    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El cuerpo debe ser un objeto JSON con las mediciones.'
      });
    }

    const camposObligatorios = [
      'temperatura_aire_celsius',
      'humedad_aire_porcentaje',
      'presion_atmosferica_hPa',
      'concentracion_CO2_ppm'
    ];

    const faltan = camposObligatorios.filter(campo => !(campo in data));

    if (faltan.length > 0) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Faltan campos obligatorios en el JSON recibido.',
        campos_faltantes: faltan
      });
    }

    const medicion = {
      id: totalMediciones + 1,
      timestamp: new Date().toISOString(),
      ...data
    };

    mediciones.push(medicion);
    if (mediciones.length > maxInMemory) {
      mediciones.shift();
    }
    totalMediciones += 1;
    ultimaMedicion = medicion;

    guardarEnArchivo(medicion);

    console.log('Medicion recibida:');
    console.log(JSON.stringify(medicion, null, 2));

    return res.status(201).json({
      ok: true,
      mensaje: 'Medicion almacenada correctamente (memoria + archivo).',
      medicion
    });
  });

  app.get('/api/mediciones', (req, res) => {
    let { limit } = req.query;

    if (limit !== undefined) {
      limit = parseInt(limit, 10);
      if (Number.isNaN(limit) || limit <= 0) {
        return res.status(400).json({
          ok: false,
          mensaje: 'El parametro "limit" debe ser un entero positivo.'
        });
      }
      const slice = mediciones.slice(-limit);
      return res.json(slice);
    }

    return res.json(mediciones);
  });

  app.get('/api/mediciones/ultimo', (req, res) => {
    if (!ultimaMedicion) {
      return res.status(404).json({
        ok: false,
        mensaje: 'No hay mediciones almacenadas todavia.'
      });
    }
    return res.json(ultimaMedicion);
  });

  app.get('/api/mediciones/export', (req, res) => {
    const format = String(req.query.format || 'csv').toLowerCase();
    const fromDate = parseDateParam(req.query.from);
    const toDate = parseDateParam(req.query.to);

    if (req.query.from && !fromDate) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Parametro "from" invalido. Usa ISO 8601, por ejemplo 2026-02-10T00:00:00Z.'
      });
    }

    if (req.query.to && !toDate) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Parametro "to" invalido. Usa ISO 8601, por ejemplo 2026-02-10T23:59:59Z.'
      });
    }

    if (!fs.existsSync(dataFile)) {
      return res.status(404).json({
        ok: false,
        mensaje: 'No hay archivo de datos para exportar.'
      });
    }

    if (format === 'jsonl') {
      res.setHeader('Content-Type', 'application/x-ndjson');
      res.setHeader('Content-Disposition', 'attachment; filename="mediciones.jsonl"');
      return streamJsonlFiltered(res, fromDate, toDate);
    }

    if (format !== 'csv') {
      return res.status(400).json({
        ok: false,
        mensaje: 'Formato no soportado. Usa format=csv o format=jsonl.'
      });
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="mediciones.csv"');
    return streamJsonlAsCsv(res, fromDate, toDate);
  });

  app.use(express.static(staticDir));

  return app;
}

module.exports = { createApp };
