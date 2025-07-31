@echo off
echo ========================================
echo    BlogScript Force Installation
echo ========================================
echo.

cd /d "C:\Users\paturi bhavana\web development\blog website"

echo Method 1: Using --legacy-peer-deps...
npm install express bcryptjs jsonwebtoken cors --legacy-peer-deps

if %errorlevel% neq 0 (
    echo.
    echo Method 2: Using --force...
    npm install express bcryptjs jsonwebtoken cors --force
)

if %errorlevel% neq 0 (
    echo.
    echo Method 3: Individual installation...
    npm install express --legacy-peer-deps
    npm install bcryptjs --legacy-peer-deps
    npm install jsonwebtoken --legacy-peer-deps
    npm install cors --legacy-peer-deps
)

echo.
echo Testing server...
node server.js
