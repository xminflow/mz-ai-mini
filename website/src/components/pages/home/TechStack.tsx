import { TECH_STACK } from '../custom-software/data'

// 刻意弱化：技术栈是背书而非卖点，视觉重量要明显低于上面各区。
export const TechStack = () => (
  <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-28">
    <div className="flex flex-col items-center gap-6 border-t border-rule pt-12">
      <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-graphite-dim">
        Tech stack
      </span>
      <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
        {TECH_STACK.map((tech) => (
          <span key={tech} className="text-[15px] text-graphite-soft">
            {tech}
          </span>
        ))}
      </div>
    </div>
  </section>
)
