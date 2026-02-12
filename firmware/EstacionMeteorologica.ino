#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_BME280.h>
#include <DHT.h>
#include <SensirionI2cScd4x.h>
#include <TinyGPSPlus.h>

// Wi-Fi y Backend
#include <WiFi.h>
#include <HTTPClient.h>

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


// Inicia el punto de acceso Wi-Fi del ESP32 (modo AP)
void iniciarPuntoDeAcceso() {
  static bool ap_inicializado = false;
  if (ap_inicializado) return;  // Evita re-inicializar

  Serial.println("Iniciando punto de acceso Wi-Fi del ESP32 (modo AP)...");
  WiFi.mode(WIFI_AP);
  bool ok = WiFi.softAP(AP_SSID, AP_PASS);

  if (!ok) {
    Serial.println("ERROR: no se pudo iniciar el punto de acceso.");
  } else {
    ap_inicializado = true;
    IPAddress ip = WiFi.softAPIP();
    Serial.print("Punto de acceso iniciado.\n  SSID: ");
    Serial.println(AP_SSID);
    Serial.print("  Contraseña: ");
    Serial.println(AP_PASS);
    Serial.print("  IP del ESP32 (gateway en esta red): ");
    Serial.println(ip);
    Serial.println("Conecta tu PC a esta red y ejecuta el backend usando esta red.");
  }
}

// Envía el JSON con la medición al backend (PC)
void enviarMedicionJSON(const String& json) {
  // En modo AP asumimos que el AP está levantado.
  // Si el PC no está conectado o el backend no está corriendo, el POST fallará.

  HTTPClient http;
  http.begin(BACKEND_URL);                 // p.ej. "http://192.168.4.2:3001/api/mediciones"
  http.addHeader("Content-Type", "application/json");

  Serial.println("Enviando medición al backend...");
  Serial.print("URL: ");
  Serial.println(BACKEND_URL);
  Serial.print("Cuerpo JSON: ");
  Serial.println(json);

  int codigoRespuesta = http.POST(json);

  if (codigoRespuesta > 0) {
    Serial.print("Respuesta HTTP: ");
    Serial.println(codigoRespuesta);
    String respuesta = http.getString();
    Serial.print("Cuerpo de respuesta: ");
    Serial.println(respuesta);
  } else {
    Serial.print("Error en POST: ");
    Serial.println(http.errorToString(codigoRespuesta));
  }

  http.end();
}

// =========================
// Macro de error del sensor SCD4x
// =========================
#ifdef NO_ERROR
#undef NO_ERROR
#endif
#define NO_ERROR 0

// =========================
// Objetos de sensores
// =========================
Adafruit_BME280 bme;
DHT dht(DHTPIN, DHTTYPE);
SensirionI2cScd4x scd4x;
TinyGPSPlus gps;

// Buffer de error para el SCD4x
static char errorMessage[64];
static int16_t error;

// =========================
// Estado y buffers
// =========================
// Flags de estado de sensores
bool bme_ok = false;
bool dht_ok = false;
bool scd_ok = false;
bool gps_ok = false;

// =========================
// Tiempos de medicion y agregacion
// =========================
bool first = true;

unsigned long ultimoTiempoMedida = 0;
unsigned long ultimoTiempoJSON   = 0;

// =========================
// Acumuladores por minuto
// =========================

// BME280
float suma_temp_bme = 0.0f;
float suma_hum_bme  = 0.0f;
float suma_pres_bme = 0.0f;
int   conteo_temp_bme = 0;
int   conteo_hum_bme  = 0;
int   conteo_pres_bme = 0;

// DHT22
float suma_temp_dht = 0.0f;
float suma_hum_dht  = 0.0f;
int   conteo_temp_dht = 0;
int   conteo_hum_dht  = 0;

// SCD4x
float    suma_temp_scd = 0.0f;
float    suma_hum_scd  = 0.0f;
uint32_t suma_co2      = 0;
int      conteo_temp_scd = 0;
int      conteo_hum_scd  = 0;
int      conteo_co2      = 0;

// GPS
double suma_lat = 0.0;
double suma_lon = 0.0;
int    conteo_latlon = 0;

long   suma_sat   = 0;
int    conteo_sat = 0;

// Variable global para almacenar el ultimo JSON generado
String ultimoJSON = "";

// =========================
// Estado del filtro de cambios bruscos
// =========================
bool tieneUltimaValida = false;
float ultima_temp = NAN;
float ultima_hum = NAN;
float ultima_pres = NAN;
uint16_t ultima_co2 = 0;

// Prototipos de funciones
void autoTestSensores();
void leerGPSContinuo();

void fusionarTemperatura(float t_bme, bool t_bme_ok,
                         float t_dht, bool t_dht_ok,
                         float t_scd, bool t_scd_ok,
                         float* t_fusion, float* incert_t);

void fusionarHumedad(float h_bme, bool h_bme_ok,
                     float h_dht, bool h_dht_ok,
                     float h_scd, bool h_scd_ok,
                     float* h_fusion, float* incert_h);

String guardarJSON(float temp_fusion, float hum_fusion, float pres_bme,
                   uint16_t co2_ppm, double lat, double lon, int sat,
                   float incert_temp, float incert_hum);

// =========================
// Funciones de utilidad
// =========================

void resetAcumuladoresMinuto() {
  // BME280
  suma_temp_bme = suma_hum_bme = suma_pres_bme = 0.0f;
  conteo_temp_bme = conteo_hum_bme = conteo_pres_bme = 0;
  // DHT22
  suma_temp_dht = suma_hum_dht = 0.0f;
  conteo_temp_dht = conteo_hum_dht = 0;
  // SCD4x
  suma_temp_scd = suma_hum_scd = 0.0f;
  suma_co2 = 0;
  conteo_temp_scd = conteo_hum_scd = conteo_co2 = 0;
  // GPS
  suma_lat = suma_lon = 0.0;
  conteo_latlon = 0;
  suma_sat = 0;
  conteo_sat = 0;
}

bool esValorValido(float v) {
  return !isnan(v);
}

// =========================
// Detección de cambios bruscos
// =========================

bool esSospechosa(float temp, float hum, float pres, uint16_t co2, String& motivos) {
  if (!tieneUltimaValida) {
    return false;
  }

  bool sospechosa = false;

  if (esValorValido(temp) && esValorValido(ultima_temp)) {
    float delta = fabs(temp - ultima_temp);
    if (delta >= UMBRAL_TEMP_C) {
      sospechosa = true;
      motivos += "Temp ";
      motivos += delta;
      motivos += "C; ";
    }
  }

  if (esValorValido(hum) && esValorValido(ultima_hum)) {
    float delta = fabs(hum - ultima_hum);
    if (delta >= UMBRAL_HUM_PORC) {
      sospechosa = true;
      motivos += "Hum ";
      motivos += delta;
      motivos += "%; ";
    }
  }

  if (esValorValido(pres) && esValorValido(ultima_pres)) {
    float delta = fabs(pres - ultima_pres);
    if (delta >= UMBRAL_PRES_HPA) {
      sospechosa = true;
      motivos += "Pres ";
      motivos += delta;
      motivos += "hPa; ";
    }
  }

  if (co2 > 0 && ultima_co2 > 0) {
    float delta = fabs((float)co2 - (float)ultima_co2);
    if (delta >= UMBRAL_CO2_PPM) {
      sospechosa = true;
      motivos += "CO2 ";
      motivos += delta;
      motivos += "ppm; ";
    }
  }

  return sospechosa;
}

// =========================
// Salida en serie (diagnóstico)
// =========================

void imprimirResumenMinuto(float temp, float hum, float pres, uint16_t co2,
                           double lat, double lon, int sat,
                           float incert_temp, float incert_hum,
                           const String& json) {
  Serial.println("====================================================");
  Serial.println("RESUMEN DEL ÚLTIMO MINUTO (VALORES OFICIALES):");

  Serial.print("Temperatura del aire (fusionada): ");
  if (isnan(temp)) {
    Serial.print("NaN");
  } else {
    Serial.print(temp, 2);
    Serial.print(" C");
    if (!isnan(incert_temp)) {
      Serial.print(" (±");
      Serial.print(incert_temp, 2);
      Serial.print(" C)");
    }
  }
  Serial.println();

  Serial.print("Humedad relativa del aire (fusionada): ");
  if (isnan(hum)) {
    Serial.print("NaN");
  } else {
    Serial.print(hum, 1);
    Serial.print(" %");
    if (!isnan(incert_hum)) {
      Serial.print(" (±");
      Serial.print(incert_hum, 1);
      Serial.print(" %)");
    }
  }
  Serial.println();

  Serial.print("Presión atmosférica media (BME280): ");
  if (isnan(pres)) {
    Serial.println("NaN");
  } else {
    Serial.print(pres, 1);
    Serial.println(" hPa");
  }

  Serial.print("Concentración media de CO2 (SCD4x): ");
  Serial.print(co2);
  Serial.println(" ppm");

  Serial.print("Posición media GPS -> Latitud: ");
  if (isnan(lat)) Serial.print("NaN"); else Serial.print(lat, 6);
  Serial.print(", Longitud: ");
  if (isnan(lon)) Serial.print("NaN"); else Serial.print(lon, 6);
  Serial.print(", Número medio de satélites: ");
  Serial.println(sat);

  Serial.println("JSON generado (promedios de 1 minuto, listo para ser enviado a una API web):");
  Serial.println(json);
  Serial.println("====================================================\n");
}

struct LecturasInstantaneas {
  float temperatura_bme;
  float humedad_bme;
  float presion_bme;
  float temperatura_dht;
  float humedad_dht;
  uint16_t co2_ppm;
  float temperatura_scd;
  float humedad_scd;
  double latitud;
  double longitud;
  int numero_satelites;
  float temperatura_fusionada_inst;
  float humedad_fusionada_inst;
  float incert_temp_inst;
  float incert_hum_inst;
};

// =========================
// Procesamiento cíclico (cada ciclo de medición)
// =========================

void procesarMedicionInstantanea(unsigned long ahora) {
  LecturasInstantaneas lect;
  lect.temperatura_bme = NAN;
  lect.humedad_bme = NAN;
  lect.presion_bme = NAN;
  lect.temperatura_dht = NAN;
  lect.humedad_dht = NAN;
  lect.co2_ppm = 0;
  lect.temperatura_scd = NAN;
  lect.humedad_scd = NAN;
  lect.latitud = NAN;
  lect.longitud = NAN;
  lect.numero_satelites = 0;
  lect.temperatura_fusionada_inst = NAN;
  lect.humedad_fusionada_inst = NAN;
  lect.incert_temp_inst = NAN;
  lect.incert_hum_inst = NAN;

  // ----- Lectura del BME280 -----
  if (bme_ok) {
    lect.temperatura_bme = bme.readTemperature();        // °C
    lect.humedad_bme     = bme.readHumidity();           // %
    lect.presion_bme     = bme.readPressure() / 100.0F;  // hPa
  }

  // ----- Lectura del DHT22 -----
  lect.temperatura_dht = dht.readTemperature(); // °C
  lect.humedad_dht     = dht.readHumidity();    // %

  if (isnan(lect.temperatura_dht) || isnan(lect.humedad_dht)) {
    Serial.println("Advertencia: lectura no válida del sensor DHT22.");
  }

  // ----- Lectura del SCD4x -----
  if (scd_ok) {
    bool datos_listos = false;
    error = scd4x.getDataReadyStatus(datos_listos);
    if (error != NO_ERROR) {
      Serial.print("Error al consultar estado de datos del SCD4x: ");
      errorToString(error, errorMessage, sizeof errorMessage);
      Serial.println(errorMessage);
    }

    if (datos_listos) {
      error = scd4x.readMeasurement(lect.co2_ppm, lect.temperatura_scd, lect.humedad_scd);
      if (error != NO_ERROR) {
        Serial.print("Error al leer la medición del SCD4x: ");
        errorToString(error, errorMessage, sizeof errorMessage);
        Serial.println(errorMessage);
      }
    }
  }

  // ----- Lectura del GPS -----
  if (gps.location.isValid()) {
    lect.latitud  = gps.location.lat();
    lect.longitud = gps.location.lng();
  }
  if (gps.satellites.isValid()) {
    lect.numero_satelites = gps.satellites.value();
  }

  fusionarTemperatura(
    lect.temperatura_bme, bme_ok && !isnan(lect.temperatura_bme),
    lect.temperatura_dht, !isnan(lect.temperatura_dht),
    lect.temperatura_scd, scd_ok && !isnan(lect.temperatura_scd),
    &lect.temperatura_fusionada_inst, &lect.incert_temp_inst
  );

  fusionarHumedad(
    lect.humedad_bme, bme_ok && !isnan(lect.humedad_bme),
    lect.humedad_dht, !isnan(lect.humedad_dht),
    lect.humedad_scd, scd_ok && !isnan(lect.humedad_scd),
    &lect.humedad_fusionada_inst, &lect.incert_hum_inst
  );

  if (bme_ok && !isnan(lect.temperatura_bme)) {
    suma_temp_bme += lect.temperatura_bme;
    conteo_temp_bme++;
  }
  if (bme_ok && !isnan(lect.humedad_bme)) {
    suma_hum_bme += lect.humedad_bme;
    conteo_hum_bme++;
  }
  if (bme_ok && !isnan(lect.presion_bme)) {
    suma_pres_bme += lect.presion_bme;
    conteo_pres_bme++;
  }

  if (!isnan(lect.temperatura_dht)) {
    suma_temp_dht += lect.temperatura_dht;
    conteo_temp_dht++;
  }
  if (!isnan(lect.humedad_dht)) {
    suma_hum_dht += lect.humedad_dht;
    conteo_hum_dht++;
  }

  if (scd_ok && !isnan(lect.temperatura_scd)) {
    suma_temp_scd += lect.temperatura_scd;
    conteo_temp_scd++;
  }
  if (scd_ok && !isnan(lect.humedad_scd)) {
    suma_hum_scd += lect.humedad_scd;
    conteo_hum_scd++;
  }
  if (scd_ok && lect.co2_ppm > 0) {
    suma_co2 += lect.co2_ppm;
    conteo_co2++;
  }

  if (!isnan(lect.latitud) && !isnan(lect.longitud)) {
    suma_lat += lect.latitud;
    suma_lon += lect.longitud;
    conteo_latlon++;
  }
  if (lect.numero_satelites > 0) {
    suma_sat += lect.numero_satelites;
    conteo_sat++;
  }

  Serial.println("----------------------------------------------------");
  Serial.print("Tiempo de ejecución [ms]: ");
  Serial.println(ahora);

  Serial.print("BME280 -> ");
  if (bme_ok) {
    Serial.print("Temperatura: "); Serial.print(lect.temperatura_bme, 2); Serial.print(" °C, ");
    Serial.print("Humedad relativa: "); Serial.print(lect.humedad_bme, 1); Serial.print(" %, ");
    Serial.print("Presión atmosférica: "); Serial.print(lect.presion_bme, 1); Serial.println(" hPa");
  } else {
    Serial.println("SIN DATOS (sensor BME280 no inicializado correctamente).");
  }

  Serial.print("DHT22  -> ");
  Serial.print("Temperatura: "); Serial.print(lect.temperatura_dht, 2); Serial.print(" °C, ");
  Serial.print("Humedad relativa: "); Serial.print(lect.humedad_dht, 1); Serial.println(" %");

  Serial.print("SCD4x  -> ");
  if (scd_ok) {
    Serial.print("Concentración de CO2: "); Serial.print(lect.co2_ppm); Serial.print(" ppm, ");
    Serial.print("Temperatura: "); Serial.print(lect.temperatura_scd, 2); Serial.print(" °C, ");
    Serial.print("Humedad relativa: "); Serial.print(lect.humedad_scd, 1); Serial.println(" %");
  } else {
    Serial.println("SIN DATOS (sensor SCD4x no inicializado correctamente).");
  }

  Serial.print("GPS    -> ");
  Serial.print("Latitud: ");
  if (isnan(lect.latitud)) Serial.print("NaN"); else Serial.print(lect.latitud, 6);
  Serial.print(", Longitud: ");
  if (isnan(lect.longitud)) Serial.print("NaN"); else Serial.print(lect.longitud, 6);
  Serial.print(", Número de satélites: "); Serial.println(lect.numero_satelites);

  Serial.print("VALORES FUSIONADOS INSTANTÁNEOS -> Temperatura del aire: ");
  if (isnan(lect.temperatura_fusionada_inst)) {
    Serial.print("NaN");
  } else {
    Serial.print(lect.temperatura_fusionada_inst, 2);
    Serial.print(" °C");
    if (!isnan(lect.incert_temp_inst)) {
      Serial.print(" (±");
      Serial.print(lect.incert_temp_inst, 2);
      Serial.print(" °C)");
    }
  }

  Serial.print(", Humedad relativa del aire: ");
  if (isnan(lect.humedad_fusionada_inst)) {
    Serial.print("NaN");
  } else {
    Serial.print(lect.humedad_fusionada_inst, 1);
    Serial.print(" %");
    if (!isnan(lect.incert_hum_inst)) {
      Serial.print(" (±");
      Serial.print(lect.incert_hum_inst, 1);
      Serial.print(" %)");
    }
  }
  Serial.println();
}

// =========================
// Agregación mensual (cada minuto)
// =========================

void procesarMinuto() {
  // Cálculo de promedios por sensor
  float prom_temp_bme = (conteo_temp_bme > 0) ? (suma_temp_bme / conteo_temp_bme) : NAN;
  float prom_hum_bme  = (conteo_hum_bme  > 0) ? (suma_hum_bme  / conteo_hum_bme)  : NAN;
  float prom_pres_bme = (conteo_pres_bme > 0) ? (suma_pres_bme / conteo_pres_bme) : NAN;

  float prom_temp_dht = (conteo_temp_dht > 0) ? (suma_temp_dht / conteo_temp_dht) : NAN;
  float prom_hum_dht  = (conteo_hum_dht  > 0) ? (suma_hum_dht  / conteo_hum_dht)  : NAN;

  float prom_temp_scd = (conteo_temp_scd > 0) ? (suma_temp_scd / conteo_temp_scd) : NAN;
  float prom_hum_scd  = (conteo_hum_scd  > 0) ? (suma_hum_scd  / conteo_hum_scd)  : NAN;
  float prom_co2      = (conteo_co2      > 0) ? ((float)suma_co2 / conteo_co2)    : 0.0f;

  double prom_lat = (conteo_latlon > 0) ? (suma_lat / conteo_latlon) : NAN;
  double prom_lon = (conteo_latlon > 0) ? (suma_lon / conteo_latlon) : NAN;
  int prom_sat    = (conteo_sat    > 0) ? (int)((float)suma_sat / conteo_sat + 0.5f) : 0;

  // Fusión por minuto
  float temperatura_fusionada_min     = NAN;
  float humedad_fusionada_min         = NAN;
  float incertidumbre_temperatura_min = NAN;
  float incertidumbre_humedad_min     = NAN;

  fusionarTemperatura(
    prom_temp_bme, bme_ok && !isnan(prom_temp_bme),
    prom_temp_dht, !isnan(prom_temp_dht),
    prom_temp_scd, scd_ok && !isnan(prom_temp_scd),
    &temperatura_fusionada_min, &incertidumbre_temperatura_min
  );

  fusionarHumedad(
    prom_hum_bme, bme_ok && !isnan(prom_hum_bme),
    prom_hum_dht, !isnan(prom_hum_dht),
    prom_hum_scd, scd_ok && !isnan(prom_hum_scd),
    &humedad_fusionada_min, &incertidumbre_humedad_min
  );

  // Generación del JSON con valores únicos y fusionados
  uint16_t co2_promedio_ppm = (uint16_t)(prom_co2 + 0.5f); // redondeo simple

  String motivosSospecha = "";
  bool sospechosa = esSospechosa(
    temperatura_fusionada_min,
    humedad_fusionada_min,
    prom_pres_bme,
    co2_promedio_ppm,
    motivosSospecha
  );

  if (sospechosa) {
    Serial.println("AVISO: cambio brusco detectado, medicion descartada en firmware.");
    Serial.print("Motivos: ");
    Serial.println(motivosSospecha);
    resetAcumuladoresMinuto();
  } else {
    ultimoJSON = guardarJSON(
      temperatura_fusionada_min,
      humedad_fusionada_min,
      prom_pres_bme,
      co2_promedio_ppm,
      prom_lat,
      prom_lon,
      prom_sat,
      incertidumbre_temperatura_min,
      incertidumbre_humedad_min
    );

    // Enviar al backend
    enviarMedicionJSON(ultimoJSON);

    // Actualizar ultima medicion valida
    tieneUltimaValida = true;
    ultima_temp = temperatura_fusionada_min;
    ultima_hum = humedad_fusionada_min;
    ultima_pres = prom_pres_bme;
    ultima_co2 = co2_promedio_ppm;
  }

  if (!sospechosa) {
    // Salida de resumen del ultimo minuto
    imprimirResumenMinuto(
      temperatura_fusionada_min,
      humedad_fusionada_min,
      prom_pres_bme,
      co2_promedio_ppm,
      prom_lat,
      prom_lon,
      prom_sat,
      incertidumbre_temperatura_min,
      incertidumbre_humedad_min,
      ultimoJSON
    );
  }

  // Reset de acumuladores para el siguiente minuto
  resetAcumuladoresMinuto();
}

void setup() {

  // Puerto serie principal (depuración)
  Serial.begin(115200);
  delay(1000);
  Serial.println("\nIniciando estación meteorológica con ESP32-S3...");

  // Bus I2C en los pines definidos
  Wire.begin(SDA_PIN, SCL_PIN);
  delay(100);

  // Inicialización del DHT22
  dht.begin();

  // =========================
  // Inicialización del BME280
  // =========================
  Serial.println("Inicializando sensor BME280 (temperatura, humedad, presión)...");
  bme_ok = bme.begin(0x76);
  if (!bme_ok) {
    bme_ok = bme.begin(0x77);  // Algunos módulos usan 0x77
  }
  if (!bme_ok) {
    Serial.println("ERROR: No se detecta el BME280 en 0x76 ni en 0x77. Revisar conexiones y dirección I2C.");
  } else {
    Serial.println("BME280 inicializado correctamente.");
  }

  // =========================
  // Inicialización del SCD4x
  // =========================
  inicializarSCD4x();

  // =========================
  // Inicialización del GPS
  // =========================
  Serial.println("Inicializando módulo GPS (Serial1)...");
  Serial1.begin(9600, SERIAL_8N1, GPS_RX_PIN, GPS_TX_PIN);

  // Auto-test inicial de todos los sensores
  autoTestSensores();

  // Inicializar acumuladores y tiempos
  resetAcumuladoresMinuto();
  ultimoTiempoMedida = millis();
  ultimoTiempoJSON   = millis();

  // Wi-Fi en modo Punto de Acceso
  iniciarPuntoDeAcceso();

  Serial.println("\nInicio del bucle principal. Se realizaran mediciones cada 2 segundos y se generara un dato oficial cada 20 segundos.\n");
}

void autoTestSensores() {
  Serial.println("\n===== AUTO-TEST INICIAL DE SENSORES =====");

  // ---- Prueba rápida del DHT22 ----
  delay(2000);  // Pequeña espera para estabilizar
  float t_test = dht.readTemperature();
  float h_test = dht.readHumidity();
  if (!isnan(t_test) && !isnan(h_test)) {
    dht_ok = true;
  } else {
    dht_ok = false;
  }

  // ---- Prueba rápida del GPS: verificar recepción de datos NMEA durante ~3 segundos ----
  gps_ok = false;
  unsigned long inicio = millis();
  while (millis() - inicio < 3000) {
    if (Serial1.available()) {
      char c = Serial1.read();
      gps.encode(c);
      gps_ok = true;   // Se confirma que llegan datos desde el módulo GPS
    }
  }

  // ---- Resumen de estado de cada sensor ----
  Serial.print("Sensor BME280 (temperatura, humedad, presión): ");
  Serial.println(bme_ok ? "OK" : "ERROR (no responde en I2C 0x76/0x77)");

  Serial.print("Sensor DHT22 (temperatura, humedad): ");
  Serial.println(dht_ok ? "OK" : "ERROR (lecturas no válidas; revisar conexiones + / OUT / -)");

  Serial.print("Sensor SCD4x (CO2, temperatura, humedad): ");
  Serial.println(scd_ok ? "OK" : "ERROR (fallo en la inicialización o en la comunicación I2C)");

  Serial.print("Módulo GPS: ");
  if (gps_ok) {
    Serial.println("OK (se reciben tramas NMEA; el cálculo de la posición puede tardar algunos minutos).");
  } else {
    Serial.println("SIN DATOS (no se reciben tramas NMEA; revisar alimentación a 5 V y conexiones TX/RX).");
  }

  Serial.println("===== FIN DEL AUTO-TEST =====\n");
}

void leerGPSContinuo() {
  // Esta función debe llamarse con frecuencia para no perder caracteres NMEA del GPS
  while (Serial1.available() > 0) {
    char c = Serial1.read();
    gps.encode(c);
  }
}

void inicializarSCD4x() {
  Serial.println("Inicializando sensor SCD4x (CO2, temperatura, humedad)...");
  scd4x.begin(Wire, SCD41_I2C_ADDR_62);
  delay(30);

  // Llevar el sensor a un estado conocido
  error = scd4x.wakeUp();
  if (error != NO_ERROR) {
    Serial.print("Error al ejecutar wakeUp() en SCD4x: ");
    errorToString(error, errorMessage, sizeof errorMessage);
    Serial.println(errorMessage);
  }

  error = scd4x.stopPeriodicMeasurement();
  if (error != NO_ERROR) {
    Serial.print("Error al ejecutar stopPeriodicMeasurement() en SCD4x: ");
    errorToString(error, errorMessage, sizeof errorMessage);
    Serial.println(errorMessage);
  }

  error = scd4x.reinit();
  if (error != NO_ERROR) {
    Serial.print("Error al ejecutar reinit() en SCD4x: ");
    errorToString(error, errorMessage, sizeof errorMessage);
    Serial.println(errorMessage);
  }

  // Comenzar mediciones periódicas del SCD4x (intervalo aproximado de 5 segundos)
  error = scd4x.startPeriodicMeasurement();
  if (error != NO_ERROR) {
    Serial.print("Error al iniciar la medición periódica del SCD4x: ");
    errorToString(error, errorMessage, sizeof errorMessage);
    Serial.println(errorMessage);
    scd_ok = false;
  } else {
    Serial.println("SCD4x inicializado correctamente en modo de medición periódica.");
    scd_ok = true;
  }
}

// =========================
// Fusión de sensores
// =========================

// Función de fusión de TEMPERATURA (3 sensores -> 1 valor)
void fusionarTemperatura(float t_bme, bool t_bme_ok,
                         float t_dht, bool t_dht_ok,
                         float t_scd, bool t_scd_ok,
                         float* t_fusion, float* incert_t) {

  const float UMBRAL_RANGO = 2.0f;  // si los sensores difieren menos de 2 °C, promediamos

  float valores[3];
  int   indiceSensor[3];
  int n = 0;

  if (t_bme_ok && !isnan(t_bme)) {
    valores[n] = t_bme; indiceSensor[n] = 0; n++;
  }
  if (t_dht_ok && !isnan(t_dht)) {
    valores[n] = t_dht; indiceSensor[n] = 1; n++;
  }
  if (t_scd_ok && !isnan(t_scd)) {
    valores[n] = t_scd; indiceSensor[n] = 2; n++;
  }

  if (n == 0) {
    *t_fusion = NAN;
    *incert_t = NAN;
    return;
  }

  // Si hay varios valores, calculamos media y rango
  float suma = 0.0f;
  float minimo = valores[0];
  float maximo = valores[0];

  for (int i = 0; i < n; i++) {
    suma += valores[i];
    if (valores[i] < minimo) minimo = valores[i];
    if (valores[i] > maximo) maximo = valores[i];
  }

  float media  = suma / n;
  float rango  = maximo - minimo;

  if (n >= 2 && rango <= UMBRAL_RANGO) {
    // Buena coherencia entre sensores: usamos la media
    *t_fusion = media;
    *incert_t = rango / 2.0f;  // mitad del rango como estimación de incertidumbre
    return;
  }

  // Si hay mucha dispersión, elegimos el sensor más confiable disponible
  // Orden de prioridad: 2 = SCD4x, 0 = BME280, 1 = DHT22
  int prioridad[] = {2, 0, 1};
  int sensorElegido = -1;
  float valorElegido = NAN;

  for (int p = 0; p < 3 && sensorElegido == -1; p++) {
    int s = prioridad[p];
    for (int i = 0; i < n; i++) {
      if (indiceSensor[i] == s) {
        sensorElegido = s;
        valorElegido  = valores[i];
        break;
      }
    }
  }

  *t_fusion = valorElegido;

  // Incertidumbre base según sensor elegido (valores razonables aproximados)
  if (sensorElegido == 2) {         // SCD4x
    *incert_t = 0.8f;
  } else if (sensorElegido == 0) {  // BME280
    *incert_t = 0.5f;
  } else {                          // DHT22
    *incert_t = 1.0f;
  }
}

// Función de fusión de HUMEDAD (3 sensores -> 1 valor)
void fusionarHumedad(float h_bme, bool h_bme_ok,
                     float h_dht, bool h_dht_ok,
                     float h_scd, bool h_scd_ok,
                     float* h_fusion, float* incert_h) {

  const float UMBRAL_RANGO = 10.0f;  // si difieren menos de 10 %HR, promediamos

  float valores[3];
  int   indiceSensor[3];
  int n = 0;

  if (h_bme_ok && !isnan(h_bme)) {
    valores[n] = h_bme; indiceSensor[n] = 0; n++;
  }
  if (h_dht_ok && !isnan(h_dht)) {
    valores[n] = h_dht; indiceSensor[n] = 1; n++;
  }
  if (h_scd_ok && !isnan(h_scd)) {
    valores[n] = h_scd; indiceSensor[n] = 2; n++;
  }

  if (n == 0) {
    *h_fusion = NAN;
    *incert_h = NAN;
    return;
  }

  float suma = 0.0f;
  float minimo = valores[0];
  float maximo = valores[0];

  for (int i = 0; i < n; i++) {
    suma += valores[i];
    if (valores[i] < minimo) minimo = valores[i];
    if (valores[i] > maximo) maximo = valores[i];
  }

  float media = suma / n;
  float rango = maximo - minimo;

  if (n >= 2 && rango <= UMBRAL_RANGO) {
    *h_fusion = media;
    *incert_h = rango / 2.0f;
    return;
  }

  // Si hay dispersión grande, elegimos sensor más confiable (SCD4x > BME280 > DHT22)
  int prioridad[] = {2, 0, 1};
  int sensorElegido = -1;
  float valorElegido = NAN;

  for (int p = 0; p < 3 && sensorElegido == -1; p++) {
    int s = prioridad[p];
    for (int i = 0; i < n; i++) {
      if (indiceSensor[i] == s) {
        sensorElegido = s;
        valorElegido  = valores[i];
        break;
      }
    }
  }

  *h_fusion = valorElegido;

  // Incertidumbre base según sensor elegido (aproximada)
  if (sensorElegido == 2) {         // SCD4x
    *incert_h = 3.0f;
  } else if (sensorElegido == 0) {  // BME280
    *incert_h = 3.0f;
  } else {                          // DHT22
    *incert_h = 5.0f;
  }
}

void loop() {
  // Actualizar continuamente el estado del GPS
  leerGPSContinuo();

  unsigned long ahora = millis();

  // =========================
  // BLOQUE 1: medicion cada INTERVALO_MEDIDA_MS
  // =========================
  if (first) {
    delay(DELAY_INICIAL_MS);
    first = false;
  } else {
    if (ahora - ultimoTiempoMedida >= INTERVALO_MEDIDA_MS) {
      ultimoTiempoMedida = ahora;
      procesarMedicionInstantanea(ahora);
    }

    // =========================
    // BLOQUE 2: agregación y JSON cada 60 segundos
    // =========================
    if (ahora - ultimoTiempoJSON >= INTERVALO_JSON_MS) {
      ultimoTiempoJSON = ahora;
      procesarMinuto();
    }
  }
}

// =========================
// Construcción de JSON
// =========================

// Función que construye un JSON con los valores fusionados (promedio 1 min)
// y lo devuelve como String (también se copia en ultimoJSON).
String guardarJSON(float temp_fusion, float hum_fusion, float pres_bme,
                   uint16_t co2_ppm, double lat, double lon, int sat,
                   float incert_temp, float incert_hum) {

  String json = "{";

  // Temperatura del aire
  json += "\"temperatura_aire_celsius\":";
  if (isnan(temp_fusion)) json += "null";
  else json += String(temp_fusion, 2);

  json += ",\"incertidumbre_temperatura_celsius\":";
  if (isnan(incert_temp)) json += "null";
  else json += String(incert_temp, 2);

  // Humedad del aire
  json += ",\"humedad_aire_porcentaje\":";
  if (isnan(hum_fusion)) json += "null";
  else json += String(hum_fusion, 1);

  json += ",\"incertidumbre_humedad_porcentaje\":";
  if (isnan(incert_hum)) json += "null";
  else json += String(incert_hum, 1);

  // Presión atmosférica (única, del BME280)
  json += ",\"presion_atmosferica_hPa\":";
  if (isnan(pres_bme)) json += "null";
  else json += String(pres_bme, 1);

  // CO₂ (único, del SCD4x)
  json += ",\"concentracion_CO2_ppm\":";
  json += String(co2_ppm);

  // GPS
  json += ",\"latitud_grados\":";
  if (isnan(lat)) json += "null";
  else json += String(lat, 6);

  json += ",\"longitud_grados\":";
  if (isnan(lon)) json += "null";
  else json += String(lon, 6);

  json += ",\"numero_satelites\":";
  json += String(sat);

  json += "}";

  return json;
}