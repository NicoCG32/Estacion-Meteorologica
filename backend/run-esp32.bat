@echo off
setlocal

cd /d "%~dp0"

if not exist node_modules (
  echo Instalando dependencias...
  npm install
)

echo Iniciando servidor para ESP32...
start "Servidor ESP32" cmd /c "npm run start:esp32"

echo Abriendo pagina...
start "" "http://localhost:3001/"
