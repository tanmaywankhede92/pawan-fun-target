@echo off
setlocal
echo ========================================================
echo   Fun Target Android TV Installer / Cache Cleaner
echo ========================================================
echo.

set ADB="C:\Users\USER\AppData\Local\Android\Sdk\platform-tools\adb.exe"
set APK="d:\React Project\Fun Target React pawan(07-10-2026)\Fun Target React\FunTarget_New_Build.apk"

set /p TV_IP="TV ka IP address enter kare (Default: 192.168.1.64 - Enter dabaye agar same hai): "
if "%TV_IP%"=="" set TV_IP=192.168.1.64

echo.
echo [1/4] Connecting to TV at %TV_IP%:5555...
%ADB% disconnect
%ADB% connect %TV_IP%:5555
timeout /t 2 >nul

echo.
echo [2/4] Uninstalling old APK and deleting all cache/data...
%ADB% -s %TV_IP%:5555 uninstall com.funtarget.app

echo.
echo [3/4] Installing fresh build: %APK%...
%ADB% -s %TV_IP%:5555 install -r %APK%

echo.
echo [4/4] Launching Fun Target app on Android TV...
%ADB% -s %TV_IP%:5555 shell am start -n com.funtarget.app/.MainActivity

echo.
echo ========================================================
echo   Done! App launched on TV.
echo ========================================================
pause
