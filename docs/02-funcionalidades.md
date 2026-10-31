# 02 — Catálogo funcional

## Capacidades y límites

**Disponibilidad:** Prototipo de estación física con captura local, backend y dashboard. Su uso como instrumento científico requiere calibración y validación del montaje.

| Módulo      | Capacidad / propósito          | Caso borde o límite                          |
| ----------- | ------------------------------ | -------------------------------------------- |
| Adquisición | Muestreo y envío configurables | Sensor ausente/GPS sin fix                   |
| Ingesta     | Validación y manejo de errores | Payload malformado o fuera de contrato       |
| Histórico   | Ventana y JSONL                | Archivo vacío, inválido o falla de escritura |
| Dashboard   | Estado y series                | Sin datos y lecturas sospechosas             |
| Exportación | CSV/JSONL y rangos             | Rango inválido o sin resultados              |

Las capacidades previstas se distinguen de las disponibles. Consulta los requisitos de la plataforma que vas a utilizar.

## Código y documentación relacionada

[README.md](../README.md) · [ARCHITECTURE.md](../ARCHITECTURE.md) · [manual-de-usuario.md](../manual-de-usuario.md) · [backend/README.md](../backend/README.md) · [firmware/README.md](../firmware/README.md).
