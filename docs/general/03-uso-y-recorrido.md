# 03 · Cómo recorrer el prototipo

## Prueba local del dashboard (sin hardware)

1. Instala Node.js de la rama 24, desde la versión **24.21.0**; dentro de `backend/` ejecuta `npm ci`.
2. Configura `DATA_FILE` con un archivo aparte en `backend/.env` para conservar el historial incluido. Usa `HOST=127.0.0.1` para trabajar solo en el PC (consulta [`.env.example`](../../backend/.env.example)).
3. Inicia `npm run start:dev` y abre `http://localhost:3002`.
4. La página muestra las mediciones disponibles en el archivo o el estado vacío si no hay ninguna. **El modo dev no genera datos ficticios automáticamente.**
5. Para poblarlo, puedes hacer un POST de prueba con el ejemplo de la [API](../tecnica/04-api-y-seguridad.md).

## Prueba con ESP32-S3

1. Revisa el circuito y la alimentación **antes de conectar la placa**; el diagrama solar del proyecto es una referencia, no una certificación del montaje.
2. Ajusta `AP_SSID`, `AP_PASS`, `BACKEND_URL` y los intervalos en [`config.h`](../../firmware/EstacionMeteorologica/config.h). Sustituye la contraseña de ejemplo por una propia.
3. Compila con el perfil indicado en [firmware/README.md](../../firmware/README.md); cargar el programa requiere verificar el modelo exacto de placa y puerto.
4. Conecta el PC al AP del ESP32 y confirma su IP real. Configura `HOST` con esa IP o con `0.0.0.0` para permitir la conexión de la placa. Inicia `npm run start:esp32` (por defecto puerto 3001).
5. Comprueba el puerto serie y los POST recibidos. Si el GPS aún no obtiene posición, el sistema puede registrar una muestra sin coordenadas válidas.
6. Abre `http://localhost:3001`, observa las últimas muestras y descarga CSV o JSONL si necesitas analizarlas fuera del panel.

## Cómo interpretar lo que ves

El navegador consulta el backend aproximadamente cada **10 s** y marca como antiguos los datos de más de **90 s**. Esto no es una inspección en tiempo real del estado físico de todos los sensores. En particular, el DHT22 no tiene un estado individual disponible en la API.

Las exportaciones consultan el archivo completo; los gráficos trabajan con un máximo de **60 muestras** y la memoria del backend conserva hasta **1000**. Si falla el servidor, la página puede seguir mostrando valores anteriores con aviso. Más detalles en el [manual de usuario](../../manual-de-usuario.md).
