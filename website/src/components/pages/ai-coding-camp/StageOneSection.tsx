'use client'

import { GradientText, Reveal } from '../../motion'
import {
  STAGE1_DELIVERABLES as DELIVERABLES,
  STAGE1_CHAPTERS as CHAPTERS, STAGE1_SERVICE_STAGES as SERVICE_STAGES, THEMES,
  STAGE1_PRICE,
} from './data'
import { SectionEyebrow, PriceChip, EnrollButton } from './primitives'

export function StageOneSection({ onEnroll }: { onEnroll: () => void }) {
  return (
    <div id="stage-one" className="relative scroll-mt-20 sm:scroll-mt-24">
      {/* 2. 四大成果：你将拿到什么 */}
      <section className="relative mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:py-28">
        <Reveal>
          <div className="flex flex-col gap-4">
            <SectionEyebrow color="#FDA4AF">你将拿到</SectionEyebrow>
            <h2 className="font-serif-zh text-[22px] font-semibold leading-[1.5] tracking-[0.005em] sm:text-[26px] sm:leading-[1.45] lg:text-[36px] lg:leading-[1.25]">
              <span className="block">学完，你手里会有</span>
              <span className="mt-1 block sm:mt-1.5">
                <GradientText className="font-semibold">4 件你自己亲手做出来的交付成果</GradientText>
              </span>
            </h2>
            <p className="max-w-2xl text-[13.5px] leading-[1.85] text-ink-soft sm:text-[14.5px]">
              不是看老师演示的截图，不是跑一遍 demo——是亲手做出来、能扫码访问、能发给朋友看的产品。
            </p>
          </div>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-12 sm:gap-5 lg:grid-cols-2">
          {DELIVERABLES.map((item, i) => {
            const t = THEMES[item.theme]
            return (
              <Reveal key={item.code} delay={i * 0.06}>
                <article
                  className="group relative h-full overflow-hidden rounded-[22px] border p-5 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 sm:rounded-[26px] sm:p-7"
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
                        交付物 · DELIVERABLE
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

      {/* 6. 课时大纲：差异化主题色 + 超大背景序号 */}
      <section className="relative mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-24 lg:pb-28">
        <Reveal>
          <div className="flex flex-col gap-4">
            <SectionEyebrow color="#F0ABFC">课时大纲</SectionEyebrow>
            <h2 className="font-serif-zh text-[22px] font-semibold leading-[1.5] tracking-[0.005em] sm:text-[26px] sm:leading-[1.45] lg:text-[34px] lg:leading-[1.3]">
              <span className="block">每节课时都有看得见、</span>
              <span className="mt-1 block sm:mt-1.5">
                <GradientText className="font-semibold">摸得着的产出物</GradientText>
              </span>
            </h2>
            <p className="max-w-2xl text-[13.5px] leading-[1.85] text-ink-soft sm:text-[14.5px]">
              每节课时都有看得见、摸得着的交付物——前一节的能力承接后一节。
            </p>
          </div>
        </Reveal>

        <div className="mt-10 flex flex-col gap-5 sm:mt-12 sm:gap-6">
          {CHAPTERS.map((chapter, i) => {
            const t = THEMES[chapter.theme]
            return (
              <Reveal key={chapter.index} delay={Math.min(i, 4) * 0.04}>
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
                  {/* 右下角超大半透明课时序号 */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -bottom-4 -right-2 select-none font-mono text-[120px] font-black leading-none tabular sm:-bottom-6 sm:-right-4 sm:text-[180px] lg:text-[220px]"
                    style={{
                      color: t.hex,
                      opacity: 0.06,
                      WebkitTextStroke: `1px ${t.hex}33`,
                    }}
                  >
                    {String(chapter.index).padStart(2, '0')}
                  </span>

                  <div className="relative flex flex-col gap-5">
                    {/* 顶部：课时序号 + 标题 + 主题标签 */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                      <div className="flex items-start gap-4 sm:gap-5">
                        <span
                          className="flex h-12 w-12 flex-none items-center justify-center rounded-xl font-mono text-[15px] font-bold text-canvas sm:h-14 sm:w-14 sm:text-[17px]"
                          style={{
                            background: `linear-gradient(135deg, ${t.gradientFrom}, ${t.gradientTo})`,
                            boxShadow: `0 6px 18px -4px ${t.hex}66`,
                          }}
                        >
                          {String(chapter.index).padStart(2, '0')}
                        </span>
                        <div className="flex flex-col gap-2">
                          <span
                            className="font-mono text-[10.5px] font-medium uppercase tracking-[0.22em]"
                            style={{ color: t.hex }}
                          >
                            课时 {chapter.index} · {t.label} · {chapter.hours}
                          </span>
                          <h3 className="font-serif-zh text-[19px] font-semibold leading-[1.4] text-ink sm:text-[22px] lg:text-[25px]">
                            {chapter.title}
                          </h3>
                        </div>
                      </div>
                    </div>

                    {/* 交付物 + 引言 */}
                    <div
                      className="flex flex-col gap-3 rounded-xl border p-4 sm:p-5"
                      style={{
                        borderColor: `rgba(${t.rgb}, 0.18)`,
                        background: `linear-gradient(135deg, rgba(${t.rgb}, 0.06) 0%, rgba(5,5,7,0.5) 100%)`,
                      }}
                    >
                      <div className="flex flex-col gap-1.5">
                        <span
                          className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em]"
                          style={{ color: t.hex }}
                        >
                          交付物
                        </span>
                        <p className="text-[13.5px] font-medium leading-[1.7] text-ink sm:text-[14.5px]">
                          {chapter.deliverable}
                        </p>
                      </div>
                      <p className="text-[12.5px] leading-[1.85] text-ink-soft sm:text-[13.5px]">
                        {chapter.intro}
                      </p>
                    </div>

                    {/* 提示色块 */}
                    {chapter.warning && (
                      <div
                        className="flex flex-col gap-1.5 rounded-xl border p-4 sm:p-5"
                        style={{
                          borderColor: `rgba(${t.rgb}, 0.35)`,
                          background: `rgba(${t.rgb}, 0.08)`,
                        }}
                      >
                        <span
                          className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.22em]"
                          style={{ color: t.hex }}
                        >
                          {chapter.warning.label}
                        </span>
                        <p className="text-[12.5px] leading-[1.85] text-ink-soft sm:text-[13px]">
                          {chapter.warning.body}
                        </p>
                      </div>
                    )}

                    {/* 子条目列表 */}
                    <ul className="grid grid-cols-1 gap-2.5 sm:gap-3 md:grid-cols-2">
                      {chapter.lessons.map((lesson) => (
                        <li
                          key={lesson.code}
                          className="flex items-start gap-3 rounded-xl border p-3.5 transition-colors hover:border-hairline-strong sm:gap-3.5 sm:p-4"
                          style={{
                            borderColor: 'rgba(255,255,255,0.07)',
                            background: 'rgba(5,5,7,0.45)',
                          }}
                        >
                          <span
                            className="flex h-7 min-w-[2.5rem] flex-none items-center justify-center rounded-md px-2 font-mono text-[11px] font-semibold tabular sm:h-8 sm:text-[11.5px]"
                            style={{
                              background: `linear-gradient(135deg, rgba(${t.rgb}, 0.18), rgba(${t.rgb}, 0.08))`,
                              border: `1px solid rgba(${t.rgb}, 0.22)`,
                              color: t.hex,
                            }}
                          >
                            {lesson.code}
                          </span>
                          <div className="flex flex-col gap-1">
                            <span className="text-[13px] font-semibold text-ink sm:text-[13.5px]">
                              {lesson.title}
                            </span>
                            <span className="text-[12px] leading-[1.75] text-muted sm:text-[12.5px]">
                              {lesson.brief}
                            </span>
                          </div>
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

      {/* 7. 服务模式：怎么交付 */}
      <section className="relative mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-24 lg:pb-28">
        <Reveal>
          <div className="flex flex-col gap-4">
            <SectionEyebrow color="#FCD34D">服务模式</SectionEyebrow>
            <h2 className="font-serif-zh text-[22px] font-semibold leading-[1.5] tracking-[0.005em] sm:text-[26px] sm:leading-[1.45] lg:text-[36px] lg:leading-[1.25]">
              <span className="block">1 个月线上直播 ·</span>
              <span className="mt-1 block sm:mt-1.5">
                <GradientText className="font-semibold">最长 6 个月持续陪跑</GradientText>
              </span>
            </h2>
            <p className="max-w-2xl text-[13.5px] leading-[1.85] text-ink-soft sm:text-[14.5px]">
              用一个月把十节课时系统化课程结构化交付给你，再用最长 6 个月把能力真正稳住——边学边做，结业时 4 件你自己亲手做出来的交付成果同步产出；课程之外的真实问题，6 个月内都可以继续来问。
            </p>
          </div>
        </Reveal>

        {/* 2 大对等阶段：直播 + 6 月陪跑 */}
        <div className="mt-10 grid grid-cols-1 gap-5 sm:mt-12 sm:gap-6 lg:grid-cols-2">
          {SERVICE_STAGES.map((stage, i) => {
            const t = THEMES[stage.theme]
            const isCompanion = stage.code === '02'
            return (
              <Reveal key={stage.code} delay={i * 0.1}>
                <article
                  className="group relative h-full overflow-hidden rounded-[24px] border p-6 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 sm:rounded-[28px] sm:p-8 lg:p-9"
                  style={{
                    borderColor: `rgba(${t.rgb}, ${isCompanion ? 0.4 : 0.28})`,
                    background: `linear-gradient(135deg, rgba(${t.rgb}, ${isCompanion ? 0.14 : 0.10}) 0%, rgba(13,13,18,0.55) 60%)`,
                    boxShadow: isCompanion
                      ? `inset 0 0 0 1px rgba(${t.rgb}, 0.18), 0 20px 50px -20px ${t.hex}55`
                      : `inset 0 0 0 1px rgba(${t.rgb}, 0.06)`,
                  }}
                >
                  {/* 主题色光晕 */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-60"
                    style={{
                      background: `radial-gradient(circle, ${t.hex}66 0%, transparent 65%)`,
                      filter: 'blur(28px)',
                    }}
                  />
                  {/* 巨号背景序号 */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -bottom-6 -right-2 select-none font-mono text-[180px] font-black leading-none tabular sm:text-[220px]"
                    style={{ color: t.hex, opacity: 0.05 }}
                  >
                    {stage.code}
                  </span>

                  <div className="relative flex h-full flex-col gap-4">
                    {/* 顶部标签 + 时长徽标 */}
                    <div className="flex items-center justify-between">
                      <span
                        className="font-mono text-[11px] font-semibold tracking-[0.18em]"
                        style={{ color: t.hex }}
                      >
                        STAGE · {stage.code} · {stage.stage}
                      </span>
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[11px] font-bold tabular text-canvas"
                        style={{
                          background: `linear-gradient(135deg, ${t.gradientFrom}, ${t.gradientTo})`,
                          boxShadow: `0 6px 18px -4px ${t.hex}66`,
                        }}
                      >
                        {stage.duration}
                      </span>
                    </div>

                    <h3 className="font-serif-zh text-[22px] font-semibold leading-[1.3] text-ink sm:text-[26px] lg:text-[28px]">
                      {stage.title}
                    </h3>
                    <p
                      className="text-[13.5px] font-medium leading-[1.6] sm:text-[14.5px]"
                      style={{ color: t.hex }}
                    >
                      {stage.highlight}
                    </p>
                    <p className="text-[13px] leading-[1.85] text-ink-soft sm:text-[13.5px]">
                      {stage.body}
                    </p>

                    {/* 详细服务清单 */}
                    <ul className="mt-2 flex flex-col gap-2.5 border-t pt-4 sm:gap-3 sm:pt-5"
                      style={{ borderColor: `rgba(${t.rgb}, 0.15)` }}
                    >
                      {stage.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-[12.5px] leading-[1.6] text-ink-soft sm:text-[13px]">
                          <span
                            aria-hidden
                            className="mt-1.5 inline-flex h-1.5 w-1.5 flex-none rounded-full"
                            style={{
                              background: `linear-gradient(135deg, ${t.gradientFrom}, ${t.gradientTo})`,
                              boxShadow: `0 0 8px ${t.hex}88`,
                            }}
                          />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>

                    {isCompanion && (
                      <div
                        className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10.5px] sm:text-[11px]"
                        style={{
                          borderColor: `rgba(${t.rgb}, 0.45)`,
                          background: `rgba(${t.rgb}, 0.10)`,
                          color: t.hex,
                        }}
                      >
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: t.hex }} />
                        训练营独家承诺
                      </div>
                    )}
                  </div>
                </article>
              </Reveal>
            )
          })}
        </div>

        {/* 时间轴条 */}
        <Reveal delay={0.18}>
          <div
            className="relative mt-6 overflow-hidden rounded-2xl border p-5 backdrop-blur-xl sm:mt-8 sm:rounded-[22px] sm:p-6"
            style={{
              borderColor: 'rgba(167,139,250,0.22)',
              background:
                'linear-gradient(110deg, rgba(167,139,250,0.10) 0%, rgba(251,113,133,0.08) 50%, rgba(251,191,36,0.10) 100%)',
            }}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
                  TIMELINE · 服务节奏
                </span>
                <p className="text-[14px] font-semibold text-ink sm:text-[15px]">
                  1 个月集中授课 · 边学边交付 · 最长 6 个月持续答疑陪跑
                </p>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px] tabular text-ink-soft sm:text-[12px]">
                <span
                  className="rounded-full px-3 py-1.5"
                  style={{ background: 'rgba(167,139,250,0.18)', color: '#C4B5FD' }}
                >
                  第 1 月 · 直播
                </span>
                <span className="text-muted">→</span>
                <span
                  className="rounded-full px-3 py-1.5"
                  style={{ background: 'rgba(251,113,133,0.15)', color: '#FDA4AF' }}
                >
                  实操产出
                </span>
                <span className="text-muted">→</span>
                <span
                  className="rounded-full px-3 py-1.5"
                  style={{ background: 'rgba(251,191,36,0.15)', color: '#FCD34D' }}
                >
                  6 月陪跑
                </span>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* 本阶段报名：价格 + 报名入口（复用 Hero 价格条样式 + BottomCta 按钮样式） */}
      <section className="relative mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-24 lg:pb-28">
        <Reveal>
          <div className="flex flex-col items-center gap-6 text-center">
            <SectionEyebrow color="#FDA4AF">本阶段报名</SectionEyebrow>

            {/* 价格条（复用 Hero.tsx 样式） */}
            <PriceChip
              badge="首批限定"
              originalPrice={`原价 ${STAGE1_PRICE.original}`}
              specialLabel="限时特价"
              price={STAGE1_PRICE.now}
            />

            {/* 报名按钮（复用 BottomCta.tsx 按钮样式） */}
            <div className="mt-1">
              <EnrollButton label="报名零基础 AI 编程 · ¥1999" onClick={onEnroll} />
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
