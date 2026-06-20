"use client";

import { GradientText, Reveal } from "../../motion";
import {
  STAGE1_DELIVERABLES as DELIVERABLES,
  STAGE1_CHAPTERS as CHAPTERS,
  STAGE1_SERVICE_STAGES as SERVICE_STAGES,
  THEMES,
  STAGE1_PRICE,
} from "./data";
import { SectionEyebrow, PriceChip } from "./primitives";

export function StageOneSection({ onEnroll }: { onEnroll: () => void }) {
  return (
    <div id="stage-one" className="relative scroll-mt-20 sm:scroll-mt-24">
      {/* 6. 课时大纲：差异化主题色 + 超大背景序号 */}
      <section className="relative mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-24 lg:pb-28">
        <Reveal>
          <h2 className="font-serif-zh text-[22px] font-semibold leading-[1.4] tracking-[0.005em] sm:text-[26px] lg:text-[34px]">
            AI 编程入门课程大纲（初阶）
          </h2>
        </Reveal>

        <div className="mt-10 flex flex-col sm:mt-12">
          {CHAPTERS.map((chapter, i) => {
            const t = THEMES[chapter.theme];
            return (
              <Reveal
                key={chapter.index}
                delay={Math.min(i, 4) * 0.06}
                y={28}
                className={
                  i > 0 ? "mt-10 border-t border-hairline pt-10 sm:mt-12 sm:pt-12" : ""
                }
              >
                {/* 区块式（非卡片）：大序号 + 主题标签，内容靠分隔线与留白组织 */}
                <div className="relative flex flex-col gap-6">
                  {/* 序号旁柔光：给区块加色彩深度，非卡片、不加边框 */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -left-5 -top-7 h-28 w-28 rounded-full opacity-45"
                    style={{
                      background: `radial-gradient(circle, ${t.hex}55 0%, transparent 70%)`,
                      filter: "blur(34px)",
                    }}
                  />
                  <div className="relative flex items-baseline gap-4 sm:gap-5">
                    <span
                      className="font-mono text-[32px] font-bold leading-none tabular sm:text-[44px]"
                      style={{
                        backgroundImage: `linear-gradient(135deg, ${t.gradientFrom}, ${t.gradientTo})`,
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                        color: "transparent",
                        filter: `drop-shadow(0 0 14px ${t.hex}66)`,
                      }}
                    >
                      {String(chapter.index).padStart(2, "0")}
                    </span>
                    <div className="flex flex-col gap-1.5">
                      <span
                        className="font-mono text-[10.5px] font-medium uppercase tracking-[0.22em]"
                        style={{ color: t.hex }}
                      >
                        {t.label} · {chapter.hours}
                      </span>
                      <h3 className="font-serif-zh text-[20px] font-semibold leading-[1.35] text-ink sm:text-[24px] lg:text-[27px]">
                        {chapter.title}
                      </h3>
                      <span
                        aria-hidden
                        className="mt-1 block h-[2px] w-10 rounded-full"
                        style={{
                          background: `linear-gradient(90deg, ${t.gradientFrom}, ${t.gradientTo})`,
                        }}
                      />
                    </div>
                  </div>

                  {/* 引言 + 交付物：纯文本，无盒；左缩进与标题对齐 */}
                  <div className="flex flex-col gap-2.5 sm:pl-[3.75rem]">
                    <p className="max-w-3xl text-[13.5px] leading-[1.85] text-ink-soft sm:text-[14.5px]">
                      {chapter.intro}
                    </p>
                    <p className="text-[13px] sm:text-[13.5px]">
                      <span
                        className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em]"
                        style={{ color: t.hex }}
                      >
                        交付物
                      </span>
                      <span className="ml-3 font-medium text-ink">{chapter.deliverable}</span>
                    </p>
                  </div>

                  {/* 提示：左竖线 + 文本，无盒 */}
                  {chapter.warning && (
                    <div
                      className="border-l-2 pl-4 sm:ml-[3.75rem]"
                      style={{ borderColor: t.hex }}
                    >
                      <span
                        className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.2em]"
                        style={{ color: t.hex }}
                      >
                        {chapter.warning.label}
                      </span>
                      <p className="mt-1 max-w-3xl text-[12.5px] leading-[1.85] text-ink-soft sm:text-[13px]">
                        {chapter.warning.body}
                      </p>
                    </div>
                  )}

                  {/* 子课时：线 + 序号 + 文字 的清单，两列，无盒 */}
                  <ul className="grid grid-cols-1 gap-x-10 sm:pl-[3.75rem] md:grid-cols-2">
                    {chapter.lessons.map((lesson) => (
                      <li
                        key={lesson.code}
                        className="group/lesson flex items-start gap-3.5 border-t border-hairline py-3.5 transition-colors hover:border-white/25"
                      >
                        <span
                          className="font-mono text-[12px] font-semibold leading-[1.5] tabular"
                          style={{
                            backgroundImage: `linear-gradient(135deg, ${t.gradientFrom}, ${t.gradientTo})`,
                            WebkitBackgroundClip: "text",
                            backgroundClip: "text",
                            color: "transparent",
                          }}
                        >
                          {lesson.code}
                        </span>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[13px] font-semibold text-ink sm:text-[13.5px]">
                            {lesson.title}
                          </span>
                          <span className="text-[12px] leading-[1.7] text-muted transition-colors group-hover/lesson:text-ink-soft sm:text-[12.5px]">
                            {lesson.brief}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* 四大成果：初阶课程学完的产出物 */}
      <section className="relative mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-24 lg:pb-28">
        <Reveal>
          <div className="flex flex-col gap-4">
            <SectionEyebrow color="#FDA4AF">你将拿到</SectionEyebrow>
            <h2 className="font-serif-zh text-[22px] font-semibold leading-[1.5] tracking-[0.005em] sm:text-[26px] sm:leading-[1.45] lg:text-[36px] lg:leading-[1.25]">
              <span className="block">学完，你手里会有</span>
              <span className="mt-1 block sm:mt-1.5">
                <GradientText className="font-semibold">
                  4 件你自己亲手做出来的交付成果
                </GradientText>
              </span>
            </h2>
            <p className="max-w-2xl text-[13.5px] leading-[1.85] text-ink-soft sm:text-[14.5px]">
              不是看老师演示的截图，不是跑一遍
              demo——是亲手做出来、能在线访问、能发给朋友看的产品。
            </p>
          </div>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-12 sm:gap-5 lg:grid-cols-2">
          {DELIVERABLES.map((item, i) => {
            const t = THEMES[item.theme];
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
                      filter: "blur(24px)",
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
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ background: t.hex }}
                        />
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
            );
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
                <GradientText className="font-semibold">
                  最长 6 个月持续陪跑
                </GradientText>
              </span>
            </h2>
            <p className="max-w-2xl text-[13.5px] leading-[1.85] text-ink-soft sm:text-[14.5px]">
              用一个月把系统化课程结构化交付给你，再用最长 6
              个月把能力真正稳住——边学边做，结业时 4
              件你自己亲手做出来的交付成果同步产出；课程之外的真实问题，6
              个月内都可以继续来问。
            </p>
          </div>
        </Reveal>

        {/* 2 大对等阶段：直播 + 6 月陪跑 */}
        <div className="mt-10 grid grid-cols-1 gap-5 sm:mt-12 sm:gap-6 lg:grid-cols-2">
          {SERVICE_STAGES.map((stage, i) => {
            const t = THEMES[stage.theme];
            const isCompanion = stage.code === "02";
            return (
              <Reveal key={stage.code} delay={i * 0.1}>
                <article
                  className="group relative h-full overflow-hidden rounded-[24px] border p-6 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 sm:rounded-[28px] sm:p-8 lg:p-9"
                  style={{
                    borderColor: `rgba(${t.rgb}, ${isCompanion ? 0.4 : 0.28})`,
                    background: `linear-gradient(135deg, rgba(${t.rgb}, ${isCompanion ? 0.14 : 0.1}) 0%, rgba(13,13,18,0.55) 60%)`,
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
                      filter: "blur(28px)",
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
                    <ul
                      className="mt-2 flex flex-col gap-2.5 border-t pt-4 sm:gap-3 sm:pt-5"
                      style={{ borderColor: `rgba(${t.rgb}, 0.15)` }}
                    >
                      {stage.features.map((f) => (
                        <li
                          key={f}
                          className="flex items-start gap-2.5 text-[12.5px] leading-[1.6] text-ink-soft sm:text-[13px]"
                        >
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
                        <span
                          className="h-1.5 w-1.5 animate-pulse rounded-full"
                          style={{ background: t.hex }}
                        />
                        训练营独家承诺
                      </div>
                    )}
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>

        {/* 时间轴条 */}
        <Reveal delay={0.18}>
          <div
            className="relative mt-6 overflow-hidden rounded-2xl border p-5 backdrop-blur-xl sm:mt-8 sm:rounded-[22px] sm:p-6"
            style={{
              borderColor: "rgba(167,139,250,0.22)",
              background:
                "linear-gradient(110deg, rgba(167,139,250,0.10) 0%, rgba(251,113,133,0.08) 50%, rgba(251,191,36,0.10) 100%)",
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
                  style={{
                    background: "rgba(167,139,250,0.18)",
                    color: "#C4B5FD",
                  }}
                >
                  第 1 月 · 直播
                </span>
                <span className="text-muted">→</span>
                <span
                  className="rounded-full px-3 py-1.5"
                  style={{
                    background: "rgba(251,113,133,0.15)",
                    color: "#FDA4AF",
                  }}
                >
                  实操产出
                </span>
                <span className="text-muted">→</span>
                <span
                  className="rounded-full px-3 py-1.5"
                  style={{
                    background: "rgba(251,191,36,0.15)",
                    color: "#FCD34D",
                  }}
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

            {/* 价格条本身可点击报名（点击打开扫码报名弹窗） */}
            <PriceChip
              badge="首批限定"
              specialLabel="限时特价"
              price={STAGE1_PRICE.now}
              onClick={onEnroll}
            />

            {/* 邀请返学费提示 */}
            <p className="flex items-center gap-2 text-[12.5px] leading-[1.6] text-ink-soft sm:text-[13px]">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: "#FDA4AF" }} />
              <span>
                <span className="font-semibold" style={{ color: "#FDA4AF" }}>
                  邀请返学费
                </span>
                　每邀请一位学员，退还 <span className="font-semibold text-ink">¥500</span> 学费
              </span>
            </p>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
