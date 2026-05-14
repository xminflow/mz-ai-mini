#Requires -Version 7.0
<#
Builds the no-Python Windows installer for ua-agent.

End users of this installer must have `uv` on PATH; the bundled backend
dir contains pyproject.toml + uv.lock so `uv run` syncs deps on first launch.

Usage:
  pwsh scripts/build-installer-no-python.ps1

Optional:
  pwsh scripts/build-installer-no-python.ps1 -BloggerDataSource "C:\path\to\blogger-frames"
  $env:UA_AGENT_BLOGGER_DATA_DIR="C:\path\to\blogger-frames"; pwsh scripts/build-installer-no-python.ps1
#>

param(
    [string]$BloggerDataSource = $env:UA_AGENT_BLOGGER_DATA_DIR,
    [switch]$SkipBloggerData
)

$ErrorActionPreference = 'Stop'
# PowerShell 7.3+: make non-zero exit codes from native commands trip ErrorActionPreference
$PSNativeCommandUseErrorActionPreference = $true

function Write-Banner($text) {
    Write-Host ""
    Write-Host "==> $text" -ForegroundColor Cyan
}

function Stop-RepoProcesses($repoRoot) {
    $normalizedRepoRoot = [System.IO.Path]::GetFullPath($repoRoot)
    $targets = @('electron', 'node')
    $stopped = 0

    foreach ($name in $targets) {
        $processes = Get-Process -Name $name -ErrorAction SilentlyContinue
        foreach ($process in $processes) {
            try {
                $path = $process.Path
            }
            catch {
                $path = $null
            }

            if (-not $path) {
                continue
            }

            $normalizedProcessPath = [System.IO.Path]::GetFullPath($path)
            if (-not $normalizedProcessPath.StartsWith($normalizedRepoRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
                continue
            }

            Stop-Process -Id $process.Id -Force
            Write-Host "  stopped $($process.ProcessName) pid=$($process.Id) path=$normalizedProcessPath"
            $stopped++
        }
    }

    if ($stopped -eq 0) {
        Write-Host "  no repo-local electron/node processes found"
    }
}

function Invoke-WithRetry {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Description,
        [Parameter(Mandatory = $true)]
        [scriptblock]$Action,
        [int]$MaxAttempts = 3,
        [int]$DelaySeconds = 2
    )

    for ($attempt = 1; $attempt -le $MaxAttempts; $attempt++) {
        try {
            & $Action
            if ($attempt -gt 1) {
                Write-Host "  succeeded on attempt $attempt"
            }
            return
        }
        catch {
            if ($attempt -ge $MaxAttempts) {
                throw
            }

            Write-Host "  $Description failed on attempt ${attempt}/${MaxAttempts}: $($_.Exception.Message)"
            Write-Host "  waiting ${DelaySeconds}s before retry"
            Start-Sleep -Seconds $DelaySeconds
        }
    }
}

function Test-BloggerDataDir($path) {
    if (-not $path -or -not (Test-Path $path -PathType Container)) {
        return $false
    }

    $firstProfile = Get-ChildItem -Path $path -Directory -ErrorAction SilentlyContinue |
        Where-Object { Test-Path (Join-Path $_.FullName 'profile.json') -PathType Leaf } |
        Select-Object -First 1

    return $null -ne $firstProfile
}

function Resolve-BloggerDataSource($explicitPath) {
    if ($explicitPath) {
        if (-not (Test-Path $explicitPath -PathType Container)) {
            throw "Blogger data source not found: $explicitPath"
        }
        return (Resolve-Path $explicitPath).Path
    }

    $candidates = @()
    if ($env:APPDATA) {
        $candidates += @(
            (Join-Path $env:APPDATA 'AI运营获客\blogger-frames'),
            (Join-Path $env:APPDATA 'ua-agent-frontend\blogger-frames'),
            (Join-Path $env:APPDATA 'ua-agent\blogger-frames')
        )

        $appDataChildren = Get-ChildItem -Path $env:APPDATA -Directory -ErrorAction SilentlyContinue
        foreach ($child in $appDataChildren) {
            $candidates += (Join-Path $child.FullName 'blogger-frames')
        }
    }

    foreach ($candidate in $candidates | Select-Object -Unique) {
        if (Test-BloggerDataDir $candidate) {
            return (Resolve-Path $candidate).Path
        }
    }

    return $null
}

function Test-DirectoryHasContents($path) {
    if (-not $path -or -not (Test-Path $path -PathType Container)) {
        return $false
    }

    $entries = Get-ChildItem -Path $path -Force -ErrorAction SilentlyContinue |
        Where-Object { $_.Name -ne '.links' }

    return $null -ne ($entries | Select-Object -First 1)
}

# Resolve repo paths relative to this script.
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot  = Resolve-Path (Join-Path $ScriptDir '..')
$Backend   = Join-Path $RepoRoot 'backend'
$Frontend  = Join-Path $RepoRoot 'frontend'
$Staging   = Join-Path $Frontend 'build-resources\staging\backend'
$Browsers  = Join-Path $Frontend 'build-resources\staging\playwright-browsers'
$BrowserCache = Join-Path $Frontend 'build-resources\cache\playwright-browsers'
$BloggerDataStaging = Join-Path $Frontend 'build-resources\staging\blogger-frames'
$AgentsFileStaging = Join-Path $Frontend 'build-resources\staging\AGENTS.md'
$Dist      = Join-Path $Frontend 'dist'
$GuideRoot = 'D:\code\creator-notes\notes\book'

Write-Banner 'Preflight: tooling versions'
foreach ($tool in @('node', 'pnpm', 'uv')) {
    $cmd = Get-Command $tool -ErrorAction SilentlyContinue
    if (-not $cmd) {
        throw "Required tool '$tool' not found on PATH."
    }
    & $tool --version | ForEach-Object { Write-Host "  $tool : $_" }
}

Write-Banner 'Clean: previous staging + dist'
foreach ($p in @($Staging, $Browsers, $BloggerDataStaging, $AgentsFileStaging, $Dist)) {
    if (Test-Path $p) {
        Remove-Item $p -Recurse -Force
        Write-Host "  removed $p"
    }
}
New-Item -ItemType Directory -Path $Staging -Force  | Out-Null
New-Item -ItemType Directory -Path $Browsers -Force | Out-Null
New-Item -ItemType Directory -Path $BrowserCache -Force | Out-Null
New-Item -ItemType Directory -Path $BloggerDataStaging -Force | Out-Null

Write-Banner 'Stage: backend payload'
Copy-Item (Join-Path $Backend 'pyproject.toml') $Staging
Copy-Item (Join-Path $Backend 'uv.lock')        $Staging
Copy-Item (Join-Path $Backend 'src')            (Join-Path $Staging 'src')                  -Recurse
Copy-Item (Join-Path $Backend 'vendor\funasr_nano') (Join-Path $Staging 'vendor\funasr_nano') -Recurse

# Strip __pycache__ from staged tree.
Get-ChildItem -Path $Staging -Recurse -Force -Directory -Filter '__pycache__' |
    ForEach-Object {
        Remove-Item $_.FullName -Recurse -Force
        Write-Host "  pruned $($_.FullName)"
    }
Write-Host "  staged at $Staging"

Write-Banner 'Stage: blogger analysis data'
if ($SkipBloggerData) {
    Write-Host "  skipped by -SkipBloggerData"
}
else {
    $resolvedBloggerDataSource = Resolve-BloggerDataSource $BloggerDataSource
    if ($resolvedBloggerDataSource) {
        Copy-Item (Join-Path $resolvedBloggerDataSource '*') $BloggerDataStaging -Recurse -Force
        $bloggerCount = (Get-ChildItem -Path $BloggerDataStaging -Directory -ErrorAction SilentlyContinue |
            Where-Object { Test-Path (Join-Path $_.FullName 'profile.json') -PathType Leaf } |
            Measure-Object).Count
        Write-Host "  staged $bloggerCount blogger(s) from $resolvedBloggerDataSource"
    }
    else {
        Write-Host "  no blogger-frames directory found; packaging without seeded blogger analysis data"
        Write-Host "  pass -BloggerDataSource or set UA_AGENT_BLOGGER_DATA_DIR to include it"
    }
}

Write-Banner 'Generate: AGENTS.md'
node (Join-Path $RepoRoot 'scripts\generate-build-agents.cjs') $AgentsFileStaging $BloggerDataStaging $GuideRoot

Push-Location $Frontend
try {
    Write-Banner 'Frontend: pnpm install (frozen lockfile)'
    pnpm install --frozen-lockfile

    Write-Banner 'Frontend: stop repo-local electron/node processes'
    Stop-RepoProcesses $Frontend

    Write-Banner 'Cache: patchright browsers (chromium + headless shell)'
    if (Test-DirectoryHasContents $BrowserCache) {
        Write-Host "  reusing cached browsers from $BrowserCache"
    }
    else {
        $env:PLAYWRIGHT_BROWSERS_PATH = $BrowserCache
        try {
            pnpm exec patchright install chromium chromium-headless-shell
        }
        finally {
            Remove-Item Env:PLAYWRIGHT_BROWSERS_PATH -ErrorAction SilentlyContinue
        }
    }

    Write-Banner 'Stage: patchright browsers'
    Copy-Item (Join-Path $BrowserCache '*') $Browsers -Recurse -Force

    Write-Banner 'Frontend: rebuild better-sqlite3 against electron'
    Invoke-WithRetry -Description 'electron-rebuild better-sqlite3' -MaxAttempts 3 -DelaySeconds 2 -Action {
        pnpm exec electron-rebuild -f -w better-sqlite3
    }

    Write-Banner 'Frontend: electron-vite build'
    pnpm run build:packaging

    Write-Banner 'Package: electron-builder (NSIS, x64)'
    pnpm exec electron-builder --win nsis --x64 --config electron-builder.yml
}
finally {
    Pop-Location
}

Write-Banner 'Result'
$installer = Get-ChildItem -Path $Dist -Filter '*.exe' -File -ErrorAction SilentlyContinue |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1

if ($installer) {
    $sizeMb = [math]::Round($installer.Length / 1MB, 1)
    Write-Host "  $($installer.FullName) ($sizeMb MB)" -ForegroundColor Green
}
else {
    throw "Build finished but no .exe found under $Dist."
}
