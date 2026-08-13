'use client'

import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

import { Reveal } from '@/components/motion/Reveal'
import { SectionHeading } from '@/components/ui'

import { ENGAGEMENT_STEPS, type EngagementStep } from './flow-data'
import { StepDiagram } from './StepDiagram'

const TOTAL = String(ENGAGEMENT_STEPS.length).padStart(2, '0')

// 横向手风琴：七条竖条并排，悬停/聚焦的那一条展开成深色面板。
//
// 过渡参数取自参考站（brandlogoreveal.framer.website）实测值：
// flex 0.72s cubic-bezier(0.22, 1, 0.26, 1)，面板内容延后 120ms 再淡入。
// 整个效果是纯 CSS flex 伸缩，不需要动画库——framer-motion 在这里只会徒增一层运行时。
const PANEL_MS = 720
const PANEL_EASE = 'cubic-bezier(0.22, 1, 0.26, 1)'
/** 面板内容比容器晚一步出现，避免文字在还没展开的窄条里闪一下 */
const CONTENT_DELAY_MS = 120

// 折叠 : 展开 = 1 : 6。六条折叠 + 一条展开共 12 份，展开条正好占一半宽度，
// 与参考站 105 : 458 的比例一致。
const COLLAPSED_FLEX = '1 1 0%'
const EXPANDED_FLEX = '6 1 0%'

/**
 * 展开面板内容的固定宽度。
 *
 * 不写 100%：容器宽度正在从窄到宽做动画，百分比会让文字在过渡期间不断重排，
 * 看起来像在抽搐。固定宽度 + overflow-hidden 让文字始终排好、由容器边缘裁切，
 * 这也是参考站的做法（过渡中途能看到文字被切断）。
 */
const PANEL_CONTENT_WIDTH = '34rem'

/**
 * 展开面板的底光。落点压在图标与标题那一组上，让近黑的面板有一处亮起来的地方——
 * 纯色平涂在这么大一块深色上会显得很死。
 *
 * 极低的白度加一点暖色温（不是品牌橙，橙色仍只留给「免费」标记），
 * 只在余光里感觉得到，正眼看不出是一层渐变。
 */
const PANEL_GLOW =
  'radial-gradient(62% 52% at 24% 64%, rgb(255 240 232 / 0.085), transparent 72%)'

/**
 * 入场：滚到板块时七条竖条自下而上逐条立起，随后才开始自动播放。
 *
 * 触发点看列表本身而不是整个 section：section 还含标题和上下留白，按它算比例会在
 * 竖条一点没露头时就先立完。进 0.2、出 0 两条线留出滞后区，避免边界上反复触发。
 */
const ENTER_MS = 560
const ENTER_STEP_MS = 70
const ENTER_RATIO = 0.2
const ENTER_TOTAL_MS = ENTER_MS + ENTER_STEP_MS * (ENGAGEMENT_STEPS.length - 1)

/** 自动播放每步停留时长。一条正文 40-60 字，3 秒够看完标题和第一行 */
const AUTOPLAY_MS = 3000

/**
 * 折叠竖条：居中的竖排名称 + 底部编号。
 *
 * 刻意不在这里放线框图标：那七张图是 200×132 的细节示意图，缩到 24px 宽只剩一团噪点，
 * 06、07 那种带小配件的还会看着像画坏了。图标留到展开面板里放大呈现。
 */
const CollapsedFace = ({ step, open }: { step: EngagementStep; open: boolean }) => (
  <span
    className={[
      'absolute inset-y-0 left-0 flex w-[var(--strip-w)] flex-col items-center py-8 transition-opacity',
      open ? 'opacity-0 duration-200' : 'opacity-100 duration-300',
    ].join(' ')}
    style={open ? undefined : { transitionDelay: `${CONTENT_DELAY_MS}ms` }}
  >
    {/* 顶部一小段竖线：折叠条上半部原本是一整片空白，一条线就够把它收住，
        与底部编号一上一下形成书脊的两端 */}
    <span className="h-5 w-px bg-rule-strong" />

    <span className="flex flex-1 items-center">
      {/* 中文竖排走 writing-mode，字距拉开才有参考站那种「书脊」的读法 */}
      <span className="[writing-mode:vertical-rl] text-[17px] tracking-[0.25em] text-graphite-soft">
        {step.short}
      </span>
    </span>

    <span className="font-mono text-[12px] tracking-[0.14em] text-graphite-dim">{step.code}</span>
  </span>
)

/** 展开面板：顶部编号，底部「图标 → 标题 → 正文」一组 */
const ExpandedFace = ({ step, open }: { step: EngagementStep; open: boolean }) => (
  <div
    className={[
      'pointer-events-none absolute inset-y-0 left-0 flex flex-col justify-between p-10 transition-opacity',
      open ? 'opacity-100 duration-[450ms]' : 'opacity-0 duration-200',
    ].join(' ')}
    style={{
      width: PANEL_CONTENT_WIDTH,
      transitionDelay: open ? `${CONTENT_DELAY_MS}ms` : undefined,
    }}
  >
    <div>
      <p className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-paper/45">
        STEP {step.code} / {TOTAL}
        {step.tag && (
          <>
            <span aria-hidden className="h-3 w-px bg-paper/20" />
            <span className="tracking-[0.1em] text-ember">{step.tag}</span>
          </>
        )}
      </p>
      {/* 编号下一条短横线：顶部原本只有孤零零一行小字，加条线才压得住这片留白 */}
      <span aria-hidden className="mt-5 block h-px w-10 bg-paper/25" />
    </div>

    {/* 图标紧贴标题成为一组，与参考站「标记 → 名称 → 描述」的下沉节奏一致；
        单独居中会让它悬在半空、和文字断开 */}
    <div className="max-w-[25rem]">
      <StepDiagram code={step.code} className="mb-6 h-16 w-auto text-paper/70" />
      <h3 className="text-[1.65rem] font-semibold leading-[1.3] tracking-[-0.02em] text-paper">
        {step.title}
      </h3>
      <p className="mt-3 text-[14.5px] leading-[1.85] text-paper/65">{step.lead}</p>
    </div>
  </div>
)

// 服务流程板块。
//
// 桌面是横向手风琴；窄屏没有横向空间容纳七条竖条，也没有悬停，改为七步全部展开的纵向列表——
// 手机上「点开才看得到」只会多一道无谓的门槛。
export const ServiceFlow = () => {
  const reduce = useReducedMotion()
  const listRef = useRef<HTMLDivElement>(null)

  // 入场期间不展开任何一条：七条竖条先整齐立好，再由自动播放把第 01 条推开，
  // 那一下才是「开始播放」的信号。用 null 表示这个「都还收着」的状态
  const [active, setActive] = useState<number | null>(null)
  // idle=还没立起 → entering=正在逐条立起 → live=交给自动播放。
  // 列表滚出视野退回 idle，下次经过重播，与上方「软件类型」板块一致
  const [phase, setPhase] = useState<'idle' | 'entering' | 'live'>('idle')
  // 悬停、聚焦、点击任一发生就算用户接管，此后不再自动跑
  const [userTookOver, setUserTookOver] = useState(false)

  useEffect(() => {
    const node = listRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= ENTER_RATIO) {
          setPhase((current) => (current === 'idle' ? 'entering' : current))
        } else if (!entry.isIntersecting) {
          // 完全离开视野才收回，并把播放进度一并复位，下次经过从第 01 步重新开始
          setPhase('idle')
          setActive(null)
          setUserTookOver(false)
        }
      },
      { threshold: [0, ENTER_RATIO] },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  // 立起跑完再交给自动播放，否则第 01 条会在竖条还没站定时就被推开。
  // 这个定时器必须自成一个 effect：和上面的触发写在一起会自毁——setPhase 让那个 effect
  // 重跑，清理函数把刚设的定时器清掉，之后又被 guard 挡住不再重设
  useEffect(() => {
    if (phase !== 'entering') return
    const timer = setTimeout(
      () => {
        setPhase('live')
        setActive(0)
      },
      reduce ? 0 : ENTER_TOTAL_MS,
    )
    return () => clearTimeout(timer)
  }, [phase, reduce])

  // 每步一个 setTimeout 而不是 setInterval：依赖 active 重建，
  // 用户手动看过某一条之后也能拿到完整停留时长
  useEffect(() => {
    if (reduce || phase !== 'live' || userTookOver) return
    const timer = setTimeout(
      () => setActive((current) => ((current ?? 0) + 1) % ENGAGEMENT_STEPS.length),
      AUTOPLAY_MS,
    )
    return () => clearTimeout(timer)
  }, [reduce, phase, userTookOver, active])

  /** 用户主动看某一条：接管播放，之后由鼠标说了算 */
  const takeOver = (index: number) => {
    setUserTookOver(true)
    setActive(index)
  }

  const shown = phase !== 'idle'
  const enterMs = reduce ? 0 : ENTER_MS

  return (
    <section id="process" className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
      {/* once=false：竖条每次经过都重新立起，标题跟着一起，不然滚回来只有列表在动 */}
      <Reveal once={false}>
        <SectionHeading eyebrow="How we work" title="我们的服务流程" className="mb-12 sm:mb-16" />
      </Reveal>

      {/* 入场的观察对象是这一层：ul 在窄屏是 display:none，盯着它会永远不相交，
          窄屏那份列表就再也立不起来 */}
      <div ref={listRef}>
      {/* 桌面：横向手风琴。--strip-w 是折叠态内容的固定宽度，与 flex 比例对应。
          鼠标离开整行不收起：全部收起会让板块变成一排空白竖条，回来时还得重新找位置。

          这一层只负责圆角、描边、投影，绝不能加 backdrop-filter——父级一旦有它就会成为
          子元素的 backdrop root，七条 li 的玻璃会全部失效（同类事故见 ServiceTypes 的 maskImage）。
          高度 32rem 而非 30rem：图标放大到 h-36 后，最长的第 06 步文案在 30rem 下会溢出 11px。 */}
      <ul
        aria-label="合作流程"
        className="hidden h-[32rem] overflow-hidden rounded-card border border-rule shadow-soft-lg lg:flex"
        style={{ ['--strip-w' as string]: '5.75rem' }}
      >
        {ENGAGEMENT_STEPS.map((step, index) => {
          const open = index === active
          const panelId = `process-panel-${step.code}`

          return (
            <li
              key={step.code}
              style={{
                flex: open ? EXPANDED_FLEX : COLLAPSED_FLEX,
                opacity: shown ? 1 : 0,
                transform: shown ? 'none' : 'translateY(20px)',
                // 逐条立起的延迟只能分别挂在 opacity/transform 上。写成一条统一的
                // duration/delay 会把 flex 一起延后，展开就跟不上鼠标了
                transition: [
                  `flex ${PANEL_MS}ms ${PANEL_EASE}`,
                  `background-color ${PANEL_MS}ms ${PANEL_EASE}`,
                  `opacity ${enterMs}ms ease-out ${reduce ? 0 : index * ENTER_STEP_MS}ms`,
                  `transform ${enterMs}ms ${PANEL_EASE} ${reduce ? 0 : index * ENTER_STEP_MS}ms`,
                ].join(', '),
              }}
              className={[
                'relative min-w-0 overflow-hidden border-l border-rule first:border-l-0',
                open ? 'bg-graphite' : 'bg-paper-raised',
              ].join(' ')}
            >
              {/* 底光挂在 li 上而不是面板内容里：内容宽度写死 34rem，光晕跟着它会在
                  过渡途中被裁出一道硬边；挂在这里则始终铺满当前宽度，随伸缩自然缩放 */}
              <span
                aria-hidden
                className={[
                  'pointer-events-none absolute inset-0 transition-opacity',
                  open ? 'opacity-100 duration-[600ms]' : 'opacity-0 duration-200',
                ].join(' ')}
                style={{ backgroundImage: PANEL_GLOW }}
              />

              {/* 详情不放进按钮内部：否则按钮的可访问名会变成整段 140 字正文。
                  按钮只负责命中区域与名称，详情作为它的兄弟节点由 aria-controls 关联 */}
              <div id={panelId} aria-hidden={open ? undefined : true}>
                <ExpandedFace step={step} open={open} />
              </div>

              <button
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                aria-label={`第 ${index + 1} 步：${step.short}`}
                onMouseEnter={() => takeOver(index)}
                onFocus={() => takeOver(index)}
                onClick={() => takeOver(index)}
                className="absolute inset-0 z-10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ember"
              >
                <CollapsedFace step={step} open={open} />
              </button>
            </li>
          )
        })}
      </ul>

      {/* 窄屏：七步顺排，不折叠。没有悬停也就没有自动播放，只保留同一套逐条立起 */}
      <ol className="border-t border-rule lg:hidden">
        {ENGAGEMENT_STEPS.map((step, index) => (
          <li
            key={step.code}
            className="border-b border-rule py-7"
            style={{
              opacity: shown ? 1 : 0,
              transform: shown ? 'none' : 'translateY(20px)',
              transition: [
                `opacity ${enterMs}ms ease-out ${reduce ? 0 : index * ENTER_STEP_MS}ms`,
                `transform ${enterMs}ms ${PANEL_EASE} ${reduce ? 0 : index * ENTER_STEP_MS}ms`,
              ].join(', '),
            }}
          >
            <div className="flex items-center gap-3">
              <span className="font-mono text-[11px] tracking-[0.12em] text-graphite-dim">
                {step.code} / {TOTAL}
              </span>
              {step.tag && (
                <>
                  <span aria-hidden className="h-3 w-px bg-rule-strong" />
                  <span className="font-mono text-[10px] tracking-[0.1em] text-ember">
                    {step.tag}
                  </span>
                </>
              )}
            </div>

            <div className="mt-3 flex items-start justify-between gap-6">
              <h3 className="text-[1.35rem] font-semibold leading-[1.3] tracking-[-0.02em] text-graphite">
                {step.title}
              </h3>
              <StepDiagram code={step.code} className="h-12 w-auto shrink-0 text-graphite-dim" />
            </div>

            <p className="mt-3 text-[14.5px] leading-[1.85] text-graphite-soft">{step.lead}</p>
          </li>
        ))}
      </ol>
      </div>
    </section>
  )
}
