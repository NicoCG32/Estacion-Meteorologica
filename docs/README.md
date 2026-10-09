# Documentacion del proyecto

El funcionamiento actual se describe en [arquitectura](../ARCHITECTURE.md),
[manual de usuario](../manual-de-usuario.md), [backend](../backend/README.md) y
[firmware](../firmware/README.md). Para colaborar, consultar
[CONTRIBUTING.md](../CONTRIBUTING.md).

## Informe academico

La fuente esta en [informe/informe.tex](informe/informe.tex), usa
[logos.sty](informe/logos.sty) y recursos en informe/figuras/. El
[PDF](informe/informe.pdf) es material de referencia; las guias de operacion y
configuracion actuales estan enlazadas arriba.

Ver tambien:
- [README.md](../README.md)

## Compilacion manual

- pdflatex -jobname informe informe.tex
- repetir una segunda vez para referencias

## Script de compilacion (Windows)

En Windows puedes usar el script en docs/informe/ (recomendado):

- compile-informe.bat

Uso:

- abrir una terminal en docs/informe/
- ejecutar compile-informe.bat
- salida: informe.pdf
