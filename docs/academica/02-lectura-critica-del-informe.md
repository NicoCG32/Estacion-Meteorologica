# 02 · Lectura crítica del informe universitario de 2025

[← Académica](README.md) · [Informe LaTeX original](../informe/informe.tex) · [Evidencia experimental](../tecnica/08-evidencia-y-validacion-experimental.md) · [Economía y sostenibilidad](../desarrollo/03-viabilidad-economica-y-sostenibilidad.md)

> **Documento posterior de interpretación — 8 de noviembre de 2026.** El informe final de la asignatura, fechado el **6 de diciembre de 2025**, se conserva **sin alterar**, tanto su fuente LaTeX como el PDF. Esta lectura contrasta la propuesta del curso con el código y los registros disponibles después. **No corrige retroactivamente el trabajo de sus seis autores** ni atribuye al equipo mejoras desarrolladas posteriormente.

## El punto de partida y los seis participantes

**Trabajo:** *Estación Meteorológica de Código Abierto para la Región de Coquimbo*; asignatura **Ingeniería y Desarrollo Sustentable**, **Universidad Católica del Norte**.

| Autoría del informe final 2025 | Carrera declarada en LaTeX |
| --- | --- |
| Martín Avilés | Ingeniería Civil Industrial (ICI) |
| Javiera Carpio | Ingeniería Civil Industrial (ICI) |
| Óscar Merino | Ingeniería Civil en Computación e Informática (ICCI) |
| Francisco Contreras | Ingeniería Civil Industrial (ICI) |
| Pablo Guzmán | Ingeniería Civil en Computación e Informática (ICCI) |
| Jorge Vicencio | Ingeniería Civil Industrial (ICI) |

La autoría colectiva del **informe** no implica que todos hayan escrito firmware, software o circuitos. Según el [registro de contribuciones vigente](README.md), **Pablo Guzmán** diseñó circuito y programó firmware Arduino en el período académico; **Óscar Merino** construyó la maqueta; **Jorge Vicencio y Francisco Contreras** trabajaron en simulación AnyLogic y frontend básico para la entrega; **Martín Avilés y Javiera Carpio** se enfocaron principalmente en informes/reportes y presentación. **Todos participaron en la labor académica** de acuerdo con el documento existente. El backend y frontend **actuales** son una continuación personal posterior de Pablo, que no debe confundirse con el frontend de la entrega.

**No inferir derechos legales exclusivos ni reparto de autoría intelectual a partir del perfil que aloja GitHub.** Si se plantea una explotación de materiales académicos grupales, identificar qué componente pertenece a quién y verificar permisos. [Licencias del repositorio](../../LICENSING.md).

## Del informe a la realidad actual

| Tema en el informe de 2025 | Qué decía / proponía | Estado corroborado del repositorio |
| --- | --- | --- |
| **Prototipo muestral de interior** | Entrega demostrativa, sin campo; no estación oficial | Firmware, esquema, backend y frontend locales disponibles; no evidencia de certificación o campo |
| **Variables meteorológicas y CO₂** | Temperatura, humedad, presión, CO₂ y GPS | Código de BME280, DHT22, SCD4x y GPS presente |
| **PM₂.₅ / PM₁₀** | Sensor óptico en descripción, objetivos y propuesta de alcance | **No implementados** en firmware/API actuales; no informar medición de partículas |
| **Solar** | Prefactibilidad, diseño, autonomía futura | No ensayada ni instalada como suministro validado |
| **Piloto UCN Campus Guayacán** | Localización **propuesta** en esquema | No existe prueba de instalación permanente o autorización del campus |
| **Datos y backend** | Captura local y formatos de registro, propuestas de QA/QC | API Express, JSONL, dashboard, tests; implementación posterior no igual a entrega original |
| **≥95 % de completitud por 2–4 h** | Objetivo y criterio de aceptación | No hay log de sesión validado que demuestre su cumplimiento |
| **$100.000–$150.000 CLP por estación** | Estimación de componentes y materiales | **No BOM cotizada con comprobantes**; no rentabilidad ni costo operativo completo |
| **Huella de carbono 15–20 kg CO₂e/año** | Estimación preliminar del trabajo | Sin inventario reproducible de ciclo de vida que permita tratarla como medida verificada |
| **Licencias MIT/AGPL, datos CC BY/ODbL** | Alternativas propuestas para una apertura futura | El código propio actual tiene **ISC**; no existe una licencia de hardware/datos general acreditada que sustituya derechos de terceros |
| **Organización, ciencia ciudadana y municipio** | Roles y coordinación estratégica propuestos | No hay empresa constituida, contratos, programas ejecutados o red comunitaria operativa acreditados |

**La diferencia entre objetivo e implementación no desacredita el informe.** Un trabajo universitario puede plantear un futuro más amplio que su maqueta; el error sería describir hoy cada objetivo como un logro o como una prestación comercial certificada.

## La observación experimental que faltaba en la documentación

En el archivo [`mediciones.jsonl`](../../backend/data/mediciones.jsonl) hay **43 registros** con timestamp de servidor entre las **14:09:18.058Z y 14:24:10.090Z del 6-12-2025**. Los ID **26–28** presentan temperatura **181,39 °C** y presión **−130,8 hPa**, incompatibles con los rangos del validador actual. El archivo contiene valores históricos que deben conservarse, **no una serie calibrada**.

La documentación [analiza ese archivo y propone experimentos](../tecnica/08-evidencia-y-validacion-experimental.md), sin declarar que se hicieron ensayos nuevos. Para demostrar el 95 % de completitud del informe haría falta identificar intentos esperados, duración controlada, pérdidas, filtrados, reinicios y fuente de cronometraje.

## Rentabilidad que el informe apenas aborda

El informe tiene una justificación de **conveniencia social y ambiental** respaldada por la problemática territorial y la educación abierta. Sin embargo, la cifra **$100.000–$150.000** corresponde a un **monto histórico orientativo**. No hay un estado de resultados, costo total unitario, mano de obra, amortización, precio contratado, margen, flujo de caja, retorno ni punto de equilibrio medido.

En lugar de añadir cifras ficticias al trabajo original, se redactó un [estudio económico separado](../desarrollo/03-viabilidad-economica-y-sostenibilidad.md): canales posibles de entrega, sensibilidad de ingresos/costos expresamente **hipotéticos**, condición para rentabilidad y necesidades de medición. También hay un [plan de pilotos](../desarrollo/04-pilotos-y-modelos-de-servicio.md) centrado inicialmente en educación y laboratorios, no en asumir ventas municipales.

## Qué significa «código abierto» en el estado actual

La licencia [ISC](../../LICENSE) del código propio permite uso, copia, modificación y distribución bajo sus condiciones, **también para fines comerciales**. El texto del informe mencionaba alternativas como MIT o AGPL en su fase de planificación; **no son la licencia vigente**. El esquema del hardware, imágenes, informe grupal, dependencias Arduino y componentes de terceros pueden tener otros titulares o términos: **no asumir que ISC se extiende automáticamente a ellos**.

El acceso a datos históricos y su eventual publicación requieren además evaluar procedencia, coordenadas y significado. El hecho de que una muestra esté versionada en GitHub no demuestra consentimiento, atribución, calibración ni una política formal de datos abiertos. [Condiciones actuales](../../LICENSING.md).

## Cómo citar correctamente el proyecto en un portafolio

> **Estación Meteorológica — UCN (2025, proyecto grupal; continuación personal posterior).** Proyecto educativo de sensórica ambiental basado en ESP32-S3. Durante la asignatura participé con el diseño del circuito y el firmware Arduino; posteriormente desarrollé la API local en Node.js/Express y su panel de consulta/exportación. La entrega original contó con seis autores y un prototipo muestral. La validación física de precisión, autonomía y campo sigue pendiente.

Esta formulación **no** presenta los aportes de terceros como propios, no inventa una estación profesional instalada y reconoce la continuidad real del desarrollo.

[Créditos completos](README.md) · [Hardware y firmware](../tecnica/02-hardware-y-firmware.md) · [Viabilidad](../desarrollo/03-viabilidad-economica-y-sostenibilidad.md).
