"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { AuroraBackground, GradientText, Marquee, Reveal } from "../motion";
import { ContactQrCodeModal } from "../layout";

const SHIFTS = [
  {
    index: "01",
    title: "客户的决策路径，已经绕开你了",
    paragraphs: [
      "过去，客户从门店、熟人、广告认识你；现在，客户在刷到你之前，AI 已经替他做完了筛选。",
      "分配注意力的不再是市场，是算法。你没出现在算法里，就等于没出现在客户面前。",
    ],
  },
  {
    index: "02",
    title: "同行的产能，被 AI 抬高了一个量级",
    paragraphs: [
      "一个人 + 一套 AI 工作流，产出接近过去一整个团队。不是同行更努力了，是 AI 把每个人的杠杆放大了 10 倍。",
      "你不启动同样的杠杆，差距每个月都在拉开。",
    ],
  },
  {
    index: "03",
    title: "专业，不再自动变成影响力",
    paragraphs: [
      '过去，把事做好，市场会给回报；现在，专业如果没被转化成"可搜索、可理解、可转发"的 IP 资产，就会在沉默里贬值。',
      "好东西不会自己被看见——这是这个时代最贵的一课。",
    ],
  },
];

const POSITIONS = [
  "AI 没有取代专业价值，只是重构了影响力的分发机制。",
  "IP 不是人设营销，而是专业资产的结构化表达。",
  "AI 是经营者与创业者的效率杠杆，不是单纯的内容生产工具。",
  "品牌不是营销预算的去处，而是商业模式的一部分。",
];

const INDUSTRIES = [
  "AI Infra",
  "消费零售",
  "智能硬件",
  "企业服务",
  "内容社区",
  "跨境出海",
  "医疗健康",
  "金融科技",
  "教育科技",
  "新能源",
];

export const HomeContent = () => {
  const [contactOpen, setContactOpen] = useState(false);
  const openContact = () => setContactOpen(true);
  const closeContact = () => setContactOpen(false);

  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <AuroraBackground variant="hero" />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-4 pb-20 pt-16 text-center sm:px-6 sm:pb-24 sm:pt-24 lg:pt-32">
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.9,
              delay: 0.05,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mb-7 flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.38em] text-muted sm:mb-9 sm:text-[11px]"
          >
            <span className="h-px w-6 bg-gradient-to-r from-transparent to-violet-400/70 sm:w-8" />
            IP · INFLUENCE · RESEARCH
            <span className="h-px w-6 bg-gradient-to-l from-transparent to-cyan-300/70 sm:w-8" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.15,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="font-serif-zh max-w-4xl text-balance text-[26px] font-semibold leading-[1.5] tracking-[0.01em] sm:text-[38px] sm:leading-[1.4] lg:text-[48px] lg:leading-[1.35]"
            style={{ fontFeatureSettings: '"palt", "pkna", "calt"' }}
          >
            <span className="block">赚钱越来越难？</span>
            <span className="mt-2 block sm:mt-3">
              <GradientText className="font-semibold">
                是AI时代的商业逻辑正在被重写
              </GradientText>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 max-w-[680px] text-[15px] leading-[1.9] text-ink-soft sm:mt-10 sm:max-w-[760px] sm:text-base sm:leading-[1.85]"
          >
            我们通过 AI
            能力与行业方法论，帮创始人与经营者，把沉淀的专业与资源，翻译为 AI
            时代的 IP 与品牌资产
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 flex flex-col items-center gap-3 sm:mt-10 sm:flex-row"
          >
            <button
              type="button"
              onClick={openContact}
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-ink px-5 py-2.5 text-[13px] font-semibold text-canvas shadow-[0_8px_32px_rgba(167,139,250,0.3)] transition-transform hover:-translate-y-0.5 sm:px-6 sm:py-3 sm:text-sm"
            >
              <span
                aria-hidden
                className="absolute inset-0 -z-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background:
                    "linear-gradient(120deg, #A78BFA, #22D3EE, #F472B6)",
                }}
              />
              <span className="relative z-10 flex items-center gap-2">
                免费1v1咨询
                <svg
                  viewBox="0 0 16 16"
                  className="h-3.5 w-3.5"
                  fill="currentColor"
                >
                  <path d="M8.22 3.22a.75.75 0 011.06 0l4 4a.75.75 0 010 1.06l-4 4a.75.75 0 01-1.06-1.06l2.72-2.72H3a.75.75 0 010-1.5h7.94L8.22 4.28a.75.75 0 010-1.06z" />
                </svg>
              </span>
            </button>
            <Link
              href="/cases"
              className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface/40 px-5 py-2.5 text-[13px] font-medium text-ink transition-colors hover:border-hairline-strong hover:bg-surface sm:px-6 sm:py-3 sm:text-sm"
            >
              浏览行业报告
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Industry marquee */}
      <section className="relative border-y border-hairline bg-surface/30 py-5 sm:py-6">
        <Marquee speed={45}>
          {INDUSTRIES.map((tag) => (
            <span
              key={tag}
              className="whitespace-nowrap text-[12px] font-medium tracking-[0.02em] text-muted/70 transition-colors hover:text-ink sm:text-[13px]"
            >
              <span className="mr-10 sm:mr-12">· {tag} ·</span>
            </span>
          ))}
        </Marquee>
      </section>

      {/* Structural shifts */}
      <section className="relative mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:py-28">
        <Reveal>
          <div className="flex flex-col gap-4">
            <span className="flex items-center gap-2.5 font-mono text-[15px] font-medium uppercase tracking-[0.24em] text-muted sm:text-[16px]">
              <span className="h-px w-5 bg-gradient-to-r from-transparent to-violet-400/60 sm:w-6" />
              正在发生的三个结构性变化
            </span>
            <h2 className="font-serif-zh text-[22px] font-semibold leading-[1.5] tracking-[0.005em] sm:text-[26px] sm:leading-[1.45] lg:text-[32px] lg:leading-[1.35]">
              <span className="block">AI 时代，你的业务价值没有消失——</span>
              <span className="mt-1 block sm:mt-1.5">
                <GradientText className="font-semibold">
                  只是赚钱的变量，换了一套。
                </GradientText>
              </span>
            </h2>
          </div>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-12 sm:gap-5 md:grid-cols-3">
          {SHIFTS.map((item, index) => (
            <Reveal key={item.index} delay={index * 0.08}>
              <div className="group relative h-full overflow-hidden rounded-2xl border border-hairline bg-surface/60 p-5 backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-hairline-strong sm:rounded-[22px] sm:p-7">
                <div className="relative flex flex-col gap-3.5 sm:gap-4">
                  <span className="font-mono text-[11px] text-muted sm:text-[12px]">
                    {item.index}
                  </span>
                  <h3 className="font-serif-zh text-[16px] font-semibold leading-[1.45] text-ink sm:text-[17px]">
                    {item.title}
                  </h3>
                  <div className="flex flex-col gap-2 text-[13px] leading-[1.85] text-muted sm:text-[13.5px]">
                    {item.paragraphs.map((p) => (
                      <p key={p}>{p}</p>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Positions (judgments) */}
      <section className="relative mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-24 lg:pb-28">
        <Reveal>
          <div className="flex flex-col gap-4">
            <span className="flex items-center gap-2.5 font-mono text-[15px] font-medium uppercase tracking-[0.24em] text-muted sm:text-[16px]">
              <span className="h-px w-5 bg-gradient-to-r from-transparent to-violet-400/60 sm:w-6" />
              我们的判断
            </span>
            <h2 className="font-serif-zh max-w-3xl text-balance text-[22px] font-semibold leading-[1.4] tracking-[0.005em] sm:text-[26px] sm:leading-[1.35] lg:text-[32px] lg:leading-[1.3]">
              四条底层立场，
              <GradientText className="font-semibold">
                贯穿每一次合作
              </GradientText>
            </h2>
          </div>
        </Reveal>
        <div className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-hairline bg-surface/40 sm:mt-12 sm:rounded-[22px] md:grid-cols-2">
          {POSITIONS.map((position, index) => (
            <Reveal key={position} delay={index * 0.06}>
              <div className="group flex h-full items-start gap-4 bg-surface/40 px-6 py-7 transition-colors hover:bg-surface/70 sm:gap-5 sm:px-8 sm:py-9">
                <span className="flex-none font-mono text-[11px] font-medium tracking-[0.18em] text-muted sm:text-[12px]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p
                  className="text-[15px] font-medium leading-[1.75] tracking-[0.005em] text-ink sm:text-[16.5px] sm:leading-[1.7]"
                  style={{ fontFeatureSettings: '"palt", "pkna"' }}
                >
                  {position}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-24 lg:pb-28">
        <Reveal>
          <div className="relative overflow-hidden rounded-[22px] border border-hairline bg-surface/40 p-7 text-center backdrop-blur-xl sm:rounded-[28px] sm:p-12 lg:p-14">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-80"
              style={{
                background:
                  "radial-gradient(circle at 20% 0%, rgba(167,139,250,0.28), transparent 55%), radial-gradient(circle at 80% 100%, rgba(34,211,238,0.22), transparent 55%)",
              }}
            />
            <div className="relative flex flex-col items-center gap-5">
              <h2 className="font-serif-zh max-w-2xl text-balance text-[22px] font-semibold leading-[1.4] tracking-[0.005em] sm:text-[26px] sm:leading-[1.35] lg:text-[32px] lg:leading-[1.3]">
                先从
                <GradientText className="font-semibold">一次深聊</GradientText>
                开始
              </h2>
              <p className="max-w-xl text-[13px] leading-[1.85] text-ink-soft sm:text-sm">
                不谈方案、不做报价——先坐下来聊一聊你手里的事、你在意什么、你希望走到哪里。之后我们再共同决定，要不要一起往前走。
              </p>
              <div className="mt-1 flex flex-col items-center gap-2.5 sm:flex-row sm:gap-3">
                <button
                  type="button"
                  onClick={openContact}
                  className="inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2 text-[12px] font-semibold text-canvas transition-transform hover:-translate-y-0.5 sm:px-5 sm:py-2.5 sm:text-[13px]"
                >
                  免费1v1咨询
                  <svg
                    viewBox="0 0 16 16"
                    className="h-3 w-3"
                    fill="currentColor"
                  >
                    <path d="M8.22 3.22a.75.75 0 011.06 0l4 4a.75.75 0 010 1.06l-4 4a.75.75 0 01-1.06-1.06l2.72-2.72H3a.75.75 0 010-1.5h7.94L8.22 4.28a.75.75 0 010-1.06z" />
                  </svg>
                </button>
                <Link
                  href="/cases"
                  className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-surface/60 px-5 py-2 text-[12px] font-medium text-ink transition-colors hover:border-hairline-strong sm:px-5 sm:py-2.5 sm:text-[13px]"
                >
                  浏览行业报告
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <ContactQrCodeModal open={contactOpen} onClose={closeContact} />
    </div>
  );
};
