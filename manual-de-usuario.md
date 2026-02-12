# Manual de Usuario

Este manual explica como usar la estacion meteorologica: hardware, conexion, energia, carga de mediciones y visualizacion.

Ver tambien:
- [README.md](README.md)
- [backend/README.md](backend/README.md)
- [firmware/README.md](firmware/README.md)
- [diagramas/circuito.drawio](diagramas/circuito.drawio)

## 1) Componentes de hardware

- Placa: ESP32-S3
- Sensores:
  - BME280 (temperatura, humedad, presion) por I2C
  - DHT22 (temperatura, humedad) por GPIO
  - SCD4x (CO2, temperatura, humedad) por I2C
  - Modulo GPS (UART)
- Fuente: panel solar + bateria Li-ion (ver seccion de energia)

## 2) Energia (panel solar y bateria)

El prototipo se alimenta con panel solar, cargador TP4056 (modulo TP45) y bateria Li-ion.

Recomendacion de dimensionamiento:
- Panel solar: 6V, 1A (aprox 6W) para mantener carga diurna.
- Bateria Li-ion: 3.7V, 2000 a 3000mAh.
- Regulador: salida estable 5V o 3.3V para el ESP32-S3 y sensores.

Flujo de energia:
Panel solar -> TP4056 -> Bateria -> Regulador -> ESP32-S3 -> Sensores.

Diagrama editable: [diagramas/circuito.drawio](diagramas/circuito.drawio)

## 3) Conexion y pines

En el firmware actual:
- I2C: SDA = GPIO 17, SCL = GPIO 18
- DHT22: DATA = GPIO 7
- GPS: RX = GPIO 40, TX = GPIO 41

Notas:
- El BME280 puede estar en 0x76 o 0x77.
- El SCD4x usa I2C (SCD41_I2C_ADDR_62).
- El GPS se conecta por UART (Serial1 a 9600).

## 4) Red Wi-Fi del ESP32

El ESP32 crea un punto de acceso (AP):
- SSID: "EstMeteo Proyecto IDS"
- Password: "nota7IDS"

Cuando el PC se conecta a esa red, su IP tipica es 192.168.4.2. Ese dato se usa en el firmware para enviar las mediciones al backend.

## 5) Configurar el firmware

Archivo: firmware/EstacionMeteorologica.ino

Revisar y ajustar:
- BACKEND_URL: debe apuntar al PC conectado al AP del ESP32
  - Ejemplo: http://192.168.4.2:3001/api/mediciones
- Intervalos:
  - INTERVALO_MEDIDA_MS: lectura frecuente de sensores
  - INTERVALO_JSON_MS: envio agregado al backend

Luego cargar el firmware desde Arduino IDE.

## 6) Backend y pagina web

El backend recibe mediciones y expone una pagina web con graficos.

Pasos:
1) Ir a backend/
2) Instalar dependencias:
   - npm install
3) Iniciar servidor:
  - npm run start:esp32
  - o ejecutar run-esp32.bat
4) Abrir la pagina:
   - http://localhost:3001/

Si el PC esta conectado al AP del ESP32, tambien puedes abrir:
- http://192.168.4.2:3001/

## 7) Formato de mediciones (mediciones.jsonl)

El backend guarda los datos en backend/data/mediciones.jsonl (una medicion por linea).
Para detalles del formato, exportacion a CSV y ejemplos, ver [backend/README.md](backend/README.md).

## 8) Endpoints utiles

La lista completa de endpoints y ejemplos esta en [backend/README.md](backend/README.md).

## 9) Solucion de problemas

- La pagina no carga: confirma que el backend este corriendo en el puerto 3001.
- No llegan datos: revisa BACKEND_URL y que el PC este en la red del ESP32.
- Sensores con NaN: revisar cableado y direccion I2C.
- GPS sin satelites: necesita cielo abierto y tiempo para fijar.
