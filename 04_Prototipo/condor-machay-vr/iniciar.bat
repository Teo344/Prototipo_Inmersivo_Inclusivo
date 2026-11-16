@echo off
REM Inicia un servidor local y abre el recorrido en el navegador.
REM (Las imagenes 360 no cargan si se abre index.html con doble clic, por seguridad del navegador.)
cd /d "%~dp0"
start "" http://localhost:8000
python -m http.server 8000
