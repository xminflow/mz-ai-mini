'use client'

import { useId, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

import { ENGAGEMENT_STEPS } from './data'
import { StepDiagram } from './StepDiagram'

// 弹簧参数取自参考组件（Framer「Expand OnHover List」）：阻尼很高，滑入时不回弹
const SPRING = { type: 'spring' as const, stiffness: 400, damping: 49, mass: 1 }
const LAST_INDEX = ENGAGEMENT_STEPS.length - 1

// 左侧时间轴选节点，右侧卡片滑入呈现该节点。
// 滑入方向跟着序号走：选更靠后的一步，卡片从下方进来；往前回退则从上方进来——
// 动效本身因此在表达「顺序」，而不只是个转场特效。
export const ServiceFlow = () => {
  const reduce = useReducedMotion()
  const baseId = useId()
  const [active, setActive] = useState(0)
  const [direction, setDirection] = useState(1)

  const select = (index: number) => {
    if (index === active) return
    setDirection(index > active ? 1 : -1)
    setActive(index)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        select(active === LAST_INDEX ? 0 : active + 1)
        break
      case 'ArrowUp':
        event.preventDefault()
        select(active === 0 ? LAST_INDEX : active - 1)
        break
      default:
        break
    }
  }

  const step = ENGAGEMENT_STEPS[active]
  const enterY = direction >= 0 ? 30 : -30
  const exitY = direction >= 0 ? -22 : 22

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-14">
      <div
        role="tablist"
        aria-orientation="vertical"
        aria-label="合作流程节点"
        onKeyDown={handleKeyDown}
        className="flex flex-col"
      >
        {ENGAGEMENT_STEPS.map((item, index) => {
          const selected = index === active
          // 当前之前的连线画成实色：这一列因此同时读得出「你在第几步」
          const walked = index <= active

          return (
            <button
              key={item.code}
              type="button"
              role="tab"
              id={`${baseId}-tab-${index}`}
              aria-controls={`${baseId}-panel`}
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              onMouseEnter={() => select(index)}
              onFocus={() => select(index)}
              onClick={() => select(index)}
              className="group relative flex items-center gap-3.5 py-3 pl-7 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
            >
              {/* 连线分两段画：上半段连到上一个节点，下半段连到下一个，首尾各缺一段 */}
              {index > 0 && (
                <span
                  aria-hidden
                  className={[
                    'absolute left-[5px] top-0 h-1/2 w-px transition-colors duration-300',
                    walked ? 'bg-graphite' : 'bg-rule',
                  ].join(' ')}
                />
              )}
              {index < LAST_INDEX && (
                <span
                  aria-hidden
                  className={[
                    'absolute bottom-0 left-[5px] h-1/2 w-px transition-colors duration-300',
                    index < active ? 'bg-graphite' : 'bg-rule',
                  ].join(' ')}
                />
              )}

              {/* 当前节点的光环 */}
              <motion.span
                aria-hidden
                className="absolute left-[-4px] h-[19px] w-[19px] rounded-full border border-ember/35"
                initial={false}
                animate={{ opacity: selected ? 1 : 0, scale: selected ? 1 : 0.6 }}
                transition={reduce ? { duration: 0 } : SPRING}
              />
              <motion.span
                aria-hidden
                className={[
                  'absolute left-0 h-[11px] w-[11px] rounded-full border-[2.5px] border-paper transition-colors duration-300',
                  selected ? 'bg-ember' : walked ? 'bg-graphite' : 'bg-graphite-dim',
                ].join(' ')}
                initial={false}
                animate={{ scale: selected ? 1.15 : 1 }}
                transition={reduce ? { duration: 0 } : SPRING}
              />

              <span
                className={[
                  'tabular text-[11.5px] font-medium tracking-[0.08em] transition-colors duration-300',
                  selected ? 'text-graphite' : 'text-graphite-dim',
                ].join(' ')}
              >
                {item.code}
              </span>
              <span
                className={[
                  'text-[14.5px] tracking-[-0.01em] transition-colors duration-300',
                  selected
                    ? 'font-medium text-graphite'
                    : 'text-graphite-soft group-hover:text-graphite',
                ].join(' ')}
              >
                {item.short}
              </span>
            </button>
          )
        })}
      </div>

      {/* min-h 撑住容器：各步内容长短不一，切换时不至于整块塌下去又弹起来 */}
      <div className="lg:min-h-[24rem]">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={step.code}
            role="tabpanel"
            id={`${baseId}-panel`}
            aria-labelledby={`${baseId}-tab-${active}`}
            tabIndex={0}
            initial={reduce ? false : { opacity: 0, y: enterY }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: exitY }}
            transition={reduce ? { duration: 0 } : SPRING}
            className="relative overflow-hidden rounded-card border border-rule bg-paper-raised p-7 shadow-soft-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember sm:p-10"
          >
            {/* 这里刻意没有巨号水印编号：每步已经有示意图占住视觉重心，
                两者叠在同一个角上会互相干扰，编号交给下面的计数器就够了。 */}
            <div className="relative grid grid-cols-1 gap-7 sm:grid-cols-[minmax(0,1fr)_minmax(0,12rem)] sm:gap-9">
              <div>
                <span className="tabular block text-[12px] font-medium tracking-[0.12em] text-graphite-dim">
                  第 {active + 1} 步 / 共 {ENGAGEMENT_STEPS.length} 步
                </span>
                <h2 className="mt-3 max-w-[18em] text-[clamp(1.4rem,2.4vw,1.85rem)] font-semibold leading-[1.28] tracking-[-0.02em] text-graphite">
                  {step.title}
                </h2>

                {step.lead && (
                  <p className="mt-4 max-w-[32em] text-[15px] leading-[1.85] text-graphite-soft">
                    {step.lead}
                  </p>
                )}

                {step.gain && (
                  <div className="mt-5 border-l-2 border-graphite pl-4">
                    <span className="text-[12px] font-medium tracking-[0.08em] text-graphite-dim">
                      你能拿到
                    </span>
                    <p className="mt-1.5 max-w-[30em] text-[15px] leading-[1.85] text-graphite">
                      {step.gain}
                    </p>
                  </div>
                )}

                {step.why && (
                  <p className="mt-5 max-w-[32em] text-[15px] leading-[1.85] text-graphite-soft">
                    <span className="text-graphite-dim">为什么这么做：</span>
                    {step.why}
                  </p>
                )}

                {step.notes && (
                  <ul className="mt-5 flex flex-col gap-2">
                    {step.notes.map((note) => (
                      <li
                        key={note}
                        className="flex items-start gap-2.5 text-[15px] leading-[1.8] text-graphite-soft"
                      >
                        <span
                          aria-hidden
                          className="mt-[10px] h-1 w-1 shrink-0 rounded-full bg-graphite-dim"
                        />
                        {note}
                      </li>
                    ))}
                  </ul>
                )}

                {step.meta && (
                  <p className="mt-6 border-t border-rule pt-3 text-[12.5px] text-graphite-dim">
                    {step.meta}
                  </p>
                )}
              </div>

              <StepDiagram
                code={step.code}
                className="h-auto w-full max-w-[15rem] self-start text-graphite-dim sm:max-w-none"
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
