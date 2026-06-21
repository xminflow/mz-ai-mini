'use client'

import { GradientText, Reveal } from '../../motion'
import {
  STAGE2_GROUPS, STAGE2_DELIVERABLES, STAGE2_THEMES,
  STAGE2_SERVICE_DRAFT, STAGE2_PRICE,
} from './data'
import { SectionEyebrow, PriceChip } from './primitives'

// 「待确认」占位标签：暗灰、低存在感,读起来像「待最终敲定」而非告警
const DraftTag = ({ children }: { children?: React.ReactNode }) => (
  <span
    className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] tracking-[0.06em]"
    style={{
      borderColor: 'rgba(117,117,117,0.28)',
      background: 'rgba(117,117,117,0.08)',
      color: 'rgba(117,117,117,0.85)',
    }}
  >
    <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'rgba(117,117,117,0.7)' }} />
    {children ?? '待确认'}
  </span>
)

export function StageTwoSection({ onEnroll }: { onEnroll: () => void }) {
  const advance = STAGE2_THEMES.advance

  return (
    <div id="stage-two" className="relative scroll-mt-20 sm:scroll-mt-24">
      {/* 三段分组课程大纲：能力进阶 / 企业实战直播 / 求职冲刺 */}
      <section className="relative mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-24 lg:pb-28">
        <Reveal>
          <h2 className="font-serif-zh text-[22px] font-semibold leading-[1.4] tracking-[-0.02em] sm:text-[26px] lg:text-[34px]">
            AI 架构师课程大纲（高阶）
          </h2>
        </Reveal>

        <div className="mt-10 flex flex-col gap-14 sm:mt-12 sm:gap-16">
          {STAGE2_GROUPS.map((group) => {
            const gt = STAGE2_THEMES[group.key]
            return (
              <div key={group.key} className="flex flex-col">
                {/* 分组标题：扁平区块 + 渐变下划线，非卡片 */}
                <Reveal>
                  <div className="flex flex-col gap-1.5">
                    <span
                      className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.22em]"
                      style={{ color: gt.hex }}
                    >
                      {gt.label}
                    </span>
                    <h3 className="font-serif-zh text-[21px] font-semibold leading-[1.35] text-ink sm:text-[25px]">
                      {group.title}
                    </h3>
                    <p className="text-[12.5px] leading-[1.7] text-ink-soft sm:text-[13.5px]">
                      {group.subtitle}
                    </p>
                    <span
                      aria-hidden
                      className="mt-1.5 block h-[2px] w-12 rounded-full"
                      style={{
                        background: `linear-gradient(90deg, ${gt.gradientFrom}, ${gt.gradientTo})`,
                      }}
                    />
                  </div>
                </Reveal>

                {/* 该分组课程：扁平区块清单（线 + 渐变发光序号 + 文字） */}
                <div className="mt-8 flex flex-col sm:mt-10">
                  {group.lessons.map((lesson, li) => {
                    const t = STAGE2_THEMES[lesson.theme]
                    return (
                      <Reveal
                        key={lesson.code}
                        delay={Math.min(li, 4) * 0.06}
                        y={28}
                        className={
                          li > 0 ? "mt-8 border-t border-hairline pt-8 sm:mt-10 sm:pt-10" : ""
                        }
                      >
                        <div className="relative flex flex-col gap-5">
                          {/* 序号旁柔光：非卡片，给区块加色彩深度 */}
                          <span
                            aria-hidden
                            className="pointer-events-none absolute -left-5 -top-7 h-28 w-28 rounded-full opacity-40"
                            style={{
                              background: `radial-gradient(circle, ${t.hex}55 0%, transparent 70%)`,
                              filter: "blur(34px)",
                            }}
                          />
                          <div className="relative flex items-baseline gap-4 sm:gap-5">
                            <span
                              className="font-mono text-[20px] font-bold leading-none tabular sm:text-[26px]"
                              style={{
                                backgroundImage: `linear-gradient(135deg, ${t.gradientFrom}, ${t.gradientTo})`,
                                WebkitBackgroundClip: "text",
                                backgroundClip: "text",
                                color: "transparent",
                                filter: `drop-shadow(0 0 12px ${t.hex}66)`,
                              }}
                            >
                              {lesson.code}
                            </span>
                            <div className="flex flex-col gap-1.5">
                              <span
                                className="font-mono text-[10.5px] font-medium uppercase tracking-[0.22em]"
                                style={{ color: t.hex }}
                              >
                                {t.label}
                              </span>
                              <h4 className="font-serif-zh text-[18px] font-semibold leading-[1.4] text-ink sm:text-[21px] lg:text-[23px]">
                                {lesson.title}
                              </h4>
                              <span
                                aria-hidden
                                className="mt-1 block h-[2px] w-10 rounded-full"
                                style={{
                                  background: `linear-gradient(90deg, ${t.gradientFrom}, ${t.gradientTo})`,
                                }}
                              />
                            </div>
                          </div>

                          {/* 本节目标 */}
                          <p className="max-w-3xl text-[13px] leading-[1.85] text-ink-soft sm:pl-[3.5rem] sm:text-[13.5px]">
                            {lesson.goal}
                          </p>

                          {/* 子条目：线 + 渐变发光点 + 文字 */}
                          <ul className="flex flex-col sm:pl-[3.5rem]">
                            {lesson.points.map((point) => (
                              <li
                                key={point}
                                className="group/p flex items-start gap-3 border-t border-hairline py-3 transition-colors hover:border-white/25"
                              >
                                <span
                                  aria-hidden
                                  className="mt-[7px] inline-flex h-1.5 w-1.5 flex-none rounded-full"
                                  style={{
                                    background: `linear-gradient(135deg, ${t.gradientFrom}, ${t.gradientTo})`,
                                    boxShadow: `0 0 8px ${t.hex}88`,
                                  }}
                                />
                                <span className="text-[12.5px] leading-[1.75] text-muted transition-colors group-hover/p:text-ink-soft sm:text-[13px]">
                                  {point}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </Reveal>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* 收获墙：5 项专家级成果（高阶学完产出，位置对齐第一阶段四大成果） */}
      <section className="relative mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-24 lg:pb-28">
        <Reveal>
          <div className="flex flex-col gap-4">
            <SectionEyebrow color={advance.hex} index={1}>第二阶段收获</SectionEyebrow>
            <h2 className="font-serif-zh text-[22px] font-semibold leading-[1.5] tracking-[-0.02em] sm:text-[26px] sm:leading-[1.45] lg:text-[34px] lg:leading-[1.3]">
              <span className="block">学完，你手里会多出</span>
              <span className="mt-1 block sm:mt-1.5">
                <GradientText className="font-semibold">5 项专家级硬核成果</GradientText>
              </span>
            </h2>
          </div>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-12 sm:gap-5 lg:grid-cols-2">
          {STAGE2_DELIVERABLES.map((item, i) => {
            const t = STAGE2_THEMES[item.theme]
            // 第 5 张(求职方向)单独成行,跨满整行作为收尾
            const isLast = i === STAGE2_DELIVERABLES.length - 1
            return (
              <Reveal key={item.code} delay={i * 0.06}>
                <article
                  className={`group relative h-full overflow-hidden rounded-[30px] p-5 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 sm:rounded-[36px] sm:p-7 ${isLast ? 'lg:col-span-2' : ''}`}
                  style={{
                    background: `linear-gradient(150deg, rgba(${t.rgb}, 0.16) 0%, rgba(${t.rgb}, 0.05) 100%)`,
                    boxShadow: `0 14px 36px -22px rgba(0,0,0,0.85)`,
                  }}
                >
                  {/* 主题色光晕 */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full opacity-60 transition-opacity duration-500 group-hover:opacity-100"
                    style={{
                      background: `radial-gradient(circle, ${t.hex}55 0%, transparent 65%)`,
                      filter: 'blur(24px)',
                    }}
                  />
                  {/* 巨大半透明序号 */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -bottom-2 right-2 select-none font-mono text-[120px] font-black leading-none tabular sm:right-3 sm:text-[160px]"
                    style={{ color: t.hex, opacity: 0.06 }}
                  >
                    {item.code}
                  </span>

                  <div className="relative flex h-full flex-col gap-4">
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
                        收获 · OUTCOME
                      </span>
                    </div>

                    <h3 className="font-serif-zh text-[19px] font-semibold leading-[1.35] text-ink sm:text-[22px]">
                      {item.title}
                    </h3>
                    <p
                      className="text-[12.5px] font-medium leading-[1.6] sm:text-[13px]"
                      style={{ color: t.hex }}
                    >
                      {item.subtitle}
                    </p>
                    <p className="text-[13px] leading-[1.85] text-ink-soft sm:text-[13.5px]">
                      {item.body}
                    </p>

                    <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
                      {item.badges.map((badge) => (
                        <span
                          key={badge}
                          className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10.5px]"
                          style={{
                            borderColor: `rgba(${t.rgb}, 0.25)`,
                            background: `rgba(${t.rgb}, 0.05)`,
                            color: `rgba(${t.rgb}, 1)`,
                          }}
                        >
                          ✓ {badge}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              </Reveal>
            )
          })}
        </div>
      </section>

      {/* 4. 服务模式(拟稿) */}
      <section className="relative mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-24 lg:pb-28">
        <Reveal>
          <div className="flex flex-col gap-4">
            <SectionEyebrow color={STAGE2_THEMES.enterprise.hex} index={2}>服务模式</SectionEyebrow>
            <h2 className="font-serif-zh text-[22px] font-semibold leading-[1.5] tracking-[-0.02em] sm:text-[26px] sm:leading-[1.45] lg:text-[34px] lg:leading-[1.3]">
              <span className="block">企业级实战直播 ·</span>
              <span className="mt-1 block sm:mt-1.5">
                <GradientText className="font-semibold">课程外问题长期陪跑</GradientText>
              </span>
            </h2>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <article
            className="group relative mt-10 overflow-hidden rounded-[32px] p-6 backdrop-blur-xl sm:mt-12 sm:rounded-[36px] sm:p-8 lg:p-9"
            style={{
              background: `linear-gradient(150deg, rgba(${STAGE2_THEMES.enterprise.rgb}, 0.16) 0%, rgba(${STAGE2_THEMES.enterprise.rgb}, 0.05) 100%)`,
              boxShadow: `0 14px 36px -22px rgba(0,0,0,0.85)`,
            }}
          >
            {/* 主题色光晕 */}
            <span
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-60"
              style={{
                background: `radial-gradient(circle, ${STAGE2_THEMES.enterprise.hex}55 0%, transparent 65%)`,
                filter: 'blur(28px)',
              }}
            />

            <div className="relative flex flex-col gap-4">
              {/* 拟稿待确认 banner */}
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[11px] tracking-[0.06em]"
                  style={{
                    borderColor: `rgba(${STAGE2_THEMES.enterprise.rgb}, 0.4)`,
                    background: `rgba(${STAGE2_THEMES.enterprise.rgb}, 0.12)`,
                    color: STAGE2_THEMES.enterprise.gradientFrom,
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 animate-pulse rounded-full"
                    style={{ background: STAGE2_THEMES.enterprise.gradientFrom }}
                  />
                  {STAGE2_SERVICE_DRAFT.note}
                </span>
              </div>

              {/* 时长徽标(待确认) */}
              <div className="flex items-center justify-between">
                <span
                  className="font-mono text-[11px] font-semibold tracking-[0.18em]"
                  style={{ color: STAGE2_THEMES.enterprise.hex }}
                >
                  SERVICE · 第二阶段
                </span>
                {STAGE2_SERVICE_DRAFT.duration === '待确认' ? (
                  <DraftTag>时长待确认</DraftTag>
                ) : (
                  <span
                    className="inline-flex items-center rounded-full px-3 py-1 font-mono text-[11px] font-bold tabular text-canvas"
                    style={{
                      background: `linear-gradient(135deg, ${STAGE2_THEMES.enterprise.gradientFrom}, ${STAGE2_THEMES.enterprise.gradientTo})`,
                    }}
                  >
                    {STAGE2_SERVICE_DRAFT.duration}
                  </span>
                )}
              </div>

              <h3 className="font-serif-zh text-[22px] font-semibold leading-[1.3] text-ink sm:text-[26px] lg:text-[28px]">
                {STAGE2_SERVICE_DRAFT.title}
              </h3>
              <p
                className="text-[13.5px] font-medium leading-[1.6] sm:text-[14.5px]"
                style={{ color: STAGE2_THEMES.enterprise.hex }}
              >
                {STAGE2_SERVICE_DRAFT.highlight}
              </p>
              <p className="text-[13px] leading-[1.85] text-ink-soft sm:text-[13.5px]">
                {STAGE2_SERVICE_DRAFT.body}
              </p>

              {/* 服务清单 */}
              <ul className="mt-2 flex flex-col gap-2.5 border-t pt-4 sm:gap-3 sm:pt-5"
                style={{ borderColor: `rgba(${STAGE2_THEMES.enterprise.rgb}, 0.15)` }}
              >
                {STAGE2_SERVICE_DRAFT.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[12.5px] leading-[1.6] text-ink-soft sm:text-[13px]">
                    <span
                      aria-hidden
                      className="mt-1.5 inline-flex h-1.5 w-1.5 flex-none rounded-full"
                      style={{
                        background: `linear-gradient(135deg, ${STAGE2_THEMES.enterprise.gradientFrom}, ${STAGE2_THEMES.enterprise.gradientTo})`,
                        boxShadow: `0 0 8px ${STAGE2_THEMES.enterprise.hex}88`,
                      }}
                    />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        </Reveal>
      </section>

      {/* 5. 价格 + 报名 */}
      <section className="relative mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-24 lg:pb-28">
        <Reveal>
          <div className="flex flex-col items-center gap-6 text-center">
            <SectionEyebrow color={advance.hex} index={3}>本阶段报名</SectionEyebrow>

            {/* 价格条 + 含第一阶段全部内容 pill */}
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
              <PriceChip badge="AI 架构师" originalPrice={STAGE2_PRICE.original} specialLabel="限时特价" price={STAGE2_PRICE.now} onClick={onEnroll} />
              <span
                className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[12px] font-semibold sm:text-[12.5px]"
                style={{
                  borderColor: `rgba(${advance.rgb}, 0.42)`,
                  background: `linear-gradient(110deg, rgba(${advance.rgb}, 0.16), rgba(${STAGE2_THEMES.career.rgb}, 0.12))`,
                  color: advance.hex,
                  boxShadow: `0 0 24px -8px ${advance.hex}88`,
                }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: advance.hex }} />
                {STAGE2_PRICE.includes}
              </span>
            </div>

            {/* 邀请返学费提示 */}
            <p className="flex items-center gap-2 text-[12.5px] leading-[1.6] text-ink-soft sm:text-[13px]">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: advance.hex }} />
              <span>
                <span className="font-semibold" style={{ color: advance.hex }}>
                  邀请返学费
                </span>
                　每邀请一位学员，退回 <span className="font-semibold text-ink">¥1000</span> 学费
              </span>
            </p>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
