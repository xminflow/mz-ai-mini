import Link from 'next/link'
import type { SiteTemplatePageProps } from '../../../types'
import '../theme.css'

const MEMBERS = [
  { name: '沈砚舟', role: '创始合伙人', focus: '公司与并购 · 投融资' },
  { name: '陆确', role: '权益合伙人', focus: '商事诉讼 · 仲裁' },
  { name: '周宛清', role: '资深律师', focus: '数据合规 · 劳动用工' },
  { name: '许知远', role: '资深律师', focus: '知识产权 · 反不正当竞争' },
]

export default function TeamPage({ basePath }: SiteTemplatePageProps) {
  return (
    <div>
      <header className="border-b border-[var(--tpl-rule)]">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
          <Link
            href={basePath}
            className="text-lg tracking-wide"
            style={{ fontFamily: 'var(--tpl-font-display)' }}
          >
            Meridian
          </Link>
          <div className="flex gap-8 text-sm text-[var(--tpl-fg-dim)]">
            <Link href={basePath} className="transition hover:text-[var(--tpl-fg)]">
              首页
            </Link>
            <span className="text-[var(--tpl-fg)]">团队</span>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-20">
        <h1 className="text-3xl sm:text-4xl" style={{ fontFamily: 'var(--tpl-font-display)' }}>
          团队
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-[var(--tpl-fg-dim)]">
          四位合伙人与律师，各自守着一个方向，不做超出能力边界的承诺。
        </p>

        <ul className="mt-16 divide-y divide-[var(--tpl-rule)] border-y border-[var(--tpl-rule)]">
          {MEMBERS.map((member) => (
            <li key={member.name} className="flex flex-wrap items-baseline gap-x-6 gap-y-1 py-6">
              <span className="text-xl" style={{ fontFamily: 'var(--tpl-font-display)' }}>
                {member.name}
              </span>
              <span className="text-xs tracking-widest text-[var(--tpl-accent)]">{member.role}</span>
              <span className="ml-auto text-sm text-[var(--tpl-fg-dim)]">{member.focus}</span>
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}
