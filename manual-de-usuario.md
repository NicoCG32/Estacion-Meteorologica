# Manual de Usuario

Este manual explica como usar la estacion meteorologica: hardware, carga de mediciones y visualizacion en la pagina web.

## 1) Componentes de hardware

- Placa: ESP32-S3
- Sensores:
  - BME280 (temperatura, humedad, presion) por I2C
  - DHT22 (temperatura, humedad) por GPIO
  - SCD4x (CO2, temperatura, humedad) por I2C
  - Modulo GPS (UART)
- Fuente: 5V (USB) o equivalente estable

## 2) Conexion y pines

En el firmware actual:
- I2C: SDA = GPIO 17, SCL = GPIO 18
- DHT22: DATA = GPIO 7
- GPS: RX = GPIO 40, TX = GPIO 41

Notas:
- El BME280 puede estar en 0x76 o 0x77.
- El SCD4x usa I2C (SCD41_I2C_ADDR_62).
- El GPS se conecta por UART (Serial1 a 9600).

## 3) Red Wi-Fi del ESP32

El ESP32 crea un punto de acceso (AP):
- SSID: "EstMeteo Proyecto IDS"
- Password: "nota7IDS"

Cuando el PC se conecta a esa red, su IP tipica es 192.168.4.2. Ese dato se usa en el firmware para enviar las mediciones al backend.

## 4) Configurar el firmware

Archivo: firmware/EstacionMeteorologica.ino

Revisar y ajustar:
- BACKEND_URL: debe apuntar al PC conectado al AP del ESP32
  - Ejemplo: http://192.168.4.2:3001/api/mediciones
- Intervalos:
  - INTERVALO_MEDIDA_MS: lectura frecuente de sensores
  - INTERVALO_JSON_MS: envio agregado al backend

Luego cargar el firmware desde Arduino IDE.

## 5) Backend y pagina web

El backend recibe mediciones y expone una pagina web con graficos.

Pasos:
1) Ir a backend/
2) Instalar dependencias:
   - npm install
3) Iniciar servidor:
   - npm start
4) Abrir la pagina:
   - http://localhost:3001/

Si el PC esta conectado al AP del ESP32, tambien puedes abrir:
- http://192.168.4.2:3001/

## 6) Formato de mediciones (mediciones.jsonl)

El backend guarda los datos en backend/data/mediciones.jsonl

Es un archivo JSON Lines: una medicion por linea. Ejemplo:

{"temperatura_aire_celsius":23.5,"incertidumbre_temperatura_celsius":0.3,"humedad_aire_porcentaje":60.1,"incertidumbre_humedad_porcentaje":2.8,"presion_atmosferica_hPa":1015.4,"concentracion_CO2_ppm":620,"latitud_grados":-29.90,"longitud_grados":-71.25,"numero_satelites":8}

Para cargar datos manualmente:
1) Abrir backend/data/mediciones.jsonl
2) Agregar nuevas lineas con el formato anterior
3) Reiniciar el servidor para que las lea al inicio

## 7) Endpoints utiles

- GET /api/status
- GET /api/mediciones
- GET /api/mediciones?limit=60
- GET /api/mediciones/ultimo
- POST /api/mediciones (desde el ESP32)

## 8) Solucion de problemas

- La pagina no carga: confirma que el backend este corriendo en el puerto 3001.
- No llegan datos: revisa BACKEND_URL y que el PC este en la red del ESP32.
- Sensores con NaN: revisar cableado y direccion I2C.
- GPS sin satelites: necesita cielo abierto y tiempo para fijar.
