param(
    [ValidateSet("dev")]
    [string]$Environment = "dev",
    [string]$HostName,
    [int]$Port,
    [string]$LogFile
)

$ErrorActionPreference = "Stop"

# -Env dev → MZ_AI_BACKEND_ENV=development，使用本地 PG (localhost:5432)
switch ($Environment) {
    "dev" { $backendEnv = "development" }
    default { throw "Unsupported env: $Environment" }
}

$commandLine = "set MZ_AI_BACKEND_ENV=$backendEnv&& set MZ_AI_BACKEND_LOG_LEVEL=DEBUG&& uv run python -m uvicorn main:app --host $HostName --port $Port --reload >> `"$LogFile`" 2>&1"
& cmd.exe /d /s /c $commandLine
