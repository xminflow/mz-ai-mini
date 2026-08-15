/**
 * 曲线生成器。
 *
 * 硬性约束：整个 data 目录不允许出现 `Math.random()` / `Date.now()` / `new Date()`。
 * 模板页面有服务端组件也有客户端组件，同一份数据会在两侧各算一次；
 * 只要取值不确定，服务端渲染出的数字与客户端 hydration 后的数字就会不一致并报错。
 * 需要"看起来随机"的曲线时一律走这里的固定种子生成器。
 */

/** 24 小时横轴刻度，全站图表共用。 */
export const HOURS: string[] = Array.from(
  { length: 24 },
  (_, i) => `${String(i).padStart(2, '0')}:00`,
)

/** 演示故事里的"现在"是 15:12，因此各处取"当前值"都读这一格。 */
export const NOW_INDEX = 15

/** 演示故事里的故障时刻：14:00 起指标劣化，16:00 恢复。跨页面共用这个设定。 */
export const INCIDENT_HOUR = 14

/** 线性同余伪随机。同一个 seed 永远产出同一串数，因此服务端与客户端结果一致。 */
export function seeded(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 0x100000000
  }
}

function round(value: number, decimals: number): number {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

/** 按日内形态生成一条 24 点曲线：base 为峰值量级，jitter 为相对抖动幅度。 */
export function shapedSeries(
  shape: readonly number[],
  base: number,
  jitter: number,
  seed: number,
  decimals = 0,
): number[] {
  const rand = seeded(seed)
  return shape.map((factor) => round(base * factor * (1 + (rand() - 0.5) * jitter), decimals))
}

/** 生成一条围绕 base 波动的平稳曲线，用于 CPU、内存这类不随业务量剧烈起伏的指标。 */
export function steadySeries(base: number, jitter: number, seed: number, decimals = 0): number[] {
  const rand = seeded(seed)
  return HOURS.map(() => round(base * (1 + (rand() - 0.5) * jitter), decimals))
}

/**
 * 把故障放大系数叠加到一条曲线上。
 *
 * 单独抽出来是因为「哪几个项目出了故障、故障有多严重」是演示叙事的一部分，
 * 必须能逐项目配置；而故障发生在同一时刻则是全站统一的设定。
 */
export function applyIncident(
  series: number[],
  lifts: readonly number[],
  /** 必须跟被放大的那条序列保持同样的精度，否则整数序列会冒出 2272.4 这种小数 */
  decimals: number,
  startHour = INCIDENT_HOUR,
): number[] {
  return series.map((value, index) => {
    const lift = lifts[index - startHour]
    return lift === undefined ? value : round(value * lift, decimals)
  })
}

/**
 * 从 upTo 往回找最近一个非零值的下标。
 *
 * 排期型任务（定时任务）在大多数整点根本没有执行，直接取"当前值"会得到 0，
 * 卡片上就变成「P95 0 分钟」这种既不真也没用的读数。对这类项目，
 * "最近一次执行的耗时"才是运维要看的数。全程有流量的项目不受影响，
 * 因为它们的 upTo 本身就非零。
 */
export function latestActiveIndex(series: number[], upTo = NOW_INDEX): number {
  for (let i = Math.min(upTo, series.length - 1); i >= 0; i -= 1) {
    if (series[i] > 0) return i
  }
  return upTo
}

/** 序列中的最大值及其所在小时，用于自动生成"峰值 X · 出现在 HH:00"这类说明。 */
export function peakOf(series: number[]): { value: number; hour: string } {
  let index = 0
  for (let i = 1; i < series.length; i += 1) {
    if (series[i] > series[index]) index = i
  }
  return { value: series[index], hour: HOURS[index] }
}

export function formatNumber(value: number): string {
  return value.toLocaleString('en-US')
}
