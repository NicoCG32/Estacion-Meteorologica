# 15 — Justificación, proyección y escalabilidad

## Justificación y proyección

### Ajuste entre problema y solución

| Necesidad             | Razón del diseño                                                                     |
| --------------------- | ------------------------------------------------------------------------------------ |
| Lecturas inconexas    | Un contrato común añade contexto temporal y unidades                                 |
| Ausencia de historial | JSONL y exportación permiten consultar series sin una infraestructura grande         |
| Resultados dudosos    | Validación y reglas de sospecha exponen anomalías en lugar de tratarlas como certeza |

Completitud de series, disponibilidad de adquisición, anomalías y comparación con referencia calibrada; no sólo cantidad de muestras.

### Qué se puede abstraer y qué no

Las entidades, reglas y fronteras de [04-base-de-datos.md](04-base-de-datos.md) permiten evaluar reutilización. Cambiar un nombre o una categoría no prueba compatibilidad con otro sector: datos, permisos, reglas, operación y costos deben validarse de nuevo.

### Posibles líneas de evolución

- Laboratorios docentes
- Talleres de instrumentación
- Huertos con observación microclimática
- Estudios exploratorios de espacios interiores

### Límites y trade-offs

- Calibración, deriva y ubicación del sensor
- Cortes de energía/red y archivos de datos
- Exposición de coordenadas o escritura API
- Interpretaciones ambientales sin validación suficiente

### Prioridad de inversión

| Prioridad   | Iniciativa                                                           | Impacto a comprobar                                                                                                                   | Criterio económico                                                    |
| ----------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Alta        | Reproducción del montaje y validación de una serie contra referencia | Completitud de series, disponibilidad de adquisición, anomalías y comparación con referencia calibrada; no sólo cantidad de muestras. | Rango de esfuerzo y costo en capítulo 18; no presupuesto comprometido |
| Media       | Reproducción, soporte y recuperación por plataforma                  | Menos fallos de entrega y pérdida de datos                                                                                            | Costo recurrente separado de implementación                           |
| Estratégica | Validar una extensión/forma de sostenimiento                         | Uso y aceptación fuera del contexto inicial                                                                                           | Investigar costos, demanda y condiciones antes de monetizar           |

Las cifras CLP/USD, supuestos, sensibilidad y retorno se presentan en [18-analisis-economico-clp-usd.md](18-analisis-economico-clp-usd.md); no son una valoración comercial del repositorio.

## Código y documentación relacionada

[README.md](../README.md) · [ARCHITECTURE.md](../ARCHITECTURE.md) · [manual-de-usuario.md](../manual-de-usuario.md) · [backend/README.md](../backend/README.md) · [firmware/README.md](../firmware/README.md).
