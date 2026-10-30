# 02 — Catálogo funcional

<!-- DOCUMENTACION:nivel-2026-10-29:BEGIN -->

**Nivel:** general / técnica.

## Catálogo de capacidades — revisión 2026-10-29

Revisión documental: 2026-10-29. Base `b02313f499f6` en `main`; árbol inicialmente limpio. La inspección de fuentes no sustituye pruebas de ejecución.

**Estado y alcance:** Prototipo físico/local con backend modular y documentación de entrega. La demostración o el servidor de prueba no certifican calibración científica ni una API de producción.

| Módulo      | Capacidad / propósito          | Caso borde o límite                          |
| ----------- | ------------------------------ | -------------------------------------------- |
| Adquisición | Muestreo y envío configurables | Sensor ausente/GPS sin fix                   |
| Ingesta     | Validación y manejo de errores | Payload malformado o fuera de contrato       |
| Histórico   | Ventana y JSONL                | Archivo vacío, inválido o falla de escritura |
| Dashboard   | Estado y series                | Sin datos y lecturas sospechosas             |
| Exportación | CSV/JSONL y rangos             | Rango inválido o sin resultados              |

Los módulos propuestos se identifican expresamente. La disponibilidad en una plataforma no se extrapola a las demás; la aceptación debe cubrir los casos borde del recorrido principal.

## Fuentes de implementación y contratos

[README.md](../README.md) · [ARCHITECTURE.md](../ARCHITECTURE.md) · [manual-de-usuario.md](../manual-de-usuario.md) · [backend/README.md](../backend/README.md) · [firmware/README.md](../firmware/README.md).
<!-- DOCUMENTACION:nivel-2026-10-29:END -->
