#pragma once

// =========================
// Configuracion (ajustar segun despliegue)
// =========================

// Wi-Fi (ESP32 como Punto de Acceso) y backend
const char* AP_SSID = "EstMeteo Proyecto IDS";     // Nombre de la red Wi-Fi creada por el ESP32
const char* AP_PASS = "nota7IDS";                 // Contrasena (minimo 8 caracteres)
const char* BACKEND_URL = "http://192.168.4.2:3001/api/mediciones";

// Pines
#define SDA_PIN   17
#define SCL_PIN   18

#define DHTPIN    7
#define DHTTYPE   DHT22

#define GPS_RX_PIN 40   // RX del ESP32-S3 (entrada desde TX del GPS)
#define GPS_TX_PIN 41   // TX del ESP32-S3 (salida hacia RX del GPS)

// Tiempos de medicion y agregacion
const unsigned long INTERVALO_MEDIDA_MS = 2000;   // medir cada 2 segundos
const unsigned long INTERVALO_JSON_MS   = 20000;  // generar JSON cada 20 segundos
const unsigned long DELAY_INICIAL_MS   = 10000;  // espera inicial antes de medir

// Filtro de cambios bruscos (firmware)
const float UMBRAL_TEMP_C = 5.0f;
const float UMBRAL_HUM_PORC = 15.0f;
const float UMBRAL_PRES_HPA = 5.0f;
const float UMBRAL_CO2_PPM = 400.0f;


