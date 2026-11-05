# 04 · API HTTP, configuración y seguridad

El backend es **Express 5** y sirve tanto API como archivos estáticos del dashboard. No hay cuentas ni autenticación; la arquitectura es **local y experimental**. No debe publicarse directamente en Internet.

## Endpoints implementados

| Verbo y ruta                 | Resultado                                                                                         | Procedencia                 |
| ---------------------------- | ------------------------------------------------------------------------------------------------- | --------------------------- |
| `POST /api/mediciones`       | Valida JSON, asigna ID/fecha, marca anomalías, escribe y responde `201`.                          | Firmware o cliente HTTP.    |
| `GET /api/mediciones`        | Lista de la ventana reciente; `limit`, `offset` y `order` (`asc`/`desc`).                         | Consulta y gráficos.        |
| `GET /api/mediciones/ultimo` | Última medición o `404` si está vacío.                                                            | Consulta directa.           |
| `GET /api/mediciones/export` | Descarga **CSV** (`format=csv`) o **JSONL** (`format=jsonl`) desde disco.                         | Historial completo o rango. |
| `GET /api/status`            | Estado del proceso, conteo, última muestra, tamaño y capacidad de la ventana, y ruta del archivo. | Dashboard.                  |

`offset` cuenta desde el extremo más reciente de la ventana y `order` **solo cambia el orden de la página seleccionada**. Exportación admite `from` y `to` con ISO 8601 y límites inclusivos, no páginas. El timestamp lo aporta el servidor y no se puede enviar en el POST.

## Ejemplo reproducible sin sensores

Desde una terminal conectada al servidor de pruebas, con `DATA_FILE` configurado aparte:

```bash
curl -X POST http://127.0.0.1:3002/api/mediciones \
  -H "Content-Type: application/json" \
  -d '{"temperatura_aire_celsius":22.4,"humedad_aire_porcentaje":48.5,"presion_atmosferica_hPa":1012.1,"concentracion_CO2_ppm":570}'
```

En PowerShell puedes enviar la misma muestra con:

```powershell
$medicion = @{
  temperatura_aire_celsius = 22.4
  humedad_aire_porcentaje = 48.5
  presion_atmosferica_hPa = 1012.1
  concentracion_CO2_ppm = 570
} | ConvertTo-Json
Invoke-RestMethod -Uri 'http://127.0.0.1:3002/api/mediciones' -Method Post -ContentType 'application/json' -Body $medicion
```

La API acepta `null` en magnitudes declaradas, pero rechaza ausencias de las cuatro claves obligatorias, números fuera del rango, valores no finitos y nombres no reconocidos. El límite del cuerpo JSON es `100kb`. Los errores usan `{ "ok": false, "mensaje": "..." }`, con detalles de validación cuando corresponde. Consulta los [códigos HTTP](../../backend/README.md#persistencia-y-errores).

## Variables y redes

| Variable    | Predeterminada                  | Observación                                                    |
| ----------- | ------------------------------- | -------------------------------------------------------------- |
| `PORT`      | 3001 (`esp32`) / 3002 (`dev`)   | Puerto TCP.                                                    |
| `HOST`      | `0.0.0.0`                       | Escucha todas las interfaces, incluso fuera del AP si existen. |
| `DATA_FILE` | `backend/data/mediciones.jsonl` | Histórico persistente; no usarlo para pruebas.                 |
| `LOG_LEVEL` | `info`                          | Logs estructurados.                                            |

Los scripts npm usan [`.env.example`](../../backend/.env.example) como guía y cargan `backend/.env` si existe. El firmware define SSID, contraseña y URL en [`config.h`](../../firmware/EstacionMeteorologica/config.h); **la contraseña del ejemplo está codificada en el repositorio**, por lo que debe reemplazarse para un montaje real. No supongas que el PC siempre tiene `192.168.4.2`.

## Límites de seguridad y operación

- El ESP32 envía las mediciones mediante **HTTP**, no HTTPS. No hay autenticación del emisor ni del lector.
- El servidor puede estar expuesto en otras interfaces por `HOST=0.0.0.0`; usar un host controlado y reglas de red según la instalación.
- Una persona con acceso al puerto puede enviar medidas falsas, consultar o descargar el historial y, en `status`, conocer una ruta local.
- JSONL carece de política de rotación, control de acceso por usuario, respaldo automático y cifrado en reposo propios del proyecto.
- GPS y registros reales deben tratarse como datos potencialmente sensibles; no publicar sin evaluar ubicación e identificación.

La restricción de red es **una medida de operación**, no una seguridad incorporada en la aplicación. Si se piensa ampliar su acceso, la autenticación, integridad del emisor, transporte cifrado, secretos y pruebas de exposición pasan a ser requisitos del diseño, no ajustes menores.
