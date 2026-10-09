# Contribuir al proyecto

Revisar [arquitectura](ARCHITECTURE.md), [backend](backend/README.md) y
[firmware](firmware/README.md) antes de cambiar un subsistema. Separar refactors,
contratos nuevos y ajustes del hardware para que se puedan revisar y revertir.

## Entorno y verificaciones

Node 24.21.0 esta fijado en .nvmrc. Desde backend/:

```powershell
npm ci
npm run lint
npm run format:check
npm run test:coverage
```

`npm test` ejecuta la suite sin medir cobertura; `npm run test:watch` ayuda al
editar. `npm run format` aplica Prettier al backend. JavaScript del servidor es
CommonJS y el frontend usa modulos ES nativos. No se necesita bundler.

Las pruebas usan archivos temporales. Para ingesta manual, configurar HOST local
y DATA_FILE absoluto fuera del historico versionado; .env se carga con los
scripts npm. No enviar muestras de prueba a backend/data/mediciones.jsonl.
Tampoco confirmar node_modules, coverage, archivos .env o artefactos de compilacion.

Cobertura: src/ completo, minima 95% lineas, 90% ramas y 95% funciones. El
porcentaje no incluye frontend/firmware y no reemplaza comprobar comportamiento.
Para cambios de UI, verificar carga, vacio, datos antiguos, fallo y recuperacion,
exportacion y vista movil. Conservar DHT22 no observable.

## Firmware

```powershell
arduino-cli compile --profile esp32s3 firmware/EstacionMeteorologica
```

Perfil y versiones en sketch.yaml; configuracion en config.h. Mantener separado
el resultado de compilar del ensayo fisico. Cambios de pines, cadencia, placa,
sensores o red deben comprobarse con montaje y Serial, y documentar que se probo.
No reemplazar valores fisicos como parte de una correccion de texto.

## Cambios y mensajes

Crear una rama descriptiva si hace falta y presentar un PR con el problema,
comportamiento resultante y verificaciones realizadas. Usar mensajes naturales
en español acordes al historial; no se requieren prefijos artificiales. Un cambio
coherente por commit facilita revision. Actualizar CHANGELOG y la guia del
subsistema si cambian comandos, estructura o contrato. No regenerar el informe
academico o modificar datasets como efecto lateral de otra tarea.

CI comprueba instalacion limpia, lint, formato, pruebas y minimos de cobertura.
Su resultado se revisa en la ejecucion del commit correspondiente.
