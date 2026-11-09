<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="branding/banners/estacion-meteorologica-banner.png" />
  <img src="branding/banners/estacion-meteorologica-banner.png" alt="Estación Meteorológica: sensor, datos y visualización" width="100%" />
</picture>

# Estación Meteorológica

**Del sensor al dato: monitoreo ambiental de bajo costo.**

[![Estado: Prototipo local](https://img.shields.io/badge/Estado-Prototipo%20local-4E7657?style=flat-square)](#resumen-ejecutivo) [![Origen: UCN](https://img.shields.io/badge/Origen-UCN%20%C2%B7%202025-3B687D?style=flat-square)](docs/academica/README.md) [![Licencia: ISC](https://img.shields.io/badge/C%C3%B3digo-ISC-665F79?style=flat-square)](LICENSING.md)

[![ESP32 S3](https://img.shields.io/badge/ESP32%20S3-B42B2B?style=for-the-badge&logo=espressif&logoColor=FFFFFF)](#qué-incluye) [![Arduino](https://img.shields.io/badge/Arduino-007D85?style=for-the-badge&logo=arduino&logoColor=FFFFFF)](#qué-incluye) [![Node.js 24](https://img.shields.io/badge/Node.js%2024-356D32?style=for-the-badge&logo=nodedotjs&logoColor=FFFFFF)](#ejecutar-la-parte-web) [![Express 5](https://img.shields.io/badge/Express%205-20232A?style=for-the-badge&logo=express&logoColor=FFFFFF)](#qué-incluye)

[Documentación](docs/README.md) · [Arquitectura](docs/tecnica/01-arquitectura.md) · [Manual de uso](manual-de-usuario.md) · [Estudio económico](docs/desarrollo/03-viabilidad-economica-y-sostenibilidad.md) · [Informe académico](docs/academica/README.md)

</div>

## Resumen ejecutivo

Estación Meteorológica es un prototipo educativo de monitoreo ambiental. Un ESP32-S3 captura temperatura, humedad, presión, CO₂ y posición GPS; un servidor local valida y guarda las mediciones en JSONL, y un panel web permite consultar series, reconocer cambios bruscos y exportar datos en CSV o JSONL.

El proyecto permite estudiar el recorrido completo de una medición, desde el sensor hasta su análisis. Su alcance actual es local y experimental; para uso científico o en exteriores requiere calibración y ensayos del montaje.

## Estado real del proyecto

| Nivel | Qué significa en esta versión |
| --- | --- |
| ✅ **Implementado** | Prototipo de firmware para captura ambiental, servidor local para mediciones y panel web con series y exportación de datos. |
| 🧪 **En validación** | Calibración de sensores, precisión, estabilidad del montaje y funcionamiento continuado fuera de condiciones de laboratorio. |
| 🧭 **Posible evolución** | Uso científico o en exteriores después de completar calibración, ensayos de campo y validaciones independientes; no se declara como estación certificada. |

<details>
<summary><strong>Cómo leer este estado</strong></summary>

Una función **implementada** existe en el código o en los artefactos del proyecto, pero eso no acredita automáticamente todas sus pruebas. «En validación» identifica capacidades todavía sujetas a comprobaciones; «pendiente» no es una promesa de entrega. El alcance se contrasta con el código, los informes originales y las releases de cada versión.

</details>

## Origen

El proyecto nació como trabajo grupal de **Ingeniería y Desarrollo Sustentable** en la Universidad Católica del Norte, orientado a la Región de Coquimbo. Diseñé el circuito y programé el firmware Arduino durante la asignatura; después desarrollé el backend y el frontend web actuales como continuación personal. El [contexto académico y los créditos](docs/academica/README.md) describen las contribuciones del equipo y reúnen el informe final de 2025.

## Qué incluye

| Capa         | Implementación                                                                            |
| ------------ | ----------------------------------------------------------------------------------------- |
| Captura      | ESP32-S3 con BME280, DHT22, SCD4x y GPS; lectura, agregación y filtro de cambios bruscos. |
| Comunicación | Punto de acceso Wi-Fi del ESP32 y envío HTTP JSON al PC.                                  |
| Servidor     | Node.js 24 y Express 5; recepción, validación y registro de mediciones.                   |
| Persistencia | Archivo JSONL y ventana de hasta 1000 registros en memoria.                               |
| Consulta     | Dashboard HTML/CSS/JavaScript con indicadores, gráficos y exportación CSV/JSONL.          |

El firmware actual no mide PM₂.₅/PM₁₀. La alimentación solar del esquema es una propuesta de diseño; el sistema funciona en red local y su API carece de autenticación. Consulta las [funciones y limitaciones](docs/general/02-estado-del-prototipo.md).

## ¿Por qué puede convenir y cuándo sería rentable?

El valor que podemos defender hoy no es reemplazar una estación oficial: es **aprender y enseñar sensórica, IoT, validación y análisis de series** con una base documentada, código abierto y funcionamiento local, sin dependencia obligatoria de una plataforma cloud. **La rentabilidad comercial no está demostrada.** Una venta de hardware aislada puede tener poco margen; un kit con formación, un proyecto de laboratorio o un servicio de integración y mantenimiento podrían resultar más sostenibles **si se comprueban costos y demanda**.

El informe universitario de 2025 estimó **CLP $100.000–$150.000 por estación piloto** para componentes y materiales, **sin facturas ni costo total de fabricación**. Tampoco incorpora de manera verificable toda la mano de obra, soporte, calibración o operación. El [estudio de viabilidad](docs/desarrollo/03-viabilidad-economica-y-sostenibilidad.md) incluye fórmulas de margen y punto de equilibrio, escenarios **expresamente hipotéticos**, una evaluación de energía/PC y propuestas de modelos de servicio. El [plan de pilotos](docs/desarrollo/04-pilotos-y-modelos-de-servicio.md) distingue educación, laboratorio y eventual monitoreo indicativo.

**Calidad antes de ingresos:** el archivo histórico `backend/data/mediciones.jsonl` incluye **43 registros** de aproximadamente 15 minutos del 6 de diciembre de 2025; **tres** tienen temperatura **181,39 °C** y presión **−130,8 hPa**, fuera de los rangos actuales de admisión. Es evidencia de la importancia de validar el dato, **no de precisión o continuidad demostradas**. [Análisis reproducible y experimentos pendientes](docs/tecnica/08-evidencia-y-validacion-experimental.md).

## Ejecutar la parte web

Requiere **Node.js >=24.21.0 y <25**, con npm. Desde la raíz del repositorio:

```bash
cd backend
npm ci
npm run start:dev
```

Abre [localhost:3002](http://localhost:3002). El modo de desarrollo muestra el archivo configurado y recibe mediciones por POST; no genera muestras automáticamente. Antes de enviar datos de prueba, configura un `DATA_FILE` independiente en `backend/.env`, siguiendo [`.env.example`](backend/.env.example).

Para recibir datos del ESP32, usa `npm run start:esp32` (puerto predeterminado 3001) y configura la red y la URL del firmware. Sigue la [guía de uso](docs/general/03-uso-y-recorrido.md), el [montaje](firmware/README.md) y la [configuración del backend](backend/README.md).

## Documentación

| Área                                                   | Contenido                                                 |
| ------------------------------------------------------ | --------------------------------------------------------- |
| [General](docs/general/01-proposito-y-alcance.md)      | Propósito, funciones y uso.                               |
| [Técnica](docs/tecnica/01-arquitectura.md)             | Arquitectura, hardware, datos, API, algoritmos y validación experimental. |
| [Desarrollo](docs/desarrollo/01-evolucion-y-metodo.md) | Decisiones, costos, sostenibilidad y pilotos.             |
| [Académica](docs/academica/README.md)                  | Informe original, créditos y contraste con el software actual. |

[Índice completo](docs/README.md) · [Lectura crítica del LaTeX](docs/academica/02-lectura-critica-del-informe.md) · [Identidad visual](branding/README.md) · [Contribuir](CONTRIBUTING.md) · [Historial de cambios](CHANGELOG.md).

## Licencia y créditos

Código propio bajo [ISC](LICENSE). Los informes, imágenes, bibliotecas y recursos de terceros conservan sus condiciones. Consulta [licencia, créditos y reutilización](LICENSING.md).
