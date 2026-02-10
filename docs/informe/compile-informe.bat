@echo off
setlocal

pushd "%~dp0"

set "FILE=informe.tex"
set "JOBNAME=informe"

pdflatex -interaction=nonstopmode -file-line-error -jobname "%JOBNAME%" "%FILE%"
if errorlevel 1 goto :error

pdflatex -interaction=nonstopmode -file-line-error -jobname "%JOBNAME%" "%FILE%"
if errorlevel 1 goto :error

echo.
echo Compilacion finalizada: informe.pdf
popd
exit /b 0

:error
echo.
echo Error en la compilacion. Revisa el log para mas detalles.
popd
exit /b 1
