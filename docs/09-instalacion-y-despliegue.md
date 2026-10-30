# 09 — Puesta en marcha y distribución

<!-- DOCUMENTACION:nivel-2026-10-29:BEGIN -->

**Nivel:** técnica.

## Puesta en marcha y distribución por plataforma

Revisión documental: 2026-10-29. Base `b02313f499f6` en `main`; árbol inicialmente limpio. La inspección de fuentes no sustituye pruebas de ejecución.

**Estado y alcance:** Prototipo físico/local con backend modular y documentación de entrega. La demostración o el servidor de prueba no certifican calibración científica ni una API de producción.

**Destinos:** Sistema local con ESP32 + Demo web.

Montaje/portal con toolchains propios; seguir las versiones y rutas de las guías específicas.

Consultar comandos de backend/firmware/mock en las fuentes específicas. La carpeta de trabajo y toolchain dependen de la modalidad. No inventar un build Node en un portal estático.

### Secuencia de puesta en marcha

1. Preparar el runtime/editor y la configuración que indiquen las fuentes enlazadas; usar valores de prueba y restaurar el lockfile apropiado.
2. Ejecutar la modalidad local y sus comprobaciones existentes desde la carpeta indicada por esa guía. No confundir preview web con el runtime nativo o montaje físico.
3. Construir/instalar el artefacto de ese target y comprobar recorrido principal, error relevante y reapertura/actualización antes de declararlo entregado.

Los comandos se enumeran desde archivos presentes; esta actualización documental no los ejecuta de nuevo ni certifica sus resultados. Estado de pruebas y CI se informa por revisión/fecha, separado de capacidades propuestas.

### Datos, servicios y distribución

JSONL en disco y ventana acotada en memoria, no una base con tablas/FKs/RLS. Identificar archivo y permisos sin publicar datos sensibles innecesarios. El almacenamiento depende del host y de su disco; no se presume durable al moverlo a funciones efímeras.

Para APK: application ID estable, versión/código creciente, firma privada preservada, permisos y prueba en dispositivo; adjuntar APK y SHA-256 a la release. Para escritorio: distinguir portable/instalador y dependencias. Para web: base/rutas, servidor/servicios y cambio de origen. Para firmware: dispositivo, cableado, compilación y prueba física separados. Aplicar sólo los targets aprobados.

GitHub Releases no aloja el backend ni convierte un ZIP de fuentes en instalador. No hacer push como parte de una revisión documental: en proyectos con publicación automática desde main, ese push puede generar una nueva APK o despliegue.

### Recuperación

Conservar el artefacto anterior y su procedencia. Retroceder código no revierte automáticamente datos o migraciones. Revisar compatibilidad de guardado/snapshot y restauración antes de instalar una versión antigua. La aceptación debe identificar archivo/URL, commit, target, fecha y limitaciones.

## Fuentes de implementación y contratos

[README.md](../README.md) · [ARCHITECTURE.md](../ARCHITECTURE.md) · [manual-de-usuario.md](../manual-de-usuario.md) · [backend/README.md](../backend/README.md) · [firmware/README.md](../firmware/README.md).
<!-- DOCUMENTACION:nivel-2026-10-29:END -->

<!-- DOCUMENTACION:evidencia-ci-2026-10-29:BEGIN -->

## Estado remoto consultado el 29 de octubre de 2026

Consulta para el commit `b02313f499f660991dc05b0b8252be7bce9b3d33`. Se leyó GitHub Actions; no se ejecutó de nuevo la aplicación ni se repitieron sus pruebas.

| Workflow        | Estado    | Resultado | Evidencia                                                                                      |
| --------------- | --------- | --------- | ---------------------------------------------------------------------------------------------- |
| Backend quality | completed | success   | [Run 39507279384](https://github.com/NicoCG32/Estacion-Meteorologica/actions/runs/39507279384) |

<!-- DOCUMENTACION:evidencia-ci-2026-10-29:END -->
