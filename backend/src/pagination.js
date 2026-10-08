const { HttpError } = require('./errors');

function integerParam(value, field, minimum) {
  if (
    typeof value !== 'string' ||
    !/^\d+$/.test(value) ||
    !Number.isSafeInteger(Number(value)) ||
    Number(value) < minimum
  ) {
    throw new HttpError(
      400,
      `El parametro "${field}" debe ser un entero ${minimum ? 'positivo' : 'no negativo'}.`
    );
  }
  return Number(value);
}

function paginate(records, query) {
  const limit = query.limit === undefined ? records.length : integerParam(query.limit, 'limit', 1);
  const offset = query.offset === undefined ? 0 : integerParam(query.offset, 'offset', 0);
  const order = query.order === undefined ? 'asc' : query.order;
  if (order !== 'asc' && order !== 'desc')
    throw new HttpError(400, 'El parametro "order" debe ser asc o desc.');
  // Offset cuenta desde las más recientes; el orden solo afecta la página elegida.
  const end = Math.max(0, records.length - offset);
  const page = records.slice(Math.max(0, end - limit), end);
  return order === 'desc' ? page.reverse() : page;
}

module.exports = { paginate };
