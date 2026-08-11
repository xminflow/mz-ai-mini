'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

import { SectionHeading } from '@/components/ui'

import { ENGAGEMENT_STEPS, type EngagementStep } from './flow-data'
import { StepDiagram } from './StepDiagram'

const LAST_INDEX = ENGAGEMENT_STEPS.length - 1
const TOTAL = String(ENGAGEMENT_STEPS.length).padStart(2, '0')

// 桌面纵向轮播的几何：卡片等高、步距固定，轨道整体平移 -active × 步距即可，无需测量。
// PEEK 是上下各露出的邻卡高度——露得够多才有「前后还有内容」的轮播感。
const CARD_HEIGHT = 352
const CARD_GAP = 16
const STRIDE = CARD_HEIGHT + CARD_GAP
const PEEK = 104

const TRACK = { type: 'spring' as const, stiffness: 260, damping: 34, mass: 1 }
const FADE = { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const }

/** 每步停留时长。正文 100–140 字，再短就会读到一半被切走 */
const AUTOPLAY_MS = 6500

const MASK =
  'linear-gradient(to bottom, transparent 0%, #000 16%, #000 84%, transparent 100%)'
const MASK_X = 'linear-gradient(to right, transparent 0%, #000 8%, #000 92%, transparent 100%)'

/** 面板四角的 L 形角标。只画角、不画整圈边，是「面板」而非「卡片」的读法 */
const CORNER_CLASS = 'pointer-events-none absolute h-3.5 w-3.5 border-graphite'
const CORNERS = [
  'left-0 top-0 border-l border-t',
  'right-0 top-0 border-r border-t',
  'left-0 bottom-0 border-b border-l',
  'right-0 bottom-0 border-b border-r',
]

const CARD_CLASS =
  'relative overflow-hidden rounded-[3px] bg-paper-raised p-6 shadow-soft-lg sm:p-9'

const opacityFor = (distance: number) => (distance === 0 ? 1 : distance === 1 ? 0.3 : 0.12)

const StepCard = ({ step }: { step: EngagementStep }) => (
  <>
    {CORNERS.map((corner) => (
      <span key={corner} aria-hidden className={`${CORNER_CLASS} ${corner}`} />
    ))}

    {/* 文字列不设 1fr：否则它会被拉宽，正文左对齐后中间空出一大片 */}
    <div className="relative grid grid-cols-1 gap-6 sm:grid-cols-[minmax(0,32em)_minmax(0,1fr)] sm:gap-10">
      <div>
        <span className="block font-mono text-[11px] uppercase tracking-[0.18em] text-graphite-dim">
          STEP {step.code} / {TOTAL}
        </span>
        <h3 className="mt-3 max-w-[18em] text-[clamp(1.3rem,2.2vw,1.75rem)] font-semibold leading-[1.28] tracking-[-0.02em] text-graphite">
          {step.title}
        </h3>

        <p className="mt-4 max-w-[32em] text-[15px] leading-[1.9] text-graphite-soft">
          {step.lead}
        </p>
      </div>

      {/* 示意图也用角标框住，和面板同一套语言，读起来像面板里的一个预览位 */}
      <div className="relative self-start pl-1 pt-1 sm:mt-8">
        <span
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 h-3 w-3 border-l border-t border-rule-strong"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-0 right-0 h-3 w-3 border-b border-r border-rule-strong"
        />
        <StepDiagram
          code={step.code}
          className="h-auto w-full max-w-[13rem] text-graphite-dim sm:max-w-[16rem] lg:max-w-none"
        />
      </div>
    </div>
  </>
)

// 左侧选节点，右侧轮播呈现该节点：当前卡在正位、清晰完整，前后邻卡半透明露出一截，
// 滑到正位才逐渐清晰。桌面纵向、移动横向。
//
// 移动端刻意不用纵向：纵向滑动在手机上会和页面滚动抢同一个手势。横向走原生 scroll-snap，
// 带惯性、跟手，也不需要给卡片定死高度（一行里等高由 items-stretch 解决）。
export const ServiceFlow = () => {
  const reduce = useReducedMotion()
  const [active, setActive] = useState(0)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const pillsRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  // 自动播放的三个刹车：滚出视口、指针停在板块内、用户已明确选过某一步
  const [inView, setInView] = useState(false)
  const [pointerInside, setPointerInside] = useState(false)
  const [userTookOver, setUserTookOver] = useState(false)
  const autoplay = !reduce && inView && !pointerInside && !userTookOver

  // useCallback 是为了让自动播放的 effect 能安全地把它列进依赖：
  // 每次渲染都新建的话，effect 会跟着重建、计时器被反复清掉，自动播放永远等不到触发
  const scrollToIndex = useCallback(
    (index: number) => {
      const card = scrollerRef.current?.children[index]
      if (card instanceof HTMLElement) {
        card.scrollIntoView({
          behavior: reduce ? 'auto' : 'smooth',
          inline: 'center',
          block: 'nearest',
        })
      }
    },
    [reduce],
  )

  const select = (index: number) => {
    setActive(index)
    // 桌面时这个容器是 display:none，scrollIntoView 自然无副作用
    scrollToIndex(index)
  }

  /** 点击与键盘视为用户接管，之后不再自动播放；悬停只是暂停，移开还会继续 */
  const selectByUser = (index: number) => {
    setUserTookOver(true)
    select(index)
  }

  // 只在板块进入视口时才跑：滚走了还在后台切换，既浪费也会让人滚回来时莫名其妙
  useEffect(() => {
    const node = sectionRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.25 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  // 每步一个 setTimeout 而不是一个 setInterval：依赖 active 重建，
  // 因此手动切过去之后也能拿到完整的停留时长，不会切完立刻又被推走
  useEffect(() => {
    if (!autoplay) return
    const timer = setTimeout(() => {
      const next = active === LAST_INDEX ? 0 : active + 1
      setActive(next)
      scrollToIndex(next)
    }, AUTOPLAY_MS)
    return () => clearTimeout(timer)
  }, [autoplay, active, scrollToIndex])

  // 横向轮播被手指滑动时反推当前项：取中心线最近的那张卡
  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return

    let frame = 0
    const measure = () => {
      frame = 0
      const center = scroller.scrollLeft + scroller.clientWidth / 2
      let nearest = 0
      let best = Number.POSITIVE_INFINITY
      Array.from(scroller.children).forEach((child, index) => {
        if (!(child instanceof HTMLElement)) return
        const childCenter = child.offsetLeft + child.offsetWidth / 2
        const gap = Math.abs(childCenter - center)
        if (gap < best) {
          best = gap
          nearest = index
        }
      })
      setActive((prev) => (prev === nearest ? prev : nearest))
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }

    scroller.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      scroller.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  // 编号胶囊排不满一行时会横向滚动，当前项（可能是手指滑卡片带出来的）要自己露出来。
  // block: 'nearest' 保证只在这一行内横向滚动，不会顺带滚动整个页面。
  useEffect(() => {
    const pill = pillsRef.current?.children[active]
    if (pill instanceof HTMLElement) {
      pill.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', inline: 'center', block: 'nearest' })
    }
  }, [active, reduce])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault()
        selectByUser(active === LAST_INDEX ? 0 : active + 1)
        break
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault()
        selectByUser(active === 0 ? LAST_INDEX : active - 1)
        break
      default:
        break
    }
  }

  return (
    <section
      ref={sectionRef}
      id="process"
      // 指针停在板块内就暂停：正在读的时候被切走是自动播放最烦人的地方
      onMouseEnter={() => setPointerInside(true)}
      onMouseLeave={() => setPointerInside(false)}
      className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-28"
    >
      <SectionHeading eyebrow="How we work" title="我们的服务流程" className="mb-12 sm:mb-14" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] lg:gap-8">
      {/* 窄屏把七行列表压成一排编号胶囊，紧贴在轮播上方：一屏内同时看得到选择器和卡片，
          不必先滚过一整列列表 */}
      <div
        ref={pillsRef}
        aria-label="合作流程节点"
        onKeyDown={handleKeyDown}
        className="scrollbar-hide -mx-4 flex gap-1.5 overflow-x-auto px-4 lg:hidden"
      >
        {ENGAGEMENT_STEPS.map((item, index) => {
          const selected = index === active

          return (
            <button
              key={item.code}
              type="button"
              aria-label={`第 ${index + 1} 步：${item.short}`}
              aria-current={selected ? 'step' : undefined}
              onClick={() => selectByUser(index)}
              className={[
                'shrink-0 rounded-[3px] border px-3 py-2 font-mono text-[11px] tracking-[0.1em] transition-colors duration-150',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember',
                selected ? 'border-graphite bg-graphite text-paper' : 'border-rule text-graphite-dim',
              ].join(' ')}
            >
              {item.code}
            </button>
          )
        })}
      </div>

      <div
        aria-label="合作流程节点"
        onKeyDown={handleKeyDown}
        className="hidden self-start border-b border-rule lg:mt-[104px] lg:block"
      >
        {ENGAGEMENT_STEPS.map((item, index) => {
          const selected = index === active

          return (
            <button
              key={item.code}
              type="button"
              aria-current={selected ? 'step' : undefined}
              onMouseEnter={() => select(index)}
              onFocus={() => select(index)}
              onClick={() => selectByUser(index)}
              className={[
                'relative flex w-full items-center gap-3.5 border-t border-rule py-3.5 pl-4 pr-4 text-left transition-colors duration-150',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember',
                selected ? 'bg-graphite' : 'hover:bg-paper-raised',
              ].join(' ')}
            >
              <span
                className={[
                  'font-mono text-[11px] tracking-[0.12em] transition-colors duration-150',
                  selected ? 'text-paper/55' : 'text-graphite-dim',
                ].join(' ')}
              >
                {item.code}
              </span>
              <span
                className={[
                  'flex-1 text-[14.5px] tracking-[-0.01em] transition-colors duration-150',
                  selected ? 'font-medium text-paper' : 'text-graphite-soft',
                ].join(' ')}
              >
                {item.short}
              </span>
              {item.tag && (
                <span
                  className={[
                    'font-mono text-[10px] tracking-[0.1em] transition-colors duration-150',
                    selected ? 'text-paper/55' : 'text-graphite-dim',
                  ].join(' ')}
                >
                  {item.tag}
                </span>
              )}

              {/* 自动播放时在当前行底部走一条进度线：没有它，卡片会毫无预告地自己跳走。
                  key 绑 active，切步时重新从 0 开始跑。 */}
              {selected && autoplay && (
                <motion.span
                  key={`progress-${active}`}
                  aria-hidden
                  className="absolute bottom-0 left-0 h-[2px] w-full origin-left bg-ember"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: AUTOPLAY_MS / 1000, ease: 'linear' }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* 桌面：纵向轮播 */}
      <div
        className="relative hidden overflow-hidden lg:block"
        style={{
          height: CARD_HEIGHT + PEEK * 2,
          maskImage: MASK,
          WebkitMaskImage: MASK,
        }}
      >
        <motion.div
          className="absolute inset-x-0"
          style={{ top: PEEK }}
          animate={{ y: -(active * STRIDE) }}
          transition={reduce ? { duration: 0 } : TRACK}
        >
          {ENGAGEMENT_STEPS.map((item, index) => {
            const distance = Math.abs(index - active)
            const isActive = distance === 0

            return (
              <motion.div
                key={item.code}
                aria-hidden={isActive ? undefined : true}
                style={{ height: CARD_HEIGHT, marginBottom: CARD_GAP }}
                animate={{ opacity: opacityFor(distance), scale: isActive ? 1 : 0.975 }}
                transition={reduce ? { duration: 0 } : FADE}
                className={isActive ? CARD_CLASS : `${CARD_CLASS} pointer-events-none`}
              >
                <StepCard step={item} />
              </motion.div>
            )
          })}
        </motion.div>
      </div>

      {/* 移动：横向 scroll-snap 轮播。scrollbar-hide 是项目里已有的工具类 */}
      <div
        ref={scrollerRef}
        // 触屏没有悬停，手指一碰轮播就算接管：否则用户刚滑到某一步就又被自动推走
        onPointerDown={() => setUserTookOver(true)}
        className="scrollbar-hide -mx-4 flex snap-x snap-mandatory items-stretch gap-3 overflow-x-auto px-4 lg:hidden"
        style={{ maskImage: MASK_X, WebkitMaskImage: MASK_X }}
      >
        {ENGAGEMENT_STEPS.map((item, index) => {
          const distance = Math.abs(index - active)
          const isActive = distance === 0

          return (
            <motion.div
              key={item.code}
              aria-hidden={isActive ? undefined : true}
              animate={{ opacity: opacityFor(distance) }}
              transition={reduce ? { duration: 0 } : FADE}
              className={`${CARD_CLASS} w-[86%] shrink-0 snap-center`}
            >
              <StepCard step={item} />
            </motion.div>
          )
        })}
        </div>
      </div>
    </section>
  )
}
