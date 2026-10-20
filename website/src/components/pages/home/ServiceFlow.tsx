'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

import { Reveal } from '@/components/motion/Reveal'
import { SectionHeading } from '@/components/ui'
import { useSiteLocale } from '@/features/site-i18n/SiteLocaleProvider'
import { EN_ENGAGEMENT_STEPS } from './home.en'
import { ENGAGEMENT_STEPS as ZH_ENGAGEMENT_STEPS, type EngagementStep } from './flow-data'

const STEP_ICONS = ['comment-text', 'reference', 'kanban', 'diagram-project', 'api-brackets', 'browser', 'server']
const STEP_TONES = ['blue', 'yellow', 'red', 'blue', 'yellow', 'red', 'blue']
const STEP_DURATION_MS = 5000

const StepDetail = ({ step, index, label }: { step: EngagementStep; index: number; label: string }) => (
  <div className="home-flow-detail-content">
    <div className="home-flow-detail-top">
      <span className="home-flow-step-meta">STEP {step.code} / {String(ZH_ENGAGEMENT_STEPS.length).padStart(2, '0')}</span>
      <span className="home-flow-art" aria-hidden="true">
        <span style={{ maskImage: `url(/home/icons/overflow/${STEP_ICONS[index]}.svg)`, WebkitMaskImage: `url(/home/icons/overflow/${STEP_ICONS[index]}.svg)` }} />
      </span>
    </div>
    <div className="home-flow-description">
      <h3>{step.title}</h3>
      <p>{step.lead}</p>
    </div>
    <div className="home-flow-deliverables">
      <p>{label}</p>
      <ul>{step.deliverables.map(item => <li key={item}><i aria-hidden="true" />{item}</li>)}</ul>
    </div>
  </div>
)

export const ServiceFlow = () => {
  const { locale, copy } = useSiteLocale()
  const steps = locale === 'en' ? EN_ENGAGEMENT_STEPS : ZH_ENGAGEMENT_STEPS
  const sectionRef = useRef<HTMLElement>(null)
  const reduceMotion = useReducedMotion()
  const [inView, setInView] = useState(false)
  const [active, setActive] = useState(0)
  const step = steps[active]

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting))
    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  // 每步重新计时，手动选择后保留完整阅读时间；屏幕外和后台标签页不继续轮播。
  useEffect(() => {
    if (!inView) return
    let timer: ReturnType<typeof setTimeout> | undefined
    const schedule = () => {
      clearTimeout(timer)
      if (document.visibilityState === 'visible') {
        timer = setTimeout(() => setActive(current => (current + 1) % steps.length), STEP_DURATION_MS)
      }
    }
    schedule()
    document.addEventListener('visibilitychange', schedule)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', schedule)
    }
  }, [active, inView, steps.length])

  return (
    <section ref={sectionRef} id="process" className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
      <Reveal><SectionHeading eyebrow="How we work" title={copy.process} /></Reveal>
      <div className="home-flow-layout">
        <ol className="home-flow-navigation" aria-label={copy.processGroup}>
          {steps.map((item, index) => (
            <li key={item.code} data-tone={STEP_TONES[index]}>
              <button
                id={`process-step-${item.code}`}
                type="button"
                aria-expanded={active === index}
                aria-controls="process-detail-desktop"
                aria-current={active === index ? 'step' : undefined}
                onClick={() => setActive(index)}
              >
                <span className="home-flow-number">{item.code}</span>
                <span className="home-flow-step-name">{item.short}</span>
                {item.tag && <span className="home-flow-free">{item.tag}</span>}
                <span className="home-flow-state" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ol>
        <div id="process-detail-desktop" className="home-flow-detail" role="region" aria-labelledby={`process-step-${step.code}`} data-tone={STEP_TONES[active]}>
          {/* 面板叠在同一网格格内，由最长文案决定高度，切换时布局不跳动。 */}
          {steps.map((item, index) => (
            <motion.div
              key={item.code}
              className="home-flow-pane"
              data-active={active === index}
              aria-hidden={active !== index}
              initial={false}
              animate={{
                opacity: active === index ? 1 : 0,
                y: reduceMotion || active === index ? 0 : -12,
                filter: active === index || reduceMotion ? 'blur(0px)' : 'blur(3px)',
                visibility: 'visible',
                transitionEnd: active === index ? undefined : { visibility: 'hidden', y: reduceMotion ? 0 : 18 },
              }}
              transition={{ duration: reduceMotion ? 0 : .35, ease: [.22, 1, .36, 1] }}
            >
              <StepDetail step={item} index={index} label={copy.processDeliverables} />
            </motion.div>
          ))}
        </div>
      </div>
      <ol className="home-flow-mobile" aria-label={copy.processGroup}>
        {steps.map((item, index) => (
          <li key={item.code} data-tone={STEP_TONES[index]}>
            <button
              id={`process-step-mobile-${item.code}`}
              type="button"
              aria-expanded={active === index}
              aria-controls={`process-detail-mobile-${item.code}`}
              onClick={() => setActive(index)}
            >
              <span className="home-flow-number">{item.code}</span>
              <span className="home-flow-step-name">{item.short}</span>
              {item.tag && <span className="home-flow-free">{item.tag}</span>}
              <span className="home-flow-toggle" aria-hidden="true">{active === index ? '−' : '+'}</span>
            </button>
            <div id={`process-detail-mobile-${item.code}`} role="region" aria-labelledby={`process-step-mobile-${item.code}`} hidden={active !== index}>
              {active === index && <StepDetail step={item} index={index} label={copy.processDeliverables} />}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
