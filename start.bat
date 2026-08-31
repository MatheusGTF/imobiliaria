@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

echo ============================================
echo   Imobiliaria - iniciando sistema
echo ============================================
echo.

if not exist ".env" (
    echo [1/5] Criando arquivo .env a partir do .env.example...
    copy /y ".env.example" ".env" >nul
    for /f "delims=" %%s in ('powershell -NoProfile -Command "[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))"') do set "SECRET=%%s"
    powershell -NoProfile -Command "(Get-Content '.env' -Encoding UTF8) -replace 'gere-um-valor-aleatorio-aqui', '!SECRET!' | Set-Content '.env' -Encoding UTF8" >nul
) else (
    echo [1/5] Arquivo .env ja existe, pulando.
)

if not exist "node_modules" (
    echo [2/5] Instalando dependencias, isso pode levar alguns minutos...
    call npm install
    if errorlevel 1 goto :erro
) else (
    echo [2/5] Dependencias ja instaladas, pulando.
)

echo [3/5] Aplicando migracoes do banco de dados...
call npx prisma migrate deploy
if errorlevel 1 goto :erro

echo [4/5] Verificando usuario administrador padrao...
call npm run seed

echo [5/5] Iniciando o servidor...
start "Imobiliaria - servidor (feche esta janela para parar)" cmd /k "npm run dev"

timeout /t 5 /nobreak >nul
start "" "http://localhost:3000"

echo.
echo ============================================
echo   Sistema iniciado!
echo   Portal:   http://localhost:3000
echo   Painel:   http://localhost:3000/admin/login
echo.
echo   Para parar o sistema, feche a janela do
echo   servidor que foi aberta separadamente.
echo ============================================
echo.
pause
exit /b 0

:erro
echo.
echo ============================================
echo   Ocorreu um erro. Verifique as mensagens acima.
echo ============================================
pause
exit /b 1
