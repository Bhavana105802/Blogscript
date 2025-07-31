@echo off
echo Installing BlogScript dependencies...
echo.

npm install express bcryptjs jsonwebtoken cors

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to install dependencies!
    echo Make sure Node.js is installed and try running as administrator.
    pause
    exit /b 1
)

echo.
echo Dependencies installed successfully!
echo.
echo Starting server...
echo.

npm start

pause
