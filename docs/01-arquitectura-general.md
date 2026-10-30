# 01 — Arquitectura por niveles

<!-- DOCUMENTACION:nivel-2026-10-29:BEGIN -->

**Nivel:** técnica.

## Arquitectura del sistema por niveles

Revisión documental: 2026-10-29. Base `b02313f499f6` en `main`; árbol inicialmente limpio. La inspección de fuentes no sustituye pruebas de ejecución.

**Estado y alcance:** Prototipo físico/local con backend modular y documentación de entrega. La demostración o el servidor de prueba no certifican calibración científica ni una API de producción.

### Nivel 1 — Contexto y fronteras de ejecución

```text
[BME280 / DHT22 / SCD4x / GPS]
                |
            [ESP32-S3]
                | HTTP JSON
                v
       [Express: validación / rutas]
                |
        [Store / archivo JSONL]
                |
       [Consulta / exportación]
                |
          [Dashboard web]
```

ESP32-S3 integra BME280, DHT22, SCD4x y GPS; envía mediciones al backend Node/Express, que valida, conserva JSONL y ofrece consulta/visualización/exportación. El circuito, firmware, contrato y datos hacen visible el recorrido de la lectura.

### Nivel 2 — Componentes y responsabilidades

| Componente      | Responsabilidad                     | Fuente                                                    |
| --------------- | ----------------------------------- | --------------------------------------------------------- |
| Firmware        | Captura, fusión y envío de lecturas | [firmware](../firmware)                                   |
| Composición API | Configura store, rutas y errores    | [backend/src/app.js](../backend/src/app.js)               |
| Validación      | Contrato de payload/unidades        | [backend/src/validation.js](../backend/src/validation.js) |
| Store           | Persistencia y ventana de lectura   | [backend/src/store.js](../backend/src/store.js)           |
| Anomalías       | Cambios sospechosos entre lecturas  | [backend/src/anomalias.js](../backend/src/anomalias.js)   |
| Exportación     | Formato y filtrado de series        | [backend/src/export.js](../backend/src/export.js)         |

Las flechas del contexto representan comunicación/flujo. No se deduce una dependencia de código o transacción compartida sólo porque dos componentes intercambien datos.

### Nivel 3 — Dominio, contratos y adaptadores

JSONL en disco y ventana acotada en memoria, no una base con tablas/FKs/RLS. Identificar archivo y permisos sin publicar datos sensibles innecesarios. El almacenamiento depende del host y de su disco; no se presume durable al moverlo a funciones efímeras.

- El contrato exige magnitudes con tipos y unidades explícitas; un campo presente no garantiza una lectura física válida.
- La incertidumbre y el estado GPS deben conservar su significado, sin inventar precisión.
- Una medición sospechosa se señala; no se corrige por conveniencia visual.

Consultar [04-base-de-datos.md](04-base-de-datos.md) para entidades, cardinalidades y representación; [05-motor-o-nucleo-de-negocio.md](05-motor-o-nucleo-de-negocio.md) para invariantes. En un prototipo, las piezas rotuladas propuestas no son clases implementadas.

### Nivel 4 — Despliegue y distribución

**Destino:** Sistema local con ESP32 + Demo web.

```text
[Revisión de fuente] -> [Verificación de su plataforma] -> [Build / artefacto]
                                                                  |
                                                          [Instalación / hosting]
                                                                  |
                                                          [Usuario y sus datos]
```

La persistencia y los servicios del contexto anterior conservan sus propias fronteras. Distribuir un APK no incorpora automáticamente el servidor, una PWA no acredita un instalador y el firmware requiere dispositivo. El capítulo [09-instalacion-y-despliegue.md](09-instalacion-y-despliegue.md) concreta la puesta en marcha.

### Calidad y límites arquitectónicos

- Calibración, deriva y ubicación del sensor
- Cortes de energía/red y archivos de datos
- Exposición de coordenadas o escritura API
- Interpretaciones ambientales sin validación suficiente

No se publican garantías de latencia, disponibilidad o escala sin medición para la revisión/entorno concretos. Un diagrama explica responsabilidades; no es una certificación de ejecución o seguridad del servicio desplegado.

## Fuentes de implementación y contratos

[README.md](../README.md) · [ARCHITECTURE.md](../ARCHITECTURE.md) · [manual-de-usuario.md](../manual-de-usuario.md) · [backend/README.md](../backend/README.md) · [firmware/README.md](../firmware/README.md).
<!-- DOCUMENTACION:nivel-2026-10-29:END -->
