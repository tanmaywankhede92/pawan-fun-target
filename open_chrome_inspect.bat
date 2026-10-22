@echo off
setlocal
title Chrome Inspect Android TV
color 0B

echo ========================================================
echo   Chrome DevTools Inspect for Android TV
echo ========================================================
echo.

set ADB="C:\Users\USER\AppData\Local\Android\Sdk\platform-tools\adb.exe"

set /p TV_IP="TV ka IP enter kare (Default: 192.168.1.64 - Enter dabaye agar same hai): "
if "%TV_IP%"=="" set TV_IP=192.168.1.64

echo.
echo [1/2] Connecting ADB to TV at %TV_IP%:5555...
%ADB% connect %TV_IP%:5555

echo.
echo [2/2] Opening Chrome Inspect on your laptop...
start chrome chrome://inspect/#devices

echo.
echo ========================================================
echo  AGLE STEPS (Chrome me kya karna hai):
echo  1. Chrome window me 'Discover network targets' checkbox tick hona chahiye.
echo  2. Neeche 'Remote Target' me aapki TV aur 'com.funtarget.app' dikhegi.
echo  3. App ke neeche blue color me 'inspect' likha aayega.
echo  4. 'inspect' par click karein - laptop par Console & Network tab khul jayenge!
echo ========================================================
echo.
pause
