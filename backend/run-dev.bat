@echo off
setlocal

cd /d "%~dp0"

if not exist node_modules (
  echo Instalando dependencias...
  call npm ci
  if errorlevel 1 exit /b 1
)

echo Iniciando servidor de pruebas...
start "Servidor Dev" cmd /c "npm run start:dev"

echo Abriendo pagina...
start "" "http://localhost:3002/"
