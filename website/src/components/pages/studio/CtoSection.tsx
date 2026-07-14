"use client";

import { Reveal, GradientText } from "../../motion";
import { THEMES, INSTRUCTOR_CREDENTIALS } from "../ai-coding-camp/data";
import { CTO_PROFILE } from "./data";

// 与训练营页讲师名片一致的三个头衔徽标（直接复用同一批真实资历文案）
const TITLE_BADGES = [
  {
    label: "创业公司 CTO",
    color: "#57beff",
    bg: "rgba(0,153,255,0.10)",
    border: "rgba(87,190,255,0.45)",
  },
  {
    label: "一线工程师",
    color: "#01aef0",
    bg: "rgba(1,174,240,0.10)",
    border: "rgba(1,174,240,0.45)",
  },
  {
    label: "AI 教学者",
    color: "#ff52b7",
    bg: "rgba(212,38,114,0.10)",
    border: "rgba(255,82,183,0.45)",
  },
];

// CTO 个人简介卡片：作为 IntroSection 网格的右列渲染，不含自身的 section 外壳
export function CtoSection() {
  return (
    <Reveal delay={0.1}>
      <div
        className="relative h-full overflow-hidden rounded-md p-6 backdrop-blur-xl sm:p-7"
        style={{
          background:
            "linear-gradient(150deg, rgba(0,153,255,0.16) 0%, rgba(0,153,255,0.05) 100%)",
          boxShadow: "0 16px 48px -16px rgba(0,153,255,0.4)",
        }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full opacity-70"
          style={{
            background:
              "radial-gradient(circle, rgba(87,190,255,0.5) 0%, transparent 65%)",
          }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-16 -left-16 h-44 w-44 rounded-full opacity-60"
          style={{
            background:
              "radial-gradient(circle, rgba(212,38,114,0.4) 0%, transparent 65%)",
          }}
        />

        <div className="relative flex h-full flex-col gap-5">
          <div className="flex items-center gap-4">
            <img
              src={CTO_PROFILE.avatarUrl}
              alt={`CTO ${CTO_PROFILE.name}`}
              loading="lazy"
              className="h-16 w-16 flex-none rounded-md object-cover sm:h-20 sm:w-20"
              style={{
                objectPosition: CTO_PROFILE.avatarPosition,
                boxShadow:
                  "0 12px 28px -8px rgba(0,153,255,0.65), inset 0 0 0 1px rgba(255,255,255,0.2)",
              }}
            />
            <div className="flex flex-col gap-1">
              <span
                className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.22em]"
                style={{ color: "#57beff" }}
              >
                组织顶点 · CTO
              </span>
              <h2 className="font-serif-zh text-[24px] font-bold leading-none text-ink sm:text-[28px]">
                <GradientText>{CTO_PROFILE.name}</GradientText>
                <span className="ml-2 align-middle font-mono text-[12px] font-medium text-ink-soft sm:text-[13px]">
                  {CTO_PROFILE.nameEn}
                </span>
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {TITLE_BADGES.map((badge) => (
              <span
                key={badge.label}
                className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] sm:text-[11.5px]"
                style={{
                  borderColor: badge.border,
                  background: badge.bg,
                  color: badge.color,
                }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: badge.color }}
                />
                {badge.label}
              </span>
            ))}
          </div>

          <div
            className="flex flex-col gap-3 border-t pt-4"
            style={{ borderColor: "rgba(255,255,255,0.08)" }}
          >
            {INSTRUCTOR_CREDENTIALS.map((cred) => {
              const t = THEMES[cred.theme];
              return (
                <div
                  key={cred.label}
                  className="flex flex-col gap-1 border-l-2 pl-3"
                  style={{ borderColor: t.hex }}
                >
                  <div className="flex items-baseline gap-2">
                    <span
                      className="font-serif-zh text-[15px] font-bold leading-none"
                      style={{
                        color: t.hex,
                        textShadow: `0 0 14px ${t.hex}55`,
                      }}
                    >
                      {cred.metric}
                    </span>
                    <span className="text-[12.5px] font-semibold leading-[1.4] text-ink sm:text-[13px]">
                      {cred.label}
                    </span>
                  </div>
                  <span className="text-[11.5px] leading-[1.65] text-ink-soft">
                    {cred.detail}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Reveal>
  );
}
