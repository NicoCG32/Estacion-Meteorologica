# 03 · Viabilidad económica y sostenibilidad: ¿cuándo conviene una estación abierta?

[← Desarrollo](../README.md) · [Evidencia experimental](../tecnica/08-evidencia-y-validacion-experimental.md) · [Informe universitario](../informe/informe.tex) · [Ruta de pilotos](04-pilotos-y-modelos-de-servicio.md)

> **Análisis de prefactibilidad — 8 de noviembre de 2026.** No se conocen facturas, costo real completo de fabricación, ventas, clientes, horas laborales facturadas, consumo eléctrico medido, presupuesto municipal adjudicado ni rentabilidad observada. **No afirmo que la estación ya sea rentable**. Distingo **[HISTÓRICO]** una cifra del informe de 2025, **[EXTERNO]** un criterio de organismos especializados, **[HIPÓTESIS]** un escenario ilustrativo y **[CÁLCULO]** una operación aritmética reproducible.

## 1. La conveniencia económica comienza con elegir bien el problema

Una estación de bajo costo **puede ser una buena solución** para aprender instrumentación, registrar variaciones ambientales locales y practicar gestión de datos. No sirve automáticamente para pronósticos meteorológicos, monitoreo ambiental regulatorio, denuncias basadas en medición certificada ni reemplazo de estaciones oficiales.

**[EXTERNO]** La [EPA](https://www.epa.gov/air-sensor-toolbox/air-sensor-use-and-study-design) considera la sensórica de bajo costo especialmente pertinente para **educación, ciencia participativa, tendencias y monitoreo complementario no regulatorio**, insistiendo en diseñar mediciones y aseguramiento de calidad según la pregunta. El [SINCA del Ministerio del Medio Ambiente chileno](https://sinca.mma.gob.cl/index.php/pagina) distingue **registros no validados, preliminares y oficiales**; los primeros no sustituyen la evidencia requerida para verificar normas. Por tanto, **no sería correcto comparar directamente nuestro prototipo con la función de una estación de referencia**.

### Cuatro fuentes de valor razonables

| Aplicación posible | Por qué podría convenir | Qué falta probar |
| --- | --- | --- |
| **Kit para educación STEM** | Integrar electrónica, sensórica, Wi-Fi, API, datos y visualización en un mismo proyecto reproducible | Costos de montaje, preparación de material, interés real de colegios/talleres, facilidad de mantenimiento |
| **Laboratorio universitario** | Practicar firmware, validación, series temporales, detección de fallos y trazabilidad con código auditable | Comparar costo total y tiempo docente contra kits/laboratorios disponibles |
| **Demostración ambiental local** | Observar tendencias **indicativas** de temperatura, humedad, presión y CO₂ con consulta local | Co-ubicación, calibración, tiempo de reloj, continuidad y adecuación del emplazamiento |
| **Servicio especializado futuro** | Entregar instalación, formación, configuración, reparación y acompañamiento técnico, además de componentes | Entrevistas, contratos, permisos, mantenimiento medido y disposición de pago |

**Importante:** el firmware **NO mide PM₂.₅/PM₁₀**. Un uso de «calidad del aire» aquí incluye **CO₂**; no implica índice de calidad del aire por material particulado. Para exteriores faltan carcasa, protecciones y ensayos. Los datos del servidor son **locales**, con API HTTP sin autenticación. [Alcance](../general/02-estado-del-prototipo.md).

## 2. El dato económico real del informe: CLP 100.000–150.000

**[HISTÓRICO]** El informe grupal `docs/informe/informe.tex`, sección «Identificación de recursos necesarios», **6-12-2025**, estima **CLP $100.000–$150.000** para una estación piloto, en sensores, microcontrolador y materiales básicos. **No incluye** desglose unitario, comprobantes, horas de construcción, herramientas, renovación, impuestos, logística, soporte, calibración independiente o costos de hospedaje.

**La estimación histórica no es una lista de materiales cotizada en 2026.** Además, el alcance académico menciona un **sensor óptico de material particulado** que no aparece en el firmware actual. No se puede restar ni añadir su costo sin conocer qué fue realmente comprado. La exactitud del BME280, DHT22, SCD4x, GPS y placa depende también del módulo y su procedencia.

### Lista de costos para una cotización reproducible

| Coste por estación | Información disponible | Cómo obtener el costo real |
| --- | --- | --- |
| ESP32-S3, BME280, DHT22, SCD4x, módulo GPS | Modelos y conexión identificados en código | Boletas o cotizaciones con proveedor, modelo, cantidad, impuestos y flete |
| Conectores, placa, cables, alimentación | Circuito documentado | Inventario comprado y reemplazos |
| Carcasa, montaje y protección exterior | No dimensionados ni ensayados | Prototipo físico, lista de materiales y grado de protección requerido |
| Panel, batería, controlador y protecciones solares | **Idea del esquema** | Medir potencia real y calcular autonomía antes de comprar |
| Ensamble, depuración y QA | No contabilizados | Horas observadas y valor hora acordado |
| Ensayo metrológico / co-ubicación | Pendiente | Presupuesto y horas con equipo de referencia autorizado |
| Instalación, traslados, soporte y garantías | No documentados | Costos por piloto y eventual contrato |
| PC que recibe HTTP, disco, energía y backups | Necesario en la configuración actual | Potencia medida, operación prevista, respaldo y mantenimiento |

### Error comercial que debemos evitar

**«Cuesta $125.000 y se vende a $X» no es un análisis de rentabilidad.** El valor intermedio del informe no es COGS (costo total de producción); tampoco podemos afirmar que funciona de manera solar, que es certificada o que ofrece material particulado. Si los costos reales exceden la disposición de pago, la propuesta puede ser **conveniente educativamente y no rentable comercialmente**.

## 3. Economía unitaria: modelo de hardware o kit

Para **una estación vendida, instalada y verificada** (hipótesis, no oferta), el costo unitario debería incluir:

```text
Costo variable / unidad =
  sensores_y_controlador + montaje_electricidad + carcasa_y_cableado
  + horas_ensamble + horas_verificacion + flete
  + provisión_de_garantia + soporte_incluido + comisiones_variables

Margen de contribución unitario =
  precio_neto_efectivamente_cobrado - costo_variable_por_unidad

Unidades de equilibrio =
  redondear_hacia_arriba(costos_fijos_del_periodo / margen_unitario)
  (solo si el margen es positivo y existe demanda)

Resultado operativo del período =
  unidades_vendidas × margen_unitario - costos_fijos_del_periodo
```

### Escenario didáctico de sensibilidad — TODO [HIPÓTESIS]

**No es una cotización ni un estudio de disposición de pago.** Se usa el punto medio de la estimación histórica solo como **sustituto de referencia**, no como costo actualizado:

| Variable supuesta | CLP |
| --- | ---: |
| Componentes base, **punto medio 2025 no actualizado** | $125.000 |
| Conectores y carcasa **supuestos** | $25.000 |
| Ensamble: **3 h × $12.000/h** | $36.000 |
| Prueba y revisión: **2 h × $12.000/h** | $24.000 |
| Logística **supuesto** | $10.000 |
| Reserva de garantía **supuesta** | $10.000 |
| **Costo variable hipotético** | **$230.000 por unidad** |
| Costos fijos de desarrollo/puesta en marcha **hipotéticos** | **$420.000** |

| Precio neto **hipotético** | Contribución por unidad **[CÁLCULO]** | Unidades de equilibrio **[CÁLCULO]** |
| ---: | ---: | ---: |
| $250.000 | $20.000 | **21** |
| $300.000 | $70.000 | **6** |
| $350.000 | $120.000 | **4** |

**Ejemplo:** seis ventas hipotéticas a $300.000 dan $420.000 de contribución acumulada, equivalente a los **$420.000 de costos fijos supuestos**. El resultado operativo modelado sería **$0**, **no** una ganancia de $420.000. No incluye IVA, impuestos, retenciones, devoluciones, capital de trabajo, adquisición de clientes, licencias adicionales o reparaciones extraordinarias. Si estos costos aumentan, el punto de equilibrio cambia. **No se ha constatado ninguna venta ni una disposición a pagar de $300.000.**

### Riesgo del modelo de vender solo hardware

El [código propio bajo licencia ISC](../../LICENSE) puede utilizarse comercialmente, cumpliendo sus condiciones. Esa apertura es **ventaja de adopción y enseñanza**, pero **no** una exclusividad tecnológica que permita cobrar regalías por cada reutilización. Un comprador puede replicar la solución de acuerdo con la licencia: la propuesta de valor sostenible debe depender de **calidad de montaje, verificación, capacitación, personalización, integración, mantenimiento y confianza**, no de impedir legalmente el uso autorizado del código.

## 4. Economía de kits y servicios: distintas vías

| Vía futura | Qué se entrega | Unidad comercial a validar | Mayor costo oculto |
| --- | --- | --- | --- |
| **Kit educativo** | Dispositivo, guía, ejercicios y puesta en marcha | Kit instalado o taller | Preparación pedagógica, reposición, asistencia a docentes |
| **Servicio para laboratorios** | Instalación, instrumentación, pruebas y soporte | Proyecto y horas de especialista | Tiempo de calibración, soporte y desplazamiento |
| **Monitoreo local indicativo** | Series documentadas con advertencias de calidad | Estación mantenida por período | Continuidad, calibración, incidentes y gestión de datos |
| **Integración de datos personalizada** | API, tablero, exportaciones, adaptación a un objetivo | Entregable de software / contrato de servicio | Desarrollo a medida, seguridad, actualizaciones y soporte |

**No suponer contratos de colegios o municipios, subvenciones, compras públicas, ingresos recurrentes ni certificaciones.** Un escenario B2G requiere procedimientos de adquisición y garantías propios. La primera conversación comercial debe confirmar qué pagaría el usuario **y por qué**, no cuánto «debería» pagar.

## 5. ¿Es más barato operar sin nube? Sí en una dimensión; no es gratis

El flujo actual utiliza **ESP32 → punto de acceso Wi-Fi → PC local con Node.js/Express → JSONL → navegador**. Sin un proveedor SaaS obligatorio, **no se exige una cuota de nube para arrancar la estación en local**. Pero sigue siendo necesario disponer de energía, PC encendido, disco, copias, mantenimiento y red controlada.

La siguiente cuenta permite ver por qué **medir consumo total** es más relevante que decir «el microcontrolador consume poco»:

```text
Energía mensual (kWh) = potencia promedio (W) × horas / 1000
Costo eléctrico mensual = energía mensual × tarifa efectiva CLP/kWh
```

**[HIPÓTESIS, NO CONSUMO REAL]** Si un dispositivo consumiera **1 W promedio** y un PC dedicado **30 W promedio** durante 30 días continuos (720 h), el dispositivo gastaría **0,72 kWh/mes** y el PC **21,6 kWh/mes**: **22,32 kWh/mes entre ambos**, antes de pérdidas eléctricas. Esto no describe el ESP32 ni el computador real del proyecto; confirma que **el PC puede dominar el gasto operativo**. No se asigna tarifa de electricidad sin boleta y comuna/cliente.

**La autonomía solar no está verificada.** Una evaluación seria requiere potencia media/pico, horas de operación, batería, pérdidas, radiación del lugar, protección, autonomía en días nublados y ciclo de mantenimiento. La emisión «casi nula» en operación o huellas de **15–20 kg CO₂e/año** mencionadas en el informe **no tienen un inventario verificable de ACV adjunto**. No utilizarlas como ahorros ambientales demostrados.

## 6. Ventaja ambiental y social: indicadores, no promesas de rentabilidad

| Beneficio posible | Cómo verificarlo |
| --- | --- |
| **Aprendizaje STEM** | Pruebas antes/después, número de experiencias realizadas, autonomía del estudiante y horas docentes |
| **Mejor trazabilidad** | % de registros con hora, calidad, origen y período; fallos identificados |
| **Granularidad local indicativa** | Comparar series contra referencia y registrar condiciones de ubicación, sin reemplazar SINCA |
| **Reparabilidad** | Costo/tiempo para reemplazar sensor o cable sin descartar la estación |
| **Sostenibilidad** | Consumo eléctrico real, vida útil, repuestos, transporte, residuos y ACV con inventario |
| **Costo-efectividad educativa** | (hardware + operación + docencia) / horas de práctica útil o estudiantes beneficiados |

La [EPA advierte](https://espanol.epa.gov/espanol/preguntas-frecuentes-acerca-de-los-sensores-de-aire) que bajo costo **no significa medición de referencia**, y que humedad, deriva y condiciones de instalación pueden sesgar registros. La [guía de calidad EPA](https://www.epa.gov/air-sensor-toolbox/quality-assurance-air-sensors) recomienda medición de completitud y validación manual, no solo filtros automáticos.

**Una solución abierta puede resultar costo-efectiva para enseñar o investigar**, incluso aunque no se comercialice. Eso es **valor educativo**, no «ganancias» convertidas artificialmente en CLP.

## 7. Competencia y posicionamiento

- **No competimos con la función regulatoria del SINCA**: allí existen protocolos de validación y responsabilidad institucional que no ha acreditado este prototipo.
- **Tampoco tenemos una estación meteorológica completa de exterior**: faltan, entre otras posibles magnitudes de ese uso, medición del viento, lluvia y ensayos de exposición.
- **Sí podemos evaluar una propuesta distinta**: kit IoT abierto, inspeccionable, modificable, con varios sensores, pipeline local, datos exportables y documentación docente.
- **Ninguna comparación comercial de precio/precisión está aún medida** contra kits u otras estaciones. Se requiere una canasta equivalente de funcionalidades y presupuestos actualizados.

## 8. Qué decisiones faltan para convertir prefactibilidad en rentabilidad demostrable

1. **Inventario y facturas:** modelo exacto de cada componente, cantidad, proveedor, costo, fecha, flete y material particulado realmente comprado —si lo hubo.
2. **Trabajo:** horas reales de montaje, programación, pruebas, soporte, costo por hora y quién asume el riesgo de garantía.
3. **Consumo:** medidas en W de estación y PC, duración de operación y gasto eléctrico.
4. **Calidad:** ensayos físicos, calibración, continuidad y costo de corrección por sensor.
5. **Cliente:** entrevistas y propuestas aceptadas, precio cobrado neto, ciclo de compra y repetición.
6. **Licencia:** titularidad de contribuciones originales del equipo y derechos de diagramas/fotografías; permisos de terceros.
7. **Escala:** comparar un kit docente, una instalación local y una red futura por separado, sin extrapolar la misma operación ni los mismos costos.

### Conclusión que se puede defender hoy

> **La estación es conveniente como plataforma educativa e instrumental de bajo costo relativo porque integra hardware, firmware, una API y visualización en un diseño estudiable y reproducible.** Su estructura abierta y el funcionamiento local permiten explorar servicios con poca dependencia de plataformas externas. **Su rentabilidad comercial todavía es una hipótesis**: depende de asegurar calidad suficiente para el uso previsto, obtener costos reales completos y comprobar que alguien esté dispuesto a pagar más que el costo de entregar y mantener el servicio.

**Fuentes:** [informe LaTeX 2025](../informe/informe.tex), [EPA: diseño de estudios](https://www.epa.gov/air-sensor-toolbox/air-sensor-use-and-study-design), [EPA: QA](https://www.epa.gov/air-sensor-toolbox/quality-assurance-air-sensors), [EPA: límites de sensores](https://espanol.epa.gov/espanol/preguntas-frecuentes-acerca-de-los-sensores-de-aire), [SINCA](https://sinca.mma.gob.cl/index.php/pagina), [validación SINCA](https://sinca.mma.gob.cl/index.php/pagina/index/id/validacion). Las tablas financieras **no proceden de esas instituciones**: son supuestos didácticos expresamente identificados.
