import type { Components } from 'react-markdown'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownRendererProps {
  content: string
  className?: string
}

const components: Components = {
  h1: ({ children }) => (
    <h1 className="mt-8 mb-4 text-2xl font-semibold leading-snug text-ink first:mt-0">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-6 mb-3 text-xl font-semibold leading-snug text-ink">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-5 mb-2 text-lg font-semibold leading-snug text-ink">{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className="mt-4 mb-2 text-base font-semibold text-ink">{children}</h4>
  ),
  p: ({ children }) => (
    <p className="mb-4 text-sm leading-relaxed text-ink-soft">{children}</p>
  ),
  a: ({ href, children }) => (
    <a href={href} className="text-accent underline decoration-accent/40 underline-offset-2 transition-colors hover:text-accent/80" target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul className="mb-4 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-ink-soft">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-4 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-ink-soft">{children}</ol>
  ),
  li: ({ children }) => <li className="pl-1">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="my-4 border-l-2 border-accent pl-4 text-sm italic text-muted">{children}</blockquote>
  ),
  code: ({ className, children }) => {
    const isBlock = className?.startsWith('language-')
    if (isBlock) {
      return (
        <code className="block overflow-x-auto rounded-lg bg-surface-2/80 p-4 font-mono text-xs leading-relaxed text-ink-soft">
          {children}
        </code>
      )
    }
    return (
      <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-xs text-ink-soft">{children}</code>
    )
  },
  pre: ({ children }) => <pre className="mb-4">{children}</pre>,
  hr: () => <hr className="my-6 border-hairline" />,
  table: ({ children }) => (
    <div className="mb-4 overflow-x-auto">
      <table className="w-full text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="border-b border-hairline-strong text-xs font-semibold uppercase tracking-wider text-muted">{children}</thead>
  ),
  tbody: ({ children }) => <tbody className="divide-y divide-hairline">{children}</tbody>,
  tr: ({ children }) => <tr>{children}</tr>,
  th: ({ children }) => <th className="px-3 py-2 text-left">{children}</th>,
  td: ({ children }) => <td className="px-3 py-2 text-ink-soft">{children}</td>,
  img: ({ src, alt }) => (
    <img src={src} alt={alt ?? ''} className="my-4 max-w-full rounded-lg" loading="lazy" />
  ),
  strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
  em: ({ children }) => <em>{children}</em>,
}

export const MarkdownRenderer = ({ content, className }: MarkdownRendererProps) => (
  <div className={className}>
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {content}
    </ReactMarkdown>
  </div>
)
