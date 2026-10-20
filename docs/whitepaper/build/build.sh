#!/usr/bin/env bash
# 由 markdown 生成 Word 白皮书。
#
# 依赖：pandoc、node。在本目录下执行：bash build.sh
#
# 流程：
#   1. patch.js   —— 把 pandoc 的默认参考文档改成本项目的排版规范（中文字体、
#                    标题层级、表格样式、页边距、页脚页码），产物是 reference.docx
#   2. 预处理     —— 剥掉 markdown 自带的标题行（改由 pandoc 元数据渲染成封面）、
#                    去掉分隔线、把目录里的锚点链接转成纯文本、把 ✅/❌ 换成中文
#   3. tablewidth.js —— 按每列实际内容宽度重写表格分隔行。pandoc 用分隔行的
#                    破折号长度决定列宽，源文件全是等长写法，不改的话 Word 里
#                    「#」列会和正文列一样宽
#   4. pandoc     —— 套用 reference.docx 生成 docx
set -euo pipefail

cd "$(dirname "$0")"
SRC="../软件定制服务白皮书.md"
OUT="../软件定制服务白皮书.docx"

# 1. 重建参考文档（样式模板）
rm -rf ref && mkdir ref && (cd ref && pandoc --print-default-data-file reference.docx > _d.docx && unzip -qo _d.docx && rm _d.docx)
node patch.js
node zipdir.js ref reference.docx

# 2. 预处理正文
{
  printf '::: {custom-style="CoverLine"}\n企业级的软件交付标准，不是中小企业不需要，是过去买不起\n:::\n\n'
  sed '1,5d' "$SRC" \
    | grep -v '^---$' \
    | sed -e 's/\[\([^]]*\)\](#[^)]*)/\1/g' -e 's/✅/**是**/g' -e 's/❌/**否**/g'
} > _body.md

# 3. 表格列宽
node tablewidth.js _body.md _body2.md

# 4. 生成
pandoc _body2.md -o "$OUT" \
  --reference-doc=reference.docx \
  --metadata title="软件定制服务白皮书" \
  --metadata subtitle="把大型企业的软件交付标准，带到中小企业的定制项目上"

rm -f _body.md _body2.md
echo "已生成 $OUT"
