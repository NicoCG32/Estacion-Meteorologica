# Documentación — Estación Meteorológica

La documentación se organiza en cuatro áreas: propósito y uso, implementación técnica, desarrollo y contexto académico. El informe de 2025 reúne la entrega universitaria; las guías técnicas describen la versión actual.

| Área           | Para qué sirve                                                                 | Leer primero                                             |
| -------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------- |
| **General**    | Conocer propósito, funciones y recorrido de uso sin entrar en el código.       | [Propósito y alcance](general/01-proposito-y-alcance.md) |
| **Técnica**    | Entender hardware, firmware, APIs, persistencia, algoritmos, flujos y estados. | [Arquitectura](tecnica/01-arquitectura.md)               |
| **Desarrollo** | Saber qué se decidió, qué está verificado y qué falta.                         | [Evolución](desarrollo/01-evolucion-y-metodo.md)         |
| **Académica**  | Consultar el informe grupal original, su contexto y atribuciones.              | [Material formativo](academica/README.md)                |

## Recorridos recomendados

**Primera visita:** [propósito](general/01-proposito-y-alcance.md) → [funciones y límites](general/02-estado-del-prototipo.md) → [uso](general/03-uso-y-recorrido.md).

**Para operar el prototipo:** [uso](general/03-uso-y-recorrido.md) → [firmware](tecnica/02-hardware-y-firmware.md) → [API y red](tecnica/04-api-y-seguridad.md) → [pruebas](tecnica/07-verificacion.md).

**Para estudiar o modificar el código:** [arquitectura](tecnica/01-arquitectura.md) → [modelo de datos](tecnica/03-datos-y-persistencia.md) → [reglas](tecnica/06-calidad-y-algoritmos.md) → [flujos](tecnica/05-flujos-y-estados.md).

## Índice completo

### General

- [01 · Propósito, origen y alcance](general/01-proposito-y-alcance.md)
- [02 · Qué funciona y qué no](general/02-estado-del-prototipo.md)
- [03 · Recorrido de uso](general/03-uso-y-recorrido.md)

### Técnica

- [01 · Arquitectura en contexto, contenedores y componentes](tecnica/01-arquitectura.md)
- [02 · Montaje, sensores y firmware](tecnica/02-hardware-y-firmware.md)
- [03 · Dominio, datos y persistencia JSONL](tecnica/03-datos-y-persistencia.md)
- [04 · API, configuración y fronteras de seguridad](tecnica/04-api-y-seguridad.md)
- [05 · Flujos, secuencias y máquinas de estado](tecnica/05-flujos-y-estados.md)
- [06 · Agregación, validación y anomalías](tecnica/06-calidad-y-algoritmos.md)
- [07 · Pruebas y evidencia de verificación](tecnica/07-verificacion.md)

### Desarrollo

- [01 · Evolución y forma de trabajo](desarrollo/01-evolucion-y-metodo.md)
- [02 · Prioridades y posibilidades futuras](desarrollo/02-prioridades.md)

### Académica

- [Contexto y autores del informe](academica/README.md)
- [Informe PDF de la asignatura](informe/informe.pdf) · [Fuente LaTeX](informe/informe.tex) · [Figuras originales](informe/figuras/)

## Guías y recursos

- [Manual de usuario](../manual-de-usuario.md)
- [Guía del backend](../backend/README.md)
- [Guía del firmware](../firmware/README.md)
- [Esquema eléctrico editable](../diagramas/circuito.drawio) · [Vista del esquema](../diagramas/circuito.png)
- [Identidad visual](../branding/README.md)

Los diagramas de contexto, contenedores, hardware y persistencia incluyen versiones PNG y SVG junto a sus fuentes editables DOT en [`docs/diagramas/`](diagramas/).
