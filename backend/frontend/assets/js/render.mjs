import { describeState } from './state.mjs';

function setText(id, value) {
  document.getElementById(id).textContent = value;
}

function dateText(value) {
  const date = new Date(value);
  return value && Number.isFinite(date.getTime()) ? date.toLocaleString() : '-';
}

function sensor(name, kind, text) {
  const icon = document.getElementById(`icon-${name}`);
  icon.textContent = kind === 'ok' ? '✅' : kind === 'bad' ? '⚠️' : '-';
  icon.className = `sensor-icon sensor-${kind}`;
  const label = document.getElementById(`estado-${name}`);
  label.textContent = text;
  label.style.color = kind === 'ok' ? '#15803d' : kind === 'bad' ? '#b91c1c' : '#6b7280';
}

function renderSensors(measurement, recent) {
  sensor(
    'dht',
    'unknown',
    'Estado no observable desde el servidor (no se envia dato propio del DHT22)'
  );
  if (!measurement || !recent) {
    for (const name of ['bme', 'scd', 'gps'])
      sensor(
        name,
        'unknown',
        measurement ? 'Muestra anterior; vigencia no comprobada' : 'Sin datos'
      );
    return;
  }
  const bme = Number.isFinite(measurement.presion_atmosferica_hPa);
  sensor(
    'bme',
    bme ? 'ok' : 'bad',
    bme ? 'Presion valida en la ultima muestra' : 'Sin lectura de presion en la ultima muestra'
  );
  const scd =
    Number.isFinite(measurement.concentracion_CO2_ppm) && measurement.concentracion_CO2_ppm > 0;
  sensor(
    'scd',
    scd ? 'ok' : 'bad',
    scd ? 'CO2 valido en la ultima muestra' : 'Sin muestras de CO2'
  );
  const gps =
    Number.isFinite(measurement.numero_satelites) &&
    measurement.numero_satelites > 0 &&
    Number.isFinite(measurement.latitud_grados) &&
    Number.isFinite(measurement.longitud_grados);
  sensor(
    'gps',
    gps ? 'ok' : 'bad',
    gps
      ? 'Posicion y satelites en la ultima muestra'
      : 'Sin posicion o satelites en la ultima muestra'
  );
}

export function renderDashboard(state) {
  const view = describeState(state);
  const notice = document.getElementById('connection-notice');
  notice.textContent = view.text;
  notice.className = `connection-notice state-${view.kind}`;
  notice.dataset.state = view.kind;
  setText('server-chip', view.chip);
  setText(
    'status-text',
    state.connection === 'error' ? 'Consulta fallida' : state.status?.status || '-'
  );
  setText('total-mediciones', state.status?.mediciones_totales ?? 0);
  setText(
    'memoria-ventana',
    state.status ? `${state.status.ventana_en_memoria} / ${state.status.max_en_memoria}` : '-'
  );
  setText('ultima-actualizacion', dateText(state.latest?.timestamp));
  setText('last-ts', dateText(state.latest?.timestamp));
  for (const [id, field, decimals] of [
    ['last-temp', 'temperatura_aire_celsius', 2],
    ['last-temp-incert', 'incertidumbre_temperatura_celsius', 2],
    ['last-hum', 'humedad_aire_porcentaje', 1],
    ['last-hum-incert', 'incertidumbre_humedad_porcentaje', 1],
    ['last-pres', 'presion_atmosferica_hPa', 1],
    ['last-co2', 'concentracion_CO2_ppm', 0],
    ['last-lat', 'latitud_grados', 6],
    ['last-lon', 'longitud_grados', 6],
    ['last-sat', 'numero_satelites', 0],
  ]) {
    const value = state.latest?.[field];
    setText(
      id,
      Number.isFinite(value) && !(field === 'concentracion_CO2_ppm' && value === 0)
        ? value.toFixed(decimals)
        : '-'
    );
  }
  setText('last-json', state.latest ? JSON.stringify(state.latest, null, 2) : '{ }');
  const alert = document.getElementById('alert-sospecha');
  alert.hidden = !state.latest?.sospechosa;
  alert.textContent = state.latest?.sospechosa
    ? `Advertencia: medicion sospechosa. ${Array.isArray(state.latest.motivos_sospecha) ? state.latest.motivos_sospecha.join(' | ') : 'Cambio brusco detectado'}.`
    : '';
  renderSensors(state.latest, view.kind === 'fresh');
}
