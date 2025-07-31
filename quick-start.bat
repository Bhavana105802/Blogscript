@echo off
title BlogScript Server

REM Change to project directory
cd /d "C:\Users\paturi bhavana\web development\blog website"

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if dependencies are installed
if not exist "node_modules" (
    echo Installing dependencies...
    npm install express bcryptjs jsonwebtoken cors
    if %errorlevel% neq 0 (
        echo Failed to install dependencies!
        pause
        exit /b 1
    )
)

REM Start the server
echo Starting BlogScript Server...
node server.js
