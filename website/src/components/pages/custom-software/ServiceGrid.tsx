'use client'

import { GradientText, Reveal } from '../../motion'
import { SectionEyebrow } from '../ai-coding-camp/primitives'
import { SERVICES, THEMES } from './data'

export function ServiceGrid() {
  return (
    <section id="services" className="relative mx-auto w-full max-w-6xl scroll-mt-20 px-4 pb-20 sm:scroll-mt-24 sm:px-6 sm:pb-24 lg:pb-28">
      <Reveal>
        <div className="flex flex-col gap-4">
          <SectionEyebrow color="#0099ff">服务矩阵</SectionEyebrow>
          <h2 className="font-serif-zh text-[22px] font-semibold leading-[1.5] tracking-[0.005em] sm:text-[26px] sm:leading-[1.45] lg:text-[34px] lg:leading-[1.3]">
            <span className="mt-1 block sm:mt-1.5">
              <GradientText className="font-semibold">11 类软件定制，一站全包</GradientText>
            </span>
          </h2>
          <p className="max-w-2xl text-[13.5px] leading-[1.85] text-ink-soft sm:text-[14.5px]">
            不管你要做的是官网、内部系统，还是一个 AI 智能体，都能在这里找到对应的团队和经验。
          </p>
        </div>
      </Reveal>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-12 sm:gap-5 lg:grid-cols-2">
        {SERVICES.map((item, i) => {
          const t = THEMES[item.theme]
          return (
            <Reveal key={item.code} delay={Math.min(i, 6) * 0.06}>
              <article
                className="group relative h-full overflow-hidden rounded-md p-5 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 sm:p-7"
                style={{
                  background: `linear-gradient(150deg, rgba(${t.rgb}, 0.16) 0%, rgba(${t.rgb}, 0.05) 100%)`,
                  boxShadow: '0 14px 36px -22px rgba(0,0,0,0.85)',
                }}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full opacity-60 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background: `radial-gradient(circle, ${t.hex}55 0%, transparent 65%)`,
                    filter: 'blur(24px)',
                  }}
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute -bottom-2 right-2 select-none font-mono text-[100px] font-black leading-none tabular sm:right-3 sm:text-[140px]"
                  style={{ color: t.hex, opacity: 0.06 }}
                >
                  {item.code}
                </span>

                <div className="relative flex h-full flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg font-mono text-[12px] font-bold text-canvas sm:h-10 sm:w-10 sm:text-[13px]"
                      style={{
                        background: `linear-gradient(135deg, ${t.gradientFrom}, ${t.gradientTo})`,
                        boxShadow: `0 4px 16px -2px ${t.hex}66`,
                      }}
                    >
                      {item.code}
                    </span>
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10.5px]"
                      style={{
                        borderColor: `rgba(${t.rgb}, 0.35)`,
                        color: t.hex,
                        background: `rgba(${t.rgb}, 0.08)`,
                      }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: t.hex }} />
                      {t.label}
                    </span>
                  </div>

                  <h3 className="font-serif-zh text-[18px] font-semibold leading-[1.35] text-ink sm:text-[20px]">
                    {item.title}
                  </h3>
                  <p className="text-[12.5px] font-medium leading-[1.6] sm:text-[13px]" style={{ color: t.hex }}>
                    {item.hook}
                  </p>

                  <ul className="mt-1 flex flex-col gap-1.5">
                    {item.points.map((p) => (
                      <li key={p} className="flex items-start gap-2 text-[12px] leading-[1.6] text-ink-soft sm:text-[12.5px]">
                        <span
                          aria-hidden
                          className="mt-1.5 inline-flex h-1.5 w-1.5 flex-none rounded-full"
                          style={{ background: `linear-gradient(135deg, ${t.gradientFrom}, ${t.gradientTo})` }}
                        />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}
