import { createApiClient } from './api.mjs';
import { initialState, applySnapshot, applyFailure, POLL_INTERVAL_MS } from './state.mjs';
import { renderDashboard } from './render.mjs';
import { drawCharts } from './charts.mjs';
import { initializeExports } from './export-controls.mjs';

const api = createApiClient();
let state = initialState();
let busy = false;
let timer;
const button = document.getElementById('refresh-button');

async function refresh() {
  if (busy) return;
  clearTimeout(timer);
  busy = true;
  button.disabled = true;
  button.textContent = 'Actualizando...';
  try {
    state = applySnapshot(state, await api.getSnapshot());
  } catch (err) {
    state = applyFailure(state, err);
  } finally {
    renderDashboard(state);
    drawCharts(state.history);
    button.disabled = false;
    button.textContent = 'Actualizar ahora';
    busy = false;
    timer = setTimeout(refresh, POLL_INTERVAL_MS);
  }
}

button.addEventListener('click', refresh);
window.addEventListener('resize', () => drawCharts(state.history));
initializeExports();
renderDashboard(state);
drawCharts(state.history);
void refresh();
