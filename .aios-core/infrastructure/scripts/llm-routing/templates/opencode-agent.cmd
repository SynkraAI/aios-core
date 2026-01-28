@echo off
REM OpenCode Agent Routing Script for Windows
REM Ported from Synkra AIOS Claude Max

REM Track usage if enabled
if "%AIOS_USAGE_TRACKING%"=="true" (
  node .aios-core/infrastructure/scripts/usage-analytics.js --agent "opencode" --event "activation"
)

REM Route to OpenCode CLI
opencode %*
