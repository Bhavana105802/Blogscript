@echo off
title BlogScript Complete Setup
echo ========================================
echo    BlogScript Complete Setup
echo ========================================
echo.

REM Navigate to project directory
cd /d "C:\Users\paturi bhavana\web development\blog website"

echo Step 1: Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found!
    echo Please install from: https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js found!

echo.
echo Step 2: Installing dependencies...
npm install express bcryptjs jsonwebtoken cors
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies!
    pause
    exit /b 1
)
echo ✅ Dependencies installed!

echo.
echo Step 3: Starting server...
echo.
echo Server will be available at:
echo   🏠 Home: http://localhost:3000/home.html
echo   🔐 Auth: http://localhost:3000/auth.html
echo   📊 Dashboard: http://localhost:3000/
echo.
echo ========================================
echo.

node server.js
