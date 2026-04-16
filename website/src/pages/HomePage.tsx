import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { AuroraBackground, GradientText, Marquee, Reveal } from '../components/motion'

const HERO_STATS = [
  { value: '100+', label: '创业机会分析' },
  { value: '30+', label: '落地 AI 方案' },
  { value: '20+', label: '生态合作伙伴' },
  { value: '1对1', label: '陪跑式服务' },
]

const FEATURES = [
  {
    badge: '案例与调研',
    title: '创业机会分析 × 深度市场调研',
    description:
      '我们不做信息搬运，而是用统一的分析框架拆解成功者与失败者的关键决策，配合一手市场调研，帮你校准方向、看清真实机会，把"感觉"换成"依据"。',
    accent: 'from-violet-400 to-fuchsia-400',
  },
  {
    badge: 'AI 落地',
    title: '全链路可落地的 AI 解决方案',
    description:
      '从业务诊断、场景选型、数据治理到模型选型、流程改造与团队赋能，把 AI 能力真正植入到你业务流程的每一个环节，让 AI 不是概念，而是你的核心竞争力。',
    accent: 'from-cyan-400 to-sky-400',
  },
  {
    badge: '共赢生态',
    title: '创业者共赢生态，不再孤军奋战',
    description:
      '连接创业者、投资人、产业资源与技术伙伴，在这里资源互通、经验共享、彼此成就。合作共赢不是口号，而是我们一起找到创业成果的路径。',
    accent: 'from-fuchsia-400 to-rose-400',
  },
]

const INDUSTRIES = [
  'AI Infra',
  '消费零售',
  '智能硬件',
  '企业服务',
  '内容社区',
  '跨境出海',
  '医疗健康',
  '金融科技',
  '教育科技',
  '新能源',
]

export const HomePage = () => {
  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <AuroraBackground variant="hero" />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-4 pb-20 pt-16 text-center sm:px-6 sm:pb-24 sm:pt-24 lg:pt-32">
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="mb-7 flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.38em] text-muted sm:mb-9 sm:text-[11px]"
          >
            <span className="h-px w-6 bg-gradient-to-r from-transparent to-violet-400/70 sm:w-8" />
            AI · PARTNER · ECOSYSTEM
            <span className="h-px w-6 bg-gradient-to-l from-transparent to-cyan-300/70 sm:w-8" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif-zh max-w-4xl text-balance text-[32px] font-semibold leading-[1.45] tracking-[0.01em] sm:text-[48px] sm:leading-[1.35] lg:text-[60px] lg:leading-[1.3]"
            style={{ fontFeatureSettings: '"palt", "pkna", "calt"' }}
          >
            <span className="block">你的 AI 创业伙伴</span>
            <span className="mt-1 block sm:mt-2">
              共赢生态
              <span
                className="mx-3 inline-block h-1.5 w-1.5 translate-y-[-0.3em] rounded-full bg-ink-soft/50 sm:mx-4 sm:h-[7px] sm:w-[7px] lg:mx-5 lg:h-2 lg:w-2"
                aria-hidden
              />
              <GradientText className="font-semibold">共见结果</GradientText>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="mt-7 max-w-[540px] text-[15px] leading-[1.8] text-ink-soft sm:mt-10 sm:max-w-[640px] sm:text-base sm:leading-[1.75]"
          >
            <span className="font-medium text-ink">知道 AI 重要</span>
            <span className="mx-2 font-light text-muted">≠</span>
            <span className="font-medium text-ink">让 AI 真正创造价值</span>
            <span className="mx-1.5 text-muted">—</span>
            <br className="hidden sm:block" />
            我们用创业机会分析、全链路落地方案与共赢生态，陪你跨过这段距离。
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 flex flex-col items-center gap-3 sm:mt-10 sm:flex-row"
          >
            <Link
              to="/about"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-ink px-5 py-2.5 text-[13px] font-semibold text-canvas shadow-[0_8px_32px_rgba(167,139,250,0.3)] transition-transform hover:-translate-y-0.5 sm:px-6 sm:py-3 sm:text-sm"
            >
              <span
                aria-hidden
                className="absolute inset-0 -z-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background:
                    'linear-gradient(120deg, #A78BFA, #22D3EE, #F472B6)',
                }}
              />
              <span className="relative z-10 flex items-center gap-2">
                成为创业伙伴
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor">
                  <path d="M8.22 3.22a.75.75 0 011.06 0l4 4a.75.75 0 010 1.06l-4 4a.75.75 0 01-1.06-1.06l2.72-2.72H3a.75.75 0 010-1.5h7.94L8.22 4.28a.75.75 0 010-1.06z" />
                </svg>
              </span>
            </Link>
            <Link
              to="/cases"
              className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface/40 px-5 py-2.5 text-[13px] font-medium text-ink transition-colors hover:border-hairline-strong hover:bg-surface sm:px-6 sm:py-3 sm:text-sm"
            >
              看看我们怎么做
            </Link>
          </motion.div>

          {/* Stats */}
          <div className="mt-14 grid w-full max-w-3xl grid-cols-2 gap-x-6 gap-y-8 sm:mt-20 sm:grid-cols-4">
            {HERO_STATS.map((stat, index) => (
              <Reveal key={stat.label} delay={index * 0.08} y={16}>
                <div className="flex flex-col items-center gap-2">
                  <div className="tabular text-2xl font-semibold tracking-[-0.02em] text-ink sm:text-[32px]">
                    {stat.value}
                  </div>
                  <div className="text-[12px] text-muted sm:text-[13px]">{stat.label}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Industry marquee */}
      <section className="relative border-y border-hairline bg-surface/30 py-5 sm:py-6">
        <Marquee speed={45}>
          {INDUSTRIES.map((tag) => (
            <span
              key={tag}
              className="whitespace-nowrap text-[12px] font-medium tracking-[0.02em] text-muted/70 transition-colors hover:text-ink sm:text-[13px]"
            >
              <span className="mr-10 sm:mr-12">· {tag} ·</span>
            </span>
          ))}
        </Marquee>
      </section>

      {/* Features */}
      <section className="relative mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:py-28">
        <Reveal>
          <div className="flex flex-col gap-4">
            <span className="flex items-center gap-2.5 font-mono text-[12px] font-medium uppercase tracking-[0.34em] text-muted sm:text-[13px]">
              <span className="h-px w-5 bg-gradient-to-r from-transparent to-violet-400/60 sm:w-6" />
              我们能做什么
            </span>
            <h2 className="font-serif-zh max-w-3xl text-balance text-[22px] font-semibold leading-[1.4] tracking-[0.005em] sm:text-[26px] sm:leading-[1.35] lg:text-[32px] lg:leading-[1.3]">
              三种能力组合，
              <GradientText className="font-semibold">一起找到创业成果</GradientText>
            </h2>
            <p className="max-w-2xl text-[13px] leading-[1.85] text-ink-soft sm:text-sm sm:leading-[1.8]">
              我们把服务拆成三条紧密咬合的主线：帮你看清方向、帮你把 AI 装进业务、帮你在共赢生态里找到资源。三者合一，才是真正的「AI 创业伙伴」。
            </p>
          </div>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-12 sm:gap-5 md:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <Reveal key={feature.title} delay={index * 0.1}>
              <div className="group relative h-full overflow-hidden rounded-2xl border border-hairline bg-surface/60 p-5 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-hairline-strong sm:rounded-[22px] sm:p-7">
                <div
                  aria-hidden
                  className={`absolute -right-14 -top-14 h-40 w-40 rounded-full bg-gradient-to-br ${feature.accent} opacity-20 blur-3xl transition-opacity duration-500 group-hover:opacity-40`}
                />
                <div className="relative flex flex-col gap-3.5 sm:gap-4">
                  <span className="inline-flex w-fit items-center rounded-full border border-hairline bg-canvas/60 px-2.5 py-0.5 font-mono text-[9px] font-medium uppercase tracking-[0.2em] text-ink-soft sm:text-[10px]">
                    {feature.badge}
                  </span>
                  <h3 className="text-[15px] font-semibold leading-[1.4] text-ink sm:text-base">{feature.title}</h3>
                  <p className="text-[13px] leading-[1.85] text-muted sm:text-[13.5px]">{feature.description}</p>
                  <div className="mt-1 inline-flex items-center gap-1.5 text-[12px] text-ink-soft transition-colors group-hover:text-ink sm:text-[13px]">
                    了解更多
                    <svg viewBox="0 0 16 16" className="h-3 w-3 transition-transform group-hover:translate-x-1 sm:h-3.5 sm:w-3.5" fill="currentColor">
                      <path d="M8.22 3.22a.75.75 0 011.06 0l4 4a.75.75 0 010 1.06l-4 4a.75.75 0 01-1.06-1.06l2.72-2.72H3a.75.75 0 010-1.5h7.94L8.22 4.28a.75.75 0 010-1.06z" />
                    </svg>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Process / approach */}
      <section className="relative mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-24 lg:pb-28">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.3fr] lg:items-start lg:gap-14">
          <Reveal>
            <div className="flex flex-col gap-4">
              <span className="flex items-center gap-2.5 font-mono text-[12px] font-medium uppercase tracking-[0.34em] text-muted sm:text-[13px]">
                <span className="h-px w-5 bg-gradient-to-r from-transparent to-violet-400/60 sm:w-6" />
                我们怎么合作
              </span>
              <h2 className="font-serif-zh text-balance text-[22px] font-semibold leading-[1.4] tracking-[0.005em] sm:text-[26px] sm:leading-[1.35] lg:text-[32px] lg:leading-[1.3]">
                陪跑式合作，
                <br />
                而不是一次性咨询
              </h2>
              <p className="max-w-md text-[13px] leading-[1.85] text-ink-soft sm:text-sm sm:leading-[1.8]">
                我们不只是给建议的人。从诊断、校准、共建到协同执行、生态对接，每一步都和你的团队并肩在现场，直到结果真正发生。
              </p>
            </div>
          </Reveal>
          <div className="flex flex-col gap-2.5 sm:gap-3">
            {[
              {
                step: '01',
                title: '深度诊断',
                description: '走进你的业务现场，理解客户、优势与真实约束，而不是对着 PPT 做推演。',
              },
              {
                step: '02',
                title: '机会校准',
                description: '用创业机会分析与市场调研，把方向、节奏、切入点讲清楚，把"感觉"换成"依据"。',
              },
              {
                step: '03',
                title: 'AI 方案共建',
                description: '全链路落地 AI——场景、数据、模型、流程、团队，一条不少，只交付能跑通的结果。',
              },
              {
                step: '04',
                title: '协同执行',
                description: '以合伙人身份陪跑：对齐目标、共担风险、共见结果，不把复杂留给你自己。',
              },
              {
                step: '05',
                title: '生态对接',
                description: '打通创业者、投资人、产业与技术资源，让每一次合作都是一次杠杆放大。',
              },
            ].map((item, index) => (
              <Reveal key={item.step} delay={index * 0.06}>
                <div className="group flex items-start gap-3.5 rounded-xl border border-transparent bg-surface/40 p-4 transition-all hover:border-hairline hover:bg-surface/70 sm:gap-4 sm:rounded-2xl sm:p-5">
                  <div className="flex h-8 w-8 flex-none items-center justify-center rounded border border-hairline bg-canvas font-mono text-[10px] text-ink-soft sm:h-9 sm:w-9 sm:rounded-md sm:text-[11px]">
                    {item.step}
                  </div>
                  <div className="flex flex-col gap-1 sm:gap-1.5">
                    <h3 className="text-[14px] font-semibold text-ink sm:text-[15px]">{item.title}</h3>
                    <p className="text-[13px] leading-[1.8] text-muted sm:text-[13.5px]">{item.description}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-24 lg:pb-28">
        <Reveal>
          <div className="relative overflow-hidden rounded-[22px] border border-hairline bg-surface/40 p-7 text-center backdrop-blur-xl sm:rounded-[28px] sm:p-12 lg:p-14">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-80"
              style={{
                background:
                  'radial-gradient(circle at 20% 0%, rgba(167,139,250,0.28), transparent 55%), radial-gradient(circle at 80% 100%, rgba(34,211,238,0.22), transparent 55%)',
              }}
            />
            <div className="relative flex flex-col items-center gap-5">
              <h2 className="font-serif-zh max-w-2xl text-balance text-[22px] font-semibold leading-[1.4] tracking-[0.005em] sm:text-[26px] sm:leading-[1.35] lg:text-[32px] lg:leading-[1.3]">
                别再孤军奋战，
                <br />
                <GradientText className="font-semibold">让我们一起把AI真正用起来</GradientText>
              </h2>
              <p className="max-w-xl text-[13px] leading-[1.85] text-ink-soft sm:text-sm sm:leading-[1.8]">
                一次深度诊断 · 一份专属方案 · 一个共赢生态 —— 先从了解你的业务开始。
              </p>
              <div className="mt-1 flex flex-col items-center gap-2.5 sm:flex-row sm:gap-3">
                <Link
                  to="/about"
                  className="inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2 text-[12px] font-semibold text-canvas transition-transform hover:-translate-y-0.5 sm:px-5 sm:py-2.5 sm:text-[13px]"
                >
                  成为创业伙伴
                  <svg viewBox="0 0 16 16" className="h-3 w-3" fill="currentColor">
                    <path d="M8.22 3.22a.75.75 0 011.06 0l4 4a.75.75 0 010 1.06l-4 4a.75.75 0 01-1.06-1.06l2.72-2.72H3a.75.75 0 010-1.5h7.94L8.22 4.28a.75.75 0 010-1.06z" />
                  </svg>
                </Link>
                <Link
                  to="/cases"
                  className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-surface/60 px-5 py-2 text-[12px] font-medium text-ink transition-colors hover:border-hairline-strong sm:px-5 sm:py-2.5 sm:text-[13px]"
                >
                  先看成功案例
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
