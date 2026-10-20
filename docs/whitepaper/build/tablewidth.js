// pandoc 的 pipe table 用分隔行里破折号的长度决定列宽比例。
// 源 markdown 全是 |---|---| 的等长写法，导致 Word 里「#」列和正文列一样宽。
// 这里按每列的实际内容宽度重算分隔行，让列宽贴合内容。
const fs = require('fs')

const src = fs.readFileSync(process.argv[2], 'utf8')
const lines = src.split('\n')

/** 显示宽度：CJK 与全角标点按 2 计，其余按 1 计 */
function width(str) {
  const plain = str
    .replace(/\*\*|__|`/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .trim()
  let w = 0
  for (const ch of plain) {
    const c = ch.codePointAt(0)
    w += (c >= 0x1100 && c <= 0x115f) ||
      (c >= 0x2e80 && c <= 0xa4cf) ||
      (c >= 0xac00 && c <= 0xd7a3) ||
      (c >= 0xf900 && c <= 0xfaff) ||
      (c >= 0xfe30 && c <= 0xfe4f) ||
      (c >= 0xff00 && c <= 0xff60) ||
      (c >= 0xffe0 && c <= 0xffe6)
      ? 2
      : 1
  }
  return w
}

const splitRow = (line) =>
  line.replace(/^\s*\|/, '').replace(/\|\s*$/, '').split('|')

const isSep = (line) => /^\s*\|[\s:|-]+\|\s*$/.test(line) && line.includes('-')
const isRow = (line) => /^\s*\|.*\|\s*$/.test(line)

/** 单元格宽度上限：防止某一条特别长的说明把其他列挤没 */
const CAP = 46
/** 分隔行总破折号数，越大比例越精细 */
const TOTAL = 120

let changed = 0
for (let i = 0; i < lines.length; i++) {
  if (!isSep(lines[i]) || i === 0 || !isRow(lines[i - 1])) continue

  // 收集这张表的所有行（表头 + 分隔行 + 数据行）
  const header = splitRow(lines[i - 1])
  const cols = header.length
  const maxima = header.map((h) => Math.min(width(h), CAP))

  for (let j = i + 1; j < lines.length && isRow(lines[j]); j++) {
    const cells = splitRow(lines[j])
    for (let c = 0; c < Math.min(cols, cells.length); c++) {
      maxima[c] = Math.max(maxima[c], Math.min(width(cells[c]), CAP))
    }
  }

  const sum = maxima.reduce((a, b) => a + b, 0) || 1
  const dashes = maxima.map((m) => Math.max(3, Math.round((m / sum) * TOTAL)))
  lines[i] = '|' + dashes.map((d) => '-'.repeat(d)).join('|') + '|'
  changed++
}

fs.writeFileSync(process.argv[3], lines.join('\n'))
console.log(`已重算 ${changed} 张表的列宽`)
