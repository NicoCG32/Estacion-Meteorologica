const labels = [];
const tempData = [];
const co2Data = [];
const humData = [];
const presData = [];
const MAX_POINTS = 60;

function formatearFloat(value, decimals) {
  if (value === null || value === undefined) return "-";
  if (typeof value !== "number") return String(value);
  return value.toFixed(decimals);
}

function formatearCoord(value) {
  if (value === null || value === undefined) return "-";
  const n = Number(value);
  if (Number.isNaN(n)) return "-";
  return n.toFixed(6);
}

function setSensorEstado(iconId, textId, ok, textoOk, textoBad) {
  const iconEl = document.getElementById(iconId);
  const textEl = document.getElementById(textId);
  if (!iconEl || !textEl) return;

  if (ok === null) {
    iconEl.textContent = "-";
    iconEl.className = "sensor-icon sensor-unknown";
    textEl.textContent = "Sin datos";
    textEl.style.color = "#6b7280";
  } else if (ok) {
    iconEl.textContent = "✅";
    iconEl.className = "sensor-icon sensor-ok";
    textEl.textContent = textoOk;
    textEl.style.color = "#15803d";
  } else {
    iconEl.textContent = "⚠️";
    iconEl.className = "sensor-icon sensor-bad";
    textEl.textContent = textoBad;
    textEl.style.color = "#b91c1c";
  }
}

function actualizarEstadoSensores(m) {
  if (!m) {
    setSensorEstado("icon-bme", "estado-bme", null);
    setSensorEstado("icon-scd", "estado-scd", null);
    setSensorEstado("icon-dht", "estado-dht", null);
    setSensorEstado("icon-gps", "estado-gps", null);
    return;
  }

  const pres = m.presion_atmosferica_hPa;
  const bmeOk = (typeof pres === "number" && !Number.isNaN(pres));
  setSensorEstado(
    "icon-bme",
    "estado-bme",
    bmeOk,
    "OK (presion valida recibida)",
    "Sin presion valida (revisar BME280)"
  );

  const co2 = m.concentracion_CO2_ppm;
  const scdOk = (typeof co2 === "number" && co2 > 0 && !Number.isNaN(co2));
  setSensorEstado(
    "icon-scd",
    "estado-scd",
    scdOk,
    "OK (CO2 valido recibido)",
    "Sin datos de CO2 (revisar SCD4x)"
  );

  const iconDht = document.getElementById("icon-dht");
  const textDht = document.getElementById("estado-dht");
  if (iconDht && textDht) {
    iconDht.textContent = "⚠️";
    iconDht.className = "sensor-icon sensor-bad";
    textDht.textContent = "Estado no observable desde el servidor (no se envia dato propio del DHT22)";
    textDht.style.color = "#b45309";
  }

  const sat = m.numero_satelites;
  const lat = m.latitud_grados;
  const lon = m.longitud_grados;
  const gpsOk =
    typeof sat === "number" && sat > 0 &&
    typeof lat === "number" && !Number.isNaN(lat) &&
    typeof lon === "number" && !Number.isNaN(lon);

  setSensorEstado(
    "icon-gps",
    "estado-gps",
    gpsOk,
    "OK (satelites y posicion validos)",
    "Sin posicion o satelites (GPS aun sin fix o desconectado)"
  );
}

function actualizarEstadoServidor(data) {
  document.getElementById("status-text").textContent = data.status || "desconocido";
  document.getElementById("total-mediciones").textContent = data.mediciones_totales ?? 0;
  const ventana = data.ventana_en_memoria;
  const max = data.max_en_memoria;
  const ventanaText =
    (typeof ventana === "number" && typeof max === "number")
      ? `${ventana} / ${max}`
      : "-";
  document.getElementById("memoria-ventana").textContent = ventanaText;

  if (data.ultima_medicion) {
    const ts = data.ultima_medicion.timestamp;
    const tsLocal = ts ? new Date(ts).toLocaleString() : "-";
    document.getElementById("ultima-actualizacion").textContent = tsLocal;
  } else {
    document.getElementById("ultima-actualizacion").textContent = "-";
    actualizarEstadoSensores(null);
  }
}

function actualizarUltimaMedicion(m) {
  if (!m) {
    actualizarEstadoSensores(null);
    return;
  }

  const alertEl = document.getElementById("alert-sospecha");
  if (alertEl) {
    if (m.sospechosa) {
      const motivos = Array.isArray(m.motivos_sospecha)
        ? m.motivos_sospecha.join(" | ")
        : "Cambio brusco detectado";
      alertEl.textContent = `Advertencia: medicion sospechosa. ${motivos}.`;
      alertEl.hidden = false;
    } else {
      alertEl.textContent = "";
      alertEl.hidden = true;
    }
  }

  const tsLocal = m.timestamp ? new Date(m.timestamp).toLocaleString() : "-";
  document.getElementById("last-ts").textContent = tsLocal;

  document.getElementById("last-temp").textContent =
    formatearFloat(m.temperatura_aire_celsius, 2);
  document.getElementById("last-temp-incert").textContent =
    formatearFloat(m.incertidumbre_temperatura_celsius, 2);
  document.getElementById("last-hum").textContent =
    formatearFloat(m.humedad_aire_porcentaje, 1);
  document.getElementById("last-hum-incert").textContent =
    formatearFloat(m.incertidumbre_humedad_porcentaje, 1);
  document.getElementById("last-pres").textContent =
    formatearFloat(m.presion_atmosferica_hPa, 1);
  document.getElementById("last-co2").textContent =
    formatearFloat(m.concentracion_CO2_ppm, 0);
  document.getElementById("last-lat").textContent =
    formatearCoord(m.latitud_grados);
  document.getElementById("last-lon").textContent =
    formatearCoord(m.longitud_grados);
  document.getElementById("last-sat").textContent =
    (m.numero_satelites ?? "-");

  document.getElementById("last-json").textContent =
    JSON.stringify(m, null, 2);

  actualizarEstadoSensores(m);
}

function drawLineChart(canvasId, data, color, label, unit) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  const width = canvas.width = rect.width || 600;
  const height = canvas.height = rect.height || 260;

  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  const margin = 32;
  const plotW = width - 2 * margin;
  const plotH = height - 2 * margin;

  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 1;
  ctx.strokeRect(margin, margin, plotW, plotH);

  const valid = data.filter(v => typeof v === "number");

  if (labels.length === 0 || valid.length === 0) {
    ctx.fillStyle = "#9ca3af";
    ctx.font = "13px Space Grotesk";
    ctx.fillText("Sin datos aun (esperando mediciones)...", margin + 10, margin + plotH / 2);
    return;
  }

  const vMin = Math.min(...valid);
  const vMax = Math.max(...valid);
  const range = (vMax - vMin) || 1;
  const n = labels.length;

  function xPos(i) {
    if (n <= 1) return margin + plotW / 2;
    return margin + (i / (n - 1)) * plotW;
  }

  function yPos(v) {
    return margin + (1 - (v - vMin) / range) * plotH;
  }

  ctx.fillStyle = "#4b5563";
  ctx.font = "11px Space Grotesk";
  ctx.fillText(`${vMax.toFixed(2)} ${unit}`, 4, margin + 10);
  ctx.fillText(`${vMin.toFixed(2)} ${unit}`, 4, margin + plotH);

  const firstLabel = labels[0];
  const lastLabel = labels[labels.length - 1];
  ctx.fillStyle = "#9ca3af";
  ctx.font = "10px Space Grotesk";
  ctx.fillText(firstLabel, margin, margin + plotH + 16);
  ctx.textAlign = "right";
  ctx.fillText(lastLabel, margin + plotW, margin + plotH + 16);
  ctx.textAlign = "left";

  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  let started = false;
  for (let i = 0; i < n; i++) {
    const v = data[i];
    if (typeof v !== "number") continue;
    const x = xPos(i);
    const y = yPos(v);
    if (!started) {
      ctx.moveTo(x, y);
      started = true;
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.stroke();

  ctx.font = "11px Space Grotesk";
  ctx.fillStyle = color;
  ctx.fillText(label, margin + 10, margin - 12);
}

function drawCharts() {
  drawLineChart("chartTemp", tempData, "#0ea5e9", "Temperatura del aire", "C");
  drawLineChart("chartCo2", co2Data, "#0f766e", "CO2", "ppm");
  drawLineChart("chartHum", humData, "#f59e0b", "Humedad relativa", "%");
  drawLineChart("chartPres", presData, "#e11d48", "Presion atmosferica", "hPa");
}

function agregarPuntoAlGrafico(m) {
  if (!m) return;

  const tsLabel = m.timestamp
    ? new Date(m.timestamp).toLocaleTimeString()
    : new Date().toLocaleTimeString();

  labels.push(tsLabel);
  tempData.push(
    (typeof m.temperatura_aire_celsius === "number")
      ? m.temperatura_aire_celsius
      : null
  );
  co2Data.push(
    (typeof m.concentracion_CO2_ppm === "number")
      ? m.concentracion_CO2_ppm
      : null
  );
  humData.push(
    (typeof m.humedad_aire_porcentaje === "number")
      ? m.humedad_aire_porcentaje
      : null
  );
  presData.push(
    (typeof m.presion_atmosferica_hPa === "number")
      ? m.presion_atmosferica_hPa
      : null
  );

  if (labels.length > MAX_POINTS) {
    labels.shift();
    tempData.shift();
    co2Data.shift();
    humData.shift();
    presData.shift();
  }

  drawCharts();
}

async function cargarEstadoInicial() {
  try {
    const resp = await fetch("/api/status");
    if (!resp.ok) return;
    const data = await resp.json();
    actualizarEstadoServidor(data);
    if (data.ultima_medicion) {
      actualizarUltimaMedicion(data.ultima_medicion);
    } else {
      actualizarEstadoSensores(null);
    }
  } catch (err) {
    console.error("Error al cargar estado inicial:", err);
  }
}

async function cargarHistorialInicial() {
  try {
    const resp = await fetch("/api/mediciones?limit=60");
    if (!resp.ok) return;
    const lista = await resp.json();
    lista.forEach(m => agregarPuntoAlGrafico(m));
  } catch (err) {
    console.error("Error al cargar historial inicial:", err);
  }
}

async function actualizarPeriodicamente() {
  try {
    const respStatus = await fetch("/api/status");
    if (respStatus.ok) {
      const status = await respStatus.json();
      actualizarEstadoServidor(status);
    }

    const respUltimo = await fetch("/api/mediciones/ultimo");
    if (respUltimo.ok) {
      const m = await respUltimo.json();
      actualizarUltimaMedicion(m);
      const ultimaLabel = labels.length > 0 ? labels[labels.length - 1] : null;
      const nuevaLabel = m.timestamp
        ? new Date(m.timestamp).toLocaleTimeString()
        : null;
      if (!ultimaLabel || ultimaLabel !== nuevaLabel) {
        agregarPuntoAlGrafico(m);
      }
    }
  } catch (err) {
    console.error("Error en actualizacion periodica:", err);
  }
}

window.addEventListener("load", async () => {
  drawCharts();
  await cargarEstadoInicial();
  await cargarHistorialInicial();
  setInterval(actualizarPeriodicamente, 10000);
});

function toIsoFromLocal(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function updateExportLinks() {
  const fromInput = document.getElementById("export-from");
  const toInput = document.getElementById("export-to");
  const csvLink = document.getElementById("export-csv");
  const jsonlLink = document.getElementById("export-jsonl");
  const errorEl = document.getElementById("export-error");
  const hintEl = document.getElementById("export-hint");
  const fromField = fromInput ? fromInput.closest(".export-field") : null;
  const toField = toInput ? toInput.closest(".export-field") : null;
  if (!fromInput || !toInput || !csvLink || !jsonlLink) return;

  const fromIso = toIsoFromLocal(fromInput.value);
  const toIso = toIsoFromLocal(toInput.value);

  let errorMessage = "";
  if (fromInput.value && !fromIso) {
    errorMessage = "Fecha 'Desde' invalida.";
  } else if (toInput.value && !toIso) {
    errorMessage = "Fecha 'Hasta' invalida.";
  } else if (fromIso && toIso && fromIso > toIso) {
    errorMessage = "El rango es invalido: 'Desde' es mayor que 'Hasta'.";
  }

  const hasError = Boolean(errorMessage);
  if (errorEl) errorEl.textContent = errorMessage;
  if (hintEl) hintEl.style.display = hasError ? "none" : "inline";

  if (fromField) fromField.classList.toggle("field-error", hasError && !!fromInput.value);
  if (toField) toField.classList.toggle("field-error", hasError && !!toInput.value);

  csvLink.classList.toggle("btn-disabled", hasError);
  jsonlLink.classList.toggle("btn-disabled", hasError);
  csvLink.setAttribute("aria-disabled", hasError ? "true" : "false");
  jsonlLink.setAttribute("aria-disabled", hasError ? "true" : "false");

  const params = new URLSearchParams();
  if (fromIso) params.set("from", fromIso);
  if (toIso) params.set("to", toIso);

  const csvParams = new URLSearchParams(params);
  csvParams.set("format", "csv");
  csvLink.href = `/api/mediciones/export?${csvParams.toString()}`;

  const jsonlParams = new URLSearchParams(params);
  jsonlParams.set("format", "jsonl");
  jsonlLink.href = `/api/mediciones/export?${jsonlParams.toString()}`;
}

window.addEventListener("load", () => {
  updateExportLinks();
  const fromInput = document.getElementById("export-from");
  const toInput = document.getElementById("export-to");
  const clearBtn = document.getElementById("export-clear");
  if (fromInput) fromInput.addEventListener("change", updateExportLinks);
  if (toInput) toInput.addEventListener("change", updateExportLinks);
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (fromInput) fromInput.value = "";
      if (toInput) toInput.value = "";
      updateExportLinks();
    });
  }
});
