'use client'

import { Marquee, Reveal } from '../../motion'
import { SectionEyebrow } from '../ai-coding-camp/primitives'
import { TECH_STACK } from './data'

export function TechStackSection() {
  return (
    <section className="relative mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-24 lg:pb-28">
      <Reveal>
        <SectionEyebrow color="#01aef0">技术栈</SectionEyebrow>
      </Reveal>
      <Reveal delay={0.06}>
        <div className="mt-6">
          <Marquee speed={28}>
            {TECH_STACK.map((tech) => (
              <span
                key={tech}
                className="inline-flex items-center whitespace-nowrap rounded-full border border-hairline px-4 py-2 font-mono text-[12px] text-ink-soft"
              >
                {tech}
              </span>
            ))}
          </Marquee>
        </div>
      </Reveal>
    </section>
  )
}
