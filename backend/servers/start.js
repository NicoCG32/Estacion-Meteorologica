const {
  DEFAULT_HOST,
  DEFAULT_DATA_FILE,
  STATIC_DIR,
  DEFAULT_MAX_IN_MEMORY,
} = require('../src/config');
const { createApp } = require('../src/app');
const { createLogger } = require('../src/logger');

function startServer({ defaultPort, esp32 = false }) {
  const port = Number(process.env.PORT || defaultPort);
  const host = process.env.HOST || DEFAULT_HOST;
  const dataFile = process.env.DATA_FILE || DEFAULT_DATA_FILE;
  const logger = createLogger();
  const app = createApp({
    dataFile,
    staticDir: STATIC_DIR,
    maxInMemory: DEFAULT_MAX_IN_MEMORY,
    logRequests: true,
    logger,
  });
  const server = app.listen(port, host, () => {
    const boundPort = server.address().port;
    logger.info('server.started', {
      host,
      port: boundPort,
      dataFile,
      message: esp32
        ? `Servidor ESP32 escuchando en http://${host}:${boundPort}`
        : `Servidor local de pruebas escuchando en http://${host}:${boundPort}`,
    });
    const address = esp32 ? '192.168.4.2' : 'localhost';
    logger.info('server.addresses', {
      apiUrl: `http://${address}:${boundPort}/api/status`,
      dashboardUrl: `http://${address}:${boundPort}/`,
      ...(esp32 ? { message: 'Con el PC conectado al AP del ESP32 (192.168.4.2), abre:' } : {}),
    });
  });
  return server;
}

module.exports = { startServer };
