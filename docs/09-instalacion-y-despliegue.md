# 09 — Puesta en marcha y distribución

## Puesta en marcha y distribución por plataforma

**Disponibilidad:** Prototipo de estación física con captura local, backend y dashboard. Su uso como instrumento científico requiere calibración y validación del montaje.

**Destinos:** Sistema local con ESP32 + Demo web.

Montaje/portal con toolchains propios; seguir las versiones y rutas de las guías específicas.

Los comandos de backend, firmware y simulación se describen en las guías relacionadas. Elige la modalidad que corresponda a tu montaje o entorno de demostración.

### Secuencia de puesta en marcha

1. Preparar el runtime/editor y la configuración que indiquen las fuentes enlazadas; usar valores de prueba y restaurar el lockfile apropiado.
2. Ejecutar la modalidad local y sus comprobaciones existentes desde la carpeta indicada por esa guía. No confundir preview web con el runtime nativo o montaje físico.
3. Construir/instalar el artefacto de ese target y comprobar recorrido principal, error relevante y reapertura/actualización antes de declararlo entregado.

Ejecuta los comandos de comprobación antes de distribuir una compilación. Puedes consultar sus resultados remotos en la pestaña Actions del repositorio.

### Datos, servicios y distribución

JSONL en disco y ventana acotada en memoria, no una base con tablas/FKs/RLS. Identificar archivo y permisos sin publicar datos sensibles innecesarios. El almacenamiento depende del host y de su disco; no se presume durable al moverlo a funciones efímeras.

El montaje requiere sensores, firmware y un host para el backend. El almacenamiento JSONL necesita un disco persistente. La demostración del dashboard permite revisar la interfaz sin sustituir la instalación ni la calibración de sensores.

GitHub Releases distribuye los archivos de cada versión. Los servicios de servidor se despliegan por separado; consulta la guía de la plataforma para instalar o alojar la aplicación.

### Recuperación

Conservar el artefacto anterior y su procedencia. Retroceder código no revierte automáticamente datos o migraciones. Revisar compatibilidad de guardado/snapshot y restauración antes de instalar una versión antigua. Consulta las notas de la versión para conocer los requisitos y límites de la entrega.

## Código y documentación relacionada

[README.md](../README.md) · [ARCHITECTURE.md](../ARCHITECTURE.md) · [manual-de-usuario.md](../manual-de-usuario.md) · [backend/README.md](../backend/README.md) · [firmware/README.md](../firmware/README.md).
