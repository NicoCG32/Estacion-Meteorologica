# 06 — Integraciones y asistencia

<!-- DOCUMENTACION:nivel-2026-10-29:BEGIN -->

**Nivel:** técnica.

## Integraciones y límites de asistencia

Revisión documental: 2026-10-29. Base `b02313f499f6` en `main`; árbol inicialmente limpio. La inspección de fuentes no sustituye pruebas de ejecución.

**Estado y alcance:** Prototipo físico/local con backend modular y documentación de entrega. La demostración o el servidor de prueba no certifican calibración científica ni una API de producción.

| Servicio / integración | Finalidad / ejecución       | Contrato o límite                                         |
| ---------------------- | --------------------------- | --------------------------------------------------------- |
| Arduino/ESP32          | Sensores por I2C/GPIO/UART  | Placa, librerías, pines y alimentación                    |
| HTTP local             | Transferencia de mediciones | Red, identidad y exposición de endpoints según despliegue |
| Navegador              | Consulta de dashboard       | No sustituye la verificación del montaje                  |

Si no hay IA generativa implementada, este capítulo no la introduce. Una IA rival de videojuego no es un proveedor LLM. Cuando existe asistencia, documentar entradas enviadas, revisión, esquema, timeout/cancelación y efecto permitido. Los reintentos/fallback deben corresponder al código y al consentimiento; no se agregan a un contrato de intento único para seguir una plantilla.

Las claves de servidor y firma no se incluyen en cliente, informes o archivos de distribución. La disponibilidad, costo y condiciones de los proveedores se verifican para el entorno real. Sin esa comprobación, distinguir integración configurada, declarada y probada.

## Fuentes de implementación y contratos

[README.md](../README.md) · [ARCHITECTURE.md](../ARCHITECTURE.md) · [manual-de-usuario.md](../manual-de-usuario.md) · [backend/README.md](../backend/README.md) · [firmware/README.md](../firmware/README.md).
<!-- DOCUMENTACION:nivel-2026-10-29:END -->
