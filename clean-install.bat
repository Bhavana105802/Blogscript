@echo off
echo ========================================
echo    BlogScript Clean Installation
echo ========================================
echo.

REM Navigate to project directory
cd /d "C:\Users\paturi bhavana\web development\blog website"

echo Current directory: %CD%
echo.

REM Backup existing package.json
if exist "package.json" (
    echo Backing up existing package.json...
    copy "package.json" "package-backup.json"
    echo ✅ Backup created: package-backup.json
)

REM Remove problematic files
echo Cleaning up existing installation...
if exist "node_modules" (
    echo Removing node_modules...
    rmdir /s /q "node_modules"
)
if exist "package-lock.json" (
    echo Removing package-lock.json...
    del "package-lock.json"
)

REM Copy simple package.json
echo Creating clean package.json...
copy "package-simple.json" "package.json"

echo.
echo Installing server dependencies only...
npm install

if %errorlevel% neq 0 (
    echo ❌ Installation failed!
    echo Trying with legacy peer deps...
    npm install --legacy-peer-deps
)

echo.
echo ========================================
echo    ✅ Clean Installation Complete!
echo ========================================
echo.
echo Starting server...
echo.

node server.js
