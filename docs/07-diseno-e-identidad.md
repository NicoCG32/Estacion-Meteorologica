# 07 — Diseño y accesibilidad

<!-- DOCUMENTACION:nivel-2026-10-29:BEGIN -->

**Nivel:** técnica / producto.

## Identidad y experiencia de uso

Revisión documental: 2026-10-29. Base `b02313f499f6` en `main`; árbol inicialmente limpio. La inspección de fuentes no sustituye pruebas de ejecución.

**Estado y alcance:** Prototipo físico/local con backend modular y documentación de entrega. La demostración o el servidor de prueba no certifican calibración científica ni una API de producción.

Dashboard orientado a magnitudes, unidades, tendencias y estado. Los mensajes deben distinguir esperando datos, fallo de sensor, dato sospechoso y error del servidor. Priorizar legibilidad y acceso sin depender sólo de colores.

### Criterios verificables

- Estados vacíos, carga, confirmación y error distinguibles por texto además de color.
- Orden de foco, teclado y nombres accesibles cuando la plataforma los utilice.
- Legibilidad y controles suficientes para el dispositivo objetivo; considerar área segura y ciclo de vida en móvil.
- Evitar que animación, espera o respuesta tardía apliquen efectos ajenos a la selección vigente.

Son criterios de revisión, no certificaciones de accesibilidad ya obtenidas. La aceptación se registra por resolución/plataforma y recorrido; no se extrapola desde una captura aislada.

## Fuentes de implementación y contratos

[README.md](../README.md) · [ARCHITECTURE.md](../ARCHITECTURE.md) · [manual-de-usuario.md](../manual-de-usuario.md) · [backend/README.md](../backend/README.md) · [firmware/README.md](../firmware/README.md).
<!-- DOCUMENTACION:nivel-2026-10-29:END -->

<!-- IDENTIDAD:2026-10-30 -->

## Recursos de identidad y distribución

[Catálogo de originales y variantes](../branding/README.md) · [Manifest de identidad](../branding/manifest.json).

El dashboard sirve el logotipo horizontal y favicon SVG desde backend/frontend/assets/brand. La interfaz actual usa su variante para fondo claro. Los logos universitarios y los informes originales se conservan.

Los banners de presentación se seleccionan por tema en el README. Las aplicaciones incorporan sólo los recursos necesarios, con dimensiones/proporción estables; las variantes y originales permanecen en branding. La identidad visual no amplía funcionalidades ni cambia las condiciones de uso.
