import type { DetailKpi, HealthStatus, ProjectKind, ProjectKindSpec, ServiceNode, TimelineEvent } from './model'
import { getKindSpec } from './model'
import {
  HOURS,
  NOW_INDEX,
  applyIncident,
  formatNumber,
  latestActiveIndex,
  peakOf,
  seeded,
  shapedSeries,
  steadySeries,
} from './series'

/**
 * 项目的构建机制：类型定义、书写辅助、以及由曲线派生核心指标的工厂。
 *
 * 与 projects.ts 分开是因为两者的修改理由完全不同——加一个被监控项目属于内容维护，
 * 不该翻过两百行的派生逻辑；而调整指标派生规则会一次性影响全部项目，
 * 也不该淹没在几十个项目的定义里。
 */

export interface Project {
  id: string
  name: string
  kind: ProjectKind
  spec: ProjectKindSpec
  /** 一句话说明这个项目是干什么的 */
  role: string
  env: string
  status: HealthStatus
  owner: string
  uptime: number
  successRate: number
  /** 近 7 天 SLO 误差预算消耗率，可超过 100 表示已透支 */
  budgetUsed: number
  activeAlerts: number

  /** 核心时序，三张小多图共用同一条时间轴 */
  throughput: number[]
  latency: number[]
  errorRate: number[]
  cpu: number[]
  memory: number[]
  /** 延迟告警阈值，画在 P95 图上；单位同 spec.latencyUnit */
  latencyThreshold: number
  /** 这个项目在 14:00–16:00 出过事。只有它为真时图表才画故障时段背景带 */
  hasIncident: boolean
  /**
   * "当前读数"应该取序列的哪一格。
   * 全程有流量的项目就是 NOW_INDEX；排期型任务则回退到最近一次真正执行的整点。
   */
  activeIndex: number

  /** 六项核心指标，全类型一致，由上面的序列派生 */
  coreKpis: DetailKpi[]
  /** 三项类型专属指标，手写 */
  extraKpis: DetailKpi[]
  services: ServiceNode[]
  events: TimelineEvent[]
}

// ---------- 内容书写辅助 ----------

export function kpi(
  label: string,
  value: string,
  unit: string | undefined,
  hint: string,
  status: HealthStatus,
): DetailKpi {
  return { label, value, unit, hint, status }
}

export function svc(
  name: string,
  category: string,
  status: HealthStatus,
  latencyMs: number,
  uptime: number,
  replicas: string,
  seed: number,
): ServiceNode {
  return { name, category, status, latencyMs, uptime, replicas, spark: steadySeries(latencyMs, 0.45, seed, 1) }
}

export function ev(
  time: string,
  title: string,
  detail: string,
  tone: TimelineEvent['tone'],
): TimelineEvent {
  return { time, title, detail, tone }
}

// ---------- 核心指标派生 ----------

function uptimeStatus(uptime: number): HealthStatus {
  if (uptime >= 99.9) return 'healthy'
  if (uptime >= 99.5) return 'warning'
  return 'critical'
}

function ratioStatus(value: number, warnAt: number, critAt: number): HealthStatus {
  if (value >= critAt) return 'critical'
  if (value >= warnAt) return 'warning'
  return 'healthy'
}

function successStatus(rate: number): HealthStatus {
  if (rate >= 99) return 'healthy'
  if (rate >= 95) return 'warning'
  return 'critical'
}

export interface ProjectSeed {
  id: string
  name: string
  kind: ProjectKind
  role: string
  env: string
  status: HealthStatus
  owner: string
  uptime: number
  successRate: number
  budgetUsed: number
  activeAlerts: number
  /** 吞吐峰值，单位见 spec.throughputUnit */
  peak: number
  /** 延迟基线，单位见 spec.latencyUnit */
  latencyBase: number
  latencyThreshold: number
  /** 延迟保留几位小数（Redis 这类亚毫秒级需要 1 位） */
  latencyDecimals?: number
  /** 错误率基线，百分比 */
  errorBase: number
  /** 故障时段对延迟 / 错误率的放大系数，按小时依次生效；不传表示这个项目没出事 */
  incident?: { latency: number[]; error: number[]; cpu: number[] }
  cpuBase: number
  memoryBase: number
  seed: number
  extraKpis: DetailKpi[]
  services: ServiceNode[]
  events: TimelineEvent[]
}

/**
 * 由种子数据构建一个完整项目。
 *
 * 核心指标读数一律从曲线派生，不另行手填——这是为了根治一类演示数据的常见毛病：
 * KPI 卡片写着 2.40s、旁边的曲线却画在 4s 上。只要读数由同一份序列算出来，
 * 图与数就不可能对不上。
 */
export function buildProject(input: ProjectSeed): Project {
  const spec = getKindSpec(input.kind)
  const shape = spec.shape
  const latencyDecimals = input.latencyDecimals ?? 0

  const throughput = shapedSeries(shape, input.peak, 0.18, input.seed)

  // 延迟与错误率只随流量轻微起伏，不像吞吐那样成正比——但排期型任务在没有执行的
  // 时段本就不存在"执行时长"和"错误率"，这里显式归零，让曲线与真实语义一致。
  const latencyRand = seeded(input.seed + 31)
  const rawLatency = shape.map((factor) =>
    factor === 0
      ? 0
      : Math.round(
          input.latencyBase * (0.78 + 0.3 * factor) * (1 + (latencyRand() - 0.5) * 0.12) * 10 ** latencyDecimals,
        ) /
        10 ** latencyDecimals,
  )

  const errorRand = seeded(input.seed + 57)
  const rawError = shape.map((factor) =>
    factor === 0
      ? 0
      : Math.round(input.errorBase * (0.6 + 0.7 * factor) * (1 + (errorRand() - 0.5) * 0.3) * 100) / 100,
  )

  const rawCpu = steadySeries(input.cpuBase, 0.24, input.seed + 83, 1)

  const latency = input.incident ? applyIncident(rawLatency, input.incident.latency, latencyDecimals) : rawLatency
  const errorRate = input.incident ? applyIncident(rawError, input.incident.error, 2) : rawError
  const cpu = input.incident ? applyIncident(rawCpu, input.incident.cpu, 1) : rawCpu
  const memory = steadySeries(input.memoryBase, 0.1, input.seed + 97, 1)

  const activeIndex = latestActiveIndex(throughput)
  const staleReading = activeIndex !== NOW_INDEX
  const asOf = staleReading ? `最近一次执行 ${HOURS[activeIndex]} · ` : ''

  const throughputPeak = peakOf(throughput)
  const nowLatency = latency[activeIndex]
  const nowError = errorRate[activeIndex]
  const nowCpu = cpu[NOW_INDEX]
  const latencyPeak = peakOf(latency)
  const unit = spec.latencyUnit

  const coreKpis: DetailKpi[] = [
    kpi(
      '服务可用性',
      input.uptime.toFixed(2),
      '%',
      `SLO 99.9% · 误差预算已消耗 ${input.budgetUsed}%`,
      uptimeStatus(input.uptime),
    ),
    kpi(
      spec.throughputLabel,
      formatNumber(throughput[activeIndex]),
      spec.throughputUnit,
      `${asOf}24h 峰值 ${formatNumber(throughputPeak.value)} · 出现在 ${throughputPeak.hour}`,
      'healthy',
    ),
    kpi(
      spec.latencyLabel,
      formatNumber(nowLatency),
      unit,
      nowLatency > input.latencyThreshold
        ? `${asOf}告警阈值 ${formatNumber(input.latencyThreshold)}${unit} · 已超出`
        : `${asOf}告警阈值 ${formatNumber(input.latencyThreshold)}${unit} · 24h 峰值 ${formatNumber(latencyPeak.value)}${unit}`,
      nowLatency > input.latencyThreshold
        ? 'critical'
        : nowLatency > input.latencyThreshold * 0.8
          ? 'warning'
          : 'healthy',
    ),
    kpi(
      '错误率',
      nowError.toFixed(2),
      '%',
      `24h 峰值 ${peakOf(errorRate).value.toFixed(2)}%`,
      ratioStatus(nowError, 0.5, 2),
    ),
    kpi(spec.successLabel, input.successRate.toFixed(1), '%', '目标 ≥ 99.0%', successStatus(input.successRate)),
    kpi('CPU 占用', nowCpu.toFixed(1), '%', `24h 峰值 ${peakOf(cpu).value.toFixed(1)}%`, ratioStatus(nowCpu, 70, 85)),
  ]

  return {
    id: input.id,
    name: input.name,
    kind: input.kind,
    spec,
    role: input.role,
    env: input.env,
    status: input.status,
    owner: input.owner,
    uptime: input.uptime,
    successRate: input.successRate,
    budgetUsed: input.budgetUsed,
    activeAlerts: input.activeAlerts,
    throughput,
    latency,
    errorRate,
    cpu,
    memory,
    latencyThreshold: input.latencyThreshold,
    hasIncident: Boolean(input.incident),
    activeIndex,
    coreKpis,
    extraKpis: input.extraKpis,
    services: input.services,
    events: input.events,
  }
}
