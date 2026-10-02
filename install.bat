@echo off
setlocal

set EXT_NAME=UtilityStudio
set CEP_DIR=%APPDATA%\Adobe\CEP\extensions
set EXT_PATH=%CEP_DIR%\%EXT_NAME%

echo Enabling CEP debug mode...
reg add "HKCU\Software\Adobe\CSXS.12" /v PlayerDebugMode /t REG_SZ /d 1 /f
reg add "HKCU\Software\Adobe\CSXS.11" /v PlayerDebugMode /t REG_SZ /d 1 /f
reg add "HKCU\Software\Adobe\CSXS.10" /v PlayerDebugMode /t REG_SZ /d 1 /f
reg add "HKCU\Software\Adobe\CSXS.9" /v PlayerDebugMode /t REG_SZ /d 1 /f

if exist "%EXT_PATH%" (
  echo Removing old extension folder...
  rmdir /s /q "%EXT_PATH%"
)

if not exist "%CEP_DIR%" (
  mkdir "%CEP_DIR%"
)

echo Copying extension...
xcopy "%~dp0" "%EXT_PATH%\" /E /I /Y

echo.
echo Done.
echo Install complete.
echo Fully restart Premiere Pro before using the panel.
echo.
pause
