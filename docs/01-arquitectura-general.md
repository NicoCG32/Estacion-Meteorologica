# 01 — Arquitectura por niveles

## Arquitectura del sistema por niveles

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

Las flechas muestran el flujo de información entre componentes. Las transacciones y dependencias de código se detallan en los contratos de cada módulo.

### Nivel 3 — Dominio, contratos y adaptadores

JSONL en disco y ventana acotada en memoria, no una base con tablas/FKs/RLS. Identificar archivo y permisos sin publicar datos sensibles innecesarios. El almacenamiento depende del host y de su disco; no se presume durable al moverlo a funciones efímeras.

- El contrato exige magnitudes con tipos y unidades explícitas; un campo presente no garantiza una lectura física válida.
- La incertidumbre y el estado GPS deben conservar su significado, sin inventar precisión.
- Una medición sospechosa se señala; no se corrige por conveniencia visual.

Consultar [04-base-de-datos.md](04-base-de-datos.md) para entidades, cardinalidades y representación; [05-motor-o-nucleo-de-negocio.md](05-motor-o-nucleo-de-negocio.md) para invariantes. Las piezas marcadas como propuestas pertenecen al diseño del prototipo.

### Nivel 4 — Despliegue y distribución

**Destino:** Sistema local con ESP32 + Demo web.

```text
[Revisión de fuente] -> [Verificación de su plataforma] -> [Build / artefacto]
                                                                  |
                                                          [Instalación / hosting]
                                                                  |
                                                          [Usuario y sus datos]
```

El montaje requiere sensores, firmware y un host para el backend. El almacenamiento JSONL necesita un disco persistente. La demostración del dashboard permite revisar la interfaz sin sustituir la instalación ni la calibración de sensores. El capítulo [09-instalacion-y-despliegue.md](09-instalacion-y-despliegue.md) concreta la puesta en marcha.

### Calidad y límites arquitectónicos

- Calibración, deriva y ubicación del sensor
- Cortes de energía/red y archivos de datos
- Exposición de coordenadas o escritura API
- Interpretaciones ambientales sin validación suficiente

El rendimiento y la capacidad dependen del entorno de ejecución. Consulta las guías de instalación y las limitaciones de cada plataforma antes de desplegar.

## Código y documentación relacionada

[README.md](../README.md) · [ARCHITECTURE.md](../ARCHITECTURE.md) · [manual-de-usuario.md](../manual-de-usuario.md) · [backend/README.md](../backend/README.md) · [firmware/README.md](../firmware/README.md).
