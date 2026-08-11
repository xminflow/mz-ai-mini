// 对齐参考站的 trust badge 条：一整颗胶囊内含三项、中间以小圆点分隔，
// 因此不复用 Pill 原子（Pill 是「一项一颗」的形态）。
const CAPABILITIES: string[] = ['全栈自研', '长期可扩展', '不黑箱交付']

export const CapabilityBar = () => (
  <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-28">
    <div className="flex justify-center">
      <div className="flex flex-wrap items-center justify-center rounded-full bg-paper-raised px-3 py-3 shadow-soft">
        {CAPABILITIES.map((item, index) => (
          <span key={item} className="flex items-center">
            {index > 0 && (
              <span aria-hidden className="mx-1 h-1 w-1 rounded-full bg-graphite-dim/50 sm:mx-2" />
            )}
            <span className="px-3 text-[14px] text-graphite-soft sm:px-4 sm:text-[15px]">
              {item}
            </span>
          </span>
        ))}
      </div>
    </div>
  </section>
)
