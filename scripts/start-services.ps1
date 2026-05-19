param(
    [ValidateSet("all", "backend", "website")]
    [string]$Service = "all",
    [int]$BackendPort = 8001,
    [int]$WebsitePort = 3000,
    [string]$HostName = "127.0.0.1"
)

$ErrorActionPreference = "Stop"

$ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Resolve-Path (Join-Path $ScriptRoot "..")
$ServerDir = Join-Path $RepoRoot "server"
$WebsiteDir = Join-Path $RepoRoot "website"
$LogDir = Join-Path $ServerDir "logs"
$RunDir = Join-Path $RepoRoot ".run"
$BackendPidFile = Join-Path $RunDir "backend.pid"
$WebsitePidFile = Join-Path $RunDir "website.pid"
$BackendPortFile = Join-Path $RunDir "backend.port"
$WebsitePortFile = Join-Path $RunDir "website.port"
$BackendLogFile = Join-Path $LogDir "backend.log"
$FrontendLogFile = Join-Path $LogDir "frontend.log"
$BackendRunner = Join-Path $ScriptRoot "run-backend-service.ps1"
$WebsiteRunner = Join-Path $ScriptRoot "run-website-service.ps1"

function Ensure-Directory {
    param([string]$Path)

    if (-not (Test-Path -LiteralPath $Path)) {
        New-Item -ItemType Directory -Path $Path | Out-Null
    }
}

function Test-PidFileRunning {
    param([string]$PidFile)

    if (-not (Test-Path -LiteralPath $PidFile)) {
        return $false
    }

    $rawPid = (Get-Content -LiteralPath $PidFile -Raw).Trim()
    if ($rawPid -notmatch "^\d+$") {
        return $false
    }

    return $null -ne (Get-Process -Id ([int]$rawPid) -ErrorAction SilentlyContinue)
}

function Start-ServiceProcess {
    param(
        [string]$Name,
        [string]$WorkingDirectory,
        [string]$Runner,
        [string[]]$RunnerArguments,
        [string]$PidFile,
        [string]$PortFile,
        [int]$Port,
        [string]$LogFile
    )

    if (Test-PidFileRunning -PidFile $PidFile) {
        $runningPid = (Get-Content -LiteralPath $PidFile -Raw).Trim()
        Write-Host "$Name already running, pid=$runningPid"
        return
    }

    Remove-Item -LiteralPath $PidFile -ErrorAction SilentlyContinue

    if (-not (Test-Path -LiteralPath $WorkingDirectory)) {
        throw "$Name working directory not found: $WorkingDirectory"
    }

    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Add-Content -LiteralPath $LogFile -Value "[$timestamp] starting $Name"

    $processArguments = @("-NoProfile", "-ExecutionPolicy", "Bypass", "-File", $Runner) + $RunnerArguments

    $process = Start-Process `
        -FilePath "powershell.exe" `
        -ArgumentList $processArguments `
        -WorkingDirectory $WorkingDirectory `
        -WindowStyle Hidden `
        -PassThru

    Set-Content -LiteralPath $PidFile -Value $process.Id
    Set-Content -LiteralPath $PortFile -Value $Port
    Write-Host "$Name started, pid=$($process.Id), log=$LogFile"
}

Ensure-Directory -Path $LogDir
Ensure-Directory -Path $RunDir

if ($Service -eq "all" -or $Service -eq "backend") {
    Start-ServiceProcess `
        -Name "backend" `
        -WorkingDirectory $ServerDir `
        -Runner $BackendRunner `
        -RunnerArguments @("-HostName", $HostName, "-Port", $BackendPort, "-LogFile", $BackendLogFile) `
        -PidFile $BackendPidFile `
        -PortFile $BackendPortFile `
        -Port $BackendPort `
        -LogFile $BackendLogFile
}

if ($Service -eq "all" -or $Service -eq "website") {
    Start-ServiceProcess `
        -Name "website" `
        -WorkingDirectory $WebsiteDir `
        -Runner $WebsiteRunner `
        -RunnerArguments @("-HostName", $HostName, "-Port", $WebsitePort, "-BackendPort", $BackendPort, "-LogFile", $FrontendLogFile) `
        -PidFile $WebsitePidFile `
        -PortFile $WebsitePortFile `
        -Port $WebsitePort `
        -LogFile $FrontendLogFile
}
