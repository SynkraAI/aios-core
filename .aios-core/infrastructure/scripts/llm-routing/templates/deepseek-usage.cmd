@echo off
:: DeepSeek Usage Statistics CLI
:: View usage tracking data per alias

setlocal

:: Try multiple locations for the tracker script
:: 1. Environment variable (if set during installation)
if defined AIOS_HOME (
    set "TRACKER_SCRIPT=%AIOS_HOME%\.aios-core\infrastructure\scripts\llm-routing\usage-tracker\index.js"
    if exist "%TRACKER_SCRIPT%" goto :found
)

:: 2. Common installation locations
set "TRACKER_SCRIPT=%USERPROFILE%\aios-core\.aios-core\infrastructure\scripts\llm-routing\usage-tracker\index.js"
if exist "%TRACKER_SCRIPT%" goto :found

set "TRACKER_SCRIPT=%USERPROFILE%\Workspaces\AIOS\SynkraAI\aios-core\.aios-core\infrastructure\scripts\llm-routing\usage-tracker\index.js"
if exist "%TRACKER_SCRIPT%" goto :found

:: 3. Relative to this script (for development)
set "TRACKER_SCRIPT=%~dp0..\usage-tracker\index.js"
if exist "%TRACKER_SCRIPT%" goto :found

:: 4. Global npm package location
set "TRACKER_SCRIPT=%APPDATA%\npm\node_modules\@aios-fullstack\core\.aios-core\infrastructure\scripts\llm-routing\usage-tracker\index.js"
if exist "%TRACKER_SCRIPT%" goto :found

echo [91mERROR: Usage tracker not found![0m
echo.
echo Please ensure AIOS is installed correctly.
echo Expected locations:
echo   - %%AIOS_HOME%%\.aios-core\infrastructure\scripts\llm-routing\usage-tracker\
echo   - %%USERPROFILE%%\aios-core\.aios-core\infrastructure\scripts\llm-routing\usage-tracker\
echo.
echo Set AIOS_HOME environment variable: setx AIOS_HOME "C:\path\to\aios-core"
exit /b 1

:found
:: Check if Node.js is available
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [91mERROR: Node.js not found in PATH[0m
    echo Please install Node.js from https://nodejs.org/
    exit /b 1
)

:: Pass arguments to tracker
node "%TRACKER_SCRIPT%" usage %*

endlocal
