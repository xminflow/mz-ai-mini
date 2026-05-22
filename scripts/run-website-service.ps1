param(
    [ValidateSet("dev")]
    [string]$Environment = "dev",
    [string]$HostName,
    [int]$Port,
    [int]$BackendPort,
    [string]$LogFile
)

$ErrorActionPreference = "Stop"

# -Env dev → 同时强制设置 WEBSITE_API_BASE_URL 和 INTERNAL_API_URL 指向本地后端。
# 进程级环境变量优先于 website/.env.local，避免 .env.local 中的生产配置漏到本地 dev。
switch ($Environment) {
    "dev" {
        $internalApiUrl = "http://$HostName`:$BackendPort"
        $websiteApiBaseUrl = "$internalApiUrl/api/v1"
    }
    default { throw "Unsupported env: $Environment" }
}

$commandLine = "set PORT=$Port&& set INTERNAL_API_URL=$internalApiUrl&& set WEBSITE_API_BASE_URL=$websiteApiBaseUrl&& pnpm exec next dev --hostname $HostName --port $Port >> `"$LogFile`" 2>&1"
& cmd.exe /d /s /c $commandLine
