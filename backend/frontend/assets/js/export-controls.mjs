function toIsoFromLocal(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function updateExportLinks() {
  const fromInput = document.getElementById('export-from');
  const toInput = document.getElementById('export-to');
  const csvLink = document.getElementById('export-csv');
  const jsonlLink = document.getElementById('export-jsonl');
  const errorEl = document.getElementById('export-error');
  const hintEl = document.getElementById('export-hint');
  const fromField = fromInput ? fromInput.closest('.export-field') : null;
  const toField = toInput ? toInput.closest('.export-field') : null;
  if (!fromInput || !toInput || !csvLink || !jsonlLink) return;

  const fromIso = toIsoFromLocal(fromInput.value);
  const toIso = toIsoFromLocal(toInput.value);

  let errorMessage = '';
  if (fromInput.validity.badInput || toInput.validity.badInput) {
    errorMessage = 'Completa las fechas antes de exportar.';
  } else if (fromInput.value && !fromIso) {
    errorMessage = "Fecha 'Desde' invalida.";
  } else if (toInput.value && !toIso) {
    errorMessage = "Fecha 'Hasta' invalida.";
  } else if (fromIso && toIso && fromIso > toIso) {
    errorMessage = "El rango es invalido: 'Desde' es mayor que 'Hasta'.";
  }

  const hasError = Boolean(errorMessage);
  if (errorEl) errorEl.textContent = errorMessage;
  if (hintEl) hintEl.style.display = hasError ? 'none' : 'inline';

  if (fromField)
    fromField.classList.toggle(
      'field-error',
      hasError && (!!fromInput.value || fromInput.validity.badInput)
    );
  if (toField)
    toField.classList.toggle(
      'field-error',
      hasError && (!!toInput.value || toInput.validity.badInput)
    );

  csvLink.classList.toggle('btn-disabled', hasError);
  jsonlLink.classList.toggle('btn-disabled', hasError);
  csvLink.setAttribute('aria-disabled', hasError ? 'true' : 'false');
  jsonlLink.setAttribute('aria-disabled', hasError ? 'true' : 'false');

  const params = new URLSearchParams();
  if (fromIso) params.set('from', fromIso);
  if (toIso) params.set('to', toIso);

  const csvParams = new URLSearchParams(params);
  csvParams.set('format', 'csv');
  csvLink.href = `/api/mediciones/export?${csvParams.toString()}`;

  const jsonlParams = new URLSearchParams(params);
  jsonlParams.set('format', 'jsonl');
  jsonlLink.href = `/api/mediciones/export?${jsonlParams.toString()}`;
}

export function initializeExports() {
  updateExportLinks();
  const fromInput = document.getElementById('export-from');
  const toInput = document.getElementById('export-to');
  const clearBtn = document.getElementById('export-clear');
  for (const input of [fromInput, toInput]) {
    if (input) {
      input.addEventListener('input', updateExportLinks);
      input.addEventListener('change', updateExportLinks);
    }
  }
  for (const id of ['export-csv', 'export-jsonl']) {
    document.getElementById(id)?.addEventListener('click', (event) => {
      if (event.currentTarget.getAttribute('aria-disabled') === 'true') event.preventDefault();
    });
  }
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (fromInput) fromInput.value = '';
      if (toInput) toInput.value = '';
      updateExportLinks();
    });
  }
}
