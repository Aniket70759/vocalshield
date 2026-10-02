@echo off
setlocal
cd /d "%~dp0"
echo Starting VocalShield AI...
call npm.cmd install
call npm.cmd run dev
endlocal
