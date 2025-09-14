@echo off
setlocal enabledelayedexpansion

REM MyACCOBot Build Script for Windows
REM This script builds the complete MyACCOBot application

echo [INFO] Starting MyACCOBot build process...

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed. Please install Node.js v16 or higher.
    exit /b 1
)

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed. Please install Python 3.8 or higher.
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm is not installed. Please install npm.
    exit /b 1
)

echo [SUCCESS] All prerequisites are installed

REM Install Node.js dependencies
echo [INFO] Installing Node.js dependencies...
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install Node.js dependencies
    exit /b 1
)

REM Set up Python virtual environment
echo [INFO] Setting up Python virtual environment...
cd Server

if not exist "venv" (
    python -m venv venv
)

call venv\Scripts\activate.bat
pip install -r requirements.txt
pip install pyinstaller

cd ..
echo [SUCCESS] Dependencies installed successfully

REM Clean previous builds if requested
if "%1"=="--clean" (
    echo [INFO] Cleaning previous builds...
    if exist "dist" rmdir /s /q "dist"
    if exist "Server\dist" rmdir /s /q "Server\dist"
    if exist "Server\build" rmdir /s /q "Server\build"
    if exist "Server\__pycache__" rmdir /s /q "Server\__pycache__"
    if exist "release" rmdir /s /q "release"
    echo [SUCCESS] Build artifacts cleaned
)

REM Build frontend
echo [INFO] Building frontend...
call npm run build
if errorlevel 1 (
    echo [ERROR] Frontend build failed
    exit /b 1
)
echo [SUCCESS] Frontend built successfully

REM Build backend
echo [INFO] Building Python backend...
call npm run build:backend
if errorlevel 1 (
    echo [WARNING] Node.js build failed, trying Python script...
    python scripts\build-backend.py
    if errorlevel 1 (
        echo [ERROR] Backend build failed
        exit /b 1
    )
)
echo [SUCCESS] Backend built successfully

REM Build Electron app
echo [INFO] Building Electron app...
call npm run build:win
if errorlevel 1 (
    echo [ERROR] Electron build failed
    exit /b 1
)
echo [SUCCESS] Electron app built successfully

echo [SUCCESS] Build completed successfully!
echo [INFO] Check the release\ directory for the built application

pause
