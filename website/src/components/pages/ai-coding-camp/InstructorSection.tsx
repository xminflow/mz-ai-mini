"use client";

import { GradientText, Reveal } from "../../motion";
import { INSTRUCTOR_CREDENTIALS, THEMES } from "./data";

/* 「为什么选我们」八大核心：短标题 + 完整描述（描述逐字按用户原话，未改一字）。 */
type Pitch = { title: string; desc: string };
const PROMISES: Pitch[] = [
  {
    title: "CTO亲授",
    desc: "专注于做好每一节AI精品课程，基于长期的AI编程教学经验，我们真正了解你的学习卡点，CTO亲自带你从零一步步实操，让你看清每一个AI编程细节",
  },
  {
    title: "AI驱动软件闭环",
    desc: "AI让我们每个人都可以成为全能战士，从开发到上线全流程，我们教你通过AI的方式真正走完软件全生命周期闭环，不论是创意还是工作，轻松拿捏",
  },
  {
    title: "为结果负责",
    desc: "学习并不是你一个人的事情，而是我们共同努力的成果，我们将持续跟踪你的掌握进度，并对你的学习成果进行验收",
  },
  {
    title: "AI思维",
    desc: "传统方式的软件教学以及常规的AI编程思维早已过时，我们是市面上最好最新的纯粹的AI编程课题，真正以AI思维驱动的AI编程与个人技术成长，让你以最轻松最高效的方式掌握AI软件编程",
  },
  {
    title: "核心竞争力",
    desc: "我们确信未来必定是全民AI编程，任何人都可以学会AI编程，但不同的人有不同的核心竞争力,我们将以最先进的AI学习方法论来挖掘出你的核心竞争力，不论是创业还是职场，你都可以一枝独秀",
  },
  {
    title: "思维骨架",
    desc: "我们教会你以AI的思维提炼了软件工程中最核心的思维骨架，只需要这一套课程即可悟透软件应用开发领域，我们不仅仅是教你技术，更是需要让你掌握面向未来的AI成长思维",
  },
  {
    title: "AI社区",
    desc: "在AI时代知识需要不断更新才有价值，于是我们为你打造了持续进化的AI社区，永久开放，终身学习",
  },
  {
    title: "企业实战",
    desc: "我们准备了真实的企业级实战项目，从零开始使用AI进行完整开发闭环，给你展示每一个AI的使用细节与软件架构设计考量，让你真正具备企业级AI开发能力，同时让你的简历大放异彩",
  },
];

export function InstructorSection() {
  return (
    <section className="relative mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-24 lg:pb-28">
      <Reveal>
        <h2 className="font-serif-zh text-center text-[24px] font-bold leading-[1.3] text-ink sm:text-[30px] lg:text-[34px]">
          为什么选我们？
        </h2>
      </Reveal>

      {/* 左：八大核心卡片网格 / 右：个人简介名片（资历并入） */}
      <div className="mt-9 grid grid-cols-1 gap-5 sm:mt-12 sm:gap-6 lg:grid-cols-[1.55fr_1fr] lg:items-stretch">
        {/* 左侧：八大核心 · 无边框中性玻璃卡片（文案逐字按用户原话） */}
        <div className="grid grid-cols-1 gap-4 text-left sm:grid-cols-2">
          {PROMISES.map((p, i) => (
            <Reveal key={p.title} delay={0.06 + i * 0.04}>
              <div
                className="group h-full rounded-md p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1"
                style={{
                  background:
                    "linear-gradient(150deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.018) 100%)",
                  boxShadow: "0 14px 36px -22px rgba(0,0,0,0.85)",
                }}
              >
                <span
                  aria-hidden
                  className="block h-[3px] w-9 rounded-full transition-all duration-300 group-hover:w-14"
                  style={{
                    background: "linear-gradient(90deg, #57beff, #01aef0)",
                  }}
                />
                <h3 className="mt-4 font-serif-zh text-[18px] font-bold leading-tight sm:text-[20px]">
                  <GradientText>{p.title}</GradientText>
                </h3>
                <p className="mt-2.5 text-[12.5px] leading-[1.8] text-ink-soft sm:text-[13px]">
                  {p.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* 右侧：讲师名片（个人简介，4 项资历以竖线+文字形式并入卡内） */}
        <Reveal delay={0.1}>
          <div
            className="relative h-full overflow-hidden rounded-md p-6 backdrop-blur-xl sm:p-7"
            style={{
              background:
                "linear-gradient(150deg, rgba(0,153,255,0.16) 0%, rgba(0,153,255,0.05) 100%)",
              boxShadow:
                "0 16px 48px -16px rgba(0,153,255,0.4)",
            }}
          >
            {/* 主题色光晕 */}
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
              {/* 头像 + 姓名 */}
              <div className="flex items-center gap-4">
                <img
                  src="https://weelume-pro-1420922170.cos.ap-shanghai.myqcloud.com/website/instructor/shiyi.jpg"
                  alt="主讲老师 十一"
                  loading="lazy"
                  className="h-16 w-16 flex-none rounded-md object-cover object-[50%_22%] sm:h-20 sm:w-20"
                  style={{
                    boxShadow:
                      "0 12px 28px -8px rgba(0,153,255,0.65), inset 0 0 0 1px rgba(255,255,255,0.2)",
                  }}
                />
                <div className="flex flex-col gap-1">
                  <span
                    className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.22em]"
                    style={{ color: "#57beff" }}
                  >
                    主讲老师 · INSTRUCTOR
                  </span>
                  <h3 className="font-serif-zh text-[24px] font-bold leading-none text-ink sm:text-[28px]">
                    十一
                    <span className="ml-2 align-middle font-mono text-[12px] font-medium text-ink-soft sm:text-[13px]">
                      SHI YI
                    </span>
                  </h3>
                </div>
              </div>

              {/* 头衔徽标组 */}
              <div className="flex flex-wrap gap-1.5">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] sm:text-[11.5px]"
                  style={{
                    borderColor: "rgba(87,190,255,0.45)",
                    background: "rgba(0,153,255,0.10)",
                    color: "#57beff",
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: "#57beff" }}
                  />
                  创业公司 CTO
                </span>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] sm:text-[11.5px]"
                  style={{
                    borderColor: "rgba(1,174,240,0.45)",
                    background: "rgba(1,174,240,0.10)",
                    color: "#01aef0",
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: "#01aef0" }}
                  />
                  一线工程师
                </span>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] sm:text-[11.5px]"
                  style={{
                    borderColor: "rgba(255,82,183,0.45)",
                    background: "rgba(212,38,114,0.10)",
                    color: "#ff52b7",
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: "#ff52b7" }}
                  />
                  AI 教学者
                </span>
              </div>

              {/* 短引言 */}
              <p className="text-[13px] leading-[1.85] text-ink-soft sm:text-[13.5px]">
                「我自己用 AI
                编程做完整产品已经做了两年，也用同一套工作流带过零基础学员从 0
                跑到上线——这门课讲的就是我自己每天在用的那一套。」
              </p>

              {/* 4 项核心资历（并入名片：竖线主题色 + 数字 + 标题 + 说明） */}
              <div className="flex flex-col gap-3">
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

              {/* 底部强调：亲授承诺（不单独成容器，作为一行文字收尾） */}
              <div className="mt-auto flex items-center gap-2">
                <span
                  className="h-1.5 w-1.5 flex-none animate-pulse rounded-full"
                  style={{
                    background: "#57beff",
                    boxShadow: "0 0 6px rgba(87,190,255,0.8)",
                  }}
                />
                <span className="text-[12.5px] font-medium text-ink sm:text-[13px]">
                  每期训练营由十一亲自授课、亲自答疑，不外包、不录播充数
                </span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
