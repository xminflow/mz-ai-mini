import type { ReactNode } from 'react'

import { GradientText, Reveal } from '../motion'

type MembershipServiceSectionProps = {
  index: number
  eyebrow: string
  title: ReactNode
  description: ReactNode
  children?: ReactNode
  bullets?: string[]
  /** 可选锚点 id，用于外部页面通过 hash 直达本段（含 scroll-margin 补偿顶栏遮挡）。 */
  anchorId?: string
}

export function MembershipServiceSection({
  index,
  eyebrow,
  title,
  description,
  children,
  bullets,
  anchorId,
}: MembershipServiceSectionProps) {
  return (
    <section
      id={anchorId}
      className="relative mx-auto w-full max-w-6xl scroll-mt-24 border-t border-hairline px-4 py-16 sm:px-6 sm:py-20"
    >
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start lg:gap-14">
        <Reveal className="lg:col-span-5">
          <div className="flex flex-col gap-4">
            <span className="flex items-center gap-2.5 font-mono text-[13px] font-medium uppercase tracking-[0.24em] text-muted sm:text-[14px]">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-hairline bg-canvas font-mono text-[11px] text-ink-soft">
                {String(index).padStart(2, '0')}
              </span>
              {eyebrow}
            </span>
            <h2 className="font-serif-zh text-balance text-[22px] font-semibold leading-[1.4] sm:text-[26px] sm:leading-[1.35] lg:text-[30px]">
              {title}
            </h2>
            <div className="max-w-md text-[13.5px] leading-[1.9] text-ink-soft sm:text-[14.5px]">
              {description}
            </div>
            {bullets && bullets.length > 0 && (
              <ul className="mt-1 flex flex-col gap-2 text-[12.5px] text-muted sm:text-[13px]">
                {bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1 w-1 flex-none rounded-full bg-ink-soft/60" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Reveal>

        {children && (
          <Reveal delay={0.08} className="lg:col-span-7">
            <div className="flex flex-col gap-4">{children}</div>
          </Reveal>
        )}
      </div>
    </section>
  )
}

export { GradientText }
