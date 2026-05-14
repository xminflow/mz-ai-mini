"use client";

import { useMemo, useState } from "react";
import { AuroraBackground, GradientText, Reveal } from "../motion";
import { ContactQrCodeModal } from "../layout";
import {
  SERVICES,
  ServiceAuxCard,
  ServiceSection,
} from "./ai-services";

const FLOW = [
  {
    step: "01",
    title: "先聊一聊（免费）",
    description:
      "不谈方案、不做报价——我们坐下来聊一聊你手里的事、你在意什么、你希望走到哪里。",
  },
  {
    step: "02",
    title: "方案共识",
    description: "共同梳理合作目标、路径与资源配置，形成书面共识后再启动。",
  },
  {
    step: "03",
    title: "交付推进",
    description: "按约定路径执行，关键节点均有明确的进度与产出同步。",
  },
  {
    step: "04",
    title: "长期协同",
    description:
      "IP 与品牌的积累需要时间。我们更看重合作结束之后，是否能继续作为长期伙伴在场。",
  },
];

export const AiServicesContent = () => {
  const [contactOpen, setContactOpen] = useState(false);
  const openContact = () => setContactOpen(true);
  const closeContact = () => setContactOpen(false);

  const mainServices = useMemo(
    () => SERVICES.filter((service) => service.tier === "main"),
    [],
  );
  const auxServices = useMemo(
    () => SERVICES.filter((service) => service.tier === "aux"),
    [],
  );

  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <AuroraBackground variant="hero" />
        <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center px-4 pb-16 pt-16 text-center sm:px-6 sm:pb-20 sm:pt-24 lg:pt-28">
          <Reveal y={16}>
            <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface/50 px-3 py-1 text-[11px] text-ink-soft backdrop-blur sm:px-3.5 sm:py-1.5 sm:text-xs">
              AI+服务 · 4 主推 + 4 辅助 = 8 项可交易服务
            </span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="font-serif-zh mt-6 max-w-3xl text-balance text-[28px] font-semibold leading-[1.4] tracking-[0.01em] sm:mt-7 sm:text-[40px] sm:leading-[1.3] lg:text-[48px] lg:leading-[1.25]">
              基于 AI 能力，
              <br className="hidden sm:block" />
              <GradientText className="font-semibold">
                帮你构建 IP 与品牌的核心影响力
              </GradientText>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-6 max-w-2xl text-sm leading-[1.9] text-ink-soft sm:mt-8 sm:text-base sm:leading-[1.85]">
              从 ¥39 的案例报告到 ¥9999 的 3
              个月陪跑——按你当前的经营阶段灵活接入。每项服务都写清定价、周期与产能，不画大饼、不做承诺以外的事。
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <button
              type="button"
              onClick={openContact}
              className="group mt-8 inline-flex items-center gap-2 overflow-hidden rounded-full bg-ink px-6 py-3 text-[13px] font-semibold text-canvas shadow-[0_8px_32px_rgba(167,139,250,0.3)] transition-transform hover:-translate-y-0.5 sm:text-sm"
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
          </Reveal>
        </div>
      </section>

      {/* Main services intro */}
      <section className="relative mx-auto w-full max-w-6xl px-4 pb-4 pt-6 sm:px-6 sm:pt-10">
        <Reveal>
          <div className="flex flex-col gap-4">
            <span className="flex items-center gap-2.5 font-mono text-[15px] font-medium uppercase tracking-[0.24em] text-muted sm:text-[16px]">
              <span className="h-px w-5 bg-gradient-to-r from-transparent to-violet-400/60 sm:w-6" />
              主推服务 · 4 项
            </span>
            <h2 className="font-serif-zh max-w-3xl text-balance text-[22px] font-semibold leading-[1.4] tracking-[0.005em] sm:text-[26px] sm:leading-[1.35] lg:text-[32px] lg:leading-[1.3]">
              覆盖从
              <GradientText className="font-semibold">诊断、资产沉淀、内容生产</GradientText>
              到品牌门面的核心环节
            </h2>
            <p className="max-w-2xl text-[13px] leading-[1.85] text-ink-soft sm:text-sm">
              主推 4 项是对外沟通的核心，每一项都能独立交付，也可以按需组合。
            </p>
          </div>
        </Reveal>
      </section>

      {/* Main services */}
      <div className="relative">
        {mainServices.map((service, index) => (
          <ServiceSection
            key={service.id}
            service={service}
            index={index}
            onConsult={openContact}
          />
        ))}
      </div>

      {/* Aux services */}
      <section className="relative mx-auto w-full max-w-6xl border-t border-hairline px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
        <Reveal>
          <div className="flex flex-col gap-4">
            <span className="flex items-center gap-2.5 font-mono text-[15px] font-medium uppercase tracking-[0.24em] text-muted sm:text-[16px]">
              <span className="h-px w-5 bg-gradient-to-r from-transparent to-cyan-400/60 sm:w-6" />
              辅助服务 · 按需选购
            </span>
            <h2 className="font-serif-zh max-w-3xl text-balance text-[22px] font-semibold leading-[1.4] tracking-[0.005em] sm:text-[26px] sm:leading-[1.35] lg:text-[32px] lg:leading-[1.3]">
              订阅、素材、Skill 年卡、稀缺陪跑——
              <GradientText className="font-semibold">按需接入，不必一次买齐</GradientText>
            </h2>
            <p className="max-w-2xl text-[13px] leading-[1.85] text-ink-soft sm:text-sm">
              辅助 4 项价格带覆盖 ¥39 – ¥9999，既有低门槛的订阅与素材，也有全平台仅 1 – 2 席的陪跑。
            </p>
          </div>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-12 sm:gap-5 lg:grid-cols-2">
          {auxServices.map((service, index) => (
            <Reveal key={service.id} delay={index * 0.05}>
              <ServiceAuxCard service={service} onConsult={openContact} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Delivery flow */}
      <section className="relative mx-auto w-full max-w-6xl border-t border-hairline px-4 py-16 sm:px-6 sm:py-20">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.3fr] lg:items-start lg:gap-14">
          <Reveal>
            <div className="flex flex-col gap-4">
              <span className="flex items-center gap-2.5 font-mono text-[15px] font-medium uppercase tracking-[0.24em] text-muted sm:text-[16px]">
                <span className="h-px w-5 bg-gradient-to-r from-transparent to-violet-400/60 sm:w-6" />
                合作流程
              </span>
              <h2 className="font-serif-zh text-balance text-[22px] font-semibold leading-[1.4] tracking-[0.005em] sm:text-[26px] sm:leading-[1.35] lg:text-[32px] lg:leading-[1.3]">
                先形成共识，
                <br />
                再落地执行
              </h2>
              <p className="max-w-md text-[13px] leading-[1.85] text-ink-soft sm:text-sm">
                IP
                与品牌是慢变量。我们在每个阶段都给出书面共识与明确产出，合作全程透明、可追溯。
              </p>
            </div>
          </Reveal>
          <div className="flex flex-col gap-2.5 sm:gap-3">
            {FLOW.map((item, index) => (
              <Reveal key={item.step} delay={index * 0.06}>
                <div className="group flex items-start gap-3.5 rounded-xl border border-transparent bg-surface/40 p-4 transition-all hover:border-hairline hover:bg-surface/70 sm:gap-4 sm:rounded-2xl sm:p-5">
                  <div className="flex h-8 w-8 flex-none items-center justify-center rounded border border-hairline bg-canvas font-mono text-[10px] text-ink-soft sm:h-9 sm:w-9 sm:rounded-md sm:text-[11px]">
                    {item.step}
                  </div>
                  <div className="flex flex-col gap-1 sm:gap-1.5">
                    <h3 className="text-[14px] font-semibold text-ink sm:text-[15px]">
                      {item.title}
                    </h3>
                    <p className="text-[13px] leading-[1.8] text-muted sm:text-[13.5px]">
                      {item.description}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
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
                合作的起点，
                <GradientText className="font-semibold">
                  是一次深聊
                </GradientText>
              </h2>
              <p className="max-w-xl text-[13px] leading-[1.85] text-ink-soft sm:text-sm">
                一次大约 60
                分钟的轻松对话（免费）——不谈方案、不做报价，先把你手里的事、在意的事、想去的方向聊清楚。之后再一起看，要不要往前走。
              </p>
              <button
                type="button"
                onClick={openContact}
                className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-[13px] font-semibold text-canvas transition-transform hover:-translate-y-0.5 sm:text-sm"
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
            </div>
          </div>
        </Reveal>
      </section>

      <ContactQrCodeModal open={contactOpen} onClose={closeContact} />
    </div>
  );
};
