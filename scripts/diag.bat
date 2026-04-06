@echo off
setlocal
echo Current script: %~f0
pushd "%~dp0.."
set "ROOT_DIR=%CD%"
popd
echo ROOT is %ROOT_DIR%
pause
