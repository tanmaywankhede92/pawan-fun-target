@echo off
setlocal
title Android TV Remote Control
color 0A

set TV_IP=192.168.1.64
if not "%~1"=="" set TV_IP=%~1

set SCRCPY_DIR=C:\Users\USER\AppData\Local\Microsoft\WinGet\Packages\Genymobile.scrcpy_Microsoft.Winget.Source_8wekyb3d8bbwe\scrcpy-win64-v4.1

echo ========================================================
echo   Connecting to Android TV at %TV_IP%:5555...
echo ========================================================
echo.

cd /d "%SCRCPY_DIR%"

adb.exe disconnect
adb.exe connect %TV_IP%:5555

echo.
echo Launching TV Screen Mirroring...
echo.
echo Controls:
echo  - Mouse Left Click = TV Remote OK / Tap
echo  - Arrow Keys       = Remote Up, Down, Left, Right
echo  - Enter            = Remote OK
echo  - Right Click/Esc  = Remote Back
echo  - Home Key         = Remote Home
echo.

scrcpy.exe -s %TV_IP%:5555 --window-title "Android TV Remote Control" --max-size 1280

if errorlevel 1 (
    echo.
    echo ----------------------------------------------------
    echo [ERROR] TV Connect nahi ho payi!
    echo Agar TV ka IP badal gaya hai, toh naya IP dalein:
    set /p NEW_IP="Naya IP enter karein: "
    if not "!NEW_IP!"=="" (
        adb.exe connect !NEW_IP!:5555
        scrcpy.exe -s !NEW_IP!:5555 --window-title "Android TV Remote Control" --max-size 1280
    )
    pause
)
