const path = require('path');
const { createApp } = require('../src/app');

const PORT = Number(process.env.PORT || 3001);
const HOST = process.env.HOST || '0.0.0.0';
const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, '..', 'data', 'mediciones.jsonl');
const STATIC_DIR = path.join(__dirname, '..', 'frontend');

const app = createApp({
  dataFile: DATA_FILE,
  staticDir: STATIC_DIR,
  maxInMemory: 1000,
  logRequests: true
});

app.listen(PORT, HOST, () => {
  console.log(`Servidor ESP32 escuchando en http://${HOST}:${PORT}`);
  console.log(`Archivo de datos: ${DATA_FILE}`);
  console.log('Con el PC conectado al AP del ESP32 (192.168.4.2), abre:');
  console.log(`  http://192.168.4.2:${PORT}/api/status`);
  console.log(`  http://192.168.4.2:${PORT}/`);
});
