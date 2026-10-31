# 18 — Escenarios económicos CLP / USD

## Escenarios económicos de Estación Meteorológica

**Finalidad:** presupuestar decisiones futuras, no tasar el repositorio ni declarar costos/ventas históricos. Alcance modelado: **Reproducción del montaje y validación de una serie contra referencia**. Sin precio de venta o servicio de monitoreo contratado. La reserva de materiales es un supuesto de escenario, no el costo histórico del prototipo ni una cotización.

### Moneda y supuestos

Conversión: **USD 1 = CLP 994,29**, valor del **27-10-2026** en la [tabla oficial SII](https://www.sii.cl/valores_y_fechas/dolar/dolar2026.htm), utilizado como referencia para los escenarios de este capítulo. CLP = USD × R; USD = CLP / R, con R = 994,29.

Para valorizar esfuerzo se supone **CLP 15.000/h** (USD 15,09/h). Es una tasa elegida para comparar escenarios, no una tarifa profesional ni un presupuesto de implementación. Rangos de horas, mantenimiento y reservas también son supuestos; no se deducen de SCT, commits o líneas de código.

### Inversión del siguiente alcance

| Concepto                        | Base del escenario                       | CLP                     | USD                   |
| ------------------------------- | ---------------------------------------- | ----------------------- | --------------------- |
| Tiempo del siguiente alcance    | 16–32 h a CLP 15.000/h                   | CLP 240.000–CLP 480.000 | USD 241,38–USD 482,76 |
| Reserva de materiales           | Supuesto; equipo existente no valorizado | CLP 150.000             | USD 150,86            |
| Total de inversión de escenario | No es inversión histórica ni cotización  | CLP 390.000–CLP 630.000 | USD 392,24–USD 633,62 |

### Operación mensual

Servicios obligatorios en el escenario local: USD 0/mes; no significa costo total cero. Equipo, tiempo, consumibles, distribución, almacenamiento y servicios opcionales deben presupuestarse cuando se necesiten.

| Concepto                        | Base                               | CLP/mes    | USD/mes   |
| ------------------------------- | ---------------------------------- | ---------- | --------- |
| Mantenimiento de escenario      | 2 h/mes                            | CLP 30.000 | USD 30,17 |
| Servicios externos de escenario | Ver composición; no factura actual | CLP 0      | USD 0,00  |
| Costo mensual modelado          | Tiempo + servicios                 | CLP 30.000 | USD 30,17 |

No se suman aquí impuestos, comisiones, dominio, sobreconsumo, reposición extraordinaria o equipo no valorizado. Costos de nube por proyecto/organización y cuotas gratuitas deben revisarse para la cuenta concreta. Una cuota de nube no sustituye la arquitectura ni la validación necesarias para escalar.

### Justificación y retorno

Ejemplo **hipotético**, no resultado medido: evitar 1 h/mes a la misma tasa representa CLP 15.000 / USD 15,09 de tiempo valorizado, no ingresos. Frente al costo modelado, el saldo de ese ejemplo es CLP -15.000 / USD -15,09 al mes. El punto de equilibrio por ahorro temporal sería 2.00 h/mes; debe comprobarse con uso real, pérdidas evitadas o un beneficio distinto.

Completitud de series, disponibilidad de adquisición, anomalías y comparación con referencia calibrada; no sólo cantidad de muestras.

ROI sólo se calcula cuando beneficios y costos comparables estén medidos: (beneficio − costo) / costo, indicando período y si el tiempo valorizado realmente se convierte en ahorro. Un costo de caja bajo no acredita rentabilidad ni valor comercial de la idea.

### Sensibilidad y decisión

- Con R ±10 %, cambia en ±10 % el costo CLP de servicios fijados en USD; el gasto local CLP no cambia por ese supuesto.
- Separar creación puntual de mantenimiento recurrente y reserva física de consumo.
- Registrar facturas/uso, horas observadas y aceptación antes de reemplazar estos escenarios por un presupuesto comprometido.
- Las monedas ficticias de un videojuego, saldos de clientes e inventario de una empresa no son ingresos del software.

### Referencias de servicios

[Supabase](https://supabase.com/pricing): Free y Pro desde USD 25/mes; [Vercel](https://vercel.com/pricing): Hobby y Pro desde USD 20/mes. Son referencias consultadas, no planes asignados al proyecto. [Gemini](https://ai.google.dev/gemini-api/docs/pricing) y [Firebase](https://firebase.google.com/pricing) requieren revisar producto/modelo, cuotas y condiciones antes de cuantificar consumo. El plan actual de Lovable u otro proveedor no se deduce de estas tarifas.

## Código y documentación relacionada

[README.md](../README.md) · [ARCHITECTURE.md](../ARCHITECTURE.md) · [manual-de-usuario.md](../manual-de-usuario.md) · [backend/README.md](../backend/README.md) · [firmware/README.md](../firmware/README.md).
