const { CSV_HEADERS } = require('./config');
const fs = require('fs');
const { once } = require('node:events');
const { createLogger } = require('./logger');

function escapeCsv(value) {
  if (value === null || value === undefined) return '';
  const text = String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function parseDateParam(value) {
  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2}))?$/.test(value)
  )
    return null;
  const day = new Date(value.slice(0, 10) + 'T00:00:00Z');
  if (Number.isNaN(day.getTime()) || day.toISOString().slice(0, 10) !== value.slice(0, 10))
    return null;
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

async function* readRecords(stream, logger) {
  let pending = '';
  function parse(line) {
    if (!line.trim()) return;
    try {
      const value = JSON.parse(line);
      if (!value || typeof value !== 'object' || Array.isArray(value))
        throw new Error('Registro invalido');
      return value;
    } catch {
      logger.warn('export.invalid_record');
    }
  }
  for await (const chunk of stream) {
    pending += chunk;
    let end;
    while ((end = pending.indexOf('\n')) !== -1) {
      const record = parse(pending.slice(0, end));
      pending = pending.slice(end + 1);
      if (record) yield record;
    }
  }
  const record = parse(pending);
  if (record) yield record;
}

async function streamExport(dataFile, res, fromDate, toDate, csv, logger) {
  const controller = new AbortController();
  const abort = () => controller.abort();
  res.once('close', abort);
  const stream = fs.createReadStream(dataFile, { encoding: 'utf8', signal: controller.signal });
  async function write(text) {
    if (!res.write(text)) await once(res, 'drain', { signal: controller.signal });
  }
  try {
    // Abrir antes de emitir datos permite responder JSON ante fallos iniciales.
    await once(stream, 'open');
    if (csv) await write(CSV_HEADERS.join(',') + '\n');
    for await (const record of readRecords(stream, logger)) {
      if (!inRange(record.timestamp, fromDate, toDate)) continue;
      await write(
        csv
          ? CSV_HEADERS.map((key) => escapeCsv(record[key])).join(',') + '\n'
          : JSON.stringify(record) + '\n'
      );
    }
    res.end();
  } finally {
    stream.destroy();
    res.off('close', abort);
  }
}

function streamJsonlAsCsv(dataFile, res, fromDate, toDate, logger = createLogger()) {
  return streamExport(dataFile, res, fromDate, toDate, true, logger);
}

function streamJsonlFiltered(dataFile, res, fromDate, toDate, logger = createLogger()) {
  return streamExport(dataFile, res, fromDate, toDate, false, logger);
}

module.exports = { escapeCsv, parseDateParam, inRange, streamJsonlAsCsv, streamJsonlFiltered };
