import postcss, { type AtRule } from 'postcss'

// 文档级选择器映射为作用域根本身；其余作后代限定，避免污染全站
const ROOT_SELECTORS = new Set([':root', 'html', 'body'])

function scopeSelector(selector: string, scope: string): string {
  const s = selector.trim()
  if (s === '') return s
  if (ROOT_SELECTORS.has(s)) return scope
  if (s === '*') return `${scope} *`
  return `${scope} ${s}`
}

// 把一段 CSS 的所有选择器限定到 scope 容器内（默认 .course-doc）。
// 用 postcss 解析 AST 可靠处理 @media（walkRules 自然递归）与 @keyframes（步进选择器不前缀）。
export function scopeCss(rawCss: string, scope = '.course-doc'): string {
  if (!rawCss.trim()) return ''
  const root = postcss.parse(rawCss)
  root.walkRules((rule) => {
    const parent = rule.parent
    // 跳过 @keyframes / @-webkit-keyframes 内的关键帧步进（0%/50%/from/to）
    if (parent && parent.type === 'atrule' && /keyframes$/i.test((parent as AtRule).name)) {
      return
    }
    rule.selectors = rule.selectors.map((sel) => scopeSelector(sel, scope))
  })
  return root.toString()
}
