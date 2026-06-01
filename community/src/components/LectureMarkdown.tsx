import type { ComponentPropsWithoutRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkCallout from '@/lib/content/remark-callout'

// data-callout 取值 → callout 容器样式（与原 LectureBlocks 三色一致）
const CALLOUT_STYLES: Record<'info' | 'warn' | 'tip', string> = {
  info: 'border-sky/40 bg-sky/10',
  warn: 'border-amber/40 bg-amber/10',
  tip: 'border-line-strong bg-white/5',
}

export default function LectureMarkdown({
  content,
  accent = '#22d3ee',
}: {
  content: string
  accent?: string
}) {
  return (
    <div>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkCallout]}
        components={{
          h2: ({ children }) => (
            <h2 className="mt-10 flex items-center gap-3 font-display text-2xl font-medium text-ink">
              <span className="h-5 w-1 flex-none rounded-pill" style={{ background: accent }} />
              {children}
            </h2>
          ),
          p: ({ children }) => <p className="mt-4 leading-relaxed text-ink-2">{children}</p>,
          ul: ({ children }) => (
            <ul className="mt-4 space-y-2 pl-5 text-ink-2 list-disc">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mt-4 space-y-2 pl-5 text-ink-2 list-decimal">{children}</ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          // 代码块：react-markdown 把围栏代码渲染为 pre > code；行内代码无 pre 包裹
          pre: ({ children }) => (
            <pre className="mt-4 overflow-x-auto rounded-card border border-line bg-surface p-4 text-sm">
              {children}
            </pre>
          ),
          code: ({ children, className }) => (
            <code className={`font-mono text-ink-2 ${className ?? ''}`}>{children}</code>
          ),
          // 告警块：remarkCallout 在 blockquote 上挂了 data-callout；无则普通引用
          blockquote: (
            props: ComponentPropsWithoutRef<'blockquote'> & { 'data-callout'?: string },
          ) => {
            const tone = props['data-callout'] as 'info' | 'warn' | 'tip' | undefined
            if (tone) {
              return (
                <div
                  className={`mt-4 rounded-card border p-4 text-sm leading-relaxed text-ink-2 ${CALLOUT_STYLES[tone]}`}
                >
                  {props.children}
                </div>
              )
            }
            return (
              <blockquote className="mt-4 border-l-2 border-line pl-4 text-ink-2">
                {props.children}
              </blockquote>
            )
          },
          img: ({ src, alt, title }) => (
            <figure className="mt-6">
              <img
                src={typeof src === 'string' ? src : ''}
                alt={alt ?? ''}
                className="w-full rounded-card border border-line"
              />
              {title && <figcaption className="mt-2 text-center text-xs text-mute">{title}</figcaption>}
            </figure>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
