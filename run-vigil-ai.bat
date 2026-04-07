@echo off
setlocal

cd /d "%~dp0"

echo ==========================================
echo VIGIL-AI Employer Mode Launcher
echo ==========================================
echo.

where npm >nul 2>nul
if errorlevel 1 (
  echo [ERROR] npm was not found. Please install Node.js and try again.
  pause
  exit /b 1
)

echo [1/3] Installing dependencies...
call npm.cmd install
if errorlevel 1 (
  echo.
  echo [ERROR] Dependency installation failed.
  pause
  exit /b 1
)

echo.
echo [2/3] Starting VIGIL-AI on http://localhost:3000 ...
start "VIGIL-AI Server" cmd /k "cd /d %~dp0 && npm.cmd run dev"

echo.
echo [3/3] Waiting for the app to become available...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$url = 'http://localhost:3000';" ^
  "$ready = $false;" ^
  "for ($i = 0; $i -lt 60; $i++) {" ^
  "  try {" ^
  "    Invoke-WebRequest -Uri $url -UseBasicParsing | Out-Null;" ^
  "    $ready = $true;" ^
  "    break;" ^
  "  } catch {" ^
  "    Start-Sleep -Seconds 1;" ^
  "  }" ^
  "}" ^
  "if ($ready) {" ^
  "  Start-Process $url;" ^
  "  Write-Host 'Frontend launched in your browser.';" ^
  "} else {" ^
  "  Write-Host 'Server is still starting. Open http://localhost:3000 manually in a browser.';" ^
  "}"

echo.
echo VIGIL-AI launcher finished.
echo Leave the "VIGIL-AI Server" window open while using the app.
echo.
pause
