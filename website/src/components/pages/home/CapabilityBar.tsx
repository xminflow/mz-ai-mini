// 对齐参考站的 trust badge 条：一整颗胶囊内含数项、中间以小圆点分隔，
// 因此不复用 Pill 原子（Pill 是「一项一颗」的形态）。
const CAPABILITIES: string[] = [
  '1V1 高端服务',
  '全天候响应',
  '全透明流程',
  '100% 主动推进',
  '高质量维保',
]

export const CapabilityBar = () => (
  <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-28">
    <div className="flex justify-center">
      {/* 圆角跟随全站按钮的 4px。原先窄屏 22px、宽屏胶囊的分档是为了避开「换行后被裹成
          橄榄球形」，统一成小圆角后这个问题不复存在，两档也就没有必要了 */}
      <div className="glass-medium rounded-btn flex max-w-full flex-wrap items-center justify-center gap-y-1 px-3 py-3">
        {CAPABILITIES.map((item, index) => (
          <span key={item} className="flex items-center">
            {index > 0 && (
              <span aria-hidden className="mx-1 h-1 w-1 rounded-full bg-graphite-dim/50 sm:mx-2" />
            )}
            <span className="whitespace-nowrap px-2.5 text-[13px] text-graphite-soft sm:px-4 sm:text-[15px]">
              {item}
            </span>
          </span>
        ))}
      </div>
    </div>
  </section>
)
