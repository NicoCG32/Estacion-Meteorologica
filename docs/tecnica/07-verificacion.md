# 07 · Cómo verificar el prototipo

La verificación combina pruebas automatizadas de software y ensayos del montaje. Cada una cubre una parte del recorrido de la medición.

## Backend y frontend

Con **Node.js >=24.21.0 y <25**, ejecuta desde `backend/`:

```bash
npm ci
npm run lint
npm run format:check
npm run test:coverage
```

Las pruebas cubren API, validación, persistencia, paginación, exportación, errores, anomalías, arranque y estados de frontend. El umbral de cobertura configurado es **95 % líneas, 90 % ramas, 95 % funciones** para módulos `backend/src/**/*.js`; no incluye hardware/firmware ni frontend en ese porcentaje.

`npm run test:coverage` ejecuta la suite completa y comprueba esos mínimos. Para ejecutar las pruebas sin cobertura, usa `npm test`. GitHub Actions realiza las mismas comprobaciones de calidad en cada push y pull request; sus resultados están en [Backend quality](https://github.com/NicoCG32/Estacion-Meteorologica/actions/workflows/lint.yml).

## Firmware

Compilar con Arduino CLI según el perfil oficial del repositorio:

```bash
arduino-cli compile --profile esp32s3 firmware/EstacionMeteorologica
```

La [guía de firmware](../../firmware/README.md) detalla las versiones fijadas del core y las librerías, la selección de placa y la carga. Después de compilar, verifica el programa en el ESP32 con el monitor serie y un archivo de datos de prueba.

## Datos históricos: una comprobación necesaria

El archivo versionado [`backend/data/mediciones.jsonl`](../../backend/data/mediciones.jsonl) contiene **43 filas del 6-12-2025**; los registros **26–28** tienen **181,39 °C** y **−130,8 hPa**, fuera del validador actual. Esto no representa una falla demostrada del backend **actual**, que aplica rangos a las nuevas solicitudes: el archivo puede provenir de una versión histórica o de pruebas cuyos detalles no están conservados.

La muestra cubre unos **15 minutos**, **no** valida la meta académica de **≥95 % de completitud durante 2–4 horas** ni precisión ambiental. [Criterios de interpretación, código reproducible y plan de ensayos](08-evidencia-y-validacion-experimental.md).

## Ensayos del montaje

| Prueba               | Qué medir o registrar                                                            |
| -------------------- | -------------------------------------------------------------------------------- |
| Alimentación         | Tensión real, estabilidad y protecciones durante el funcionamiento.              |
| Sensores             | Disponibilidad, pérdidas, calentamiento, dispersión y deriva.                    |
| Referencia           | Comparaciones periódicas con instrumento calibrado y condiciones conocidas.      |
| Redes y recuperación | Pérdida del AP, reinicio del backend, caída de energía y muestras no entregadas. |
| GPS                  | Calidad y tiempo hasta fijación en condiciones representativas.                  |
| Estabilidad          | Archivo JSONL tras un ensayo prolongado y comportamiento en reinicios.           |
| Energía solar        | Montaje, protecciones y autonomía real, si se llega a implementar.               |

Registra fecha, entorno, instrumentos de referencia y resultados de cada ensayo, incluyendo pérdidas y fallos. Estos registros permiten evaluar precisión, continuidad y autonomía antes de ampliar el uso del prototipo. **El [estudio de rentabilidad](../desarrollo/03-viabilidad-economica-y-sostenibilidad.md) depende también del costo real de conseguir esta calidad.**
