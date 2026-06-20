"use client";

import { Reveal } from "../../motion";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center px-4 pb-12 pt-20 text-center sm:px-6 sm:pb-16 sm:pt-28 lg:pt-32">
        <Reveal delay={0.08}>
          <h1 className="font-serif-zh mt-7 max-w-4xl text-balance text-[30px] font-bold leading-[1.32] tracking-[-0.005em] text-ink sm:mt-8 sm:text-[46px] sm:leading-[1.22] lg:text-[58px] lg:leading-[1.15]">
            市面上最好的AI架构师训练营
          </h1>
        </Reveal>
        <Reveal delay={0.16}>
          <div className="mt-6 max-w-3xl sm:mt-7">
            <p className="text-balance text-[15px] font-medium leading-[1.75] text-ink-soft sm:text-[18px] lg:text-[20px]">
              <span className="block">
                <span className="font-semibold text-ink">教你真正的AI编程架构和思维模式</span>
                {" · "}面向企业真实要求针对性学习
              </span>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
