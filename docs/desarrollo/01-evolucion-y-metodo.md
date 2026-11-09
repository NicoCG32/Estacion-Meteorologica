# 01 · Evolución del proyecto y método

El proyecto comenzó en 2025 como trabajo grupal de **Ingeniería y Desarrollo Sustentable** en la UCN. Diseñé el circuito y programé el firmware Arduino durante esa etapa. Posteriormente desarrollé el backend Node.js y el frontend web actuales para completar el recorrido entre captura, almacenamiento y consulta. El [contexto académico](../academica/README.md) reúne el informe y las contribuciones del equipo.

## Decisiones técnicas

| Decisión                      | Consecuencia                                                                       |
| ----------------------------- | ---------------------------------------------------------------------------------- |
| ESP32-S3 y Arduino            | Integración de sensores I²C, GPIO y UART en un sketch.                             |
| Punto de acceso Wi-Fi         | Conexión directa entre la estación y el PC.                                        |
| Node.js y Express             | API y página estática servidas por una aplicación.                                 |
| JSONL local                   | Historial inspeccionable y exportable, con un único proceso escritor.              |
| JavaScript en módulos nativos | Dashboard sin paso de compilación.                                                 |
| Fusión y filtros heurísticos  | Tratamiento de discrepancias y saltos, con riesgo de descartar variaciones reales. |
| Pruebas automatizadas         | Comprobación de contratos y regresiones del software.                              |

## Ciclo de trabajo

1. Definir una necesidad observable en el sensor, transporte, almacenamiento o visualización.
2. Comprobar el comportamiento actual con datos de prueba y casos límite.
3. Modificar el módulo responsable, revisando el efecto sobre pines, intervalos y formatos.
4. Ejecutar las pruebas correspondientes y repetir ensayos físicos si el cambio afecta al montaje o a la adquisición.
5. Actualizar la guía del área afectada con el comportamiento y los límites resultantes.

Las [pruebas de software](../tecnica/07-verificacion.md) y la comparación con instrumentos de referencia cubren aspectos distintos del sistema. Para continuar el desarrollo, la prioridad es repetir el montaje y comprobar la conservación de series durante una operación prolongada.

[Próximos pasos](02-prioridades.md) · [Economía y sostenibilidad](03-viabilidad-economica-y-sostenibilidad.md) · [Pilotos](04-pilotos-y-modelos-de-servicio.md) · [Contribuir](../../CONTRIBUTING.md) · [Backend](../../backend/README.md) · [Firmware](../../firmware/README.md).
