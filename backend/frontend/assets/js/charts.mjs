function drawLineChart(canvasId, labels, data, color, label, unit) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  const width = (canvas.width = rect.width || 600);
  const height = (canvas.height = rect.height || 260);

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  const margin = 32;
  const plotW = width - 2 * margin;
  const plotH = height - 2 * margin;

  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 1;
  ctx.strokeRect(margin, margin, plotW, plotH);

  const valid = data.filter(Number.isFinite);

  if (labels.length === 0 || valid.length === 0) {
    ctx.fillStyle = '#9ca3af';
    ctx.font = '13px Space Grotesk';
    ctx.fillText('Sin datos aun (esperando mediciones)...', margin + 10, margin + plotH / 2);
    return;
  }

  const vMin = Math.min(...valid);
  const vMax = Math.max(...valid);
  const range = vMax - vMin || 1;
  const n = labels.length;

  function xPos(i) {
    if (n <= 1) return margin + plotW / 2;
    return margin + (i / (n - 1)) * plotW;
  }

  function yPos(v) {
    return margin + (1 - (v - vMin) / range) * plotH;
  }

  ctx.fillStyle = '#4b5563';
  ctx.font = '11px Space Grotesk';
  ctx.fillText(`${vMax.toFixed(2)} ${unit}`, 4, margin + 10);
  ctx.fillText(`${vMin.toFixed(2)} ${unit}`, 4, margin + plotH);

  const firstLabel = labels[0];
  const lastLabel = labels[labels.length - 1];
  ctx.fillStyle = '#9ca3af';
  ctx.font = '10px Space Grotesk';
  ctx.fillText(firstLabel, margin, margin + plotH + 16);
  ctx.textAlign = 'right';
  ctx.fillText(lastLabel, margin + plotW, margin + plotH + 16);
  ctx.textAlign = 'left';

  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  let started = false;
  for (let i = 0; i < n; i++) {
    const v = data[i];
    if (!Number.isFinite(v)) {
      started = false;
      continue;
    }
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

  ctx.font = '11px Space Grotesk';
  ctx.fillStyle = color;
  ctx.fillText(label, margin + 10, margin - 12);
}

export function drawCharts(history) {
  const labels = history.map((record) => {
    const date = new Date(record.timestamp);
    return Number.isFinite(date.getTime()) ? date.toLocaleTimeString() : '-';
  });
  const tempData = history.map((record) => record.temperatura_aire_celsius);
  const co2Data = history.map((record) =>
    record.concentracion_CO2_ppm > 0 ? record.concentracion_CO2_ppm : null
  );
  const humData = history.map((record) => record.humedad_aire_porcentaje);
  const presData = history.map((record) => record.presion_atmosferica_hPa);
  drawLineChart('chartTemp', labels, tempData, '#0ea5e9', 'Temperatura del aire', 'C');
  drawLineChart('chartCo2', labels, co2Data, '#0f766e', 'CO2', 'ppm');
  drawLineChart('chartHum', labels, humData, '#f59e0b', 'Humedad relativa', '%');
  drawLineChart('chartPres', labels, presData, '#e11d48', 'Presion atmosferica', 'hPa');
}
