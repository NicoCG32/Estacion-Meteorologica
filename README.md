<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="branding/estacion-meteorologica-banner.png" />
  <img src="branding/estacion-meteorologica-banner.png" alt="Identidad visual de EstacionMeteorologica" width="100%" />
</picture>

# Estación Meteorológica

**Del sensor al dato: monitoreo ambiental de bajo costo.**

[![Estado: Prototipo académico](https://img.shields.io/badge/Estado-Prototipo%20acad%C3%A9mico-267C6B?style=flat-square&labelColor=263244)](#sobre-el-proyecto) [![Plataforma: ESP32 / Web](https://img.shields.io/badge/Plataforma-ESP32%20%2F%20Web-386B8F?style=flat-square&labelColor=263244)](#usar-o-descargar) [![Licencia: ISC](https://img.shields.io/badge/Licencia-ISC-596273?style=flat-square&labelColor=263244)](LICENSING.md)

[![ESP32 S3](https://img.shields.io/badge/ESP32%20S3-B42B2B?style=for-the-badge&logo=espressif&logoColor=FFFFFF)](#tecnologías) [![Arduino](https://img.shields.io/badge/Arduino-007D85?style=for-the-badge&logo=arduino&logoColor=FFFFFF)](#tecnologías) [![Node.js 24](https://img.shields.io/badge/Node.js%2024-356D32?style=for-the-badge&logo=nodedotjs&logoColor=FFFFFF)](#tecnologías) [![Express 5](https://img.shields.io/badge/Express%205-20232A?style=for-the-badge&logo=express&logoColor=FFFFFF)](#tecnologías)

[Documentación](docs/README.md) · [Arquitectura](docs/01-arquitectura-general.md) · [Inicio rápido](#ejecutar-desde-el-código)

</div>

---

## Sobre el proyecto

Prototipo universitario de monitoreo ambiental: un ESP32-S3 captura mediciones, un backend Node.js las almacena y una interfaz web permite consultarlas y exportarlas. Incluye firmware, diagramas e informes del curso.

**Estado:** Prototipo con modos de desarrollo y dispositivo real. No hay instaladores publicados en GitHub Releases; la puesta en marcha se realiza desde el código y el montaje.

## Tecnologías

| Área              | Tecnologías y responsabilidad                                     |
| ----------------- | ----------------------------------------------------------------- |
| **Dispositivo**   | ESP32-S3, C++/Arduino y sensores BME280, DHT22, SCD4x y GPS.      |
| **Backend**       | Node.js 24 y Express 5; recepción HTTP y almacenamiento JSONL.    |
| **Visualización** | Dashboard web en HTML/CSS/JavaScript y exportación de mediciones. |

> **Enfoque técnico:** Firmware, recepción de datos y visualización como módulos independientes.

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

[Identidad visual](branding/README.md): logos, banners y variantes de aplicación.

## Licencia y créditos

Código propio bajo [ISC](LICENSE). [Créditos, terceros y condiciones de reutilización](LICENSING.md).
