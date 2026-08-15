/**
 * 通用监控模型。
 *
 * 这套模板的核心主张是：不管被监控的是 Web 应用、API 服务、AI Agent、数据管道、
 * 定时任务还是数据库，「可用性 / 吞吐 / P95 延迟 / 错误率 / 资源」这五类指标的**语义**
 * 是共通的，图表形态因此可以完全一致；真正随类型变化的只有**名称、单位和日内形态**。
 *
 * 所以这里把类型差异收敛成一张规格表，而不是给每种类型各写一套页面。
 * 各类型再各自追加三个专属指标，用来表达"这一类特有的健康信号"。
 */

export type HealthStatus = 'healthy' | 'warning' | 'critical'

export type AlertSeverity = 'critical' | 'warning' | 'info'

/** 一个可读的指标读数。value 是已格式化的字符串，因为单位随类型变。 */
export interface DetailKpi {
  label: string
  value: string
  unit?: string
  hint: string
  status: HealthStatus
}

/** 项目依赖的下游服务/组件。 */
export interface ServiceNode {
  name: string
  /** 依赖类别，卡片右上角的小标签 */
  category: string
  status: HealthStatus
  /** 最近一次健康检查的响应耗时，毫秒 */
  latencyMs: number
  uptime: number
  /** 就绪实例 / 期望实例，形如 4 / 4 */
  replicas: string
  spark: number[]
}

export interface TimelineEvent {
  time: string
  title: string
  detail: string
  tone: HealthStatus | 'neutral'
}

export type ProjectKind = 'web' | 'api' | 'agent' | 'pipeline' | 'job' | 'database'

// ---------- 日内形态 ----------
// 四条形态曲线是"不同类型项目长得不一样"最直观的体现：
// 面向用户的业务有明显早晚高峰，流式管道近乎常压，批处理只在排期点跳一下，
// 数据库跟随业务但有一条不会归零的基线。

/** 面向用户的业务流量：凌晨低谷、上午爬升、午间回落、下午次高峰、晚间衰减。 */
const BUSINESS_SHAPE = [
  0.22, 0.18, 0.15, 0.14, 0.16, 0.24, 0.38, 0.58, 0.78, 0.92, 1.0, 0.95, 0.72, 0.85, 0.98, 0.94,
  0.86, 0.74, 0.62, 0.55, 0.48, 0.4, 0.32, 0.26,
]

/** 流式管道：常年高位运行，只有深夜略降。 */
const STREAM_SHAPE = [
  0.72, 0.68, 0.65, 0.62, 0.64, 0.7, 0.82, 0.9, 0.95, 0.98, 1.0, 0.97, 0.92, 0.94, 0.99, 0.96,
  0.93, 0.9, 0.88, 0.86, 0.84, 0.8, 0.78, 0.75,
]

/** 批处理：只在排期点执行，其余时段为零。画出来是一串孤立的尖峰。 */
const BATCH_SHAPE = [
  0.08, 0.92, 1.0, 0.25, 0, 0, 0.17, 0.83, 0.33, 0.08, 0, 0, 0.17, 0.58, 0, 0, 0, 0, 0.25, 0.67, 0,
  0, 0.17, 0.5,
]

/** 数据库：跟随业务流量，但有一条不会归零的基线负载。 */
const DATABASE_SHAPE = [
  0.42, 0.38, 0.35, 0.34, 0.36, 0.44, 0.56, 0.7, 0.84, 0.94, 1.0, 0.96, 0.8, 0.88, 0.98, 0.95, 0.9,
  0.82, 0.74, 0.68, 0.62, 0.56, 0.5, 0.46,
]

export interface ProjectKindSpec {
  id: ProjectKind
  label: string
  /** 总览页分组标题下的一句话说明 */
  note: string
  /** 吞吐指标在这一类项目里叫什么、单位是什么 */
  throughputLabel: string
  throughputUnit: string
  /** 延迟指标在这一类项目里叫什么、单位是什么 */
  latencyLabel: string
  latencyUnit: string
  /** 成功率在这一类项目里叫什么 */
  successLabel: string
  /** 专属指标区的标题 */
  extraTitle: string
  shape: readonly number[]
}

export const PROJECT_KINDS: ProjectKindSpec[] = [
  {
    id: 'web',
    label: 'Web 应用',
    note: '面向终端用户的页面型应用，关注加载体验与前端异常',
    throughputLabel: '页面请求量',
    throughputUnit: '次/分钟',
    latencyLabel: 'P95 首屏耗时',
    latencyUnit: 'ms',
    successLabel: '请求成功率',
    extraTitle: '前端体验指标',
    shape: BUSINESS_SHAPE,
  },
  {
    id: 'api',
    label: 'API 服务',
    note: '被其它系统调用的接口服务，关注响应耗时与上游依赖',
    throughputLabel: '接口调用量',
    throughputUnit: '次/分钟',
    latencyLabel: 'P95 响应耗时',
    latencyUnit: 'ms',
    successLabel: '调用成功率',
    extraTitle: '接口治理指标',
    shape: BUSINESS_SHAPE,
  },
  {
    id: 'agent',
    label: 'AI Agent',
    note: '基于大模型的智能体，关注 Token 成本与工具调用可靠性',
    throughputLabel: '会话调用量',
    throughputUnit: '次/分钟',
    latencyLabel: 'P95 端到端耗时',
    latencyUnit: 'ms',
    successLabel: '任务成功率',
    extraTitle: '模型与工具指标',
    shape: BUSINESS_SHAPE,
  },
  {
    id: 'pipeline',
    label: '数据管道',
    note: '持续运行的流式处理链路，关注积压与数据质量',
    throughputLabel: '处理量',
    throughputUnit: '条/秒',
    latencyLabel: 'P95 处理延迟',
    latencyUnit: 's',
    successLabel: '处理成功率',
    extraTitle: '管道健康指标',
    shape: STREAM_SHAPE,
  },
  {
    id: 'job',
    label: '定时任务',
    note: '按排期触发的批处理作业，关注是否按时跑完',
    throughputLabel: '执行次数',
    throughputUnit: '次/小时',
    latencyLabel: 'P95 单次执行时长',
    latencyUnit: '分钟',
    successLabel: '任务成功率',
    extraTitle: '调度执行指标',
    shape: BATCH_SHAPE,
  },
  {
    id: 'database',
    label: '数据库',
    note: '有状态的数据存储，关注连接、慢查询与复制延迟',
    throughputLabel: '查询量',
    throughputUnit: 'QPS',
    latencyLabel: 'P95 查询耗时',
    latencyUnit: 'ms',
    successLabel: '查询成功率',
    extraTitle: '存储运行指标',
    shape: DATABASE_SHAPE,
  },
]

const KIND_INDEX: Record<ProjectKind, ProjectKindSpec> = PROJECT_KINDS.reduce(
  (map, spec) => {
    map[spec.id] = spec
    return map
  },
  {} as Record<ProjectKind, ProjectKindSpec>,
)

export function getKindSpec(kind: ProjectKind): ProjectKindSpec {
  return KIND_INDEX[kind]
}
