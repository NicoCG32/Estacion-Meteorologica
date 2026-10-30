# 03 — Recorrido y estados

<!-- DOCUMENTACION:nivel-2026-10-29:BEGIN -->

**Nivel:** general / técnica.

## Recorrido operativo y estados

Revisión documental: 2026-10-29. Base `b02313f499f6` en `main`; árbol inicialmente limpio. La inspección de fuentes no sustituye pruebas de ejecución.

**Estado y alcance:** Prototipo físico/local con backend modular y documentación de entrega. La demostración o el servidor de prueba no certifican calibración científica ni una API de producción.

1. Montar y configurar hardware según circuito.
2. Iniciar backend con archivo de datos apropiado.
3. Recibir y validar mediciones.
4. Consultar estado e historial.
5. Exportar una selección y revisar anomalías/origen antes de interpretar.

### Confirmación y resultado

El contrato exige magnitudes con tipos y unidades explícitas; un campo presente no garantiza una lectura física válida.

El reconocimiento de persistencia debe corresponder al resultado real del almacenamiento y sus errores.

En formularios/operaciones, distinguir captura, revisión, confirmación, resultado y fallo. Cancelar una previsualización no debe anunciar un cambio no confirmado; cuando existe una operación persistente, su recuperación sigue el contrato específico. En juegos, las fases de simulación se definen en el núcleo y la vista refleja esas transiciones.

### Criterio de aceptación del recorrido

Completitud de series, disponibilidad de adquisición, anomalías y comparación con referencia calibrada; no sólo cantidad de muestras.

Validar inicio, camino principal, error relevante, cancelación y reapertura según la plataforma; registrar también los escenarios aún no ejecutados. Para Estación Meteorológica, atender especialmente: calibración, deriva y ubicación del sensor.

## Fuentes de implementación y contratos

[README.md](../README.md) · [ARCHITECTURE.md](../ARCHITECTURE.md) · [manual-de-usuario.md](../manual-de-usuario.md) · [backend/README.md](../backend/README.md) · [firmware/README.md](../firmware/README.md).
<!-- DOCUMENTACION:nivel-2026-10-29:END -->
