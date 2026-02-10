// server.js
// Backend para estación meteorológica:
// - Recibe mediciones JSON desde el ESP32.
// - Las guarda en un archivo data/mediciones.jsonl.
// - Expone API para consultar datos.
// - Sirve una interfaz web desde /public.

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;
const HOST = '0.0.0.0';

// Carpeta y archivo de datos
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'mediciones.jsonl');

// Asegurarse de que la carpeta data existe
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  console.log(`Carpeta de datos creada en: ${DATA_DIR}`);
}

// Almacenamiento en memoria (últimas N mediciones para respuesta rápida)
let mediciones = [];
const MAX_IN_MEMORY = 1000; // guarda en RAM solo las 1000 últimas

// Leer mediciones previas desde el archivo al arrancar
function cargarDesdeArchivo() {
  if (!fs.existsSync(DATA_FILE)) {
    console.log('No hay archivo de datos previo, se comenzará desde cero.');
    return;
  }
  console.log(`Cargando datos desde ${DATA_FILE} ...`);
  const contenido = fs.readFileSync(DATA_FILE, 'utf8');
  const lineas = contenido.split('\n').filter(linea => linea.trim().length > 0);
  for (const linea of lineas) {
    try {
      const obj = JSON.parse(linea);
      mediciones.push(obj);
    } catch (err) {
      console.error('Línea inválida en archivo de datos, se ignora:', linea);
    }
  }
  if (mediciones.length > MAX_IN_MEMORY) {
    mediciones = mediciones.slice(-MAX_IN_MEMORY);
  }
  console.log(`Se cargaron ${mediciones.length} mediciones en memoria.`);
}

// Guardar una medición nueva como línea JSON en el archivo
function guardarEnArchivo(medicion) {
  const linea = JSON.stringify(medicion) + '\n';
  fs.appendFile(DATA_FILE, linea, (err) => {
    if (err) {
      console.error('Error al escribir en el archivo de datos:', err);
    }
  });
}

// Cargar datos previos
cargarDesdeArchivo();

// Middleware para JSON
app.use(express.json());

// Logging simple
app.use((req, res, next) => {
  const now = new Date().toISOString();
  console.log(`[${now}] ${req.method} ${req.url}`);
  next();
});

// ===============================
// GET /api/status
// ===============================
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    mediciones_totales: mediciones.length,
    ultima_medicion: mediciones.length > 0 ? mediciones[mediciones.length - 1] : null,
    archivo_datos: DATA_FILE
  });
});

// ===============================
// POST /api/mediciones  (llamado por el ESP32)
// ===============================
app.post('/api/mediciones', (req, res) => {
  const data = req.body;

  // Validación mínima de campos clave
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

  // Crear objeto medición con metadatos
  const medicion = {
    id: mediciones.length > 0 ? mediciones[mediciones.length - 1].id + 1 : 1,
    timestamp: new Date().toISOString(),
    ...data
  };

  // Añadir a memoria
  mediciones.push(medicion);
  if (mediciones.length > MAX_IN_MEMORY) {
    mediciones = mediciones.slice(-MAX_IN_MEMORY);
  }

  // Guardar en archivo
  guardarEnArchivo(medicion);

  console.log('Medición recibida:');
  console.log(JSON.stringify(medicion, null, 2));

  return res.status(201).json({
    ok: true,
    mensaje: 'Medición almacenada correctamente (memoria + archivo).',
    medicion
  });
});

// ===============================
// GET /api/mediciones
// Todas o últimas N (?limit=)
// ===============================
app.get('/api/mediciones', (req, res) => {
  let { limit } = req.query;

  if (limit !== undefined) {
    limit = parseInt(limit, 10);
    if (isNaN(limit) || limit <= 0) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El parámetro "limit" debe ser un entero positivo.'
      });
    }
    const slice = mediciones.slice(-limit);
    return res.json(slice);
  }

  return res.json(mediciones);
});

// ===============================
// GET /api/mediciones/ultimo
// ===============================
app.get('/api/mediciones/ultimo', (req, res) => {
  if (mediciones.length === 0) {
    return res.status(404).json({
      ok: false,
      mensaje: 'No hay mediciones almacenadas todavía.'
    });
  }
  const ultima = mediciones[mediciones.length - 1];
  return res.json(ultima);
});

// ===============================
// Servir interfaz web desde /public
// ===============================
app.use(express.static(path.join(__dirname, 'public')));

// ===============================
// Arrancar servidor
// ===============================
app.listen(PORT, HOST, () => {
  console.log(`Backend estación meteorológica escuchando en http://${HOST}:${PORT}`);
  console.log(`Archivo de datos: ${DATA_FILE}`);
  console.log('Con el PC conectado al AP del ESP32 (192.168.4.2), abre:');
  console.log('  http://192.168.4.2:3001/api/status');
  console.log('  http://192.168.4.2:3001/');
});
