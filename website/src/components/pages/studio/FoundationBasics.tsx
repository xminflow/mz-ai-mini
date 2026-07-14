'use client'

import { GradientText, Reveal } from '../../motion'
import { SectionEyebrow } from '../ai-coding-camp/primitives'
import { THEMES } from '../ai-coding-camp/data'
import { FOUNDATION_GROUPS } from './data'

export function FoundationBasics() {
  return (
    <section className="relative mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-24 lg:pb-28">
      <Reveal>
        <div className="flex flex-col gap-4">
          <SectionEyebrow color="#bafa77">基础巩固</SectionEyebrow>
          <h2 className="font-serif-zh text-[22px] font-semibold leading-[1.5] tracking-[-0.02em] sm:text-[26px] sm:leading-[1.45] lg:text-[34px] lg:leading-[1.3]">
            <span className="block">动手做 20 个项目之前，</span>
            <span className="mt-1 block sm:mt-1.5">
              <GradientText className="font-semibold">先补齐这 6 块地基</GradientText>
            </span>
          </h2>
          <p className="max-w-2xl text-[13.5px] leading-[1.85] text-ink-soft sm:text-[14.5px]">
            从 AI 架构师训练营的课程里提炼、合并出应届生 / 专科生真正必学的部分（不含企业实战直播、求职冲刺这类项目或面试导向内容），是做实战项目前建议先打牢的地基。
          </p>
        </div>
      </Reveal>

      <div className="relative mt-10 sm:mt-12">
        <span
          aria-hidden
          className="absolute left-[19px] top-2 bottom-2 w-px sm:left-[23px]"
          style={{
            background: `linear-gradient(to bottom, ${FOUNDATION_GROUPS.map((g) => THEMES[g.theme].hex).join(', ')})`,
            opacity: 0.45,
          }}
        />
        <ol className="flex flex-col gap-9 sm:gap-11">
          {FOUNDATION_GROUPS.map((group, i) => {
            const t = THEMES[group.theme]
            return (
              <Reveal key={group.code} delay={Math.min(i, 6) * 0.06}>
                <li className="relative pl-11 sm:pl-14">
                  <span
                    aria-hidden
                    className="absolute left-[11px] top-1 flex h-[18px] w-[18px] items-center justify-center rounded-full font-mono text-[9px] font-bold text-canvas sm:left-[15px]"
                    style={{
                      background: `radial-gradient(circle, ${t.gradientFrom} 0%, ${t.gradientTo} 80%)`,
                      boxShadow: `0 0 18px ${t.hex}66`,
                    }}
                  >
                    {group.code}
                  </span>

                  <h3 className="font-serif-zh text-[16px] font-semibold leading-[1.35] text-ink sm:text-[19px]">
                    {group.title}
                  </h3>

                  <p className="mt-2 max-w-2xl text-[12.5px] leading-[1.75] text-ink-soft sm:text-[13.5px]">
                    {group.reason}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {group.merged.map((m) => (
                      <span
                        key={m}
                        className="inline-flex items-center rounded-md px-2.5 py-1 text-[11px] leading-none text-muted"
                        style={{
                          border: `1px solid ${t.hex}22`,
                          background: `${t.hex}0a`,
                        }}
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </li>
              </Reveal>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
