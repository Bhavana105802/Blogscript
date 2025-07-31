@echo off
echo ========================================
echo    Installing BlogScript Dependencies
echo ========================================
echo.

REM Navigate to project directory
cd /d "C:\Users\paturi bhavana\web development\blog website"

echo Current directory: %CD%
echo.

REM Check if Node.js is installed
echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo.
    echo Please download and install Node.js from:
    echo https://nodejs.org/
    echo.
    echo After installation, run this script again.
    pause
    exit /b 1
)

echo ✅ Node.js is installed!
node --version
echo.

REM Check if npm is available
echo Checking npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not available!
    pause
    exit /b 1
)

echo ✅ npm is available!
npm --version
echo.

REM Install dependencies
echo Installing dependencies...
echo This may take a few minutes...
echo.

npm install express bcryptjs jsonwebtoken cors

if %errorlevel% neq 0 (
    echo.
    echo ❌ ERROR: Failed to install dependencies!
    echo.
    echo Try running as administrator or check your internet connection.
    pause
    exit /b 1
)

echo.
echo ========================================
echo    ✅ Installation Complete!
echo ========================================
echo.
echo Dependencies installed successfully!
echo.
echo You can now start the server with:
echo   node server.js
echo.
echo Or run: start-server.bat
echo.
pause
