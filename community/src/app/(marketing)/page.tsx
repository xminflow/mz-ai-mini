import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "不学一行代码，做出你想要的软件",
  description:
    "纯粹的 AI 编程：你不需要懂代码，把想法讲清楚，AI 帮你把它变成真正能用的软件。沿着 AI 编程学习路径，从第一章开始。",
};

export default function HomePage() {
  return (
    <section className="flex flex-col items-center py-20 text-center sm:py-28">
      <span className="glass inline-flex items-center gap-2 rounded-pill px-3.5 py-1.5 text-xs font-medium tracking-wide text-ink-2">
        <span
          className="h-1.5 w-1.5 rounded-pill"
          style={{ background: "#22d3ee" }}
        />
        纯粹 AI 编程 · 零基础友好
      </span>

      <h1 className="mx-auto mt-7 max-w-3xl font-display text-4xl font-medium leading-[1.15] tracking-tight sm:text-6xl">
        <span className="text-shimmer">不学一行代码，做出你想要的软件</span>
      </h1>

      <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-mute">
        你不需要懂代码。把想法讲清楚，AI 帮你把它变成真正能用的软件
      </p>

      <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/ai-coding"
          className="btn-fusion px-6 py-2.5 text-sm font-semibold"
        >
          从第一章开始
        </Link>
        <Link
          href="/feed"
          className="glass rounded-btn px-6 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-white/8"
        >
          逛逛社区
        </Link>
      </div>
    </section>
  );
}
