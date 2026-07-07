#!/usr/bin/env bash
#
# 课件内容同步脚本：把仓库里的 website/public/{courses,community}
# 增量推送到服务器上 docker bind-mount 的内容目录（默认 /srv/weelume/content）。
#
# 课程/社区路由是 force-dynamic 每次请求读盘，所以同步完成后无需重建镜像、
# 无需 docker restart，下一次请求即生效。
#
# 传输方式自动选择（不静默降级，会打印实际使用的方式）：
#   - 本机有 rsync：用 rsync over SSH，增量传输，支持 --delete 镜像删除。
#   - 本机无 rsync（典型 Windows Git Bash）：回退到 tar over SSH，全量传输。
#
# 用法：
#   ./sync-content.sh -H root@1.2.3.4
#   ./sync-content.sh -H root@1.2.3.4 --only courses --dry-run
#   ./sync-content.sh -H root@1.2.3.4 --delete            # rsync 模式镜像删除
#   ./sync-content.sh -H root@1.2.3.4 --clean             # tar 模式：先清空远端再传（镜像等价）
#
# 配置可写进脚本同目录的 sync-content.env（已被 gitignore），免得每次敲参数。

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC_BASE="$(cd "$SCRIPT_DIR/../public" && pwd)"   # website/public

# 默认值，可被 env 文件或命令行覆盖
DEPLOY_HOST="${DEPLOY_HOST:-}"
DEPLOY_DEST="${DEPLOY_DEST:-/home/deploy/workspace/website/md}"
DEPLOY_PORT="${DEPLOY_PORT:-22}"
DEPLOY_KEY="${DEPLOY_KEY:-}"
ONLY="both"
DRY_RUN="false"
DELETE="false"
CLEAN="false"

# 同目录可选配置文件（不入库，放主机/私钥等本地参数）
if [[ -f "$SCRIPT_DIR/sync-content.env" ]]; then
  # shellcheck disable=SC1091
  source "$SCRIPT_DIR/sync-content.env"
fi

usage() {
  cat <<'EOF'
课件内容同步脚本

选项:
  -H, --host <user@host>   目标服务器 SSH 地址（必填，或在 sync-content.env 配 DEPLOY_HOST）
  -d, --dest <path>        服务器上的内容根目录（默认 /srv/weelume/content）
  -p, --port <n>           SSH 端口（默认 22）
  -i, --identity <key>     SSH 私钥文件
      --only <set>         只同步 courses 或 community（默认 both）
      --dry-run            只预览将要变更的文件，不实际传输
      --delete             rsync 模式：删除源里已不存在的远端文件（镜像同步）
      --clean              tar 模式：传输前清空远端对应目录（镜像等价；危险，需显式开启）
  -h, --help               显示帮助
EOF
}

# 解析命令行参数（覆盖 env 默认值）
while [[ $# -gt 0 ]]; do
  case "$1" in
    -H|--host)     DEPLOY_HOST="$2"; shift 2 ;;
    -d|--dest)     DEPLOY_DEST="$2"; shift 2 ;;
    -p|--port)     DEPLOY_PORT="$2"; shift 2 ;;
    -i|--identity) DEPLOY_KEY="$2";  shift 2 ;;
    --only)        ONLY="$2";        shift 2 ;;
    --dry-run)     DRY_RUN="true";   shift ;;
    --delete)      DELETE="true";    shift ;;
    --clean)       CLEAN="true";     shift ;;
    -h|--help)     usage; exit 0 ;;
    *) echo "未知参数: $1" >&2; usage; exit 2 ;;
  esac
done

if [[ -z "$DEPLOY_HOST" ]]; then
  echo "错误: 未指定目标服务器。用 -H user@host 或在 sync-content.env 配 DEPLOY_HOST。" >&2
  exit 2
fi

case "$ONLY" in
  both)      SETS=(courses community) ;;
  courses)   SETS=(courses) ;;
  community) SETS=(community) ;;
  *) echo "错误: --only 只能是 courses / community / both，得到: $ONLY" >&2; exit 2 ;;
esac

# 组装 SSH 命令（端口/私钥）
SSH_OPTS=(-p "$DEPLOY_PORT")
[[ -n "$DEPLOY_KEY" ]] && SSH_OPTS+=(-i "$DEPLOY_KEY")
ssh_cmd() { ssh "${SSH_OPTS[@]}" "$DEPLOY_HOST" "$@"; }

# 排除项：Obsidian 配置目录（避免被当静态资源暴露）+ 编辑器/系统垃圾文件
EXCLUDES=(".obsidian" ".DS_Store" "Thumbs.db" "*.tmp")

USE_RSYNC="false"
command -v rsync >/dev/null 2>&1 && USE_RSYNC="true"

echo "==> 源目录:   $SRC_BASE"
echo "==> 目标:     $DEPLOY_HOST:$DEPLOY_DEST  (端口 $DEPLOY_PORT)"
echo "==> 同步集合: ${SETS[*]}"
if [[ "$USE_RSYNC" == "true" ]]; then
  echo "==> 传输方式: rsync over SSH（增量）"
else
  echo "==> 传输方式: tar over SSH（全量，本机未安装 rsync）"
  echo "    提示: 装上 rsync 可获得增量传输与 --delete 镜像删除。"
fi
[[ "$DRY_RUN" == "true" ]] && echo "==> 模式:     DRY-RUN（仅预览，不写入服务器）"

sync_one() {
  local set_name="$1"
  local src="$SRC_BASE/$set_name"
  local dest="$DEPLOY_DEST/$set_name"

  if [[ ! -d "$src" ]]; then
    echo "跳过: 源目录不存在 $src" >&2
    return 0
  fi

  echo "----- 同步 $set_name -----"

  if [[ "$USE_RSYNC" == "true" ]]; then
    local args=(-rltvz --human-readable)
    # 强制设定权限，确保容器内 nextjs(uid 1001) 可读
    args+=(--chmod=Du=rwx,Dgo=rx,Fu=rw,Fgo=r)
    for e in "${EXCLUDES[@]}"; do args+=(--exclude="$e"); done
    [[ "$DRY_RUN" == "true" ]] && args+=(--dry-run)
    [[ "$DELETE"  == "true" ]] && args+=(--delete)
    local rsh="ssh ${SSH_OPTS[*]}"
    # 先建好远端目录，再带尾斜杠同步内容
    [[ "$DRY_RUN" == "true" ]] || ssh_cmd "mkdir -p '$dest'"
    rsync "${args[@]}" -e "$rsh" "$src/" "$DEPLOY_HOST:$dest/"
  else
    # tar 回退：全量打包经 SSH 解到远端
    local tar_excludes=()
    for e in "${EXCLUDES[@]}"; do tar_excludes+=(--exclude="$e"); done
    if [[ "$DRY_RUN" == "true" ]]; then
      echo "[dry-run] 将传输以下文件:"
      tar -C "$src" "${tar_excludes[@]}" -czf - . | tar -tzf -
      return 0
    fi
    if [[ "$CLEAN" == "true" ]]; then
      # 镜像等价：清空远端对应目录后再传（危险动作，仅 --clean 时执行）
      echo "[clean] 清空远端 $dest/*"
      ssh_cmd "mkdir -p '$dest' && rm -rf '${dest:?}'/*"
    fi
    tar -C "$src" "${tar_excludes[@]}" -czf - . \
      | ssh_cmd "mkdir -p '$dest' && tar -C '$dest' -xzf - && chmod -R a+rX '$dest'"
  fi
}

for s in "${SETS[@]}"; do
  sync_one "$s"
done

echo "==> 完成。课程路由 force-dynamic 每次读盘，无需重建镜像或重启容器，下次请求即生效。"
