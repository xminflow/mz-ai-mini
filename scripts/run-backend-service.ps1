param(
    [string]$HostName,
    [int]$Port,
    [string]$LogFile
)

$ErrorActionPreference = "Stop"

$commandLine = "set MZ_AI_BACKEND_LOG_LEVEL=DEBUG&& uv run python -m uvicorn main:app --host $HostName --port $Port --reload >> `"$LogFile`" 2>&1"
& cmd.exe /d /s /c $commandLine
