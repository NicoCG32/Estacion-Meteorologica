const { startServer } = require('./start');
const { DEFAULT_PORTS } = require('../src/config');

startServer({ defaultPort: DEFAULT_PORTS.dev });
