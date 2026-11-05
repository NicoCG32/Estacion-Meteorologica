# 02 · Funciones y limitaciones

El prototipo integra captura, almacenamiento y consulta local. La tabla resume las funciones disponibles y las condiciones que afectan su uso.

| Función                                    | Situación verificable        | Nota                                                              |
| ------------------------------------------ | ---------------------------- | ----------------------------------------------------------------- |
| Lectura BME280 / DHT22 / SCD4x / GPS       | Implementada en el firmware  | Depende del montaje y de sensores presentes y conectados.         |
| Fusión de temperatura y humedad            | Implementada                 | Regla heurística, no modelo de calibración.                       |
| CO₂ y presión                              | Implementadas                | CO₂ proviene de SCD4x; presión de BME280.                         |
| Geolocalización                            | Implementada                 | Puede venir `null` o sin satélites.                               |
| Material particulado PM₂.₅/PM₁₀            | **No implementado**          | Aparece en el alcance académico, no en el firmware/API.           |
| Wi-Fi AP y envío HTTP                      | Implementado                 | Depende de conectividad local y de `BACKEND_URL`.                 |
| API Express, validación y JSONL            | Implementados                | Sin autenticación ni cifrado de transporte.                       |
| Anomalías en firmware y backend            | Implementadas                | Filtro previo al envío vs. marca posterior al ingreso.            |
| Dashboard, gráficos y exportación          | Implementados                | La página conserva indicaciones de vigencia y fallos.             |
| Alimentación solar/autonomía               | **Diseño de referencia**     | Diagrama y manual no equivalen a ensayo eléctrico o de autonomía. |
| Calibración, intemperie y pruebas de campo | **Pendientes de validación** | Necesarias antes de hacer afirmaciones de precisión.              |
| Multiestación, cuentas o nube              | **No implementados**         | Quedan fuera del alcance actual.                                  |

## Qué significa 'medición sospechosa'

El firmware descarta **antes del envío** un lote si detecta un salto respecto de su última referencia válida. El backend, para las lecturas que recibe, **marca** las sospechosas y las conserva. Estas acciones pueden generar vacíos en la serie; no deben interpretarse automáticamente como ausencia de un fenómeno ambiental.

Las fechas del historial se asignan al procesar cada registro en el servidor; no indican el instante de adquisición del ESP32. [Detalle del algoritmo](../tecnica/06-calidad-y-algoritmos.md).
