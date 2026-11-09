# 01 · Origen, propósito y alcance

Este proyecto nació en **Ingeniería y Desarrollo Sustentable**, en la Universidad Católica del Norte. Propusimos en equipo una estación de bajo costo para observar variables ambientales de la Región de Coquimbo y explorar su uso educativo.

Diseñé el circuito y desarrollé el programa Arduino durante la asignatura. Después continué el proyecto con el backend Node.js y el frontend web disponibles hoy. El [informe final de 2025 y los créditos del equipo](../academica/README.md) recogen el trabajo académico.

## Qué problema aborda

Una lectura aislada aporta poco para seguir tendencias. Para estudiar una serie de mediciones hacen falta fechas, unidades coherentes, un historial y criterios para reconocer valores inusuales. La estación conecta la captura de sensores con el transporte HTTP, el almacenamiento local y la consulta desde el navegador.

Quiero que sirva para aprender instrumentación y software de manera conjunta: capturar una lectura, reconocer sus unidades, detectar datos extraños y conservar una serie que se pueda revisar. La sostenibilidad da un contexto concreto a esa integración.

## Por qué puede ser conveniente

Para educación y laboratorios, integrar **sensores, firmware, API, historial y visualización local** permite estudiar un sistema completo con código que se puede inspeccionar y adaptar. La [EPA](https://www.epa.gov/air-sensor-toolbox/air-sensor-use-and-study-design) destaca los usos educativos y de monitoreo complementario, **no regulatorio**, de sensores de bajo costo. El [SINCA chileno](https://sinca.mma.gob.cl/index.php/pagina) separa registros oficiales de datos no validados: por eso nuestra estación **no debe venderse ni describirse como equivalente a un monitor normativo**.

El informe de 2025 estimó **CLP $100.000–$150.000** como costo de materiales de un piloto, cifra histórica sin facturas. La [prefactibilidad económica y ambiental](../desarrollo/03-viabilidad-economica-y-sostenibilidad.md) explica el valor educativo, el costo total de operación y los escenarios de rentabilidad sin confundir hipótesis con resultados medidos.

## A quién puede servir

El prototipo está orientado al aprendizaje y la experimentación con IoT, sensores, adquisición y calidad de datos. Puede servir como base para talleres o laboratorios educativos. El informe propone además usos comunitarios y municipales que requieren desarrollo y validación adicionales.

## Alcance actual

El sistema captura temperatura, humedad, presión, CO₂ y posición GPS; conserva mediciones en un PC y permite consultarlas y exportarlas desde una interfaz web. Su operación es local. La precisión, estabilidad y autonomía requieren comparación con instrumentos de referencia y ensayos del montaje.

Mi siguiente prioridad es revisar la continuidad de las series y el comportamiento de los sensores durante una operación prolongada.

[Funciones y limitaciones](02-estado-del-prototipo.md) · [Uso](03-uso-y-recorrido.md) · [Arquitectura](../tecnica/01-arquitectura.md).
