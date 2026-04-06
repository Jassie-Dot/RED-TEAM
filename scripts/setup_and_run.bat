@echo off
setlocal

:: Get Root Directory
pushd "%~dp0.."
set "ROOT_DIR=%CD%"
popd

set "BACKEND_DIR=%ROOT_DIR%\backend"
set "FRONTEND_DIR=%ROOT_DIR%\frontend"

:: Check for uv
where uv >nul 2>&1
if errorlevel 1 echo 'uv' not found. Please install uv. && pause && exit /b 1

:: Check for node
where node >nul 2>&1
if errorlevel 1 echo Node.js not found. Please install Node.js. && pause && exit /b 1

echo.
echo [1/3] Setting up Backend...
pushd "%BACKEND_DIR%"
if not exist ".venv" uv venv --python 3.12
echo Installing dependencies...
uv pip install -r requirements.txt
if errorlevel 1 echo Backend dependency installation failed. && popd && pause && exit /b 1
popd

echo.
echo [2/3] Setting up Frontend...
pushd "%FRONTEND_DIR%"
if not exist "node_modules" call npm install
if errorlevel 1 echo Frontend dependency installation failed. && popd && pause && exit /b 1
popd

echo.
echo [3/3] Starting Services...
start "HireGuard Backend" /D "%BACKEND_DIR%" cmd /k ".venv\Scripts\python -m uvicorn main:app --reload --port 8000"
start "HireGuard Frontend" /D "%FRONTEND_DIR%" cmd /k "npm run dev"

echo.
echo Waiting for services to initialize...
timeout /t 10 /nobreak >nul

echo Opening browser at http://localhost:3000
start "" "http://localhost:3000"

echo.
echo HireGuard AI is now running!
pause
