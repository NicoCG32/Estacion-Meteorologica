const path = require('path');

const DEFAULT_PORTS = { dev: 3002, esp32: 3001 };
const DEFAULT_HOST = '0.0.0.0';
const DEFAULT_MAX_IN_MEMORY = 1000;
const JSON_BODY_LIMIT = '100kb';
const DEFAULT_DATA_FILE = path.join(__dirname, '..', 'data', 'mediciones.jsonl');
const STATIC_DIR = path.join(__dirname, '..', 'frontend');

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
  'numero_satelites',
];

const ANOMALY_RULES = [
  {
    campo: 'temperatura_aire_celsius',
    umbral: 5,
    etiqueta: 'Cambio brusco en temperatura',
  },
  {
    campo: 'humedad_aire_porcentaje',
    umbral: 15,
    etiqueta: 'Cambio brusco en humedad',
  },
  {
    campo: 'presion_atmosferica_hPa',
    umbral: 5,
    etiqueta: 'Cambio brusco en presion',
  },
  {
    campo: 'concentracion_CO2_ppm',
    umbral: 400,
    etiqueta: 'Cambio brusco en CO2',
  },
];

const REQUIRED_FIELDS = [
  'temperatura_aire_celsius',
  'humedad_aire_porcentaje',
  'presion_atmosferica_hPa',
  'concentracion_CO2_ppm',
];

// Límites de admisión de la API; no representan precisión ni calibración del sensor.
const MEASUREMENT_RULES = {
  temperatura_aire_celsius: { min: -50, max: 85 },
  incertidumbre_temperatura_celsius: { min: 0, max: 135 },
  humedad_aire_porcentaje: { min: 0, max: 100 },
  incertidumbre_humedad_porcentaje: { min: 0, max: 100 },
  presion_atmosferica_hPa: { min: 300, max: 1200 },
  concentracion_CO2_ppm: { min: 0, max: 40000 },
  latitud_grados: { min: -90, max: 90 },
  longitud_grados: { min: -180, max: 180 },
  numero_satelites: { min: 0, max: 255, integer: true },
};

module.exports = {
  DEFAULT_PORTS,
  DEFAULT_HOST,
  DEFAULT_MAX_IN_MEMORY,
  JSON_BODY_LIMIT,
  DEFAULT_DATA_FILE,
  STATIC_DIR,
  CSV_HEADERS,
  ANOMALY_RULES,
  REQUIRED_FIELDS,
  MEASUREMENT_RULES,
};
