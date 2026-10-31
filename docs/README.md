# Documentación de Estación Meteorológica

Prototipo de estación física con captura local, backend y dashboard. Su uso como instrumento científico requiere calibración y validación del montaje.

## Documentación por cuatro tipos

| Tipo                    | Qué encontrarás                                                 | Por dónde empezar                                                                                                                                |
| ----------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| General                 | Problemática, público, solución y motivación personal           | [Propuesta](00-problematica-cliente-y-valor.md) · [Origen](16-motivacion-y-contexto.md)                                                          |
| Técnica                 | Arquitectura, dominio, datos, interfaz y puesta en marcha       | [Arquitectura](01-arquitectura-general.md) · [Instalación](09-instalacion-y-despliegue.md)                                                       |
| Desarrollo del proyecto | Etapas, metodología, justificación, proyección y costos CLP/USD | [Metodología](17-desarrollo-y-metodologia.md) · [Proyección](15-escalabilidad-y-nuevos-mercados.md) · [Costos](18-analisis-economico-clp-usd.md) |
| Académica/formativa     | Contexto del curso, informes y anexos de la etapa formativa     | [Catálogo académico](academica/README.md)                                                                                                        |

## Rutas de lectura

- **Conocer el proyecto:** [propuesta](00-problematica-cliente-y-valor.md) → [motivación](16-motivacion-y-contexto.md) → [funcionalidades](02-funcionalidades.md).
- **Utilizarlo o desplegarlo:** [recorrido](03-flujo-de-usuario.md) → [instalación](09-instalacion-y-despliegue.md).
- **Desarrollar o contribuir:** [arquitectura](01-arquitectura-general.md) → [dominio y datos](04-base-de-datos.md) → [reglas](05-motor-o-nucleo-de-negocio.md).
- **Evaluar su evolución:** [metodología](17-desarrollo-y-metodologia.md) → [proyección](15-escalabilidad-y-nuevos-mercados.md) → [costos](18-analisis-economico-clp-usd.md).

## Tabla de contenidos

| Capítulo | Documento                                                                          |
| -------- | ---------------------------------------------------------------------------------- |
| 00       | [Problemática, cliente y solución](00-problematica-cliente-y-valor.md)             |
| 01       | [Arquitectura por niveles](01-arquitectura-general.md)                             |
| 02       | [Catálogo funcional](02-funcionalidades.md)                                        |
| 03       | [Recorrido y estados](03-flujo-de-usuario.md)                                      |
| 04       | [Dominio, entidades y persistencia](04-base-de-datos.md)                           |
| 05       | [Reglas y núcleo](05-motor-o-nucleo-de-negocio.md)                                 |
| 06       | [Integraciones y asistencia](06-capa-de-ia-o-analisis.md)                          |
| 07       | [Diseño y accesibilidad](07-diseno-e-identidad.md)                                 |
| 08       | [Salidas y entregables](08-exportacion-e-informes.md)                              |
| 09       | [Puesta en marcha y distribución](09-instalacion-y-despliegue.md)                  |
| 15       | [Justificación, proyección y escalabilidad](15-escalabilidad-y-nuevos-mercados.md) |
| 16       | [Motivación personal y contexto](16-motivacion-y-contexto.md)                      |
| 17       | [Etapas y metodología](17-desarrollo-y-metodologia.md)                             |
| 18       | [Escenarios económicos CLP / USD](18-analisis-economico-clp-usd.md)                |

## Guías especializadas

- [informe/informe.tex](informe/informe.tex).
- [logos.sty](informe/logos.sty).
- [PDF](informe/informe.pdf).

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

## Uso y distribución

[Presentación y descargas](../README.md) · [Licencia y créditos](../LICENSING.md).
