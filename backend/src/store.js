const fs = require('fs');
const path = require('path');
const { HttpError } = require('./errors');
const { createLogger } = require('./logger');

function createStore({ dataFile, maxInMemory, logger = createLogger() }) {
  const dataDir = path.dirname(dataFile);

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    logger.info('store.directory_created');
  }

  const mediciones = [];
  let totalMediciones = 0;
  let ultimaMedicion = null;
  let nextId = 1;
  let queue = Promise.resolve();
  let writeBlocked = false;

  function cargarDesdeArchivo() {
    if (!fs.existsSync(dataFile)) {
      logger.info('store.empty');
      return;
    }
    const contenido = fs.readFileSync(dataFile, 'utf8');
    const lineas = contenido.split('\n').filter((linea) => linea.trim().length > 0);
    for (const linea of lineas) {
      try {
        const obj = JSON.parse(linea);
        if (!obj || typeof obj !== 'object' || Array.isArray(obj))
          throw new Error('Registro invalido');
        totalMediciones += 1;
        nextId = Math.max(
          nextId,
          totalMediciones + 1,
          Number.isSafeInteger(obj.id) && obj.id > 0 ? obj.id + 1 : 0
        );
        ultimaMedicion = obj;
        mediciones.push(obj);
        if (mediciones.length > maxInMemory) {
          mediciones.shift();
        }
      } catch {
        logger.warn('store.invalid_record');
      }
    }
    logger.info('store.loaded', { total: totalMediciones, in_memory: mediciones.length });
  }

  async function guardarEnArchivo(medicion) {
    let handle;
    let originalSize;
    let writeAttempted = false;
    try {
      handle = await fs.promises.open(dataFile, 'a+');
      originalSize = (await handle.stat()).size;
      let separator = '';
      if (originalSize > 0) {
        const tail = Buffer.alloc(1);
        await handle.read(tail, 0, 1, originalSize - 1);
        if (tail[0] !== 10) separator = '\n';
      }
      writeAttempted = true;
      await handle.writeFile(separator + JSON.stringify(medicion) + '\n', 'utf8');
      await handle.close();
      handle = null;
    } catch (err) {
      if (writeAttempted) {
        try {
          await fs.promises.truncate(dataFile, originalSize);
        } catch (rollbackError) {
          writeBlocked = true;
          logger.error('store.rollback_failed', { code: rollbackError.code });
        }
      }
      logger.error('store.append_failed', { code: err.code });
      throw new HttpError(
        writeBlocked ? 503 : 500,
        writeBlocked
          ? 'Almacenamiento no disponible; revise el archivo de datos.'
          : 'No se pudo guardar la medicion.'
      );
    } finally {
      if (handle) await handle.close().catch(() => {});
    }
  }

  function append(createMeasurement) {
    const operation = queue.then(async () => {
      if (writeBlocked || !Number.isSafeInteger(nextId)) {
        throw new HttpError(503, 'Almacenamiento no disponible; revise el archivo de datos.');
      }
      const medicion = createMeasurement(nextId, ultimaMedicion);
      await guardarEnArchivo(medicion);
      // Publicar en memoria solo después de completar la escritura y cerrar el archivo.
      mediciones.push(medicion);
      if (mediciones.length > maxInMemory) mediciones.shift();
      totalMediciones += 1;
      nextId += 1;
      ultimaMedicion = medicion;
      return medicion;
    });
    queue = operation.catch(() => {});
    return operation;
  }

  cargarDesdeArchivo();

  return {
    append,
    getMeasurements: () => mediciones,
    getTotal: () => totalMediciones,
    getLast: () => ultimaMedicion,
  };
}

module.exports = { createStore };
