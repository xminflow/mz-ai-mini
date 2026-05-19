param(
    [string]$HostName,
    [int]$Port,
    [int]$BackendPort,
    [string]$LogFile
)

$ErrorActionPreference = "Stop"

$internalApiUrl = "http://$HostName`:$BackendPort"
$commandLine = "set PORT=$Port&& set INTERNAL_API_URL=$internalApiUrl&& pnpm exec next dev --hostname $HostName --port $Port >> `"$LogFile`" 2>&1"
& cmd.exe /d /s /c $commandLine
