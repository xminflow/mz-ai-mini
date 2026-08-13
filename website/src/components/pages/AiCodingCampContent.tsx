"use client";

import { useState } from "react";

import { ContactQrCodeModal } from "../layout";
import { GradientText, Reveal } from "../motion";
import { SectionEyebrow } from "./ai-coding-camp/primitives";
import { Hero } from "./ai-coding-camp/Hero";
import { JourneyMap } from "./ai-coding-camp/JourneyMap";
import { InstructorSection } from "./ai-coding-camp/InstructorSection";
import { StageTwoSection } from "./ai-coding-camp/StageTwoSection";
// 往期赠送课程大纲：与企业培训页(/studio)共用同一组件与同一份大纲数据，避免重复实现
import { CourseOutline } from "./studio/CourseOutline";

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

      {/* 3. 全景学习路径：AI 架构师单条成长曲线（第一阶段「AI 编程入门」已下架展示） */}
      <section className="relative mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-24 lg:pb-32">
        <Reveal>
          <div className="flex flex-col gap-4">
            <SectionEyebrow color="#01aef0">完整学习路径</SectionEyebrow>
            <h2 className="font-serif-zh text-[22px] font-semibold leading-[1.5] tracking-[0.005em] sm:text-[26px] sm:leading-[1.45] lg:text-[34px] lg:leading-[1.3]">
              <span className="mt-1 block sm:mt-1.5">
                <GradientText className="font-semibold">
                  一条主线走完 AI 架构师
                </GradientText>
              </span>
            </h2>
            <p className="max-w-2xl text-[13.5px] leading-[1.85] text-ink-soft sm:text-[14.5px]">
              一条时间轴串起全部里程碑：能力进阶、企业级实战直播、求职冲刺，全程跟到拿下 offer。
            </p>
          </div>
        </Reveal>

        <div className="mt-10 sm:mt-14">
          <JourneyMap />
        </div>
      </section>

      {/* 课程主体：收获墙 / 三段 16 课大纲 / 服务拟稿 + ¥3999 报名入口
        * 注：第一阶段 StageOneSection（¥1999 AI 编程入门）已下架展示，组件保留备用 */}
      <StageTwoSection onEnroll={openContact} />

      {/* 往期赠送课程大纲：报名即赠全套录播 + 针对性答疑（原「后续课程预告」已移除） */}
      <CourseOutline onEnroll={openContact} />

      <ContactQrCodeModal open={contactOpen} onClose={closeContact} />
    </div>
  );
}
