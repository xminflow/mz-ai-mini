#!/usr/bin/env bash
#
# 构建并部署 weelume-website 镜像到远程服务器。
# 流程：本地 docker build -> docker save | gzip -> scp 到远端 /tmp
#       -> 远端 docker load -> 远端 restart.sh 重启容器 -> 清理远端临时包。
#
# 课件内容不在镜像里（走 bind-mount，见 sync-content.ps1），所以本脚本只负责
# 代码镜像的更新；换镜像不影响已挂载的 courses/community 内容。
#
# 用法（Windows 用 Git Bash 运行）：
#   bash deploy.sh                      # 全流程：构建+部署
#   bash deploy.sh --proxy http://192.168.32.1:7078   # 构建走代理
#   bash deploy.sh --skip-build         # 跳过构建，部署已有本地镜像
#
# 可选配置写进同目录 deploy.env（已 gitignore）。

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WEBSITE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"   # website/，docker build 上下文

# 默认值，可被 deploy.env 或命令行覆盖
DEPLOY_HOST="${DEPLOY_HOST:-deploy@weelume.com}"
DEPLOY_PORT="${DEPLOY_PORT:-22}"
DEPLOY_KEY="${DEPLOY_KEY:-}"
IMAGE="${IMAGE:-weelume-website}"
TAG="${TAG:-latest}"
REMOTE_TMP="${REMOTE_TMP:-/tmp}"
REMOTE_RESTART="${REMOTE_RESTART:-/home/deploy/workspace/website/restart.sh}"
BUILD_PROXY="${BUILD_PROXY:-}"
SKIP_BUILD="false"

if [[ -f "$SCRIPT_DIR/deploy.env" ]]; then
  # shellcheck disable=SC1091
  source "$SCRIPT_DIR/deploy.env"
fi

usage() {
  cat <<'EOF'
构建并部署 weelume-website 镜像

选项:
  -H, --host <user@host>   目标服务器（默认 deploy@weelume.com）
  -p, --port <n>           SSH 端口（默认 22）
  -i, --identity <key>     SSH 私钥
      --proxy <url>        docker build 走代理（HTTPS_PROXY）
      --skip-build         跳过构建，直接部署本地已有镜像
  -h, --help               显示帮助
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    -H|--host)     DEPLOY_HOST="$2"; shift 2 ;;
    -p|--port)     DEPLOY_PORT="$2"; shift 2 ;;
    -i|--identity) DEPLOY_KEY="$2";  shift 2 ;;
    --proxy)       BUILD_PROXY="$2"; shift 2 ;;
    --skip-build)  SKIP_BUILD="true"; shift ;;
    -h|--help)     usage; exit 0 ;;
    *) echo "未知参数: $1" >&2; usage; exit 2 ;;
  esac
done

IMAGE_REF="$IMAGE:$TAG"
REMOTE_FILE="$REMOTE_TMP/${IMAGE}-${TAG}.tar.gz"

# 组装 ssh / scp 参数（ssh 端口 -p，scp 端口 -P）
SSH_OPTS=(-p "$DEPLOY_PORT")
SCP_OPTS=(-P "$DEPLOY_PORT")
if [[ -n "$DEPLOY_KEY" ]]; then SSH_OPTS+=(-i "$DEPLOY_KEY"); SCP_OPTS+=(-i "$DEPLOY_KEY"); fi
ssh_cmd() { ssh "${SSH_OPTS[@]}" "$DEPLOY_HOST" "$@"; }

echo "==> 镜像:     $IMAGE_REF"
echo "==> 构建上下文: $WEBSITE_DIR"
echo "==> 目标:     $DEPLOY_HOST  (端口 $DEPLOY_PORT)"
echo "==> 远端临时包: $REMOTE_FILE"

# 1) 构建
if [[ "$SKIP_BUILD" == "true" ]]; then
  echo "==> 跳过构建（--skip-build）"
else
  echo "==> [1/4] docker build ..."
  BUILD_ARGS=(build -t "$IMAGE_REF")
  [[ -n "$BUILD_PROXY" ]] && BUILD_ARGS+=(--build-arg "HTTPS_PROXY=$BUILD_PROXY" --build-arg "HTTP_PROXY=$BUILD_PROXY")
  BUILD_ARGS+=("$WEBSITE_DIR")
  docker "${BUILD_ARGS[@]}"
fi

# 2) 导出 + scp（本地临时包用完即删）
echo "==> [2/4] docker save | gzip -> 本地临时包 ..."
LOCAL_TGZ="$(mktemp -t weelume-website.XXXXXX.tar.gz)"
cleanup() { rm -f "$LOCAL_TGZ"; }
trap cleanup EXIT
docker save "$IMAGE_REF" | gzip -c > "$LOCAL_TGZ"
echo "    本地包大小: $(du -h "$LOCAL_TGZ" | cut -f1)"

echo "==> [3/4] scp 上传到 $DEPLOY_HOST:$REMOTE_FILE ..."
scp "${SCP_OPTS[@]}" "$LOCAL_TGZ" "$DEPLOY_HOST:$REMOTE_FILE"

# 3) 远端 load + 重启 + 清理（任一步失败立即中止）
echo "==> [4/4] 远端 docker load 并执行 restart.sh ..."
ssh_cmd "set -e; \
  echo '--- docker load ---'; gunzip -c '$REMOTE_FILE' | docker load; \
  echo '--- restart.sh ---'; bash '$REMOTE_RESTART'; \
  echo '--- 清理临时包 ---'; rm -f '$REMOTE_FILE'"

echo "==> 部署完成。容器名 website，可用以下命令核验："
echo "    ssh $DEPLOY_HOST \"docker ps --filter name=website; docker logs --tail=30 website\""
