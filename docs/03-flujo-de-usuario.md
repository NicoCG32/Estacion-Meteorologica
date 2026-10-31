# 03 — Recorrido y estados

## Recorrido operativo y estados

1. Montar y configurar hardware según circuito.
2. Iniciar backend con archivo de datos apropiado.
3. Recibir y validar mediciones.
4. Consultar estado e historial.
5. Exportar una selección y revisar anomalías/origen antes de interpretar.

### Confirmación y resultado

El contrato exige magnitudes con tipos y unidades explícitas; un campo presente no garantiza una lectura física válida.

El reconocimiento de persistencia debe corresponder al resultado real del almacenamiento y sus errores.

### Criterio de aceptación del recorrido

Completitud de series, disponibilidad de adquisición, anomalías y comparación con referencia calibrada; no sólo cantidad de muestras.

Validar inicio, camino principal, error relevante, cancelación y reapertura según la plataforma; registrar también los escenarios aún no ejecutados. Para Estación Meteorológica, atender especialmente: calibración, deriva y ubicación del sensor.

## Código y documentación relacionada

[README.md](../README.md) · [ARCHITECTURE.md](../ARCHITECTURE.md) · [manual-de-usuario.md](../manual-de-usuario.md) · [backend/README.md](../backend/README.md) · [firmware/README.md](../firmware/README.md).
