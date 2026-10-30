# Documentacion del proyecto

<!-- DOCUMENTACION:indice-niveles-2026-10-29:BEGIN -->

## Documentación por cuatro niveles — 2026-10-29

Revisión documental: 2026-10-29. Base `b02313f499f6` en `main`; árbol inicialmente limpio. La inspección de fuentes no sustituye pruebas de ejecución.

**Estado y alcance:** Prototipo físico/local con backend modular y documentación de entrega. La demostración o el servidor de prueba no certifican calibración científica ni una API de producción.

| Nivel                      | Pregunta principal                                                    | Lectura                                                  |
| -------------------------- | --------------------------------------------------------------------- | -------------------------------------------------------- |
| 1. General                 | Qué problema, para quién, qué solución y por qué lo eligió el creador | 00, 02, 03 y 16                                          |
| 2. Técnica                 | Cómo funciona, entidades, persistencia y ejecución                    | 01, 04, 05, 06, 07, 08 y 09                              |
| 3. Desarrollo del proyecto | Cómo se llegó, por qué corresponde y qué cuesta continuar             | 17, 15 y 18                                              |
| 4. Académica/formativa     | Qué se entregó en un curso y a qué etapa pertenece                    | [Documentación académica/formativa](academica/README.md) |

### Rutas por lector

- **Dirección/cliente/responsable:** 00 → 16 → 01 → 15 → 18.
- **Desarrollo/técnica:** 01 → 04 → 05 → 06 → 09; complementar con las guías especializadas conservadas.
- **Producto/operaciones:** 00 → 02 → 03 → 07 → 08 → 17.
- **Académica/formativa:** contexto de 16 y catálogo del nivel 4 cuando corresponda; contrastar luego con la arquitectura vigente.

| Capítulo | Documento                                                                          | Nivel                   |
| -------- | ---------------------------------------------------------------------------------- | ----------------------- |
| 00       | [Problemática, cliente y solución](00-problematica-cliente-y-valor.md)             | general                 |
| 01       | [Arquitectura por niveles](01-arquitectura-general.md)                             | técnica                 |
| 02       | [Catálogo funcional](02-funcionalidades.md)                                        | general / técnica       |
| 03       | [Recorrido y estados](03-flujo-de-usuario.md)                                      | general / técnica       |
| 04       | [Dominio, entidades y persistencia](04-base-de-datos.md)                           | técnica                 |
| 05       | [Reglas y núcleo](05-motor-o-nucleo-de-negocio.md)                                 | técnica                 |
| 06       | [Integraciones y asistencia](06-capa-de-ia-o-analisis.md)                          | técnica                 |
| 07       | [Diseño y accesibilidad](07-diseno-e-identidad.md)                                 | técnica / producto      |
| 08       | [Salidas y entregables](08-exportacion-e-informes.md)                              | técnica                 |
| 09       | [Puesta en marcha y distribución](09-instalacion-y-despliegue.md)                  | técnica                 |
| 15       | [Justificación, proyección y escalabilidad](15-escalabilidad-y-nuevos-mercados.md) | desarrollo del proyecto |
| 16       | [Motivación personal y contexto](16-motivacion-y-contexto.md)                      | general                 |
| 17       | [Etapas y metodología](17-desarrollo-y-metodologia.md)                             | desarrollo del proyecto |
| 18       | [Escenarios económicos CLP / USD](18-analisis-economico-clp-usd.md)                | desarrollo del proyecto |

Los nuevos capítulos complementan las fuentes especializadas existentes; no reemplazan contratos detallados por resúmenes. Los originales académicos se conservan intactos. La documentación del desarrollo describe etapas/metodología del producto y no contiene instrucciones o conversaciones internas.
<!-- DOCUMENTACION:indice-niveles-2026-10-29:END -->

El funcionamiento actual se describe en [arquitectura](../ARCHITECTURE.md),
[manual de usuario](../manual-de-usuario.md), [backend](../backend/README.md) y
[firmware](../firmware/README.md). Para colaborar, consultar
[CONTRIBUTING.md](../CONTRIBUTING.md).

## Informe academico

La fuente esta en [informe/informe.tex](informe/informe.tex), usa
[logos.sty](informe/logos.sty) y recursos en informe/figuras/. El
[PDF](informe/informe.pdf) es material de referencia; las guias de operacion y
configuracion actuales estan enlazadas arriba.

Ver tambien:

- [README.md](../README.md)

## Compilacion manual

- pdflatex -jobname informe informe.tex
- repetir una segunda vez para referencias

## Script de compilacion (Windows)

En Windows puedes usar el script en docs/informe/ (recomendado):

- compile-informe.bat

Uso:

- abrir una terminal en docs/informe/
- ejecutar compile-informe.bat
- salida: informe.pdf

<!-- INDICE:uso-y-licencia -->

## Uso, distribución y condiciones

- [Entrada y descargas](../README.md).
- [Licencia, créditos y reutilización](../LICENSING.md).
