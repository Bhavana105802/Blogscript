@echo off
echo ========================================
echo    BlogScript Setup
echo ========================================
echo.

REM Create project directory
echo Creating project directory...
cd C:\
if not exist "BlogScript" mkdir BlogScript
cd BlogScript

echo Project directory created at: C:\BlogScript
echo.

REM Check if Node.js is installed
echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please download and install Node.js from: https://nodejs.org/
    echo After installation, run this script again.
    pause
    exit /b 1
)

echo Node.js is installed!
echo.

REM Install dependencies
echo Installing dependencies...
npm install express bcryptjs jsonwebtoken cors

if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies!
    pause
    exit /b 1
)

echo.
echo ========================================
echo    Setup Complete!
echo ========================================
echo.
echo Your project is ready at: C:\BlogScript
echo.
echo To start the server, run: start-server.bat
echo Or manually run: node server.js
echo.
pause
