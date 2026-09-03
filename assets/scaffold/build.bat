@echo off
setlocal
rem ===== Web PPT 一键构建（Windows）=====
if not exist node_modules call npm install
if errorlevel 1 goto :err
call npm run build
if errorlevel 1 goto :err
go build -ldflags "-s -w" -o presentation.exe .
if errorlevel 1 goto :err
echo.
echo Build OK: presentation.exe
goto :eof

:err
echo.
echo Build FAILED
exit /b 1
