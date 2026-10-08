const { createLogger } = require('./logger');

class HttpError extends Error {
  constructor(status, mensaje, details = {}) {
    super(mensaje);
    this.status = status;
    this.details = details;
  }
}

function errorHandler(logger = createLogger()) {
  return (err, req, res, next) => {
    if (!err) return next();
    if (res.headersSent) {
      logger.error('http.stream_error', {
        method: req.method,
        path: req.path,
        code: err.code || err.name,
      });
      res.destroy();
      return;
    }
    if (res.destroyed) return;
    const parserErrors = {
      'entity.parse.failed': [400, 'JSON invalido.'],
      'entity.too.large': [413, 'El cuerpo excede el limite de 100kb.'],
      'encoding.unsupported': [415, 'Codificacion del cuerpo no soportada.'],
      'charset.unsupported': [415, 'Charset del cuerpo no soportado.'],
      'request.aborted': [400, 'Solicitud interrumpida.'],
      'request.size.invalid': [400, 'Tamano del cuerpo invalido.'],
    };
    const [status, mensaje] =
      err instanceof HttpError
        ? [err.status, err.message]
        : parserErrors[err.type] || [500, 'Error interno del servidor.'];
    if (status >= 500)
      logger.error('http.error', {
        method: req.method,
        path: req.path,
        status,
        code: err.code || err.type || err.name,
      });
    res.removeHeader('Content-Disposition');
    res
      .type('json')
      .status(status)
      .json({ ok: false, mensaje, ...(err instanceof HttpError ? err.details : {}) });
  };
}

module.exports = { HttpError, errorHandler };
