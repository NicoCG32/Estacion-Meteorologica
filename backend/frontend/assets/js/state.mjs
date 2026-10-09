export const MAX_POINTS = 60;
export const POLL_INTERVAL_MS = 10000;
export const STALE_AFTER_MS = 90000;

export function initialState() {
  return { connection: 'loading', status: null, latest: null, history: [], error: null };
}

export function applySnapshot(state, { status, history }) {
  const latest = status.ultima_medicion;
  const records = history.slice();
  if (
    latest &&
    !records.some((record) => record.id === latest.id && record.timestamp === latest.timestamp)
  )
    records.push(latest);
  return {
    ...state,
    connection: 'ready',
    status,
    latest,
    history: records.slice(-MAX_POINTS),
    error: null,
  };
}

export function applyFailure(state, error) {
  return { ...state, connection: 'error', error: error.message };
}

export function describeState(state, now = Date.now()) {
  if (state.connection === 'loading')
    return { kind: 'loading', text: 'Consultando el servidor...', chip: 'Cargando' };
  if (state.connection === 'error')
    return {
      kind: 'error',
      text: `${state.error} ${state.latest ? 'Se conservan los ultimos datos; su vigencia no esta comprobada.' : 'Todavia no se han recibido datos.'}`,
      chip: 'Consulta fallida',
    };
  if (state.status.status !== 'ok')
    return {
      kind: 'error',
      text: 'El servidor informa un estado distinto de ok. La ultima muestra no confirma disponibilidad actual.',
      chip: 'Revisar servidor',
    };
  if (!state.latest)
    return {
      kind: 'empty',
      text: 'Servidor disponible, sin mediciones almacenadas. Esperando datos de la estacion.',
      chip: 'Sin mediciones',
    };
  const timestamp = Date.parse(state.latest.timestamp);
  if (!Number.isFinite(timestamp) || timestamp > now + POLL_INTERVAL_MS)
    return {
      kind: 'unknown',
      text: 'Servidor disponible, pero la fecha de la ultima muestra no permite comprobar su vigencia.',
      chip: 'Fecha no verificable',
    };
  if (now - timestamp > STALE_AFTER_MS)
    return {
      kind: 'stale',
      text: 'Servidor disponible, sin nuevas mediciones en mas de 90 segundos. Se muestran datos anteriores.',
      chip: 'Datos antiguos',
    };
  return {
    kind: 'fresh',
    text: 'Servidor disponible. Indicadores basados en la ultima muestra recibida, no en un diagnostico directo de los sensores.',
    chip: 'Backend disponible',
  };
}
