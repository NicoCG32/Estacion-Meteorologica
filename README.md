# Estacion meteorologica

Proyecto universitario de una estacion meteorologica y de calidad del aire de bajo costo. Usa un ESP32-S3 para capturar mediciones (temperatura, humedad, presion, CO2 y material particulado), un backend Node.js para recibir y almacenar datos, y una interfaz web simple para visualizarlos. Incluye documentacion tecnica, manual de usuario e informe en LaTeX.

## Estructura

- backend/: servidor Node.js, API y pagina web
- firmware/: codigo del ESP32-S3 (Arduino)
- docs/informe/: informe en LaTeX
- manual-de-usuario.md: guia de uso para usuarios finales

## Estructura del informe

- docs/informe/informe.tex: fuente principal del informe
- docs/informe/logos.sty: estilo y encabezados
- docs/informe/Figuras/: figuras del informe
- docs/informe/compile-informe.bat: compilacion automatizada en Windows

## Inicio rapido

1) Backend y pagina web
- Ir a backend/
- npm install
- npm start
- Abrir http://localhost:3001/

2) Firmware
- Abrir firmware/EstacionMeteorologica.ino en Arduino IDE
- Configurar pines y BACKEND_URL segun tu red
- Cargar al ESP32-S3

## Documentacion

- manual-de-usuario.md: instrucciones completas (hardware, carga de datos y visualizacion)
- backend/README.md: endpoints y formato de datos
- firmware/README.md: cableado, sensores y configuracion
- docs/informe/README.md: compilacion del informe
