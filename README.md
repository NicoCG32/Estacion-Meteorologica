# Estación Meteorológica

Prototipo universitario de monitoreo ambiental: un ESP32-S3 captura mediciones, un backend Node.js las almacena y una interfaz web permite consultarlas y exportarlas. Incluye firmware, diagramas e informes del curso.

**Estado:** Prototipo con modos de desarrollo y dispositivo real. No hay instaladores publicados en GitHub Releases; la puesta en marcha se realiza desde el código y el montaje.

## Usar o descargar

[Manual de usuario](manual-de-usuario.md) · [Montaje y firmware](firmware/README.md) · [API y backend](backend/README.md).

## Ejecutar desde el código

Con Node.js 24.21+ dentro de la rama 24, desde la raíz:

```sh
cd backend
npm ci
npm run start:dev
```

Abre [localhost:3002](http://localhost:3002). Este modo sirve para desarrollo; para recibir el ESP32 y configurar sensores, sigue las guías del backend y firmware.

## Documentación

[Índice completo y rutas de lectura](docs/README.md) · [Uso y operación](manual-de-usuario.md).

| Tipo                | Lectura                                                                                                                                                                          |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| General             | [Problema, cliente y solución](docs/00-problematica-cliente-y-valor.md) · [Motivación](docs/16-motivacion-y-contexto.md)                                                         |
| Técnica             | [Arquitectura y diagramas](docs/01-arquitectura-general.md) · [Dominio y datos](docs/04-base-de-datos.md)                                                                        |
| Desarrollo          | [Etapas y metodología](docs/17-desarrollo-y-metodologia.md) · [Proyección](docs/15-escalabilidad-y-nuevos-mercados.md) · [Costos CLP/USD](docs/18-analisis-economico-clp-usd.md) |
| Académica/formativa | [Contexto e informes originales](docs/academica/README.md)                                                                                                                       |

## Licencia y créditos

Código propio bajo [ISC](LICENSE). [Créditos, terceros y condiciones de reutilización](LICENSING.md).
