@echo off
REM Vai para o diretório do script (opcional se o BAT já estiver no mesmo)
cd /d %~dp0

REM Ativa a virtualenv
call ..\.venv\Scripts\activate.bat

REM Roda o script Python
python main.py

REM Pausa para ver a saída antes de fechar
pause
