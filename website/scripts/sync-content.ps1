#requires -Version 7.0
<#
.SYNOPSIS
  课件内容同步脚本（Windows 原生 / PowerShell 版）。

.DESCRIPTION
  把仓库里的 website/public/{courses,community} 推送到服务器上 docker
  bind-mount 的内容目录（默认 /srv/weelume/content）。

  课程/社区路由是 force-dynamic 每次请求读盘，同步完成后无需重建镜像、
  无需 docker restart，下一次请求即生效。

  传输方式：打包成 tar.gz -> scp 上传 -> 远端解包。
  之所以不用 PowerShell 管道直传，是因为 PS 管道会把二进制 tar 流当文本
  处理而损坏内容，落地临时文件再 scp 是 Windows 上最稳妥的做法。
  （Windows 自带 ssh.exe / scp.exe / tar.exe，无需安装 rsync。）

.EXAMPLE
  ./sync-content.ps1 -DeployHost root@1.2.3.4
.EXAMPLE
  ./sync-content.ps1 -DeployHost root@1.2.3.4 -Only courses -DryRun
.EXAMPLE
  ./sync-content.ps1 -DeployHost root@1.2.3.4 -Clean   # 先清空远端再传（镜像等价，危险）
#>
[CmdletBinding()]
param(
  # 目标服务器 SSH 地址，如 root@1.2.3.4（必填；也可在 sync-content.config.ps1 里设默认）
  [string]$DeployHost = $env:DEPLOY_HOST,
  # 服务器上的内容根目录（与 docker run -v 左侧一致）
  [string]$Dest = $(if ($env:DEPLOY_DEST) { $env:DEPLOY_DEST } else { '/home/deploy/workspace/website/md' }),
  # SSH 端口
  [int]$Port = $(if ($env:DEPLOY_PORT) { [int]$env:DEPLOY_PORT } else { 22 }),
  # SSH 私钥文件（可选）
  [string]$Identity = $env:DEPLOY_KEY,
  # 只同步某一个集合
  [ValidateSet('both', 'courses', 'community')]
  [string]$Only = 'both',
  # 只预览将要传输的文件，不实际上传
  [switch]$DryRun,
  # 传输前清空远端对应目录（镜像等价：让源里删掉的章节也从服务器消失）
  [switch]$Clean
)

$ErrorActionPreference = 'Stop'

# 同目录可选配置文件（已 gitignore）：用 if (-not $X) 守卫，命令行显式传参优先
$configFile = Join-Path $PSScriptRoot 'sync-content.config.ps1'
if (Test-Path $configFile) { . $configFile }

if (-not $DeployHost) {
  throw '未指定目标服务器。用 -DeployHost user@host 或在 sync-content.config.ps1 配 $DeployHost。'
}

$srcBase = (Resolve-Path (Join-Path $PSScriptRoot '..\public')).Path  # website/public

$sets = switch ($Only) {
  'both' { @('courses', 'community') }
  default { @($Only) }
}

# 排除项：Obsidian 配置目录（避免被当静态资源暴露）+ 编辑器/系统垃圾。
# bsdtar 下 bare 名字排顶层、*/名字 排嵌套，双写确保各层都命中。
$excludeNames = @('.obsidian', '.DS_Store', 'Thumbs.db', '*.tmp')
$excludeArgs = @()
foreach ($n in $excludeNames) {
  $excludeArgs += "--exclude=$n"
  $excludeArgs += "--exclude=*/$n"
}

# 组装 ssh / scp 公共参数（注意 ssh 端口是 -p，scp 是 -P）
$sshArgs = @('-p', "$Port")
$scpArgs = @('-P', "$Port")
if ($Identity) { $sshArgs += @('-i', $Identity); $scpArgs += @('-i', $Identity) }

Write-Host "==> 源目录:   $srcBase"
Write-Host "==> 目标:     ${DeployHost}:$Dest  (端口 $Port)"
Write-Host "==> 同步集合: $($sets -join ', ')"
Write-Host '==> 传输方式: tar.gz + scp + 远端解包（Windows 原生 ssh/tar）'
if ($DryRun) { Write-Host '==> 模式:     DRY-RUN（仅预览，不写入服务器）' }

function Invoke-Native {
  # 参数名避开 PowerShell 自动变量 $Args，否则 splat 会取到空的自动变量导致丢参
  param([string]$Exe, [string[]]$Arguments)
  & $Exe @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "$Exe 执行失败（退出码 $LASTEXITCODE）: $Exe $($Arguments -join ' ')"
  }
}

function Sync-One {
  param([string]$SetName)

  $src = Join-Path $srcBase $SetName
  $dest = "$Dest/$SetName"

  if (-not (Test-Path $src)) {
    Write-Warning "跳过: 源目录不存在 $src"
    return
  }
  Write-Host "----- 同步 $SetName -----"

  # 打包到本地临时文件（带排除项）
  $localTmp = (New-TemporaryFile).FullName
  try {
    $tarArgs = @('-czf', $localTmp, '-C', $src) + $excludeArgs + @('.')
    Invoke-Native -Exe 'tar' -Arguments $tarArgs

    if ($DryRun) {
      Write-Host '[dry-run] 将传输以下文件:'
      & tar -tzf $localTmp
      return
    }

    # 远端临时包路径；解包后立即删除
    $remoteTmp = "/tmp/weelume-content-$SetName.tgz"
    Invoke-Native -Exe 'scp' -Arguments ($scpArgs + @($localTmp, "${DeployHost}:$remoteTmp"))

    # 远端命令：建目录 ->(可选清空)-> 解包 -> 修权限(容器内 nextjs uid 1001 可读) -> 删临时包
    $cleanPart = if ($Clean) { "rm -rf '$dest'/*; " } else { '' }
    $remoteCmd = "mkdir -p '$dest'; ${cleanPart}tar -xzf '$remoteTmp' -C '$dest' && chmod -R a+rX '$dest' && rm -f '$remoteTmp'"
    if ($Clean) { Write-Host "[clean] 传输前清空远端 $dest/*" }
    Invoke-Native -Exe 'ssh' -Arguments ($sshArgs + @($DeployHost, $remoteCmd))
  }
  finally {
    Remove-Item $localTmp -Force -ErrorAction SilentlyContinue
  }
}

foreach ($s in $sets) { Sync-One -SetName $s }

Write-Host '==> 完成。课程路由 force-dynamic 每次读盘，无需重建镜像或重启容器，下次请求即生效。'
