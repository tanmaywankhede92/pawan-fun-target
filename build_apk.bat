@echo off
echo ==============================================
echo Building Fun Target Latest APK...
echo ==============================================

cd /d "%~dp0frontend"
echo [1/3] Building Web assets with Vite...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Web build failed!
    exit /b %ERRORLEVEL%
)

echo [2/3] Syncing Capacitor Android assets...
call npx cap sync android
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Capacitor sync failed!
    exit /b %ERRORLEVEL%
)

echo [3/3] Compiling Android Debug APK with Gradle...
cd android
call gradlew.bat assembleDebug
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Gradle build failed!
    exit /b %ERRORLEVEL%
)

cd /d "%~dp0"
if not exist "build_apk" mkdir "build_apk"
copy /y "frontend\android\app\build\outputs\apk\debug\app-debug.apk" "build_apk\FunTarget_Latest.apk"

echo ==============================================
echo SUCCESS!
echo APK generated at: build_apk\FunTarget_Latest.apk
echo ==============================================
pause
