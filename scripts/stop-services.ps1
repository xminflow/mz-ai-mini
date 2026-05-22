param(
    [ValidateSet("all", "backend", "website")]
    [string]$Service = "all",
    [int]$BackendPort = 8001,
    [int]$WebsitePort = 3000
)

$ErrorActionPreference = "Stop"

$ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Resolve-Path (Join-Path $ScriptRoot "..")
$RunDir = Join-Path $RepoRoot ".run"
$BackendPidFile = Join-Path $RunDir "backend.pid"
$WebsitePidFile = Join-Path $RunDir "website.pid"
$BackendPortFile = Join-Path $RunDir "backend.port"
$WebsitePortFile = Join-Path $RunDir "website.port"

function Stop-ProcessTreeByPid {
    param([int]$ProcessId)

    $process = Get-Process -Id $ProcessId -ErrorAction SilentlyContinue
    if ($null -ne $process) {
        & taskkill.exe /PID $ProcessId /T /F | Out-Null
    }
}

function Stop-ListeningProcessesByPort {
    param([int]$Port)

    $netstatOutput = & netstat.exe -ano -p tcp
    $escapedPort = [regex]::Escape(":$Port")
    $listeningLines = $netstatOutput | Where-Object {
        $_ -match $escapedPort -and $_ -match "\sLISTENING\s+(\d+)\s*$"
    }

    $listeningPids = @(
        $listeningLines | ForEach-Object {
            if ($_ -match "\sLISTENING\s+(\d+)\s*$") {
                [int]$Matches[1]
            }
        } | Sort-Object -Unique
    )

    foreach ($listeningPid in $listeningPids) {
        Stop-ProcessTreeByPid -ProcessId $listeningPid
    }
}

function Stop-ServiceProcess {
    param(
        [string]$Name,
        [string]$PidFile,
        [string]$PortFile,
        [int]$DefaultPort
    )

    # 解析有效的目标端口：优先 .port 文件，回退到调用方传入的默认端口
    $rawPort = $null
    if (Test-Path -LiteralPath $PortFile) {
        $rawPort = (Get-Content -LiteralPath $PortFile -Raw).Trim()
    }
    $effectivePort = $null
    if ($rawPort -match "^\d+$") {
        $effectivePort = [int]$rawPort
    } elseif ($DefaultPort -gt 0) {
        $effectivePort = $DefaultPort
    }

    $rawPid = $null
    if (Test-Path -LiteralPath $PidFile) {
        $rawPid = (Get-Content -LiteralPath $PidFile -Raw).Trim()
    }

    $killedPid = $false
    if ($rawPid -match "^\d+$") {
        Stop-ProcessTreeByPid -ProcessId ([int]$rawPid)
        $killedPid = $true
    }

    # 始终按端口兜底，覆盖「服务在脚本外启动 / pid 文件丢失」的情况
    $killedPort = $false
    if ($null -ne $effectivePort) {
        $beforePids = @(
            (& netstat.exe -ano -p tcp) | Where-Object {
                $_ -match ([regex]::Escape(":$effectivePort")) -and $_ -match "\sLISTENING\s+(\d+)\s*$"
            } | ForEach-Object {
                if ($_ -match "\sLISTENING\s+(\d+)\s*$") { [int]$Matches[1] }
            } | Sort-Object -Unique
        )
        if ($beforePids.Count -gt 0) {
            Stop-ListeningProcessesByPort -Port $effectivePort
            $killedPort = $true
        }
    }

    Remove-Item -LiteralPath $PidFile, $PortFile -ErrorAction SilentlyContinue

    if ($killedPid -and $killedPort) {
        Write-Host "$Name stopped, pid=$rawPid, port=$effectivePort"
    } elseif ($killedPid) {
        Write-Host "$Name stopped, pid=$rawPid"
    } elseif ($killedPort) {
        Write-Host "$Name stopped via port=$effectivePort (no valid pid file)"
    } else {
        Write-Host "$Name not running"
    }
}

if ($Service -eq "all" -or $Service -eq "website") {
    Stop-ServiceProcess -Name "website" -PidFile $WebsitePidFile -PortFile $WebsitePortFile -DefaultPort $WebsitePort
}

if ($Service -eq "all" -or $Service -eq "backend") {
    Stop-ServiceProcess -Name "backend" -PidFile $BackendPidFile -PortFile $BackendPortFile -DefaultPort $BackendPort
}
