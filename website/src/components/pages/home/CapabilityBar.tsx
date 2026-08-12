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
      {/* 五项在窄屏一行放不下，必然换行；换行后 rounded-full 会把两三行文字裹成一个
          橄榄球形，所以窄屏给固定圆角，宽屏单行时再回到胶囊 */}
      <div className="flex max-w-full flex-wrap items-center justify-center gap-y-1 rounded-[22px] bg-paper-raised px-3 py-3 shadow-soft sm:rounded-full">
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
