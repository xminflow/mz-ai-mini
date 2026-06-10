'use client'

import { GradientText, Reveal } from '../../motion'
import { INSTRUCTOR_CREDENTIALS, THEMES } from './data'
import { SectionEyebrow } from './primitives'

export function InstructorSection() {
  return (
    <section className="relative mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-24 lg:pb-28">
      <Reveal>
        <div className="flex flex-col gap-4">
          <SectionEyebrow color="#C4B5FD">讲师介绍</SectionEyebrow>
          <h2 className="font-serif-zh text-[22px] font-semibold leading-[1.5] tracking-[0.005em] sm:text-[26px] sm:leading-[1.45] lg:text-[36px] lg:leading-[1.25]">
            <span className="block">亲自带你的人 ·</span>
            <span className="mt-1 block sm:mt-1.5">
              <GradientText className="font-semibold">12 年实战 + 4 年 CTO + 2 年 AI 大模型应用教学</GradientText>
            </span>
          </h2>
          <p className="max-w-2xl text-[13.5px] leading-[1.85] text-ink-soft sm:text-[14.5px]">
            不是只会讲 PPT 的"AI 老师"——是真正在一线写过、做过、带过团队、踩过坑的工程师。
          </p>
        </div>
      </Reveal>

      <div className="mt-10 grid grid-cols-1 gap-5 sm:mt-12 sm:gap-6 lg:grid-cols-[1fr_1.55fr]">
        {/* 讲师名片 */}
        <Reveal>
          <div
            className="relative h-full overflow-hidden rounded-[24px] border p-6 backdrop-blur-xl sm:rounded-[28px] sm:p-8"
            style={{
              borderColor: 'rgba(196,181,253,0.32)',
              background:
                'linear-gradient(140deg, rgba(167,139,250,0.16) 0%, rgba(232,121,249,0.10) 50%, rgba(13,13,18,0.55) 100%)',
              boxShadow: 'inset 0 0 0 1px rgba(196,181,253,0.06), 0 16px 48px -16px rgba(167,139,250,0.4)',
            }}
          >
            {/* 主题色光晕 */}
            <span
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full opacity-70"
              style={{
                background: 'radial-gradient(circle, rgba(196,181,253,0.5) 0%, transparent 65%)',
              }}
            />
            <span
              aria-hidden
              className="pointer-events-none absolute -bottom-16 -left-16 h-44 w-44 rounded-full opacity-60"
              style={{
                background: 'radial-gradient(circle, rgba(232,121,249,0.4) 0%, transparent 65%)',
              }}
            />

            <div className="relative flex h-full flex-col gap-5">
              {/* 头像占位 */}
              <div className="flex items-center gap-4">
                <div
                  className="flex h-16 w-16 flex-none items-center justify-center rounded-2xl font-serif-zh text-[26px] font-bold text-canvas sm:h-20 sm:w-20 sm:text-[32px]"
                  style={{
                    background: 'linear-gradient(135deg, #C4B5FD, #A78BFA 50%, #7C3AED)',
                    boxShadow: '0 12px 28px -8px rgba(167,139,250,0.65), inset 0 0 0 1px rgba(255,255,255,0.2)',
                  }}
                >
                  行
                </div>
                <div className="flex flex-col gap-1">
                  <span
                    className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.22em]"
                    style={{ color: '#C4B5FD' }}
                  >
                    主讲老师 · INSTRUCTOR
                  </span>
                  <h3 className="font-serif-zh text-[24px] font-bold leading-none text-ink sm:text-[28px]">
                    行明
                    <span className="ml-2 align-middle font-mono text-[12px] font-medium text-ink-soft sm:text-[13px]">
                      XING MING
                    </span>
                  </h3>
                </div>
              </div>

              {/* 头衔徽标组 */}
              <div className="flex flex-wrap gap-1.5">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] sm:text-[11.5px]"
                  style={{
                    borderColor: 'rgba(196,181,253,0.45)',
                    background: 'rgba(167,139,250,0.10)',
                    color: '#C4B5FD',
                  }}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#C4B5FD' }} />
                  创业公司 CTO
                </span>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] sm:text-[11.5px]"
                  style={{
                    borderColor: 'rgba(103,232,249,0.45)',
                    background: 'rgba(34,211,238,0.10)',
                    color: '#67E8F9',
                  }}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#67E8F9' }} />
                  一线工程师
                </span>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] sm:text-[11.5px]"
                  style={{
                    borderColor: 'rgba(253,164,175,0.45)',
                    background: 'rgba(251,113,133,0.10)',
                    color: '#FDA4AF',
                  }}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#FDA4AF' }} />
                  AI 教学者
                </span>
              </div>

              {/* 短引言 */}
              <p className="text-[13px] leading-[1.85] text-ink-soft sm:text-[13.5px]">
                「我自己用 AI 编程做完整产品已经做了两年，也用同一套工作流带过零基础学员从 0 跑到上线——这门课讲的就是我自己每天在用的那一套。」
              </p>

              <div
                className="mt-auto flex items-center gap-2 rounded-xl border px-3.5 py-2.5 sm:px-4 sm:py-3"
                style={{
                  borderColor: 'rgba(196,181,253,0.22)',
                  background: 'rgba(167,139,250,0.06)',
                }}
              >
                <span
                  className="h-1.5 w-1.5 animate-pulse rounded-full"
                  style={{ background: '#C4B5FD', boxShadow: '0 0 6px rgba(196,181,253,0.8)' }}
                />
                <span className="text-[12.5px] font-medium text-ink sm:text-[13px]">
                  每期训练营由行明亲自授课、亲自答疑，不外包、不录播充数
                </span>
              </div>
            </div>
          </div>
        </Reveal>

        {/* 4 项资历卡片 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
          {INSTRUCTOR_CREDENTIALS.map((cred, i) => {
            const t = THEMES[cred.theme]
            return (
              <Reveal key={cred.label} delay={i * 0.06}>
                <div
                  className="group relative h-full overflow-hidden rounded-2xl border p-5 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 sm:rounded-[22px] sm:p-6"
                  style={{
                    borderColor: `rgba(${t.rgb}, 0.26)`,
                    background: `linear-gradient(135deg, rgba(${t.rgb}, 0.12) 0%, rgba(13,13,18,0.55) 65%)`,
                    boxShadow: `inset 0 0 0 1px rgba(${t.rgb}, 0.06)`,
                  }}
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full opacity-50 transition-opacity duration-500 group-hover:opacity-80"
                    style={{
                      background: `radial-gradient(circle, ${t.hex}55 0%, transparent 65%)`,
                    }}
                  />
                  <div className="relative flex h-full flex-col gap-3">
                    <span
                      className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em]"
                      style={{ color: t.hex }}
                    >
                      CREDENTIAL · {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span
                        className="font-serif-zh text-[28px] font-bold leading-none tabular sm:text-[34px]"
                        style={{
                          color: t.hex,
                          textShadow: `0 0 18px ${t.hex}66`,
                        }}
                      >
                        {cred.metric}
                      </span>
                    </div>
                    <h4 className="text-[14px] font-semibold leading-[1.4] text-ink sm:text-[15px]">
                      {cred.label}
                    </h4>
                    <p className="text-[12.5px] leading-[1.75] text-ink-soft sm:text-[13px]">
                      {cred.detail}
                    </p>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
