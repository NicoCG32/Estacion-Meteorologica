# 08 · Evidencia disponible y validación experimental pendiente

[← Técnica](../README.md) · [Hardware y firmware](02-hardware-y-firmware.md) · [Calidad de datos](06-calidad-y-algoritmos.md) · [Viabilidad](../desarrollo/03-viabilidad-economica-y-sostenibilidad.md)

> **Auditoría documental y de un archivo de datos — 8 de noviembre de 2026.** No constituye ensayo nuevo, calibración, certificación, operación en terreno ni revisión instrumental. Los registros del repositorio pueden ser históricos o de prueba: **no tienen bitácora de montaje, instrumento de referencia ni trazabilidad experimental suficiente para certificar su procedencia o exactitud**.

## Qué evidencia existe y qué demuestra

| Evidencia accesible | Qué puede afirmarse | Qué no permite afirmar |
| --- | --- | --- |
| `firmware/EstacionMeteorologica/EstacionMeteorologica.ino` | Existe lógica de sensores, agregación, filtro, Wi-Fi AP y POST | Que todas las piezas actuales funcionan montadas o calibradas |
| `firmware/EstacionMeteorologica/sketch.yaml` | Existe perfil versionado para ESP32-S3 y librerías | Que la compilación equivale a prueba física |
| `backend/src/`, `backend/test/`, workflow `lint.yml` | Hay API, persistencia y pruebas automatizadas verificables | Precisión ambiental, impermeabilidad y disponibilidad ininterrumpida |
| `backend/data/mediciones.jsonl` | Hay muestras históricas serializadas en el repositorio | Serie científica validada, reloj de adquisición o exposición exterior |
| `docs/informe/informe.tex` (2025) | Informe grupal de diseño, propuesta y criterios de aceptación | Realización demostrada de todos sus objetivos, conexión solar funcional o sensores MP implementados |
| `diagramas/circuito.drawio` | Existe un esquema editable de conexión | Certificación eléctrica, protecciones instaladas o autonomía |

**Distinguir evidencias:** una prueba unitaria de Express acredita respuestas del programa, no temperatura ambiental exacta; un esquema de conexión acredita diseño, no funcionamiento prolongado; una fila JSONL acredita que se registró ese texto, no su veracidad metrológica.

## Auditoría reproducible de la serie histórica incluida

**Fuente:** [`backend/data/mediciones.jsonl`](../../backend/data/mediciones.jsonl). Al momento de revisión contiene **43 registros**, con primer timestamp `2025-12-06T14:09:18.058Z` y último `2025-12-06T14:24:10.090Z`: **14 min 52,032 s de cobertura temporal entre extremos**. Los tiempos corresponden al registro en backend, **no al instante en que el sensor efectuó cada lectura**.

En **tres registros** (ID **26, 27 y 28**), los valores guardados son **181,39 °C** y **−130,8 hPa**. Quedan fuera de los actuales rangos de validación de entrada (`temperatura_aire_celsius` de −50 a 85 °C, `presion_atmosferica_hPa` de 300 a 1200 hPa). **No eliminar ni editar estos registros originales**: ilustran una condición anómala real del conjunto histórico y la diferencia entre *filtrar entradas nuevas* y *revalidar el historial antiguo*. No hay prueba de que el código actual permitiría ingresar esas muestras, ni se conoce por qué fueron registradas originalmente.

**Los 43 registros carecen de** `sospechosa` y de fijación GPS válida (coordenadas `null`, satélites `0`). No derivar de esto que el módulo GPS esté averiado: pudo ser interior o un estado sin fijación. El archivo **no incluye lecturas individuales de todos los sensores, secuencias de adquisición, calibración ni una bitácora de montaje**.

**Lo que no puede calcularse correctamente con este archivo:** exactitud, sesgo, deriva, continuidad de 2–4 horas, **95 % de completitud de la adquisición**, tasa verdadera de transmisión frente a lecturas esperadas o desempeño exterior. Una proporción de filas que supera una regla de rango no equivale a completitud ni a precisión.

### Reproducción con herramientas locales

Tras clonar el proyecto, una revisión exploratoria del archivo puede hacerse sin alterar originales:

```python
import json
from pathlib import Path

ruta = Path("backend/data/mediciones.jsonl")
datos = [json.loads(linea) for linea in ruta.read_text(encoding="utf-8").splitlines() if linea.strip()]

invalidas = [
    r for r in datos
    if not (-50 <= r["temperatura_aire_celsius"] <= 85)
    or not (300 <= r["presion_atmosferica_hPa"] <= 1200)
]
print("Registros:", len(datos))
print("IDs fuera de rango histórico según reglas actuales:", [r["id"] for r in invalidas])
```

Este chequeo simplificado **no** reemplaza los validadores completos (campos opcionales, `null`, humedad, CO₂, GPS, etc.). Sirve para reproducir los **tres casos extremos** identificados sin asignarles una causa no documentada.

## La meta académica del 95 % aún no es un logro medido

En el [informe grupal](../informe/informe.tex), apartado «Objetivos específicos» y «Criterios de aceptación», se plantea **≥95 % de completitud** en sesiones de **2–4 horas** para el prototipo muestral. Es un **objetivo/criterio académico**. El repositorio no aporta un archivo de adquisición completo, protocolo y comparación frente a conteo esperado que demuestren su cumplimiento.

No presentar el umbral de **cobertura automatizada 95/90/95 del backend** como si probara **95 % de datos ambientales completos**: son métricas totalmente distintas.

## Experimentos que faltan y cómo registrarlos

### Experimento A · Precisión y co-ubicación

1. Documentar ubicación, orientación, fecha, condiciones ambientales, fuente de alimentación y fotos del montaje.
2. Disponer de **instrumento de referencia apropiado y con trazabilidad conocida** para cada magnitud que se quiera validar.
3. Co-ubicar y sincronizar ambas series; conservar **lecturas crudas por sensor** además de la fusión, si se habilita el registro.
4. Medir diferencia por par de muestras, sesgo promedio, error absoluto, dispersión y deriva **por magnitud y por rango**, incluyendo condiciones adversas.
5. Repetir ante cambios de temperatura/humedad y en nuevas sesiones. Registrar reemplazo de sensores, calentamiento y ajustes.
6. Reportar limitaciones: un ensayo de interior **no acredita** una instalación exterior.

**Criterios concretos de precisión:** **sin umbrales aprobados todavía**; deben depender de la necesidad educativa o experimental, ficha de sensor y referencia. No inventar tolerancias de «grado científico».

### Experimento B · Completitud, continuidad y pérdidas

```text
Completitud de entregas (%) =
  100 × intervalos_con_entrega_valida / intervalos_programados_y_elegibles

Porcentaje de valores disponibles por magnitud =
  100 × lecturas_no_nulas_aceptables / entregas_consideradas

(Indicar si los descartes del firmware, reinicios, conexión
y ventanas de calentamiento cuentan en el denominador.)
```

Definir primero la **unidad de análisis**. El firmware muestrea cada ~2 s y envía agregados cada ~20 s, pero los filtros pueden omitir lotes y los tiempos efectivos varían. La prueba debe registrar **intentos de envío, respuestas HTTP, descartes, reinicios e intervalos realmente programados**, además de la cantidad de líneas recibidas. Si se usa el objetivo académico de ≥95 %, indicar explícitamente su duración, regla de cómputo y condiciones.

### Experimento C · Cortes y recuperación

- Desconectar temporalmente al PC del AP y comprobar pérdida/recuperación.
- Apagar el backend con el ESP32 emitiendo; registrar si hay **lotes perdidos** (hoy no existe cola durable de reintentos).
- Interrumpir alimentación del dispositivo con medidas seguras; verificar reinicio, sensor init y secuencia de muestras.
- Simular fallo de escritura del backend y comprobar el comportamiento documentado de `writeBlocked`.
- Validar integridad del JSONL después de pruebas y cambios de versión; guardar copia de ensayo.

### Experimento D · Energía, carcasa y futuro solar

Medir en W la placa y el sistema completo durante arranque, lectura, AP y POST; documentar picos, regulación y caída de tensión. Evaluar por separado consumo del PC receptor. Solo entonces dimensionar panel, batería, controlador, autonomía, protecciones y mantenimiento. Una imagen de panel solar en el circuito **no es prueba** de autosuficiencia.

### Experimento E · Seguridad y datos

El backend no tiene autenticación de emisor/lector y usa HTTP. En una red aislada puede probarse con alcance acotado; **no desplegarlo en Internet**. Evitar publicar rutas de almacenamiento o coordenadas reales sin evaluación. El `timestamp` generado por servidor limita el análisis de latencia sensor → almacenamiento: añadir relojes/IDs solo cuando exista una propuesta de trazabilidad verificada.

## Matriz de aceptación para futuras afirmaciones

| Afirmación que se quisiera publicar | Evidencia necesaria |
| --- | --- |
| «Funciona como prototipo en laboratorio» | Sesión registrada con sensores físicos y recepción de datos |
| «Tiene 95 % de completitud» | Protocolo, denominador, sesión de duración explícita y archivos crudos |
| «Mide temperatura con error máximo X» | Referencia trazable, muestra, condiciones y distribución de errores |
| «Opera 24/7» | Ensayo de continuidad, fallos y restauración durante período definido |
| «Es solar» | Hardware instalado, dimensionamiento y autonomía real |
| «Mide PM₂.₅/PM₁₀» | Sensor, firmware/API, calibración y evidencia de medición |
| «Puede usarse para validar normativa» | Requisitos normativos y metrológicos aplicables, certificaciones y procedimientos; **no acreditados** |

El [SINCA](https://sinca.mma.gob.cl/index.php/pagina/index/id/validacion) explica por qué los datos de monitoreo se clasifican y validan en etapas. La [EPA sobre calidad de sensores](https://www.epa.gov/air-sensor-toolbox/quality-assurance-air-sensors) recomienda controlar completitud y revisar manualmente anomalías, pues un filtro automático puede omitir errores sutiles o señalar eventos reales.

## Formato mínimo de bitácora futura

```text
ensayo_id | fecha | versión firmware/backend | montaje/fotos
equipo/sensor/serie | referencia y calibración
inicio/fin | frecuencia y método de cómputo
condiciones y ubicación | fallos/cortes | muestras esperadas/recibidas
resultado por magnitud | incertidumbre calculada de forma justificada
archivo crudo | incidencias | responsable de medición
```

Esta plantilla **no es un dataset existente**. Conservar también resultados adversos y versiones exactas. Las mediciones repetibles, no la cantidad de diagramas, permitirán comparar diseños y argumentar una ampliación de alcance.

[Protocolo de software](07-verificacion.md) · [Ruta de validación/comercialización](../desarrollo/04-pilotos-y-modelos-de-servicio.md).
