"use client";

import { useState } from "react";

import { ContactQrCodeModal } from "../layout";
import { GradientText, Reveal } from "../motion";
import { SectionEyebrow } from "./ai-coding-camp/primitives";
import { Hero } from "./ai-coding-camp/Hero";
import { JourneyMap } from "./ai-coding-camp/JourneyMap";
import { InstructorSection } from "./ai-coding-camp/InstructorSection";
import { StageOneSection } from "./ai-coding-camp/StageOneSection";
import { StageTwoSection } from "./ai-coding-camp/StageTwoSection";
import { UpcomingCoursesSection } from "./ai-coding-camp/UpcomingCoursesSection";

/* ─────────────────────────  主组件  ───────────────────────── */

export function AiCodingCampContent() {
  const [contactOpen, setContactOpen] = useState(false);
  const openContact = () => setContactOpen(true);
  const closeContact = () => setContactOpen(false);

  return (
    <div className="relative">
      {/* 1. Hero：标题 + 副标题 */}
      <Hero />

      {/* 2. 为什么选我们（左：八大核心 / 右：个人简介名片，资历并入） */}
      <InstructorSection />

      {/* 3. 全景学习路径：纵向主线 + 嵌套购买覆盖框（外层 ¥3999 含内层 ¥1999） */}
      <section className="relative mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-24 lg:pb-32">
        <Reveal>
          <div className="flex flex-col gap-4">
            <SectionEyebrow color="#67E8F9">完整学习路径</SectionEyebrow>
            <h2 className="font-serif-zh text-[22px] font-semibold leading-[1.5] tracking-[0.005em] sm:text-[26px] sm:leading-[1.45] lg:text-[34px] lg:leading-[1.3]">
              <span className="mt-1 block sm:mt-1.5">
                <GradientText className="font-semibold">
                  覆盖从零基础到 AI 架构师
                </GradientText>
              </span>
            </h2>
            <p className="max-w-2xl text-[13.5px] leading-[1.85] text-ink-soft sm:text-[14.5px]">
              一条时间轴串起全部里程碑：第一阶段「AI 编程入门」，第二阶段「AI 架构师」（含第一阶段全部内容）。
            </p>
          </div>
        </Reveal>

        <div className="mt-10 sm:mt-14">
          <JourneyMap />
        </div>
      </section>

      {/* 第一阶段：课程大纲 / 四大成果 / 服务模式 + ¥1999 报名入口 */}
      <StageOneSection onEnroll={openContact} />

      {/* 第二阶段：收获墙 / 三段 14 课大纲 / 服务拟稿 + ¥3999 报名入口 */}
      <StageTwoSection onEnroll={openContact} />

      {/* 后续课程预告：四套企业级实战系统（敬请期待，轻量线+圆点列表） */}
      <UpcomingCoursesSection />

      <ContactQrCodeModal open={contactOpen} onClose={closeContact} />
    </div>
  );
}
