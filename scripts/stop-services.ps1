param(
    [ValidateSet("all", "backend", "website")]
    [string]$Service = "all"
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
        [string]$PortFile
    )

    $rawPort = $null
    if (Test-Path -LiteralPath $PortFile) {
        $rawPort = (Get-Content -LiteralPath $PortFile -Raw).Trim()
    }

    if (-not (Test-Path -LiteralPath $PidFile)) {
        if ($rawPort -match "^\d+$") {
            Stop-ListeningProcessesByPort -Port ([int]$rawPort)
            Remove-Item -LiteralPath $PortFile -ErrorAction SilentlyContinue
        }
        Write-Host "$Name not running, pid file not found"
        return
    }

    $rawPid = (Get-Content -LiteralPath $PidFile -Raw).Trim()
    if ($rawPid -notmatch "^\d+$") {
        Remove-Item -LiteralPath $PidFile, $PortFile -ErrorAction SilentlyContinue
        Write-Host "$Name pid file is invalid and has been removed"
        return
    }

    Stop-ProcessTreeByPid -ProcessId ([int]$rawPid)

    if ($rawPort -match "^\d+$") {
        Stop-ListeningProcessesByPort -Port ([int]$rawPort)
    }

    Remove-Item -LiteralPath $PidFile, $PortFile -ErrorAction SilentlyContinue
    Write-Host "$Name stopped, pid=$rawPid"
}

if ($Service -eq "all" -or $Service -eq "website") {
    Stop-ServiceProcess -Name "website" -PidFile $WebsitePidFile -PortFile $WebsitePortFile
}

if ($Service -eq "all" -or $Service -eq "backend") {
    Stop-ServiceProcess -Name "backend" -PidFile $BackendPidFile -PortFile $BackendPortFile
}
