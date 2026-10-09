# Changelog

Cambios relevantes del proyecto. Las entradas nuevas se agrupan en Unreleased
hasta que se publique una version. La version 1.0.0 declarada en el backend no
establece por si sola una fecha de lanzamiento.

## [Unreleased]

### Added

- Modulos nativos para consultas, estado, renderizado, graficos y controles de
  exportacion; avisos de carga, ausencia de datos, consulta fallida y vigencia.
- Boton de actualizacion manual y pruebas de estado/cliente del frontend.
- Perfil Arduino con placa/core/librerias fijados, config.h y guias de
  arquitectura y contribucion independientes.
- Cobertura nativa de src/ con minimos 95/90/95 para lineas/ramas/funciones,
  control de todos los modulos, informes LCOV/JSON/SVG y resumen/artefactos en CI.
- Badges de CI y politica minima de cobertura; pruebas de almacenamiento al
  iniciar, historial no estructurado, ID limite, cierre y solicitudes interrumpidas.
- Validacion de ingesta con campos permitidos, limites y soporte de sensores
  sin muestras; errores JSON consistentes, paginacion offset/order y logs JSON
  controlados por LOG_LEVEL.
- Pruebas con el runner nativo de Node.js y comandos `test`/`test:watch`;
  caracterizacion HTTP y pruebas de umbrales, CSV y fechas con datos temporales.
- Prettier y ESLint con versiones fijadas y comandos de formato, comprobacion
  de formato y lint; configuraciones separadas para servidor y navegador.
- Workflow de GitHub Actions para instalacion limpia, lint, formato y pruebas en push/PR.
- Reglas de Git para conservar finales de linea LF en texto y CRLF en scripts Windows.
- Texto de licencia ISC en la raiz, coherente con los metadatos del backend.
- Configuracion de edicion comun mediante `.editorconfig`, con CRLF para scripts
  Windows y conservacion de espacios significativos en Markdown.
- Version de Node.js reproducible en `.nvmrc` y rango de soporte en el backend.
- Ejemplo de variables PORT, HOST y DATA_FILE para configuracion local.

### Changed

- Sketch en firmware/EstacionMeteorologica/ para compilar con Arduino IDE/CLI;
  configuracion extraida sin cambiar pines, intervalos o umbrales.
- Etiquetas y comentarios de agregacion corregidos a intervalo de 20 s; graficos
  de 60 mediciones y estados de sensores basados en vigencia, sin diagnostico de DHT22.
- POST confirma escritura y cierre antes del 201; cola serializada, ID por encima
  del historico y restauracion de escrituras parciales con bloqueo si falla.
- Exportaciones respetan backpressure, cancelacion y errores de lectura; fechas
  invalidas/repetidas y rangos invertidos se rechazan.
- Metadatos y campos extra del cliente se rechazan; limit solo acepta enteros
  completos. CO2=0 representa ausencia y no dispara anomalías.
- Backend separado en almacenamiento, exportacion, anomalias, rutas y
  configuracion; arranque compartido entre dev y ESP32, conservando la API y puertos.
- Formato uniforme en el backend y sus recursos frontend; eliminacion de tres
  variables de catch sin uso y uso de const para la referencia a mediciones.
- Los scripts npm cargan `.env` opcionalmente con el soporte nativo de Node.js.
- Instalacion reproducible con `npm ci` en la guia backend y scripts Windows;
  los scripts detienen el arranque si la instalacion falla.
- Guia de arranque con runtime, precedencia de variables y archivo de datos
  independiente para pruebas.

### Fixed

- Dependencias transitivas body-parser, path-to-regexp, proxy-addr y qs actualizadas
  en el lockfile para resolver los avisos detectados por npm audit.
