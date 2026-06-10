'use client'

import { GradientText, Reveal } from '../../motion'
import {
  STAGE2_GROUPS, STAGE2_DELIVERABLES, STAGE2_THEMES,
  STAGE2_SERVICE_DRAFT, STAGE2_PRICE,
} from './data'
import { SectionEyebrow, PriceChip, EnrollButton } from './primitives'

// 「待确认」占位标签：暗灰、低存在感,读起来像「待最终敲定」而非告警
const DraftTag = ({ children }: { children?: React.ReactNode }) => (
  <span
    className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] tracking-[0.06em]"
    style={{
      borderColor: 'rgba(148,163,184,0.28)',
      background: 'rgba(148,163,184,0.08)',
      color: 'rgba(148,163,184,0.85)',
    }}
  >
    <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'rgba(148,163,184,0.7)' }} />
    {children ?? '待确认'}
  </span>
)

export function StageTwoSection({ onEnroll }: { onEnroll: () => void }) {
  const advance = STAGE2_THEMES.advance

  return (
    <div id="stage-two" className="relative">
      {/* 1. 定位头 */}
      <section className="relative mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:py-28">
        <Reveal>
          <div className="flex flex-col gap-4">
            <SectionEyebrow color={advance.hex}>第二阶段 · 职业开发者进阶</SectionEyebrow>
            <h2 className="font-serif-zh text-[22px] font-semibold leading-[1.5] tracking-[0.005em] sm:text-[26px] sm:leading-[1.45] lg:text-[36px] lg:leading-[1.25]">
              <span className="block">从能用 AI，</span>
              <span className="mt-1 block sm:mt-1.5">
                <GradientText className="font-semibold">到企业级 AI 工程师</GradientText>
              </span>
            </h2>
            <p className="max-w-2xl text-[13.5px] leading-[1.85] text-ink-soft sm:text-[14.5px]">
              面向已有基础的开发者，覆盖企业级 AI 工程 + 两套实战系统 + 求职冲刺。价格 ¥3999，含第一阶段全部内容——把「会写」真正进阶成「能上线、能拿 offer」。
            </p>
          </div>
        </Reveal>
      </section>

      {/* 2. 收获墙：5 张交付卡(复用第一阶段四大成果卡片语言) */}
      <section className="relative mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-24 lg:pb-28">
        <Reveal>
          <div className="flex flex-col gap-4">
            <SectionEyebrow color={advance.hex}>第二阶段收获</SectionEyebrow>
            <h2 className="font-serif-zh text-[22px] font-semibold leading-[1.5] tracking-[0.005em] sm:text-[26px] sm:leading-[1.45] lg:text-[34px] lg:leading-[1.3]">
              <span className="block">学完，你手里会多出</span>
              <span className="mt-1 block sm:mt-1.5">
                <GradientText className="font-semibold">5 项职业级硬核成果</GradientText>
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
                  className={`group relative h-full overflow-hidden rounded-[22px] border p-5 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 sm:rounded-[26px] sm:p-7 ${isLast ? 'lg:col-span-2' : ''}`}
                  style={{
                    borderColor: `rgba(${t.rgb}, 0.28)`,
                    background: `linear-gradient(135deg, rgba(${t.rgb}, 0.12) 0%, rgba(13,13,18,0.6) 60%)`,
                    boxShadow: `inset 0 0 0 1px rgba(${t.rgb}, 0.06)`,
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

      {/* 3. 三段分组课程大纲：能力进阶 / 企业实战直播 / 求职冲刺 */}
      <section className="relative mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-24 lg:pb-28">
        <Reveal>
          <div className="flex flex-col gap-4">
            <SectionEyebrow color={STAGE2_THEMES.enterprise.hex}>课程大纲</SectionEyebrow>
            <h2 className="font-serif-zh text-[22px] font-semibold leading-[1.5] tracking-[0.005em] sm:text-[26px] sm:leading-[1.45] lg:text-[34px] lg:leading-[1.3]">
              <span className="block">三段进阶，</span>
              <span className="mt-1 block sm:mt-1.5">
                <GradientText className="font-semibold">14 课从能力地图到求职冲刺</GradientText>
              </span>
            </h2>
            <p className="max-w-2xl text-[13.5px] leading-[1.85] text-ink-soft sm:text-[14.5px]">
              能力进阶补齐企业级 AI 工程地图，企业实战直播带你从零搭两套可上线系统，求职冲刺把实战讲成 offer。
            </p>
          </div>
        </Reveal>

        <div className="mt-10 flex flex-col gap-12 sm:mt-12 sm:gap-16">
          {STAGE2_GROUPS.map((group) => {
            const gt = STAGE2_THEMES[group.key]
            return (
              <div key={group.key} className="flex flex-col gap-5 sm:gap-6">
                {/* 分组小标题 */}
                <Reveal>
                  <div
                    className="relative flex flex-col gap-1.5 overflow-hidden rounded-2xl border px-5 py-4 backdrop-blur-xl sm:px-6 sm:py-5"
                    style={{
                      borderColor: `rgba(${gt.rgb}, 0.28)`,
                      background: `linear-gradient(110deg, rgba(${gt.rgb}, 0.12) 0%, rgba(13,13,18,0.5) 70%)`,
                      boxShadow: `inset 2px 0 0 0 rgba(${gt.rgb}, 0.6)`,
                    }}
                  >
                    <span
                      className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.22em]"
                      style={{ color: gt.hex }}
                    >
                      {gt.label}
                    </span>
                    <h3 className="font-serif-zh text-[20px] font-semibold leading-[1.35] text-ink sm:text-[24px]">
                      {group.title}
                    </h3>
                    <p className="text-[12.5px] leading-[1.7] text-ink-soft sm:text-[13.5px]">
                      {group.subtitle}
                    </p>
                  </div>
                </Reveal>

                {/* 该分组课程卡片 */}
                <div className="flex flex-col gap-5 sm:gap-6">
                  {group.lessons.map((lesson, li) => {
                    const t = STAGE2_THEMES[lesson.theme]
                    const isHoursDraft = lesson.hours === '待确认'
                    return (
                      <Reveal key={lesson.code} delay={Math.min(li, 4) * 0.04}>
                        <article
                          className="group relative overflow-hidden rounded-[22px] border p-5 backdrop-blur-xl transition-all duration-500 sm:rounded-[28px] sm:p-7 lg:p-8"
                          style={{
                            borderColor: `rgba(${t.rgb}, 0.22)`,
                            background: `linear-gradient(120deg, rgba(${t.rgb}, 0.08) 0%, rgba(13,13,18,0.55) 60%)`,
                            boxShadow: `inset 1px 0 0 0 rgba(${t.rgb}, 0.5), inset 0 0 0 1px rgba(${t.rgb}, 0.04)`,
                          }}
                        >
                          {/* 左侧主题色光晕条 */}
                          <span
                            aria-hidden
                            className="pointer-events-none absolute left-0 top-0 h-full w-1.5"
                            style={{ background: `linear-gradient(to bottom, ${t.gradientFrom}, ${t.gradientTo})` }}
                          />
                          {/* 右下角超大半透明课号 */}
                          <span
                            aria-hidden
                            className="pointer-events-none absolute -bottom-4 -right-2 select-none font-mono text-[100px] font-black leading-none tabular sm:-bottom-6 sm:-right-4 sm:text-[150px] lg:text-[180px]"
                            style={{
                              color: t.hex,
                              opacity: 0.06,
                              WebkitTextStroke: `1px ${t.hex}33`,
                            }}
                          >
                            {lesson.code}
                          </span>

                          <div className="relative flex flex-col gap-5">
                            {/* 顶部：课号徽标 + 课时 chip + 标题 + 主题标签 */}
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                              <div className="flex items-start gap-4 sm:gap-5">
                                <span
                                  className="flex h-12 min-w-[3.5rem] flex-none items-center justify-center rounded-xl px-2 font-mono text-[13px] font-bold text-canvas sm:h-14 sm:text-[15px]"
                                  style={{
                                    background: `linear-gradient(135deg, ${t.gradientFrom}, ${t.gradientTo})`,
                                    boxShadow: `0 6px 18px -4px ${t.hex}66`,
                                  }}
                                >
                                  {lesson.code}
                                </span>
                                <div className="flex flex-col gap-2">
                                  <span
                                    className="font-mono text-[10.5px] font-medium uppercase tracking-[0.22em]"
                                    style={{ color: t.hex }}
                                  >
                                    {t.label}
                                  </span>
                                  <h4 className="font-serif-zh text-[18px] font-semibold leading-[1.4] text-ink sm:text-[21px] lg:text-[23px]">
                                    {lesson.title}
                                  </h4>
                                </div>
                              </div>
                              {/* 课时 chip：待确认时呈暗灰占位 */}
                              <div className="flex flex-none">
                                {isHoursDraft ? (
                                  <DraftTag>课时待确认</DraftTag>
                                ) : (
                                  <span
                                    className="inline-flex items-center rounded-full px-3 py-1 font-mono text-[11px] font-bold tabular text-canvas"
                                    style={{
                                      background: `linear-gradient(135deg, ${t.gradientFrom}, ${t.gradientTo})`,
                                      boxShadow: `0 6px 18px -4px ${t.hex}66`,
                                    }}
                                  >
                                    {lesson.hours}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* 本节目标 */}
                            <p className="text-[13px] leading-[1.85] text-ink-soft sm:text-[13.5px]">
                              {lesson.goal}
                            </p>

                            {/* 子条目列表 */}
                            <ul className="grid grid-cols-1 gap-2.5 sm:gap-3 md:grid-cols-2">
                              {lesson.points.map((point) => (
                                <li
                                  key={point}
                                  className="flex items-start gap-3 rounded-xl border p-3.5 transition-colors hover:border-hairline-strong sm:gap-3.5 sm:p-4"
                                  style={{
                                    borderColor: 'rgba(255,255,255,0.07)',
                                    background: 'rgba(5,5,7,0.45)',
                                  }}
                                >
                                  <span
                                    aria-hidden
                                    className="mt-1.5 inline-flex h-1.5 w-1.5 flex-none rounded-full"
                                    style={{
                                      background: `linear-gradient(135deg, ${t.gradientFrom}, ${t.gradientTo})`,
                                      boxShadow: `0 0 8px ${t.hex}88`,
                                    }}
                                  />
                                  <span className="text-[12.5px] leading-[1.75] text-ink-soft sm:text-[13px]">
                                    {point}
                                  </span>
                                </li>
                              ))}
                            </ul>

                            {/* 课后产出 callout */}
                            <div
                              className="flex flex-col gap-1.5 rounded-xl border p-4 sm:p-5"
                              style={{
                                borderColor: `rgba(${t.rgb}, 0.3)`,
                                background: `rgba(${t.rgb}, 0.08)`,
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em]"
                                  style={{ color: t.hex }}
                                >
                                  课后产出 · 收获
                                </span>
                                {lesson.outputDraft && <DraftTag />}
                              </div>
                              <p className="text-[13px] font-medium leading-[1.7] text-ink sm:text-[14px]">
                                {lesson.output}
                              </p>
                            </div>
                          </div>
                        </article>
                      </Reveal>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* 4. 服务模式(拟稿) */}
      <section className="relative mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-24 lg:pb-28">
        <Reveal>
          <div className="flex flex-col gap-4">
            <SectionEyebrow color={STAGE2_THEMES.enterprise.hex}>服务模式</SectionEyebrow>
            <h2 className="font-serif-zh text-[22px] font-semibold leading-[1.5] tracking-[0.005em] sm:text-[26px] sm:leading-[1.45] lg:text-[34px] lg:leading-[1.3]">
              <span className="block">企业级实战直播 ·</span>
              <span className="mt-1 block sm:mt-1.5">
                <GradientText className="font-semibold">课程外问题长期陪跑</GradientText>
              </span>
            </h2>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <article
            className="group relative mt-10 overflow-hidden rounded-[24px] border p-6 backdrop-blur-xl sm:mt-12 sm:rounded-[28px] sm:p-8 lg:p-9"
            style={{
              borderColor: `rgba(${STAGE2_THEMES.enterprise.rgb}, 0.32)`,
              background: `linear-gradient(135deg, rgba(${STAGE2_THEMES.enterprise.rgb}, 0.12) 0%, rgba(13,13,18,0.55) 60%)`,
              boxShadow: `inset 0 0 0 1px rgba(${STAGE2_THEMES.enterprise.rgb}, 0.08)`,
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
            <SectionEyebrow color={advance.hex}>本阶段报名</SectionEyebrow>

            {/* 价格条 + 含第一阶段全部内容 pill */}
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
              <PriceChip badge="职业进阶" specialLabel="全包价" price="¥3999" />
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

            {/* 报名按钮 */}
            <div className="mt-1">
              <EnrollButton label="报名职业开发者进阶 · ¥3999" onClick={onEnroll} />
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
