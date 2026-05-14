"use client";

import { useState } from "react";
import Link from "next/link";
import { AuroraBackground, GradientText, Reveal } from "../motion";
import { ContactQrCodeModal } from "../layout";

const SERVE = [
  {
    label: "把生意做扎实了的经营者",
    description:
      "你在一个行业里耕耘多年，客户与口碑是一点一点攒起来的。最近你感觉到——做生意的方式在变，但你手里真正值钱的东西并没变。你想找的不是换个方向，而是让已有的价值，被这个时代重新看见。",
  },
  {
    label: "带着一件认真事出发的创业者",
    description:
      "你不追风口、也不想做快钱生意——手里有一件想认真做下去的事。你希望从第一天起，就把 IP 与品牌当作生意的一部分去经营，而不是等做大了再回头补。",
  },
];

export const AboutContent = () => {
  const [contactOpen, setContactOpen] = useState(false);
  const openContact = () => setContactOpen(true);
  const closeContact = () => setContactOpen(false);

  return (
    <div className="relative">
      <section className="relative overflow-hidden">
        <AuroraBackground variant="hero" />
        <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center px-4 pb-16 pt-16 text-center sm:px-6 sm:pb-20 sm:pt-24 lg:pt-28">
          <Reveal y={16}>
            <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface/50 px-3 py-1 text-[11px] text-ink-soft backdrop-blur sm:px-3.5 sm:py-1.5 sm:text-xs">
              关于微域生光
            </span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="font-serif-zh mt-6 max-w-3xl text-balance text-[30px] font-semibold leading-[1.3] tracking-[0.01em] sm:mt-7 sm:text-[44px] sm:leading-[1.25] lg:text-[56px] lg:leading-[1.2]">
              认知驱动，
              <GradientText className="font-semibold">长期主义</GradientText>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <div className="mt-7 flex flex-col gap-1.5 text-[15px] font-medium leading-[1.8] text-ink-soft sm:mt-9 sm:text-[16.5px]">
              <p>我们不跟风口，</p>
              <p>我们不做快生意，</p>
              <p>我们不做流量套利。</p>
            </div>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="mt-10 flex max-w-2xl flex-col gap-6 text-left text-[14px] leading-[1.95] text-ink-soft sm:mt-12 sm:gap-7 sm:text-[15.5px]">
              <p>
                <span className="font-semibold text-ink">
                  我们擅长这样的场景：
                </span>
                你已经把事情做好——有专业、有资源、有客户，也有属于自己的判断；但在
                AI 时代，这些沉淀还没有被转化为被看见、被信任、被记住的 IP
                与品牌资产。
              </p>
              <p>
                <span className="font-semibold text-ink">
                  我们做的就是这件事——
                </span>
                用行业洞察、AI
                工程与品牌方法论，陪你把已有的专业，变成这个时代真正值钱的资产。
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Who we are */}
      <section className="relative mx-auto w-full max-w-4xl px-4 pb-20 pt-6 sm:px-6 sm:pb-24 sm:pt-10">
        <Reveal>
          <div className="flex flex-col gap-4 sm:gap-5">
            <span className="text-[15px] font-semibold uppercase tracking-[0.22em] text-muted sm:text-[16px]">
              · 我们是谁 ·
            </span>
            <div className="flex flex-col gap-4 text-[14px] leading-[1.95] text-ink-soft sm:gap-5 sm:text-[15.5px]">
              <p>
                我们是一个专注 AI 时代 IP 与品牌研究的团队，背景覆盖行业研究、AI
                工程、程序开发与内容策略。
              </p>
              <p>
                我们相信专业值得被正确地分发——不被信息噪音淹没，不被流量逻辑扭曲，也不被所谓的"风口"推着走。
              </p>
              <p>
                我们不假装成熟，但在每一次合作里，我们都愿意把问题想透、把事情做完。
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Who we serve */}
      <section className="relative mx-auto w-full max-w-5xl px-4 pb-20 sm:px-6 sm:pb-24">
        <Reveal>
          <div className="flex flex-col gap-4 sm:gap-5">
            <span className="text-[15px] font-semibold uppercase tracking-[0.22em] text-muted sm:text-[16px]">
              · 我们想认识的人 ·
            </span>
            <h2 className="font-serif-zh max-w-2xl text-balance text-[26px] font-semibold leading-[1.35] tracking-[0.005em] sm:text-3xl sm:leading-[1.3] lg:text-4xl lg:leading-[1.25]">
              手里有一件值得
              <GradientText className="font-semibold">
                长期做下去的事
              </GradientText>
            </h2>
          </div>
        </Reveal>
        <div className="mt-10 grid grid-cols-1 gap-5 sm:mt-12 md:grid-cols-2">
          {SERVE.map((item, index) => (
            <Reveal key={item.label} delay={index * 0.08}>
              <div className="flex h-full flex-col gap-3 rounded-2xl border border-hairline bg-surface/60 p-6 backdrop-blur transition-all hover:-translate-y-1 hover:border-hairline-strong sm:rounded-[22px] sm:p-7">
                <span className="font-mono text-[11px] text-muted sm:text-[12px]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="font-serif-zh text-[17px] font-semibold leading-[1.45] text-ink sm:text-[19px]">
                  {item.label}
                </h3>
                <p className="text-[13.5px] leading-[1.9] text-muted sm:text-[14.5px]">
                  {item.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.2}>
          <p className="mx-auto mt-8 max-w-2xl text-center text-[13.5px] leading-[1.95] text-muted sm:mt-10 sm:text-[14px]">
            让我们想深入合作的，不是你做到多大，而是你手里有一件
            <span className="font-medium text-ink-soft">值得长期投入的事</span>
            ——以及愿意把它做好的那份诚意。
          </p>
        </Reveal>
      </section>

      {/* CTA */}
      <section className="relative mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-24 lg:pb-28">
        <Reveal>
          <div className="relative overflow-hidden rounded-[24px] border border-hairline bg-surface/40 p-8 backdrop-blur-xl sm:rounded-[32px] sm:p-12 lg:p-14">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-70"
              style={{
                background:
                  "radial-gradient(circle at 80% 0%, rgba(34,211,238,0.24), transparent 55%), radial-gradient(circle at 10% 100%, rgba(167,139,250,0.24), transparent 55%)",
              }}
            />
            <div className="relative flex flex-col items-start gap-6 sm:gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex max-w-xl flex-col gap-3 sm:gap-4">
                <h2 className="font-serif-zh text-balance text-2xl font-semibold leading-[1.35] tracking-[0.005em] sm:text-3xl sm:leading-[1.3]">
                  找个时间，先聊一聊
                </h2>
                <p className="text-[14px] leading-[1.9] text-ink-soft sm:text-[15.5px]">
                  不谈方案、不做报价——我们坐下来聊一聊你手里的事、你在意什么、你希望走到哪里。之后再一起看，有没有往前走的可能。
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={openContact}
                  className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-[13px] font-semibold text-canvas transition-transform hover:-translate-y-0.5 sm:px-6 sm:py-3 sm:text-sm"
                >
                  免费1v1咨询
                  <svg
                    viewBox="0 0 16 16"
                    className="h-3.5 w-3.5"
                    fill="currentColor"
                  >
                    <path d="M8.22 3.22a.75.75 0 011.06 0l4 4a.75.75 0 010 1.06l-4 4a.75.75 0 01-1.06-1.06l2.72-2.72H3a.75.75 0 010-1.5h7.94L8.22 4.28a.75.75 0 010-1.06z" />
                  </svg>
                </button>
                <Link
                  href="/ai-services"
                  className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface/60 px-5 py-2.5 text-[13px] font-medium text-ink transition-colors hover:border-hairline-strong sm:px-6 sm:py-3 sm:text-sm"
                >
                  了解 AI+服务
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
