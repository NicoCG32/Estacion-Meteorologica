# 17 — Etapas y metodología

<!-- DOCUMENTACION:nivel-2026-10-29:BEGIN -->

**Nivel:** desarrollo del proyecto.

## Desarrollo del proyecto: etapas y método

Revisión documental: 2026-10-29. Base `b02313f499f6` en `main`; árbol inicialmente limpio. La inspección de fuentes no sustituye pruebas de ejecución.

**Estado y alcance:** Prototipo físico/local con backend modular y documentación de entrega. La demostración o el servidor de prueba no certifican calibración científica ni una API de producción.

Proyecto académico de integración hardware/software: problemática, diseño de instrumentación, montaje, firmware, backend, visualización y verificación. Las pruebas de software, compilación y ensayo físico se registran por separado; no se infiere un ensayo de laboratorio por ejecutar tests.

### Etapas reconstruidas de fuentes

| Etapa              | Evidencia / alcance                                               |
| ------------------ | ----------------------------------------------------------------- |
| Contexto académico | Ingeniería y Desarrollo Sustentable, 4.º semestre, 5 SCT          |
| Diseño y montaje   | Circuito y selección de sensores documentados                     |
| Captura y datos    | Firmware y backend con contrato/almacenamiento                    |
| Validación         | Separar pruebas de API, montaje, calibración y condiciones de uso |

El cuadro distingue hechos documentados y pendientes. Un archivo de planificación describe intención; un commit confirma contenido de código/documentación; una prueba/artefacto con procedencia aporta evidencia de comportamiento. No son intercambiables.

### Ciclo de trabajo y decisión

1. Caracterizar una necesidad y un escenario observable.
2. Revisar contratos, datos y límites del alcance.
3. Implementar o prototipar el incremento apropiado a la etapa.
4. Verificar el recorrido y sus errores relevantes; conservar resultados negativos.
5. Decidir continuar, corregir, limitar o posponer y actualizar documentación vigente.

Este ciclo es una propuesta de continuidad compatible con el método descrito arriba; no se afirma que todas las etapas históricas se ejecutaran con idéntica ceremonia o duración.

### Cierre y continuidad

La entrega identifica fuente, plataforma, límites, guía de uso e integridad de datos/artefactos. Los informes académicos conservan su etapa, cuando aplican, y no se actualizan como si fueran manuales del runtime. La proyección no obliga a desarrollar extensiones antes de validar el núcleo.

Justificación y prioridades: [15-escalabilidad-y-nuevos-mercados.md](15-escalabilidad-y-nuevos-mercados.md). Esfuerzo futuro y operación: [18-analisis-economico-clp-usd.md](18-analisis-economico-clp-usd.md).

## Fuentes de implementación y contratos

[README.md](../README.md) · [ARCHITECTURE.md](../ARCHITECTURE.md) · [manual-de-usuario.md](../manual-de-usuario.md) · [backend/README.md](../backend/README.md) · [firmware/README.md](../firmware/README.md).
<!-- DOCUMENTACION:nivel-2026-10-29:END -->
