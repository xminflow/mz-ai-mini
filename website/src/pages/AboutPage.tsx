import { Link } from 'react-router-dom'
import { AuroraBackground, GradientText, Reveal } from '../components/motion'

const VALUES = [
  {
    title: '伙伴关系',
    description:
      '我们不做单向的建议输出。和创业者共担风险、共见结果，在同一张作战地图上并肩推进。',
  },
  {
    title: '落地优先',
    description:
      '拒绝概念堆砌。只交付能够跑通、能被度量、能持续运转的方案，真正改变业务指标。',
  },
  {
    title: '生态共赢',
    description:
      '相信彼此成就。把创业者、投资人、产业与技术伙伴连到一起，让每一次合作都放大资源。',
  },
  {
    title: '长期主义',
    description:
      '陪跑比一次性交付重要得多。我们愿意花时间走进你的业务，也愿意在版本更新后继续陪你前进。',
  },
]

const TIMELINE = [
  { year: '2023', text: '以「创业机会分析 × 市场调研」切入，服务早期创业团队' },
  { year: '2024', text: '推出全链路 AI 解决方案，开始以合伙人身份陪跑交付' },
  { year: '2025', text: '构建创业者共赢生态，打通投资、产业与技术伙伴资源' },
  { year: '2026', text: '上线官方网站与小程序，让创业者随时找到我们' },
]

export const AboutPage = () => {
  return (
    <div className="relative">
      <section className="relative overflow-hidden">
        <AuroraBackground variant="hero" />
        <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center px-4 pb-16 pt-16 text-center sm:px-6 sm:pb-20 sm:pt-24 lg:pt-28">
          <Reveal y={16}>
            <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface/50 px-3 py-1 text-[11px] text-ink-soft backdrop-blur sm:px-3.5 sm:py-1.5 sm:text-xs">
              关于微域生光
            </span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="font-serif-zh mt-6 max-w-3xl text-balance text-[32px] font-semibold leading-[1.45] tracking-[0.01em] sm:mt-7 sm:text-[48px] sm:leading-[1.35] lg:text-[60px] lg:leading-[1.3]">
              合作共赢，
              <br className="hidden sm:block" />
              <GradientText className="font-semibold">与你一起找到创业成果</GradientText>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-6 max-w-2xl text-sm leading-[1.85] text-ink-soft sm:mt-8 sm:text-base sm:leading-[1.85]">
              我们不只是给建议的人——我们是每一位希望用 AI 驱动增长的创业者的伙伴。用创业机会分析、市场调研、全链路落地方案与共赢生态，陪你把 AI 变成真正的核心竞争力。
            </p>
          </Reveal>
        </div>
      </section>

      {/* Mission block */}
      <section className="relative mx-auto w-full max-w-5xl px-4 pb-20 sm:px-6 sm:pb-24">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-12">
          <Reveal>
            <div className="flex flex-col gap-4 sm:gap-5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted">
                · 使命 ·
              </span>
              <h2 className="font-serif-zh text-balance text-[26px] font-semibold leading-[1.35] tracking-[0.005em] sm:text-3xl sm:leading-[1.3] lg:text-4xl lg:leading-[1.25]">
                让每一位创业者，
                <br />
                <GradientText className="font-semibold">都能被 AI 真正赋能</GradientText>
              </h2>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="flex flex-col gap-4 text-sm leading-[1.85] text-ink-soft sm:gap-5 sm:text-[15px]">
              <p>
                每个行业都在被 AI 重塑，但大多数创业者面对的现实是：知道 AI 重要，却不知道怎么让 AI 真正为自己的业务创造价值。信息差、方法论、资源、落地执行——每一步都可能成为阻碍。
              </p>
              <p>
                微域生光的使命，是服务每一位希望用 AI 驱动业务增长的创业者。通过创业机会分析与深度市场调研帮你校准方向、看清机会；通过全链路可落地的 AI 解决方案把 AI 装进业务流程的每一个环节；同时构建创业者共赢生态，让资源互通、经验共享、彼此成就。
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Values */}
      <section className="relative mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-24">
        <Reveal>
          <div className="flex flex-col gap-4 sm:gap-5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted">
              · 我们相信 ·
            </span>
            <h2 className="font-serif-zh max-w-2xl text-balance text-[26px] font-semibold leading-[1.35] tracking-[0.005em] sm:text-3xl sm:leading-[1.3] lg:text-4xl lg:leading-[1.25]">
              四个底层判断，
              <GradientText className="font-semibold">贯穿每一次合作</GradientText>
            </h2>
          </div>
        </Reveal>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-12 md:grid-cols-2">
          {VALUES.map((value, index) => (
            <Reveal key={value.title} delay={index * 0.08}>
              <div className="group relative h-full overflow-hidden rounded-2xl border border-hairline bg-surface/60 p-6 backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-hairline-strong sm:rounded-3xl sm:p-7">
                <div className="flex items-start gap-4 sm:gap-5">
                  <div className="font-mono text-[11px] text-muted sm:text-xs">0{index + 1}</div>
                  <div className="flex flex-col gap-2 sm:gap-3">
                    <h3 className="text-lg font-semibold text-ink sm:text-xl">{value.title}</h3>
                    <p className="text-[14px] leading-[1.85] text-muted sm:text-[15px]">{value.description}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="relative mx-auto w-full max-w-4xl px-4 pb-20 sm:px-6 sm:pb-24">
        <Reveal>
          <div className="flex flex-col gap-4 sm:gap-5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted">
              · 时间线 ·
            </span>
            <h2 className="font-serif-zh text-balance text-[26px] font-semibold leading-[1.35] tracking-[0.005em] sm:text-3xl sm:leading-[1.3] lg:text-4xl lg:leading-[1.25]">
              一步一步，
              <GradientText className="font-semibold">长成创业者身边的伙伴</GradientText>
            </h2>
          </div>
        </Reveal>
        <div className="mt-10 flex flex-col gap-px overflow-hidden rounded-2xl border border-hairline bg-surface/40 sm:mt-12 sm:rounded-3xl">
          {TIMELINE.map((item, index) => (
            <Reveal key={item.year} delay={index * 0.08} y={12}>
              <div className="flex items-center gap-4 bg-surface/40 px-5 py-5 transition-colors hover:bg-surface/70 sm:gap-8 sm:px-8 sm:py-6">
                <div className="font-mono text-lg text-ink-soft sm:text-2xl">{item.year}</div>
                <div className="h-px flex-1 hairline-divider" />
                <div className="max-w-md text-[13px] text-ink-soft sm:text-sm lg:text-base">{item.text}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-24 lg:pb-28">
        <Reveal>
          <div className="relative overflow-hidden rounded-[24px] border border-hairline bg-surface/40 p-8 backdrop-blur-xl sm:rounded-[32px] sm:p-12 lg:p-14">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-70"
              style={{
                background:
                  'radial-gradient(circle at 80% 0%, rgba(34,211,238,0.24), transparent 55%), radial-gradient(circle at 10% 100%, rgba(167,139,250,0.24), transparent 55%)',
              }}
            />
            <div className="relative flex flex-col items-start gap-6 sm:gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex max-w-xl flex-col gap-3 sm:gap-4">
                <h2 className="font-serif-zh text-balance text-2xl font-semibold leading-[1.35] tracking-[0.005em] sm:text-3xl sm:leading-[1.3]">
                  想聊聊你的 AI 落地计划？
                </h2>
                <p className="text-sm leading-[1.85] text-ink-soft sm:text-[15px]">
                  无论你是在找方向、找方案还是找资源，都欢迎直接找我们。第一步是一次坦诚的诊断对话，然后我们再决定怎么一起往前走。
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/cases"
                  className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-[13px] font-semibold text-canvas transition-transform hover:-translate-y-0.5 sm:px-6 sm:py-3 sm:text-sm"
                >
                  查看案例
                  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor">
                    <path d="M8.22 3.22a.75.75 0 011.06 0l4 4a.75.75 0 010 1.06l-4 4a.75.75 0 01-1.06-1.06l2.72-2.72H3a.75.75 0 010-1.5h7.94L8.22 4.28a.75.75 0 010-1.06z" />
                  </svg>
                </Link>
                <Link
                  to="/cases"
                  className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface/60 px-5 py-2.5 text-[13px] font-medium text-ink transition-colors hover:border-hairline-strong sm:px-6 sm:py-3 sm:text-sm"
                >
                  查看创业机会分析
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
