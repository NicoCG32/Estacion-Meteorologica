# 00 — Problemática, cliente y solución

<!-- DOCUMENTACION:nivel-2026-10-29:BEGIN -->

**Nivel:** general.

## Síntesis general — Estación Meteorológica

Revisión documental: 2026-10-29. Base `b02313f499f6` en `main`; árbol inicialmente limpio. La inspección de fuentes no sustituye pruebas de ejecución.

**Estado y alcance:** Prototipo físico/local con backend modular y documentación de entrega. La demostración o el servidor de prueba no certifican calibración científica ni una API de producción.

### Problemática

Las lecturas ambientales aisladas no permiten observar tendencias ni relacionar calidad del aire con contexto y tiempo. Para aprendizaje y observación local se necesita integrar captura, unidades, almacenamiento y visualización sin confundir un sensor de bajo costo con instrumentación certificada.

### Cliente, usuario y beneficiario

| Perfil            | Contexto                                       | Necesidad                                                          |
| ----------------- | ---------------------------------------------- | ------------------------------------------------------------------ |
| Usuario académico | Estudiante y equipo del prototipo              | Comprender y verificar el ciclo completo de medición               |
| Observador local  | Persona que consulta un espacio instrumentado  | Ver historia y estado de sensores                                  |
| Cliente potencial | Laboratorio educativo o responsable de espacio | Requiere calibración y validación adicional antes de uso operativo |

### Solución y límites

ESP32-S3 integra BME280, DHT22, SCD4x y GPS; envía mediciones al backend Node/Express, que valida, conserva JSONL y ofrece consulta/visualización/exportación. El circuito, firmware, contrato y datos hacen visible el recorrido de la lectura.

### Por qué corresponde al problema

| Fricción / necesidad  | Mecanismo de la solución                                                             |
| --------------------- | ------------------------------------------------------------------------------------ |
| Lecturas inconexas    | Un contrato común añade contexto temporal y unidades                                 |
| Ausencia de historial | JSONL y exportación permiten consultar series sin una infraestructura grande         |
| Resultados dudosos    | Validación y reglas de sospecha exponen anomalías en lugar de tratarlas como certeza |

### Validación pendiente o continua

Completitud de series, disponibilidad de adquisición, anomalías y comparación con referencia calibrada; no sólo cantidad de muestras.

La motivación del creador se presenta en [16-motivacion-y-contexto.md](16-motivacion-y-contexto.md); el análisis de costos y proyección se separa en [18-analisis-economico-clp-usd.md](18-analisis-economico-clp-usd.md). Afinidad personal, un prototipo o cercanía con una organización no equivalen a demanda/venta demostrada.

## Fuentes de implementación y contratos

[README.md](../README.md) · [ARCHITECTURE.md](../ARCHITECTURE.md) · [manual-de-usuario.md](../manual-de-usuario.md) · [backend/README.md](../backend/README.md) · [firmware/README.md](../firmware/README.md).
<!-- DOCUMENTACION:nivel-2026-10-29:END -->
