import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypePrism from 'rehype-prism-plus'

interface Props {
  source: string
}

// 课程 Markdown 渲染：GFM(表格/任务列表/删除线) + 数学公式(KaTeX) + 代码高亮(Prism)。
// 不启用 rehype-raw：默认不渲染原始 HTML，避免不必要的 XSS 面。
export function CourseMarkdown({ source }: Props) {
  return (
    <article className="typora-md">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, [rehypePrism, { ignoreMissing: true }]]}
      >
        {source}
      </ReactMarkdown>
    </article>
  )
}
