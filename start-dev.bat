@echo off
setlocal enabledelayedexpansion

echo.
echo ========================================
echo   WatchHere Development Environment
echo ========================================
echo.

REM Colors for Windows (limited support)
set "GREEN=[92m"
set "YELLOW=[93m"
set "RED=[91m"
set "BLUE=[94m"
set "RESET=[0m"

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo %RED%❌ Node.js not found. Please install Node.js%RESET%
    pause
    exit /b 1
)

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo %YELLOW%⚠️ Docker not found. Some services may not start%RESET%
    set DOCKER_AVAILABLE=false
) else (
    set DOCKER_AVAILABLE=true
)

echo %BLUE%🔄 Starting MongoDB...%RESET%

REM Try to start MongoDB service
net start MongoDB >nul 2>&1
if errorlevel 1 (
    if "%DOCKER_AVAILABLE%"=="true" (
        echo %YELLOW%MongoDB service not found, trying Docker...%RESET%
        
        REM Check if MongoDB container exists
        docker ps -a --filter name=watchhere-mongo --format "{{.Names}}" | findstr watchhere-mongo >nul
        if errorlevel 1 (
            echo %BLUE%Creating MongoDB Docker container...%RESET%
            docker run -d --name watchhere-mongo -p 27017:27017 -v watchhere-mongo-data:/data/db mongo:latest
        ) else (
            echo %BLUE%Starting existing MongoDB container...%RESET%
            docker start watchhere-mongo
        )
        
        if errorlevel 1 (
            echo %RED%❌ Failed to start MongoDB%RESET%
            pause
            exit /b 1
        )
        
        echo %GREEN%✅ MongoDB started via Docker%RESET%
        timeout /t 3 /nobreak >nul
    ) else (
        echo %RED%❌ MongoDB not available and Docker not found%RESET%
        pause
        exit /b 1
    )
) else (
    echo %GREEN%✅ MongoDB service started%RESET%
)

echo.
echo %BLUE%🔄 Starting Redis...%RESET%

if "%DOCKER_AVAILABLE%"=="true" (
    REM Check if Redis container exists
    docker ps -a --filter name=watchhere-redis --format "{{.Names}}" | findstr watchhere-redis >nul
    if errorlevel 1 (
        echo %BLUE%Creating Redis Docker container...%RESET%
        docker run -d --name watchhere-redis -p 6379:6379 redis:alpine redis-server --appendonly yes
    ) else (
        echo %BLUE%Starting existing Redis container...%RESET%
        docker start watchhere-redis
    )
    
    if errorlevel 1 (
        echo %YELLOW%⚠️ Redis failed to start (optional service)%RESET%
    ) else (
        echo %GREEN%✅ Redis started via Docker%RESET%
        timeout /t 2 /nobreak >nul
    )
) else (
    echo %YELLOW%⚠️ Redis not available (Docker required)%RESET%
)

echo.
echo %BLUE%🔄 Starting WatchHere Backend...%RESET%

REM Change to backend directory
if not exist "backend\server.js" (
    echo %RED%❌ Backend server.js not found%RESET%
    pause
    exit /b 1
)

cd backend

echo %BLUE%🚀 Starting Node.js server...%RESET%
echo.
echo %GREEN%========================================%RESET%
echo %GREEN%  WatchHere Backend Starting...%RESET%
echo %GREEN%========================================%RESET%
echo.
echo %YELLOW%💡 Press Ctrl+C to stop all services%RESET%
echo.

REM Start the Node.js server
node server.js

REM If we get here, the server stopped
echo.
echo %YELLOW%🛑 Server stopped%RESET%
pause