const { DEFAULT_MAX_IN_MEMORY, JSON_BODY_LIMIT } = require('./config');
const express = require('express');
const { createStore } = require('./store');
const { registerStatusRoutes } = require('./routes/status');
const { registerMeasurementRoutes } = require('./routes/mediciones');
const { HttpError, errorHandler } = require('./errors');
const { createLogger } = require('./logger');

function createApp(options) {
  const {
    dataFile,
    staticDir,
    maxInMemory = DEFAULT_MAX_IN_MEMORY,
    logRequests = true,
    logger = createLogger(),
  } = options;

  const app = express();

  if (!dataFile) {
    throw new Error('dataFile es requerido.');
  }

  if (!staticDir) {
    throw new Error('staticDir es requerido.');
  }

  const store = createStore({ dataFile, maxInMemory, logger });

  if (logRequests) {
    app.use((req, res, next) => {
      const started = process.hrtime.bigint();
      res.once('finish', () => {
        const severity = res.statusCode >= 400 ? 'warn' : 'info';
        logger[severity]('http.request', {
          method: req.method,
          path: req.path,
          status: res.statusCode,
          duration_ms: Number(process.hrtime.bigint() - started) / 1e6,
        });
      });
      next();
    });
  }

  app.use(express.json({ limit: JSON_BODY_LIMIT, strict: false }));

  registerStatusRoutes(app, { store, maxInMemory, dataFile });
  registerMeasurementRoutes(app, { store, dataFile, logger });

  app.use('/api', (req, res, next) => next(new HttpError(404, 'Ruta API no encontrada.')));

  app.use(express.static(staticDir));
  app.use(errorHandler(logger));

  return app;
}

module.exports = { createApp };
