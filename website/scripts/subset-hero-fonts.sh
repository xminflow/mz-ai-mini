#!/usr/bin/env bash
# 首页 Hero 字体子集化。
#
# 阿里巴巴普惠体全量字库单字重约 9MB，不可能直接上线；Hero 的标语与副标题总共只有
# 七十来个不重复的字，子集之后两个文件合计不到 12KB。这个脚本就是把全量字库压到那个体积。
#
# 什么时候需要重跑：
#   1. 换了官方下载的字体文件（建议正式上线前从 fonts.alibabagroup.com 走一遍官方授权）
#   2. 改了 Hero 的标语或副标题文案——新字不在子集里就会掉回系统字体，
#      表现为「个别字忽然变成微软雅黑」，这是最容易漏掉的一种回归
#
# 用法：把两个全量字重放到本脚本同级目录，命名为 PuHuiTi-Bold.ttf / PuHuiTi-Medium.ttf，然后
#   bash scripts/subset-hero-fonts.sh
#
# 依赖用 uvx 临时拉起，不写进项目依赖。brotli 是 woff2 压缩必需，缺它会报 "No module named brotli"。

set -euo pipefail
cd "$(dirname "$0")"

OUT_DIR="../src/app/fonts"

# 这两串必须与 Hero.tsx 里的文案逐字对应。副标题串已去掉重复字符与标点中的空格，
# 顺序无所谓，pyftsubset 只关心字符集合。
TITLE_TEXT="把软件定制做成您的专属贵宾服务"
SUB_TEXT="从需求梳理、产品设计，到开发交付与后期运营全流程1对深度服务我们将7×24小时为您提供专属的人员以行业标准来做软件定制生意"

subset() {
  local src="$1" text="$2" out="$3"
  [ -f "$src" ] || { echo "缺少字体源文件：$src" >&2; exit 1; }
  uvx --with brotli --from fonttools pyftsubset "$src" \
    --text="$text" \
    --flavor=woff2 \
    --output-file="$OUT_DIR/$out" \
    --layout-features='' \
    --no-hinting \
    --desubroutinize
  printf '%s  %s 字节\n' "$out" "$(stat -c%s "$OUT_DIR/$out")"
}

subset PuHuiTi-Bold.ttf   "$TITLE_TEXT" puhuiti-title.woff2
subset PuHuiTi-Medium.ttf "$SUB_TEXT"   puhuiti-sub.woff2
