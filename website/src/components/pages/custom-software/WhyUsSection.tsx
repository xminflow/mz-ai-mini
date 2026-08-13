'use client'

import { GradientText, Reveal } from '../../motion'
import { SectionEyebrow } from '../ai-coding-camp/primitives'
import { ADVANTAGES, THEMES } from './data'

export function WhyUsSection() {
  return (
    <section className="relative mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-24 lg:pb-28">
      <Reveal>
        <div className="flex flex-col gap-4">
          <SectionEyebrow color="#d42672">为什么选我们</SectionEyebrow>
          <h2 className="font-serif-zh text-[22px] font-semibold leading-[1.5] tracking-[0.005em] sm:text-[26px] sm:leading-[1.45] lg:text-[34px] lg:leading-[1.3]">
            <span className="mt-1 block sm:mt-1.5">
              <GradientText className="font-semibold">我们是值得你信任的长期合作伙伴</GradientText>
            </span>
          </h2>
        </div>
      </Reveal>

      <div className="relative mt-10 sm:mt-14">
        <span
          aria-hidden
          className="absolute left-[19px] top-2 bottom-2 w-px sm:left-[23px]"
          style={{
            background: `linear-gradient(to bottom, ${ADVANTAGES.map((a) => THEMES[a.theme].hex).join(', ')})`,
            opacity: 0.45,
          }}
        />
        <ol className="flex flex-col gap-8 sm:gap-10">
          {ADVANTAGES.map((item, i) => {
            const t = THEMES[item.theme]
            return (
              <Reveal key={item.title} delay={i * 0.06}>
                <li className="relative pl-11 sm:pl-14">
                  <span
                    aria-hidden
                    className="absolute left-[11px] top-1 h-[18px] w-[18px] rounded-full sm:left-[15px]"
                    style={{
                      background: `radial-gradient(circle, ${t.gradientFrom} 0%, ${t.gradientTo} 80%)`,
                      boxShadow: `0 0 18px ${t.hex}66`,
                    }}
                  />
                  <h3 className="font-serif-zh text-[16px] font-semibold leading-[1.35] text-ink sm:text-[19px]">
                    {item.title}
                  </h3>
                  <p className="mt-2 max-w-2xl text-[12.5px] leading-[1.75] text-ink-soft sm:text-[13.5px]">
                    {item.body}
                  </p>
                </li>
              </Reveal>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
