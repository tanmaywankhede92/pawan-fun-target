@echo off
title Fun Target - Auto Screen Capture
echo ===================================================
echo   Fun Target Auto Screen Capture Monitor
echo   Connected to: 192.168.1.64:5555
echo   Saving screenshots to: %~dp0screenshots\
echo ===================================================
echo.
node "%~dp0scripts\capture_tv_screens.js"
pause
