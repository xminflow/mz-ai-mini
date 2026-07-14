'use client'

import { Reveal, GradientText } from '../../motion'
import { CTO_PROFILE } from './data'

export function CtoSection() {
  return (
    <section className="relative mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6 sm:pt-8 lg:pt-8">
      <Reveal>
        <div className="flex flex-col items-center gap-3 text-center">
          <div
            className="relative w-full max-w-md overflow-hidden rounded-md p-4 backdrop-blur-xl sm:p-5"
            style={{
              background:
                'linear-gradient(150deg, rgba(0,153,255,0.16) 0%, rgba(0,153,255,0.05) 100%)',
              boxShadow: '0 16px 48px -16px rgba(0,153,255,0.4)',
            }}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full opacity-70"
              style={{
                background:
                  'radial-gradient(circle, rgba(87,190,255,0.5) 0%, transparent 65%)',
              }}
            />
            <div className="relative flex flex-col items-center gap-4">
              <img
                src={CTO_PROFILE.avatarUrl}
                alt={`CTO ${CTO_PROFILE.name}`}
                loading="lazy"
                className="h-16 w-16 flex-none rounded-md object-cover sm:h-[72px] sm:w-[72px]"
                style={{
                  objectPosition: CTO_PROFILE.avatarPosition,
                  boxShadow:
                    '0 12px 28px -8px rgba(0,153,255,0.65), inset 0 0 0 1px rgba(255,255,255,0.2)',
                }}
              />
              <div className="flex flex-col items-center gap-1.5">
                <span
                  className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.22em]"
                  style={{ color: '#57beff' }}
                >
                  组织顶点 · CTO
                </span>
                <h2 className="font-serif-zh text-[24px] font-bold leading-none text-ink sm:text-[28px]">
                  <GradientText>{CTO_PROFILE.name}</GradientText>
                  <span className="ml-2 align-middle font-mono text-[12px] font-medium text-ink-soft sm:text-[13px]">
                    {CTO_PROFILE.nameEn}
                  </span>
                </h2>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] sm:text-[11.5px]"
                  style={{
                    borderColor: 'rgba(87,190,255,0.45)',
                    background: 'rgba(0,153,255,0.10)',
                    color: '#57beff',
                  }}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#57beff' }} />
                  {CTO_PROFILE.title}
                </span>
              </div>
              <p className="text-[13px] leading-[1.85] text-ink-soft sm:text-[13.5px]">
                「{CTO_PROFILE.quote}」
              </p>
            </div>
          </div>

          {/* 装饰性连接：竖线 → 横向分隔线，寓意 CTO 统领全部部门；不逐个部门连线 */}
          <div className="flex flex-col items-center">
            <span
              aria-hidden
              className="h-4 w-px sm:h-5"
              style={{
                background: 'linear-gradient(to bottom, rgba(87,190,255,0.7), transparent)',
              }}
            />
            <span
              aria-hidden
              className="h-px w-full max-w-xs"
              style={{
                background:
                  'linear-gradient(90deg, transparent, rgba(87,190,255,0.55), transparent)',
              }}
            />
          </div>
        </div>
      </Reveal>
    </section>
  )
}
