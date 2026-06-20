"use client";

import { Reveal } from "../../motion";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center px-4 pb-12 pt-20 text-center sm:px-6 sm:pb-16 sm:pt-28 lg:pt-32">
        <Reveal delay={0.08}>
          <h1 className="font-serif-zh mt-7 max-w-4xl text-balance leading-[1.32] tracking-[-0.005em] text-ink sm:mt-8 sm:leading-[1.22] lg:leading-[1.15]">
            {/* 次：市场定位修饰语，渐变流光 + 辉光，炫酷但不抢主标题 */}
            <span className="hero-shine mb-2 block text-[18px] font-bold tracking-[0.18em] sm:mb-2.5 sm:text-[22px] lg:text-[26px]">
              市面上最好的
            </span>
            {/* 主：训练营名称，大字加粗 */}
            <span className="block text-[30px] font-bold sm:text-[46px] lg:text-[58px]">
              AI架构师训练营
            </span>
          </h1>
        </Reveal>
        <Reveal delay={0.16}>
          <div className="mt-6 max-w-3xl sm:mt-7">
            <p className="text-balance text-[15px] font-medium leading-[1.75] text-ink-soft sm:text-[18px] lg:text-[20px]">
              <span className="block">
                <span className="font-semibold text-ink">实操教你真正的AI架构思维</span>
                {" · "}成为企业抢着要的AI专业人才
              </span>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
