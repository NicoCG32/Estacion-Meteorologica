const LEVELS = { silent: -1, error: 0, warn: 1, info: 2, debug: 3 };

function createLogger({ level = process.env.LOG_LEVEL || 'info', sink } = {}) {
  if (!Object.hasOwn(LEVELS, level))
    throw new Error('LOG_LEVEL debe ser silent, error, warn, info o debug.');
  function emit(severity, event, fields = {}) {
    if (LEVELS[severity] > LEVELS[level]) return;
    const line = JSON.stringify({
      ...fields,
      timestamp: new Date().toISOString(),
      level: severity,
      event,
    });
    if (sink) sink(line, severity);
    else if (severity === 'error') console.error(line);
    else console.log(line);
  }
  return Object.fromEntries(
    ['error', 'warn', 'info', 'debug'].map((severity) => [
      severity,
      (event, fields) => emit(severity, event, fields),
    ])
  );
}

module.exports = { createLogger };
