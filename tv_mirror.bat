@echo off
title Android TV Screen Mirror & Remote Control
echo ===================================================
echo   Connecting to Android TV (192.168.1.64)...
echo ===================================================

set "ADB=C:\Users\Asus\AppData\Local\Android\Sdk\platform-tools\adb.exe"
set "SCRCPY=C:\Users\Asus\AppData\Local\Microsoft\WinGet\Packages\Genymobile.scrcpy_Microsoft.Winget.Source_8wekyb3d8bbwe\scrcpy-win64-v5.0.1\scrcpy.exe"

"%ADB%" connect 192.168.1.64:5555

echo.
echo TV Connected! Starting Mirror Window...
echo.
echo [Controls]
echo   - Mouse Left-Click   : Tap / Click buttons
echo   - Mouse Right-Click  : Back button
echo   - Arrow Keys / Enter : TV Remote navigation
echo   - Keyboard typing    : Type username / password
echo.

"%SCRCPY%" -s 192.168.1.64:5555 --max-size 1280 --video-bit-rate 4M --no-audio

if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Connection lost or scrcpy closed.
    pause
)
