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
 * 14 个被监控项目，横跨 6 种类型。
 *
 * 每个项目的**文字内容**（名称、职责、专属指标、依赖、事件）是手写的，
 * 而**核心指标读数**一律由曲线派生，不另行手填。
 * 这么做是为了根治一类演示数据的常见毛病：KPI 卡片写着 2.40s、旁边的曲线却画在 4s 上。
 * 只要读数由同一份序列算出来，图与数就不可能对不上。
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

function kpi(label: string, value: string, unit: string | undefined, hint: string, status: HealthStatus): DetailKpi {
  return { label, value, unit, hint, status }
}

function svc(
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

function ev(time: string, title: string, detail: string, tone: TimelineEvent['tone']): TimelineEvent {
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

interface ProjectSeed {
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

function buildProject(input: ProjectSeed): Project {
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
    kpi('错误率', nowError.toFixed(2), '%', `24h 峰值 ${peakOf(errorRate).value.toFixed(2)}%`, ratioStatus(nowError, 0.5, 2)),
    kpi(
      spec.successLabel,
      input.successRate.toFixed(1),
      '%',
      `目标 ≥ 99.0%`,
      successStatus(input.successRate),
    ),
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

// ---------- 项目清单 ----------

export const PROJECTS: Project[] = [
  buildProject({
    id: 'corp-site',
    name: '企业官网',
    kind: 'web',
    role: '品牌官网与内容发布',
    env: '生产',
    status: 'healthy',
    owner: '周宛清',
    uptime: 99.98,
    successRate: 99.9,
    budgetUsed: 7,
    activeAlerts: 0,
    peak: 1800,
    latencyBase: 1100,
    latencyThreshold: 2500,
    errorBase: 0.12,
    cpuBase: 32,
    memoryBase: 48,
    seed: 1101,
    extraKpis: [
      kpi('LCP 最大内容绘制', '1.82', 's', '优秀区间 ≤ 2.5s', 'healthy'),
      kpi('JS 错误率', '0.14', '%', '按会话统计 · 阈值 1%', 'healthy'),
      kpi('静态资源命中率', '98.6', '%', 'CDN 边缘缓存', 'healthy'),
    ],
    services: [
      svc('CDN 边缘节点', '边缘', 'healthy', 24, 99.99, '全球 18 节点', 1111),
      svc('页面渲染服务', '核心', 'healthy', 86, 99.98, '4 / 4', 1112),
      svc('内容管理 API', '外部', 'healthy', 142, 99.95, '2 / 2', 1113),
    ],
    events: [
      ev('13:20', '内容发布', '发布 3 篇新闻稿，CDN 全量刷新耗时 42s', 'neutral'),
      ev('09:05', '证书轮换', 'TLS 证书自动续期完成，有效期至 2027-08-14', 'neutral'),
      ev('02:10', '定期巡检', '全站链接巡检通过，无 404', 'healthy'),
    ],
  }),

  buildProject({
    id: 'ops-console',
    name: '运营管理后台',
    kind: 'web',
    role: '内部运营人员的管理控制台',
    env: '生产',
    status: 'healthy',
    owner: '林拾',
    uptime: 99.95,
    successRate: 99.7,
    budgetUsed: 14,
    activeAlerts: 0,
    peak: 620,
    latencyBase: 1420,
    latencyThreshold: 3000,
    errorBase: 0.22,
    cpuBase: 38,
    memoryBase: 55,
    seed: 1201,
    extraKpis: [
      kpi('LCP 最大内容绘制', '2.41', 's', '优秀区间 ≤ 2.5s', 'healthy'),
      kpi('JS 错误率', '0.31', '%', '主要来自导出组件', 'healthy'),
      kpi('静态资源命中率', '96.2', '%', '内网直连，未走 CDN', 'healthy'),
    ],
    services: [
      svc('前端资源服务', '核心', 'healthy', 62, 99.97, '2 / 2', 1211),
      svc('权限中心', '外部', 'healthy', 48, 99.99, '3 / 3', 1212),
      svc('报表查询接口', '外部', 'healthy', 640, 99.9, '2 / 2', 1213),
    ],
    events: [
      ev('14:52', '版本发布', 'v3.4.1 上线，订单列表分页性能优化', 'neutral'),
      ev('11:30', '权限变更', '新增运营主管角色，涉及 12 个菜单项', 'neutral'),
      ev('08:00', '定期巡检', '关键路径可用性拨测全部通过', 'healthy'),
    ],
  }),

  buildProject({
    id: 'mini-shop',
    name: '小程序商城',
    kind: 'web',
    role: '面向 C 端的小程序交易入口',
    env: '生产',
    status: 'warning',
    owner: '周宛清',
    uptime: 99.82,
    successRate: 98.6,
    budgetUsed: 68,
    activeAlerts: 1,
    peak: 3400,
    latencyBase: 1680,
    latencyThreshold: 2500,
    errorBase: 0.94,
    cpuBase: 54,
    memoryBase: 66,
    seed: 1301,
    extraKpis: [
      kpi('LCP 最大内容绘制', '3.14', 's', '超出优秀区间 2.5s', 'warning'),
      kpi('JS 错误率', '2.80', '%', '阈值 1% · 集中在支付回调页', 'critical'),
      kpi('静态资源命中率', '91.4', '%', '新版本上线后回落', 'warning'),
    ],
    services: [
      svc('小程序网关', '核心', 'healthy', 96, 99.96, '4 / 4', 1311),
      svc('商品检索服务', '检索', 'warning', 420, 99.72, '3 / 3', 1312),
      svc('支付网关', '外部', 'critical', 3860, 99.41, '3 / 3', 1313),
      svc('营销活动服务', '业务', 'healthy', 118, 99.94, '2 / 2', 1314),
    ],
    events: [
      ev('14:24', '连锁影响', '支付网关异常导致下单页 JS 错误率升至 2.8%', 'critical'),
      ev('12:08', '活动开始', '限时秒杀开启，流量较日常上涨 3.2 倍', 'warning'),
      ev('10:15', '版本发布', 'v5.2.0 灰度 20%，新增分享裂变组件', 'neutral'),
    ],
  }),

  buildProject({
    id: 'payment-gateway',
    name: '支付网关',
    kind: 'api',
    role: '统一收单与渠道路由',
    env: '生产',
    status: 'critical',
    owner: '陈见山',
    uptime: 99.41,
    successRate: 96.2,
    budgetUsed: 118,
    activeAlerts: 3,
    peak: 12600,
    latencyBase: 240,
    latencyThreshold: 1500,
    errorBase: 0.38,
    incident: { latency: [17, 9.2, 3.1], error: [22, 12, 4], cpu: [1.34, 1.18, 1.06] },
    cpuBase: 58,
    memoryBase: 71,
    seed: 2101,
    extraKpis: [
      kpi('限流拒绝数', '1,284', '次', '近 24 小时 · 集中在 14:00 后', 'warning'),
      kpi('鉴权失败率', '0.42', '%', '阈值 2% · 正常波动', 'healthy'),
      kpi('上游依赖超时数', '862', '次', '银行渠道适配器返回 504', 'critical'),
    ],
    services: [
      svc('交易核心服务', '核心', 'healthy', 42, 99.98, '6 / 6', 2111),
      svc('风控决策服务', '风控', 'warning', 680, 99.64, '4 / 4', 2112),
      svc('银行渠道适配器', '外部', 'critical', 5210, 96.38, '2 / 3', 2113),
      svc('对账消息队列', '队列', 'healthy', 18, 99.97, '4 / 4', 2114),
      svc('商户信息缓存', '存储', 'healthy', 3, 100, '3 / 3', 2115),
    ],
    events: [
      ev('15:12', '告警自动恢复', '上游超时率回落至 0.4%，低于阈值 2%', 'healthy'),
      ev('14:38', '预案已执行', '自动切换备用银行渠道并降级为异步补单', 'neutral'),
      ev('14:21', '严重告警触发', '上游依赖超时率 8.4% 持续 5 分钟，已通知值班群', 'critical'),
      ev('14:06', '依赖异常', '银行渠道适配器返回 504，重试队列开始堆积', 'critical'),
      ev('11:40', '版本发布', 'v2.8.3 灰度至 20% 流量，路由策略更新', 'neutral'),
    ],
  }),

  buildProject({
    id: 'auth-center',
    name: '统一认证中心',
    kind: 'api',
    role: '单点登录与令牌签发',
    env: '生产',
    status: 'healthy',
    owner: '许知白',
    uptime: 99.99,
    successRate: 99.96,
    budgetUsed: 4,
    activeAlerts: 0,
    peak: 8200,
    latencyBase: 86,
    latencyThreshold: 500,
    errorBase: 0.06,
    cpuBase: 41,
    memoryBase: 52,
    seed: 2201,
    extraKpis: [
      kpi('限流拒绝数', '96', '次', '近 24 小时 · 均为爬虫特征', 'healthy'),
      kpi('鉴权失败率', '1.24', '%', '以密码错误为主', 'healthy'),
      kpi('上游依赖超时数', '3', '次', '目录服务偶发抖动', 'healthy'),
    ],
    services: [
      svc('令牌签发服务', '核心', 'healthy', 12, 99.99, '6 / 6', 2211),
      svc('用户目录服务', '存储', 'healthy', 28, 99.98, '3 / 3', 2212),
      svc('短信验证码通道', '外部', 'healthy', 640, 99.86, '2 / 2', 2213),
    ],
    events: [
      ev('13:05', '密钥轮换', 'JWT 签名密钥完成轮换，旧密钥保留 24 小时', 'neutral'),
      ev('09:42', '容量扩缩', '按流量预测自动扩容至 6 实例', 'neutral'),
      ev('03:00', '定期巡检', '登录链路端到端拨测全部通过', 'healthy'),
    ],
  }),

  buildProject({
    id: 'open-api',
    name: '开放平台 API',
    kind: 'api',
    role: '对外合作伙伴的开放接口',
    env: '生产',
    status: 'healthy',
    owner: '许知白',
    uptime: 99.93,
    successRate: 99.4,
    budgetUsed: 26,
    activeAlerts: 0,
    peak: 4600,
    latencyBase: 320,
    latencyThreshold: 1000,
    errorBase: 0.34,
    cpuBase: 47,
    memoryBase: 58,
    seed: 2301,
    extraKpis: [
      kpi('限流拒绝数', '3,420', '次', '两家合作方持续触顶', 'warning'),
      kpi('鉴权失败率', '2.16', '%', '阈值 2% · 已逼近', 'warning'),
      kpi('上游依赖超时数', '41', '次', '订单查询接口偶发', 'healthy'),
    ],
    services: [
      svc('开放网关', '核心', 'healthy', 64, 99.95, '4 / 4', 2311),
      svc('配额与限流', '治理', 'healthy', 8, 99.99, '3 / 3', 2312),
      svc('订单查询服务', '外部', 'healthy', 480, 99.82, '4 / 4', 2313),
    ],
    events: [
      ev('14:10', '配额调整', '为合作方 A 临时上调 QPS 配额至 800', 'neutral'),
      ev('10:26', '接口下线', 'v1 版商品接口进入下线倒计时，剩余 30 天', 'warning'),
      ev('07:15', '容量扩缩', '按流量预测自动扩容至 4 实例', 'neutral'),
    ],
  }),

  buildProject({
    id: 'cs-agent',
    name: '智能客服 Agent',
    kind: 'agent',
    role: '多轮对话与工单自动处理',
    env: '生产',
    status: 'warning',
    owner: '陈见山',
    uptime: 99.87,
    successRate: 97.8,
    budgetUsed: 74,
    activeAlerts: 1,
    peak: 2600,
    latencyBase: 1450,
    latencyThreshold: 2000,
    errorBase: 0.52,
    cpuBase: 49,
    memoryBase: 64,
    seed: 3101,
    extraKpis: [
      kpi('24h Token 消耗', '1.86', '亿', '折算成本 ¥2,314', 'healthy'),
      kpi('工具调用失败率', '1.40', '%', '阈值 2% · 主要来自工单写入', 'healthy'),
      kpi('上下文溢出次数', '214', '次', '阈值 100 次/小时 · 已超出', 'warning'),
    ],
    services: [
      svc('Agent 编排引擎', '核心', 'healthy', 18, 99.98, '6 / 6', 3111),
      svc('LLM 网关', '模型', 'warning', 1240, 99.62, '4 / 4', 3112),
      svc('向量检索服务', '检索', 'healthy', 42, 99.99, '3 / 3', 3113),
      svc('工具执行器', '工具', 'healthy', 186, 99.9, '3 / 3', 3114),
      svc('会话状态存储', '存储', 'healthy', 6, 100, '3 / 3', 3115),
    ],
    events: [
      ev('14:48', '告警触发', '上下文溢出 214 次/小时，超出阈值 100 次', 'warning'),
      ev('12:30', '提示词更新', '客服话术模板 v7 上线，平均输入长度 +18%', 'neutral'),
      ev('09:20', '模型切换', '主模型切换至长上下文版本，单价上浮 12%', 'neutral'),
    ],
  }),

  buildProject({
    id: 'kb-agent',
    name: '知识库检索 Agent',
    kind: 'agent',
    role: '语义召回与引用生成',
    env: '生产',
    status: 'healthy',
    owner: '林拾',
    uptime: 99.98,
    successRate: 99.6,
    budgetUsed: 9,
    activeAlerts: 0,
    peak: 3400,
    latencyBase: 620,
    latencyThreshold: 1500,
    errorBase: 0.18,
    cpuBase: 44,
    memoryBase: 61,
    seed: 3201,
    extraKpis: [
      kpi('24h Token 消耗', '0.74', '亿', '折算成本 ¥912', 'healthy'),
      kpi('工具调用失败率', '0.30', '%', '仅检索工具，链路短', 'healthy'),
      kpi('上下文溢出次数', '18', '次', '远低于阈值 100 次/小时', 'healthy'),
    ],
    services: [
      svc('检索编排服务', '核心', 'healthy', 14, 99.99, '4 / 4', 3211),
      svc('向量索引集群', '检索', 'healthy', 36, 99.99, '6 / 6', 3212),
      svc('LLM 网关', '模型', 'healthy', 680, 99.94, '4 / 4', 3213),
    ],
    events: [
      ev('13:40', '索引重建', '知识库增量重建完成，新增 12,480 个切片', 'neutral'),
      ev('10:02', '召回调优', '相似度阈值由 0.5 调至 0.46，空召回率下降 38%', 'healthy'),
      ev('04:00', '定期巡检', '召回质量抽样评测得分 0.91', 'healthy'),
    ],
  }),

  buildProject({
    id: 'lakehouse-etl',
    name: '实时数仓入湖',
    kind: 'pipeline',
    role: '业务库变更实时同步至湖仓',
    env: '生产',
    status: 'critical',
    owner: '林拾',
    uptime: 98.94,
    successRate: 97.1,
    budgetUsed: 132,
    activeAlerts: 2,
    peak: 18500,
    latencyBase: 42,
    latencyThreshold: 300,
    errorBase: 0.82,
    incident: { latency: [14, 8.4, 3.2], error: [9, 5, 2], cpu: [1.22, 1.12, 1.04] },
    cpuBase: 76,
    memoryBase: 83,
    seed: 4101,
    extraKpis: [
      kpi('积压条数', '182.4', '万', '阈值 50 万 · 已严重超出', 'critical'),
      kpi('端到端时延', '14.2', '分钟', '阈值 5 分钟 · 已超出', 'critical'),
      kpi('脏数据占比', '1.80', '%', '阈值 1% · 主要为字段缺失', 'warning'),
    ],
    services: [
      svc('Kafka 消费组', '队列', 'critical', 4820, 97.2, '6 / 8', 4111),
      svc('Flink 计算集群', '计算', 'warning', 1860, 99.1, '8 / 8', 4112),
      svc('湖仓写入器', '存储', 'critical', 6240, 96.8, '3 / 4', 4113),
      svc('元数据服务', '元数据', 'healthy', 22, 99.97, '2 / 2', 4114),
      svc('数据质量校验', '质量', 'warning', 340, 99.5, '2 / 2', 4115),
    ],
    events: [
      ev('15:02', '仍在处置', '积压量从 214 万降至 182 万，预计 40 分钟追平', 'warning'),
      ev('14:35', '扩容执行', 'Flink 并行度由 8 提升至 16', 'neutral'),
      ev('14:12', '严重告警触发', '积压条数 182 万超出阈值 50 万', 'critical'),
      ev('13:58', '上游突增', '业务库批量刷数，变更量瞬时上涨 6 倍', 'critical'),
    ],
  }),

  buildProject({
    id: 'event-stream',
    name: '埋点采集流',
    kind: 'pipeline',
    role: '客户端埋点接收、清洗与分发',
    env: '生产',
    status: 'healthy',
    owner: '许知白',
    uptime: 99.96,
    successRate: 99.8,
    budgetUsed: 12,
    activeAlerts: 0,
    peak: 26400,
    latencyBase: 8,
    latencyThreshold: 60,
    errorBase: 0.14,
    cpuBase: 52,
    memoryBase: 60,
    seed: 4201,
    extraKpis: [
      kpi('积压条数', '3.2', '万', '远低于阈值 50 万', 'healthy'),
      kpi('端到端时延', '22', '秒', '阈值 5 分钟', 'healthy'),
      kpi('脏数据占比', '0.40', '%', '主要为老版本客户端字段缺失', 'healthy'),
    ],
    services: [
      svc('埋点接收网关', '核心', 'healthy', 16, 99.98, '8 / 8', 4211),
      svc('清洗计算集群', '计算', 'healthy', 240, 99.95, '6 / 6', 4212),
      svc('分发消息队列', '队列', 'healthy', 12, 99.99, '6 / 6', 4213),
    ],
    events: [
      ev('14:20', '协议升级', '埋点 SDK v4 灰度 30%，字段缺失率下降', 'healthy'),
      ev('11:12', '容量扩缩', '按流量预测自动扩容至 8 实例', 'neutral'),
      ev('05:30', '定期巡检', '端到端投递抽样校验通过', 'healthy'),
    ],
  }),

  buildProject({
    id: 'recon-batch',
    name: '每日对账批处理',
    kind: 'job',
    role: '与银行渠道逐笔对账并生成差错单',
    env: '生产',
    status: 'warning',
    owner: '陈见山',
    uptime: 99.6,
    successRate: 96.4,
    budgetUsed: 86,
    activeAlerts: 1,
    peak: 12,
    latencyBase: 68,
    latencyThreshold: 60,
    errorBase: 1.2,
    cpuBase: 63,
    memoryBase: 74,
    seed: 5101,
    extraKpis: [
      kpi('错过排期次数', '2', '次', '近 7 天 · 均为 02:00 批次', 'warning'),
      // 平均执行时长必须低于派生出来的 P95，否则同一张页面上两个数字自相矛盾
      kpi('平均执行时长', '52', '分钟', '基线 40 分钟 · 已劣化 30%', 'warning'),
      kpi('重试次数', '14', '次', '近 24 小时 · 主要为渠道文件未就绪', 'warning'),
    ],
    services: [
      svc('任务调度器', '调度', 'healthy', 8, 99.99, '2 / 2', 5111),
      svc('批处理执行池', '计算', 'warning', 1420, 99.2, '4 / 6', 5112),
      svc('对账数据源', '存储', 'healthy', 64, 99.96, '2 / 2', 5113),
      svc('差错工单接口', '外部', 'healthy', 320, 99.9, '2 / 2', 5114),
    ],
    events: [
      ev('13:46', '批次完成', '13:00 增量对账批次耗时 64 分钟，较上一批次回落', 'warning'),
      ev('07:38', '批次完成', '07:00 批次耗时 73 分钟，仍高于阈值 60 分钟', 'warning'),
      ev('02:16', '执行超时告警', '02:00 批次耗时 76 分钟，超出阈值 60 分钟；文件未就绪顺延 14 分钟', 'warning'),
    ],
  }),

  buildProject({
    id: 'report-scheduler',
    name: '报表生成调度',
    kind: 'job',
    role: '定时生成经营报表并推送',
    env: '生产',
    status: 'healthy',
    owner: '周宛清',
    uptime: 99.94,
    successRate: 99.5,
    budgetUsed: 18,
    activeAlerts: 0,
    peak: 8,
    latencyBase: 22,
    latencyThreshold: 45,
    errorBase: 0.3,
    cpuBase: 41,
    memoryBase: 49,
    seed: 5201,
    extraKpis: [
      kpi('错过排期次数', '0', '次', '近 7 天全部准点', 'healthy'),
      kpi('平均执行时长', '18', '分钟', '基线 45 分钟', 'healthy'),
      kpi('重试次数', '1', '次', '近 24 小时', 'healthy'),
    ],
    services: [
      svc('任务调度器', '调度', 'healthy', 8, 99.99, '2 / 2', 5211),
      svc('报表渲染服务', '计算', 'healthy', 860, 99.94, '3 / 3', 5212),
      svc('邮件推送通道', '外部', 'healthy', 420, 99.88, '2 / 2', 5213),
    ],
    events: [
      ev('13:18', '批次完成', '日报生成并推送 46 个收件人，耗时 16 分钟', 'healthy'),
      ev('07:22', '批次完成', '晨报生成完成，耗时 21 分钟', 'healthy'),
      ev('01:40', '批次完成', '昨日经营汇总完成，耗时 24 分钟', 'healthy'),
    ],
  }),

  buildProject({
    id: 'primary-db',
    name: '主库集群',
    kind: 'database',
    role: '核心交易数据的主存储',
    env: '生产',
    status: 'warning',
    owner: '许知白',
    uptime: 99.97,
    successRate: 99.98,
    budgetUsed: 42,
    activeAlerts: 1,
    peak: 8400,
    latencyBase: 14,
    latencyThreshold: 100,
    errorBase: 0.02,
    cpuBase: 68,
    memoryBase: 79,
    seed: 6101,
    extraKpis: [
      kpi('连接池占用', '86', '%', '阈值 80% · 已超出', 'warning'),
      kpi('慢查询数', '342', '条', '近 24 小时 · 集中在对账表', 'warning'),
      kpi('主从复制延迟', '3.20', 's', '阈值 3s · 已超出', 'warning'),
    ],
    services: [
      svc('主节点', '主库', 'healthy', 8, 99.99, '1 / 1', 6111),
      svc('只读副本 A', '副本', 'healthy', 12, 99.98, '1 / 1', 6112),
      svc('只读副本 B', '副本', 'warning', 46, 99.72, '1 / 1', 6113),
      svc('连接池代理', '代理', 'warning', 4, 99.9, '2 / 2', 6114),
    ],
    events: [
      ev('14:52', '连锁影响', '支付网关重试放大，连接池占用升至 86%', 'warning'),
      ev('12:30', '索引优化', '对账表新增复合索引，慢查询下降 41%', 'healthy'),
      ev('03:20', '备份完成', '全量备份完成并校验通过，耗时 38 分钟', 'healthy'),
    ],
  }),

  buildProject({
    id: 'cache-cluster',
    name: 'Redis 缓存集群',
    kind: 'database',
    role: '会话、配置与热点数据缓存',
    env: '生产',
    status: 'healthy',
    owner: '林拾',
    uptime: 100,
    successRate: 99.99,
    budgetUsed: 3,
    activeAlerts: 0,
    peak: 42000,
    latencyBase: 2,
    latencyThreshold: 20,
    latencyDecimals: 1,
    errorBase: 0.01,
    cpuBase: 46,
    memoryBase: 71,
    seed: 6201,
    extraKpis: [
      kpi('连接池占用', '54', '%', '阈值 80%', 'healthy'),
      kpi('慢查询数', '6', '条', '近 24 小时 · 均为大 key 扫描', 'healthy'),
      kpi('主从复制延迟', '0.20', 's', '阈值 3s', 'healthy'),
    ],
    services: [
      svc('分片主节点', '主库', 'healthy', 1, 100, '6 / 6', 6211),
      svc('分片从节点', '副本', 'healthy', 2, 99.99, '6 / 6', 6212),
      svc('哨兵集群', '代理', 'healthy', 3, 100, '3 / 3', 6213),
    ],
    events: [
      ev('14:40', '容量水位', '内存占用 71%，距逐出阈值仍有余量', 'healthy'),
      ev('10:08', '大 key 治理', '清理 4 个超过 10MB 的历史 key', 'healthy'),
      ev('02:00', '定期巡检', '主从切换演练通过，切换耗时 1.8s', 'healthy'),
    ],
  }),
]

/** 详情页默认落在的项目。刻意选一个非 Agent 的项目，模板的定位是通用监控。 */
export const DEFAULT_PROJECT_ID = 'payment-gateway'

/**
 * 预算排行图只画消耗最高的这几个项目；14 条横向条形会把面板撑得过高。
 *
 * 这个常量放在数据层而不是图表组件里：图表组件带 `'use client'`，
 * 它导出的任何东西在服务端 import 时都会被 Next 换成客户端引用代理，
 * 常量会变成一个不能在服务端调用的函数——症状是页面上直接渲染出一段
 * "Attempted to call X() from the server" 的报错文本。
 */
export const BUDGET_RANKING_SIZE = 8

export function getProject(id: string): Project {
  return PROJECTS.find((project) => project.id === id) ?? PROJECTS[0]
}

/** 按类型分组，顺序跟随 PROJECT_KINDS，用于总览页的分组展示。 */
export function groupProjectsByKind(): { kind: ProjectKind; projects: Project[] }[] {
  const groups = new Map<ProjectKind, Project[]>()
  for (const project of PROJECTS) {
    const list = groups.get(project.kind)
    if (list) list.push(project)
    else groups.set(project.kind, [project])
  }
  return [...groups.entries()].map(([kind, projects]) => ({ kind, projects }))
}
