class RequestError extends Error {}

export function createApiClient(fetcher = globalThis.fetch, timeoutMs = 5000) {
  async function request(url) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetcher(url, { signal: controller.signal });
      if (!response.ok)
        throw new RequestError(`No se pudieron actualizar los datos (HTTP ${response.status}).`);
      return await response.json();
    } catch (err) {
      if (err instanceof RequestError) throw err;
      throw new RequestError(
        controller.signal.aborted
          ? 'La consulta al servidor tardo demasiado.'
          : 'No se pudo consultar el servidor.'
      );
    } finally {
      clearTimeout(timer);
    }
  }
  return {
    async getSnapshot() {
      const [status, history] = await Promise.all([
        request('/api/status'),
        request('/api/mediciones?limit=60'),
      ]);
      if (
        !status ||
        typeof status !== 'object' ||
        typeof status.status !== 'string' ||
        ![status.mediciones_totales, status.ventana_en_memoria, status.max_en_memoria].every(
          (value) => Number.isSafeInteger(value) && value >= 0
        ) ||
        !Object.hasOwn(status, 'ultima_medicion') ||
        (status.ultima_medicion !== null &&
          (typeof status.ultima_medicion !== 'object' || Array.isArray(status.ultima_medicion))) ||
        !Array.isArray(history) ||
        history.some((record) => !record || typeof record !== 'object' || Array.isArray(record))
      ) {
        throw new RequestError('El servidor devolvio un formato de datos inesperado.');
      }
      return { status, history };
    },
  };
}
