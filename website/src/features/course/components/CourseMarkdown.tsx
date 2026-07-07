import type { ReactNode } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeRaw from 'rehype-raw'
import rehypeKatex from 'rehype-katex'
import rehypePrism from 'rehype-prism-plus'

import { AsciinemaCast } from './AsciinemaCast'

interface Props {
  source: string
}

// 递归取出节点里的纯文本（rehype-prism 会把内容拆进嵌套 span，需向下钻取）
function extractText(node: ReactNode): string {
  if (typeof node === 'string') return node
  if (typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(extractText).join('')
  if (node && typeof node === 'object' && 'props' in node) {
    const props = (node as { props?: { children?: ReactNode } }).props
    return extractText(props?.children)
  }
  return ''
}

function firstChild(children: ReactNode): ReactNode {
  return Array.isArray(children) ? children[0] : children
}

function classNameOf(node: ReactNode): string {
  if (node && typeof node === 'object' && 'props' in node) {
    const cls = (node as { props?: { className?: unknown } }).props?.className
    return typeof cls === 'string' ? cls : ''
  }
  return ''
}

// 自定义渲染：识别 ```asciinema 围栏块 → 渲染终端演示播放器；其余代码块保持默认(prism 高亮)
const components: Components = {
  pre({ children, ...rest }) {
    const codeChild = firstChild(children)
    if (classNameOf(codeChild).includes('language-asciinema')) {
      const src = extractText(codeChild).trim()
      if (src) return <AsciinemaCast src={src} />
    }
    return <pre {...rest}>{children}</pre>
  },
}

// 课程 Markdown 渲染：GFM(表格/任务列表/删除线) + 数学公式(KaTeX) + 代码高亮(Prism)
// + 原始 HTML/内联 SVG(rehype-raw)；并把 ```asciinema 块渲染为终端演示播放器。
// 课程 .md 是作者维护的受信静态内容(非用户输入)，启用 rehype-raw 以支持手写内联 SVG 配图；
// rehype-raw 必须位于其余 rehype 插件之前，先把原始 HTML 解析进 hast 再交给 katex/prism 处理。
export function CourseMarkdown({ source }: Props) {
  return (
    <article className="typora-md">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeKatex, [rehypePrism, { ignoreMissing: true }]]}
        components={components}
      >
        {source}
      </ReactMarkdown>
    </article>
  )
}
