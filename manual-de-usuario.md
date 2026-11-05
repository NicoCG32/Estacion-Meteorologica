# Manual de uso · Estación Meteorológica

Esta guía explica cómo consultar mediciones y conectar la estación durante una sesión de prototipado local.

## 1. Identificar los componentes

ESP32-S3, BME280 (temperatura/humedad/presión), DHT22 (temperatura/humedad), SCD4x (CO₂/temperatura/humedad) y GPS por UART. Los pines y la lógica se describen en [hardware y firmware](docs/tecnica/02-hardware-y-firmware.md); el [esquema del circuito](diagramas/circuito.png) es una referencia. Si se elige alimentación con panel/batería, se debe validar el montaje y las protecciones; no consta aquí una prueba de autonomía solar.

## 2. Trabajar solo con el backend

Con **Node.js >=24.21.0 y <25**, y npm instalado, desde `backend/`:

```bash
npm ci
npm run start:dev
```

Abre [localhost:3002](http://localhost:3002). Se mostrarán los datos existentes en `DATA_FILE`; no se generan muestras sintéticas de forma automática. **Antes de iniciar pruebas de ingreso**, configura `backend/.env` según [`.env.example`](backend/.env.example), con `DATA_FILE` apuntando a un archivo independiente. Para trabajar solo en este PC, usa `HOST=127.0.0.1`. Puedes enviar una lectura con el ejemplo de la [API](docs/tecnica/04-api-y-seguridad.md).

## 3. Conectar la placa real

1. Revisa físicamente alimentación, pines y el modelo exacto de placa antes de conectar.
2. En [`config.h`](firmware/EstacionMeteorologica/config.h), cambia SSID/contraseña de ejemplo, confirma la IP del PC en `BACKEND_URL` e intervalos.
3. Consulta [instrucciones de compilación/carga](firmware/README.md) y valida respuesta de sensores con el monitor serie.
4. Conecta el PC a la red AP creada por el ESP32. Configura `HOST` con la IP del PC en esa red o con `0.0.0.0` para escuchar en todas sus interfaces; ejecuta `npm run start:esp32` desde `backend/`.
5. Abre `http://localhost:3001` en el PC y comprueba solicitudes entrantes. Los puertos pueden cambiar si configuras `PORT`.

El firmware hace lecturas aproximadas cada **2 segundos** y construye/envía un conjunto aproximadamente cada **20 segundos**. Los saltos bruscos pueden **descartarse en el firmware**: una ausencia en el gráfico no permite inferir que no hubo evento ambiental.

## 4. Leer el dashboard

- Se actualiza mediante consultas periódicas de aproximadamente **10 segundos** y permite actualizar manualmente.
- «Datos antiguos» significa más de **90 segundos** desde el timestamp del servidor; no es diagnóstico directo de todos los sensores.
- El estado individual del DHT22 **no puede observarse** desde la API actual; otros indicadores se infieren de los campos de la última muestra.
- El gráfico incluye hasta **60** puntos y puede presentar huecos por valores faltantes. CO₂ igual a cero no se interpreta como lectura ambiental.
- La página ofrece exportaciones **CSV** o **JSONL**, con filtro opcional de fechas. La exportación recorre el archivo completo, no solo la ventana del gráfico.

## 5. Precauciones

El servidor local utiliza HTTP **sin autenticación**. Para pruebas con un solo PC, restringe su interfaz y guarda el historial fuera de la carpeta versionada. Los datos de GPS pueden revelar lugares concretos. No lo expongas a Internet ni lo emplees para alertas de seguridad, calidad del aire certificada o decisiones críticas sin rediseñar y validar el sistema.

Más detalles: [documentación completa](docs/README.md) · [limitaciones](docs/general/02-estado-del-prototipo.md) · [API](backend/README.md).
