const { validateMeasurement } = require('../validation');
const { HttpError } = require('../errors');
const { paginate } = require('../pagination');
const fs = require('fs');
const { evaluarSospecha } = require('../anomalias');
const { parseDateParam, streamJsonlAsCsv, streamJsonlFiltered } = require('../export');

function registerMeasurementRoutes(app, { store, dataFile, logger }) {
  app.post('/api/mediciones', async (req, res) => {
    if (!req.is('application/json'))
      throw new HttpError(415, 'Content-Type debe ser application/json.');
    const data = validateMeasurement(req.body);

    const medicion = await store.append((id, previous) => {
      const record = {
        id,
        timestamp: new Date().toISOString(),
        ...data,
      };

      const sospecha = evaluarSospecha(record, previous);
      if (sospecha.sospechosa) {
        record.sospechosa = true;
        record.motivos_sospecha = sospecha.motivos;
      } else {
        record.sospechosa = false;
      }

      return record;
    });

    logger.info('measurement.stored', { id: medicion.id, total: store.getTotal() });

    return res.status(201).json({
      ok: true,
      mensaje: 'Medicion almacenada correctamente (memoria + archivo).',
      medicion,
    });
  });

  app.get('/api/mediciones', (req, res) => {
    return res.json(paginate(store.getMeasurements(), req.query));
  });

  app.get('/api/mediciones/ultimo', (req, res) => {
    if (!store.getLast()) {
      return res.status(404).json({
        ok: false,
        mensaje: 'No hay mediciones almacenadas todavia.',
      });
    }
    return res.json(store.getLast());
  });

  app.get('/api/mediciones/export', async (req, res) => {
    const format = String(req.query.format || 'csv').toLowerCase();
    const fromDate = parseDateParam(req.query.from);
    const toDate = parseDateParam(req.query.to);

    if (req.query.from && !fromDate) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Parametro "from" invalido. Usa ISO 8601, por ejemplo 2026-02-10T00:00:00Z.',
      });
    }

    if (req.query.to && !toDate) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Parametro "to" invalido. Usa ISO 8601, por ejemplo 2026-02-10T23:59:59Z.',
      });
    }

    if (fromDate && toDate && fromDate > toDate) {
      throw new HttpError(400, 'El parametro "from" no puede ser posterior a "to".');
    }

    if (!fs.existsSync(dataFile)) {
      return res.status(404).json({
        ok: false,
        mensaje: 'No hay archivo de datos para exportar.',
      });
    }

    if (format === 'jsonl') {
      res.setHeader('Content-Type', 'application/x-ndjson');
      res.setHeader('Content-Disposition', 'attachment; filename="mediciones.jsonl"');
      return streamJsonlFiltered(dataFile, res, fromDate, toDate, logger);
    }

    if (format !== 'csv') {
      return res.status(400).json({
        ok: false,
        mensaje: 'Formato no soportado. Usa format=csv o format=jsonl.',
      });
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="mediciones.csv"');
    return streamJsonlAsCsv(dataFile, res, fromDate, toDate, logger);
  });
}

module.exports = { registerMeasurementRoutes };
