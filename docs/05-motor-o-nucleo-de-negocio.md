# 05 — Reglas y núcleo

<!-- DOCUMENTACION:nivel-2026-10-29:BEGIN -->

**Nivel:** técnica.

## Núcleo e invariantes

Revisión documental: 2026-10-29. Base `b02313f499f6` en `main`; árbol inicialmente limpio. La inspección de fuentes no sustituye pruebas de ejecución.

**Estado y alcance:** Prototipo físico/local con backend modular y documentación de entrega. La demostración o el servidor de prueba no certifican calibración científica ni una API de producción.

- El contrato exige magnitudes con tipos y unidades explícitas; un campo presente no garantiza una lectura física válida.
- La incertidumbre y el estado GPS deben conservar su significado, sin inventar precisión.
- Una medición sospechosa se señala; no se corrige por conveniencia visual.
- Paginación, exportación y rango temporal no deben modificar el historial.
- El reconocimiento de persistencia debe corresponder al resultado real del almacenamiento y sus errores.

### Entradas, decisión y efectos

El recorrido de [03-flujo-de-usuario.md](03-flujo-de-usuario.md) proporciona entradas al núcleo. Las reglas anteriores determinan lo aceptado y sus efectos; UI y proveedores externos no deben sustituir silenciosamente esas decisiones. El modelo de [04-base-de-datos.md](04-base-de-datos.md) identifica los estados/referencias afectados.

Las fórmulas y parámetros detallados permanecen en las fuentes especializadas enlazadas. Distinguir parámetros provisionales, azar, reloj y resultados persistidos; cambiar presentación o reexportar no debe presentarse como una nueva evaluación equivalente sin identificarlo.

### Pruebas con propósito

Proteger al menos una transición válida, un rechazo importante y la repetición/reapertura que pueda duplicar efectos. No inventar una suite ni un porcentaje de cobertura: consultar los comandos existentes y la evidencia de su ejecución en [09-instalacion-y-despliegue.md](09-instalacion-y-despliegue.md).

## Fuentes de implementación y contratos

[README.md](../README.md) · [ARCHITECTURE.md](../ARCHITECTURE.md) · [manual-de-usuario.md](../manual-de-usuario.md) · [backend/README.md](../backend/README.md) · [firmware/README.md](../firmware/README.md).
<!-- DOCUMENTACION:nivel-2026-10-29:END -->
