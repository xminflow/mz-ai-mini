import Link from 'next/link'
import type { SiteTemplatePageProps } from '../../../types'
import '../theme.css'

const PRACTICE_AREAS = [
  { title: '公司与并购', desc: '股权架构、投融资交易、并购重组的全流程法律支持。' },
  { title: '争议解决', desc: '商事诉讼与仲裁，覆盖合同、股东、知识产权纠纷。' },
  { title: '合规与风控', desc: '数据合规、劳动用工、反舞弊制度的建立与审查。' },
]

export default function HomePage({ basePath }: SiteTemplatePageProps) {
  return (
    <div>
      <header className="border-b border-[var(--tpl-rule)]">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
          <span className="text-lg tracking-wide" style={{ fontFamily: 'var(--tpl-font-display)' }}>
            Meridian
          </span>
          <div className="flex gap-8 text-sm text-[var(--tpl-fg-dim)]">
            <Link href={basePath} className="text-[var(--tpl-fg)]">
              首页
            </Link>
            <Link href={`${basePath}/team`} className="transition hover:text-[var(--tpl-fg)]">
              团队
            </Link>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-6">
        <section className="py-24">
          <p className="text-xs tracking-[0.3em] text-[var(--tpl-accent)]">EST. 2009</p>
          <h1
            className="mt-6 text-4xl leading-[1.35] sm:text-5xl sm:leading-[1.3]"
            style={{ fontFamily: 'var(--tpl-font-display)' }}
          >
            以审慎与克制
            <br />
            处理每一件重要的事
          </h1>
          <p className="mt-8 max-w-xl text-sm leading-relaxed text-[var(--tpl-fg-dim)] sm:text-base">
            Meridian 是一家专注商事领域的律师事务所。十六年来我们只做一件事：
            在关键节点上，给出经得起推敲的判断。
          </p>
          <Link
            href={`${basePath}/team`}
            className="mt-10 inline-block bg-[var(--tpl-accent)] px-7 py-3 text-sm text-[#0d1420] transition hover:opacity-90"
          >
            认识我们的团队
          </Link>
        </section>

        <section className="border-t border-[var(--tpl-rule)] py-20">
          <h2 className="text-xs tracking-[0.3em] text-[var(--tpl-fg-dim)]">专业领域</h2>
          <div className="mt-12 grid gap-12 sm:grid-cols-3">
            {PRACTICE_AREAS.map((area) => (
              <div key={area.title}>
                <span className="block h-px w-8 bg-[var(--tpl-accent)]" />
                <h3 className="mt-5 text-xl" style={{ fontFamily: 'var(--tpl-font-display)' }}>
                  {area.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--tpl-fg-dim)]">{area.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--tpl-rule)]">
        <div className="mx-auto max-w-5xl px-6 py-10 text-xs text-[var(--tpl-fg-dim)]">
          Meridian 律师事务所 · 上海市静安区南京西路 1266 号
        </div>
      </footer>
    </div>
  )
}
