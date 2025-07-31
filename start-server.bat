@echo off
echo ========================================
echo    Starting BlogScript Server
echo ========================================
echo.

REM Navigate to project directory
cd /d "C:\Users\paturi bhavana\web development\blog website"

echo Current directory: %CD%
echo.

REM Check if server.js exists
if not exist "server.js" (
    echo ERROR: server.js not found in current directory!
    echo Make sure you're in the correct folder.
    echo.
    dir
    pause
    exit /b 1
)

echo Starting server...
echo.
echo Server will be available at:
echo   🏠 Home: http://localhost:3000/home.html
echo   🔐 Auth: http://localhost:3000/auth.html
echo   📊 Dashboard: http://localhost:3000/
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

node server.js

echo.
echo Server stopped.
pause
