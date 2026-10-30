# 04 — Dominio, entidades y persistencia

<!-- DOCUMENTACION:nivel-2026-10-29:BEGIN -->

**Nivel:** técnica.

## Dominio y representación de datos

Revisión documental: 2026-10-29. Base `b02313f499f6` en `main`; árbol inicialmente limpio. La inspección de fuentes no sustituye pruebas de ejecución.

**Estado y alcance:** Prototipo físico/local con backend modular y documentación de entrega. La demostración o el servidor de prueba no certifican calibración científica ni una API de producción.

### Entidades y conceptos

| Entidad / concepto     | Identidad y significado                    | Representación / estado                       |
| ---------------------- | ------------------------------------------ | --------------------------------------------- |
| Medición               | ID, timestamp, valores y unidades          | JSONL y ventana en memoria                    |
| LecturaSensor          | Observación física previa a la publicación | Firmware; no tabla relacional                 |
| Ubicación              | Latitud/longitud y calidad GPS             | Campos de la medición                         |
| IndicadorSospecha      | Motivos derivados del contraste            | Datos/estado de procesamiento                 |
| Consulta / exportación | Rango temporal y formato                   | Proyección sobre historial; no medición nueva |

### Relaciones de dominio

```text
[Estación] -- produce --> [Medición]
[Medición] -- contiene --> [Magnitudes]
[Medición] -- 0:1 --> [UbicaciónVálida]
[MediciónAnterior] -- contrasta --> [MediciónActual]
```

| Origen           | Cardinalidad / relación | Destino         | Semántica                                                   |
| ---------------- | ----------------------- | --------------- | ----------------------------------------------------------- |
| Estación         | produce                 | Medición        | Flujo del prototipo; no multiestación normalizada prometida |
| Medición         | contiene                | Magnitudes      | Temperatura, humedad, presión y CO2                         |
| Medición         | 0:1                     | UbicaciónVálida | GPS puede no tener fix                                      |
| MediciónAnterior | contrasta               | MediciónActual  | Regla de sospecha no equivale a calibración                 |

### Persistencia y garantías

JSONL en disco y ventana acotada en memoria, no una base con tablas/FKs/RLS. Identificar archivo y permisos sin publicar datos sensibles innecesarios. El almacenamiento depende del host y de su disco; no se presume durable al moverlo a funciones efímeras.

La cardinalidad de dominio no prueba que exista una FK física. Revisar adaptadores/migraciones para identificar qué se valida por esquema, por caso de uso o por lectura. No usar «RLS» para almacenamiento que no dispone de esas políticas.

### Consistencia y evolución

- El contrato exige magnitudes con tipos y unidades explícitas; un campo presente no garantiza una lectura física válida.
- La incertidumbre y el estado GPS deben conservar su significado, sin inventar precisión.
- Una medición sospechosa se señala; no se corrige por conveniencia visual.
- Paginación, exportación y rango temporal no deben modificar el historial.
- El reconocimiento de persistencia debe corresponder al resultado real del almacenamiento y sus errores.

Cambios de formato, referencias y restauración se comprueban con datos de prueba. El respaldo/artefacto debe indicar versión; la documentación no autoriza transformar datos reales ni rebajar un esquema para abrirlo con un ejecutable anterior.

## Fuentes de implementación y contratos

[README.md](../README.md) · [ARCHITECTURE.md](../ARCHITECTURE.md) · [manual-de-usuario.md](../manual-de-usuario.md) · [backend/README.md](../backend/README.md) · [firmware/README.md](../firmware/README.md).
<!-- DOCUMENTACION:nivel-2026-10-29:END -->
