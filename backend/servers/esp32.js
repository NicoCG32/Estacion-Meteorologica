const { startServer } = require('./start');
const { DEFAULT_PORTS } = require('../src/config');

startServer({ defaultPort: DEFAULT_PORTS.esp32, esp32: true });
