#!/usr/bin/env bash
#
# 构建并部署 website-admin 镜像到远程服务器。
# 流程：本地 docker build -> docker save | gzip -> scp 到远端 /tmp
#       -> 远端 docker load -> 远端 restart.sh 重启容器 -> 清理远端临时包。
#
# 该镜像只托管 SPA 静态产物；/api/v1 由外层 Caddy 反代到后端（admin.weelume.com 块）。
#
# 用法（Windows 用 WSL / Git Bash 运行）：
#   bash deploy.sh
#   bash deploy.sh --skip-build      # 跳过构建，部署已有本地镜像
#
# 可选配置写进同目录 deploy.env（已 gitignore）。

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_CTX="$SCRIPT_DIR"

DEPLOY_HOST="${DEPLOY_HOST:-deploy@weelume.com}"
DEPLOY_PORT="${DEPLOY_PORT:-22}"
DEPLOY_KEY="${DEPLOY_KEY:-}"
IMAGE="${IMAGE:-weelume-admin}"
TAG="${TAG:-latest}"
REMOTE_TMP="${REMOTE_TMP:-/tmp}"
REMOTE_RESTART="${REMOTE_RESTART:-/home/deploy/workspace/website-admin/restart.sh}"
BUILD_PROXY="${BUILD_PROXY:-}"
SKIP_BUILD="false"

if [[ -f "$SCRIPT_DIR/deploy.env" ]]; then
  # shellcheck disable=SC1091
  source "$SCRIPT_DIR/deploy.env"
fi

while [[ $# -gt 0 ]]; do
  case "$1" in
    -H|--host)     DEPLOY_HOST="$2"; shift 2 ;;
    -p|--port)     DEPLOY_PORT="$2"; shift 2 ;;
    -i|--identity) DEPLOY_KEY="$2";  shift 2 ;;
    --proxy)       BUILD_PROXY="$2"; shift 2 ;;
    --skip-build)  SKIP_BUILD="true"; shift ;;
    *) echo "未知参数: $1" >&2; exit 2 ;;
  esac
done

IMAGE_REF="$IMAGE:$TAG"
REMOTE_FILE="$REMOTE_TMP/${IMAGE}-${TAG}.tar.gz"

SSH_OPTS=(-p "$DEPLOY_PORT")
SCP_OPTS=(-P "$DEPLOY_PORT")
if [[ -n "$DEPLOY_KEY" ]]; then SSH_OPTS+=(-i "$DEPLOY_KEY"); SCP_OPTS+=(-i "$DEPLOY_KEY"); fi
ssh_cmd() { ssh "${SSH_OPTS[@]}" "$DEPLOY_HOST" "$@"; }

echo "==> 镜像:     $IMAGE_REF"
echo "==> 构建上下文: $BUILD_CTX"
echo "==> 目标:     $DEPLOY_HOST  (端口 $DEPLOY_PORT)"

if [[ "$SKIP_BUILD" == "true" ]]; then
  echo "==> 跳过构建（--skip-build）"
else
  echo "==> [1/4] docker build ..."
  BUILD_ARGS=(build -t "$IMAGE_REF")
  [[ -n "$BUILD_PROXY" ]] && BUILD_ARGS+=(--build-arg "HTTPS_PROXY=$BUILD_PROXY" --build-arg "HTTP_PROXY=$BUILD_PROXY")
  BUILD_ARGS+=("$BUILD_CTX")
  docker "${BUILD_ARGS[@]}"
fi

echo "==> [2/4] docker save | gzip -> 本地临时包 ..."
LOCAL_TGZ="$(mktemp -t weelume-admin.XXXXXX.tar.gz)"
cleanup() { rm -f "$LOCAL_TGZ"; }
trap cleanup EXIT
docker save "$IMAGE_REF" | gzip -c > "$LOCAL_TGZ"
echo "    本地包大小: $(du -h "$LOCAL_TGZ" | cut -f1)"

echo "==> [3/4] scp 上传到 $DEPLOY_HOST:$REMOTE_FILE ..."
scp "${SCP_OPTS[@]}" "$LOCAL_TGZ" "$DEPLOY_HOST:$REMOTE_FILE"

echo "==> [4/4] 远端 docker load 并执行 restart.sh ..."
ssh_cmd "set -e; \
  echo '--- docker load ---'; gunzip -c '$REMOTE_FILE' | docker load; \
  echo '--- restart.sh ---'; bash '$REMOTE_RESTART'; \
  echo '--- 清理临时包 ---'; rm -f '$REMOTE_FILE'"

echo "==> 部署完成。容器名 website-admin。"
