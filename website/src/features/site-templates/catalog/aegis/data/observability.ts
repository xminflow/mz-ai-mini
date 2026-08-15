import type { AlertSeverity, TimelineEvent } from './model'
import { PROJECTS, getProject } from './projects'
import { HOURS, INCIDENT_HOUR, shapedSeries } from './series'

/**
 * 跨项目的可观测性数据：全局概览、告警、日志、规则。
 *
 * 凡是能从项目清单算出来的（项目数、告警总数、平均可用性、严重度构成），
 * 一律派生而不是手填——演示数据最容易翻车的地方就是"图上写 25、表里只有 8 行"
 * 这种自相矛盾，客户第一眼就会看到。
 */

// ============================================================
// 全局概览
// ============================================================

export interface GlobalKpi {
  label: string
  value: string
  unit?: string
  delta: string
  trend: 'up' | 'down' | 'flat'
  /** 变化方向对业务是好是坏——涨不一定是好事 */
  tone: 'positive' | 'negative' | 'neutral'
}

const TOTAL_ALERTS = PROJECTS.reduce((sum, project) => sum + project.activeAlerts, 0)
const AVERAGE_UPTIME = PROJECTS.reduce((sum, project) => sum + project.uptime, 0) / PROJECTS.length
const SLO_MET = PROJECTS.filter((project) => project.budgetUsed <= 100).length
const TOTAL_COMPONENTS = PROJECTS.reduce((sum, project) => sum + project.services.length, 0)

export const GLOBAL_KPIS: GlobalKpi[] = [
  {
    label: '在线项目',
    value: `${PROJECTS.length} / ${PROJECTS.length}`,
    delta: '全部在线',
    trend: 'flat',
    tone: 'positive',
  },
  { label: '活跃告警', value: String(TOTAL_ALERTS), delta: '+4', trend: 'up', tone: 'negative' },
  {
    label: '平均可用性',
    value: AVERAGE_UPTIME.toFixed(2),
    unit: '%',
    delta: '-0.21pp',
    trend: 'down',
    tone: 'negative',
  },
  {
    label: 'SLO 达标项目',
    value: `${SLO_MET} / ${PROJECTS.length}`,
    delta: '-2',
    trend: 'down',
    tone: 'negative',
  },
  { label: '24h 处理总量', value: '2.14', unit: '亿', delta: '+6.8%', trend: 'up', tone: 'neutral' },
  {
    label: '纳管服务组件',
    value: String(TOTAL_COMPONENTS),
    delta: '+3',
    trend: 'up',
    tone: 'neutral',
  },
]

/** 近 24 小时全局告警触发次数，按严重度堆叠。14:00 那一根与故障时刻对应。 */
export const ALERT_TREND: { critical: number[]; warning: number[]; info: number[] } = {
  critical: [0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 4, 2, 0, 0, 0, 0, 0, 0, 0, 0],
  warning: [1, 2, 2, 0, 0, 1, 2, 3, 2, 3, 2, 1, 1, 3, 6, 5, 3, 2, 1, 2, 0, 1, 0, 1],
  info: [2, 3, 3, 1, 1, 2, 4, 5, 5, 4, 6, 5, 3, 5, 9, 8, 6, 4, 3, 3, 2, 2, 1, 2],
}

// ============================================================
// 日志与异常
// ============================================================

export type LogLevel = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG'

export const LOG_LEVEL_COUNTS: { level: LogLevel; count: number }[] = [
  { level: 'ERROR', count: 3642 },
  { level: 'WARN', count: 24180 },
  { level: 'INFO', count: 486320 },
  { level: 'DEBUG', count: 1284600 },
]

const LOG_SHAPE = [
  0.24, 0.2, 0.18, 0.16, 0.18, 0.26, 0.4, 0.6, 0.8, 0.93, 1.0, 0.96, 0.74, 0.86, 0.98, 0.95, 0.87,
  0.76, 0.64, 0.57, 0.5, 0.42, 0.34, 0.28,
]

export const LOG_VOLUME_SERIES: Record<LogLevel, number[]> = {
  DEBUG: shapedSeries(LOG_SHAPE, 78000, 0.14, 7101),
  INFO: shapedSeries(LOG_SHAPE, 29500, 0.16, 7102),
  WARN: shapedSeries(LOG_SHAPE, 1420, 0.3, 7103),
  ERROR: HOURS.map((_, index) => {
    const base = 70 + LOG_SHAPE[index] * 90
    // 故障时段 ERROR 激增，这是日志页最该被一眼看到的信息
    const lift = index === INCIDENT_HOUR ? 8.6 : index === INCIDENT_HOUR + 1 ? 5.2 : index === INCIDENT_HOUR + 2 ? 2.1 : 1
    return Math.round(base * lift)
  }),
}

export interface ErrorCluster {
  /** 归一化后的错误签名，同类异常聚在一起 */
  signature: string
  /** 来源项目，跨类型排查时这一列比服务名更有用 */
  project: string
  service: string
  count: number
  delta: string
  trend: 'up' | 'down' | 'flat'
  firstSeen: string
  lastSeen: string
  impacted: number
  spark: number[]
}

export const ERROR_CLUSTERS: ErrorCluster[] = [
  {
    signature: 'UpstreamTimeout: POST /v2/pay 返回 504 Gateway Timeout',
    project: '支付网关',
    service: 'bank-adapter',
    count: 862,
    delta: '+780%',
    trend: 'up',
    firstSeen: '14:06',
    lastSeen: '15:09',
    impacted: 641,
    spark: [2, 1, 0, 3, 4, 2, 1, 0, 2, 3, 1, 2, 4, 6, 412, 268, 84, 22, 6, 3, 2, 1, 0, 1],
  },
  {
    signature: 'ConsumerLagExceeded: 消费组 cdc-lakehouse 积压 182 万条',
    project: '实时数仓入湖',
    service: 'kafka-consumer',
    count: 517,
    delta: '+高',
    trend: 'up',
    firstSeen: '13:58',
    lastSeen: '15:11',
    impacted: 517,
    spark: [4, 3, 2, 2, 3, 4, 6, 8, 9, 10, 12, 9, 7, 96, 214, 168, 74, 26, 12, 8, 6, 5, 4, 3],
  },
  {
    signature: "JSError: Cannot read properties of undefined (reading 'orderNo')",
    project: '小程序商城',
    service: 'mini-shop-web',
    count: 431,
    delta: '+214%',
    trend: 'up',
    firstSeen: '12:11',
    lastSeen: '15:12',
    impacted: 398,
    spark: [1, 0, 1, 0, 0, 1, 2, 4, 8, 12, 16, 14, 22, 34, 118, 96, 48, 22, 14, 10, 8, 6, 4, 2],
  },
  {
    signature: 'SlowQuery: SELECT … FROM t_reconcile 执行 8.4s 未走索引',
    project: '主库集群',
    service: 'mysql-proxy',
    count: 342,
    delta: '+38%',
    trend: 'up',
    firstSeen: '00:14',
    lastSeen: '15:08',
    impacted: 342,
    spark: [12, 14, 18, 9, 6, 8, 12, 16, 18, 20, 22, 19, 14, 17, 34, 28, 22, 18, 15, 13, 11, 10, 9, 8],
  },
  {
    signature: 'ContextWindowExceeded: 输入 token 超出模型上限，已截断历史',
    project: '智能客服 Agent',
    service: 'llm-gateway',
    count: 214,
    delta: '+12%',
    trend: 'up',
    firstSeen: '02:18',
    lastSeen: '15:11',
    impacted: 214,
    spark: [6, 8, 5, 4, 3, 5, 9, 12, 14, 16, 18, 15, 9, 12, 21, 17, 14, 11, 9, 8, 7, 6, 5, 4],
  },
  {
    signature: 'BatchRetryExhausted: recon-daily 渠道对账文件未就绪，重试 3/3',
    project: '每日对账批处理',
    service: 'cron-scheduler',
    count: 14,
    delta: '持平',
    trend: 'flat',
    firstSeen: '02:00',
    lastSeen: '13:00',
    impacted: 14,
    spark: [0, 0, 4, 2, 0, 0, 0, 3, 1, 0, 0, 0, 0, 2, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
  },
]

export interface LogEntry {
  time: string
  level: LogLevel
  service: string
  traceId: string
  message: string
}

export const LOG_ENTRIES: LogEntry[] = [
  { time: '15:12:04.118', level: 'INFO', service: 'payment-gateway', traceId: 'a7f3c1e9', message: 'order ord_88214 settled via channel=CMB in 268ms' },
  { time: '15:11:58.902', level: 'DEBUG', service: 'redis-sentinel', traceId: 'a7f3c1e9', message: 'cache hit ratio 0.94 over last 10000 gets, evicted=0' },
  { time: '15:11:52.441', level: 'WARN', service: 'mysql-proxy', traceId: 'b21d40aa', message: 'SlowQuery 8.42s: SELECT * FROM t_reconcile WHERE biz_date=? (no index)' },
  { time: '15:11:47.203', level: 'ERROR', service: 'bank-adapter', traceId: 'c58e7712', message: 'UpstreamTimeout: POST /v2/pay exceeded 30s, retry 2/3' },
  { time: '15:11:46.887', level: 'ERROR', service: 'payment-gateway', traceId: 'c58e7712', message: 'channel CMB returned 504, falling back to channel=ICBC' },
  { time: '15:11:40.115', level: 'INFO', service: 'auth-center', traceId: 'd90a1b3c', message: 'token issued sub=u_41822 ttl=7200s scope=[order,pay]' },
  { time: '15:11:33.774', level: 'ERROR', service: 'kafka-consumer', traceId: 'e13f8802', message: 'ConsumerLagExceeded: group=cdc-lakehouse lag=1824391 threshold=500000' },
  { time: '15:11:29.560', level: 'WARN', service: 'flink-etl', traceId: 'e13f8802', message: 'backpressure detected on operator sink-iceberg, ratio=0.87' },
  { time: '15:11:21.338', level: 'ERROR', service: 'mini-shop-web', traceId: 'f4a02219', message: "JSError: Cannot read properties of undefined (reading 'orderNo') at pay-result.js:142" },
  { time: '15:11:14.092', level: 'WARN', service: 'llm-gateway', traceId: '0c7b3ad1', message: 'ContextWindowExceeded: 132480 tokens exceeds limit 131072, truncating history' },
  { time: '15:11:08.651', level: 'INFO', service: 'agent-orchestrator', traceId: '0c7b3ad1', message: 'session sess_9f21 completed in 1.84s, 4 tool calls, 3120 tokens' },
  { time: '15:11:02.407', level: 'DEBUG', service: 'open-gateway', traceId: '18ee9004', message: 'quota check partner=pt_204 used=782/800 window=60s' },
  { time: '15:10:56.219', level: 'WARN', service: 'open-gateway', traceId: '18ee9004', message: 'RateLimited: partner=pt_204 exceeded quota, returned 429' },
  { time: '15:10:49.884', level: 'INFO', service: 'cron-scheduler', traceId: '2b6c5518', message: 'job recon-daily-incremental finished in 42m18s, 1284620 records' },
  { time: '15:10:43.560', level: 'DEBUG', service: 'flink-etl', traceId: '2b6c5518', message: 'checkpoint 4821 completed in 3.2s, state size 1.8GB' },
  { time: '15:10:37.192', level: 'INFO', service: 'corp-site', traceId: '39dd7126', message: 'cdn purge completed, 42 paths invalidated in 1.9s' },
  { time: '15:10:30.044', level: 'WARN', service: 'mysql-proxy', traceId: '44f10093', message: 'connection pool usage 86%, threshold 80%, active=172 idle=28' },
  { time: '15:10:22.716', level: 'DEBUG', service: 'auth-center', traceId: '5a92c847', message: 'jwks rotated, kid=2026-08-14a, previous key retained 24h' },
]

// ============================================================
// 告警
// ============================================================

export interface ActiveAlert {
  id: string
  severity: AlertSeverity
  title: string
  project: string
  /** 项目类型标签，跨类型排查时用来快速分辨 */
  kindLabel: string
  rule: string
  firedAt: string
  duration: string
  assignee: string
  state: '待认领' | '处理中' | '已抑制' | '已恢复'
}

export const ACTIVE_ALERTS: ActiveAlert[] = [
  { id: 'ALT-20418', severity: 'critical', title: '上游依赖超时率 8.4% 超出阈值 2%', project: '支付网关', kindLabel: 'API 服务', rule: '上游依赖超时率突增', firedAt: '14:21', duration: '51 分钟', assignee: '陈见山', state: '处理中' },
  { id: 'ALT-20417', severity: 'critical', title: 'P95 响应耗时 4.5s 超出阈值 1.5s', project: '支付网关', kindLabel: 'API 服务', rule: 'P95 响应耗时劣化', firedAt: '14:09', duration: '1 小时 3 分', assignee: '陈见山', state: '已抑制' },
  { id: 'ALT-20416', severity: 'critical', title: '银行渠道适配器实例存活 2/3', project: '支付网关', kindLabel: 'API 服务', rule: '依赖实例不足', firedAt: '14:06', duration: '1 小时 6 分', assignee: '许知白', state: '处理中' },
  { id: 'ALT-20414', severity: 'critical', title: '管道积压 182 万条 超出阈值 50 万', project: '实时数仓入湖', kindLabel: '数据管道', rule: '管道积压超限', firedAt: '14:12', duration: '1 小时', assignee: '林拾', state: '处理中' },
  { id: 'ALT-20412', severity: 'warning', title: '端到端时延 14.2 分钟 超出阈值 5 分钟', project: '实时数仓入湖', kindLabel: '数据管道', rule: '管道时延劣化', firedAt: '14:18', duration: '54 分钟', assignee: '待分配', state: '待认领' },
  { id: 'ALT-20409', severity: 'warning', title: '前端 JS 错误率 2.8% 超出阈值 1%', project: '小程序商城', kindLabel: 'Web 应用', rule: '前端 JS 错误率', firedAt: '14:24', duration: '48 分钟', assignee: '待分配', state: '待认领' },
  { id: 'ALT-20404', severity: 'warning', title: '上下文溢出 214 次/小时 超出阈值 100 次', project: '智能客服 Agent', kindLabel: 'AI Agent', rule: '上下文溢出频次', firedAt: '14:48', duration: '24 分钟', assignee: '陈见山', state: '处理中' },
  { id: 'ALT-20398', severity: 'warning', title: '批次执行时长 76 分钟 超出阈值 60 分钟', project: '每日对账批处理', kindLabel: '定时任务', rule: '任务执行超时', firedAt: '02:16', duration: '12 小时 56 分', assignee: '陈见山', state: '处理中' },
  // 告警的严重度必须与它所属规则的严重度一致，否则规则页与告警页会互相打脸
  { id: 'ALT-20391', severity: 'info', title: '慢查询 342 条/小时 超出阈值 200 条', project: '主库集群', kindLabel: '数据库', rule: '慢查询突增', firedAt: '14:52', duration: '20 分钟', assignee: '许知白', state: '已恢复' },
]

/** 严重度构成由告警列表实时算出，杜绝图与表对不上。 */
export const ALERT_SEVERITY_DIST: { severity: AlertSeverity; label: string; count: number }[] = (
  [
    ['critical', '严重'],
    ['warning', '警告'],
    ['info', '提示'],
  ] as [AlertSeverity, string][]
).map(([severity, label]) => ({
  severity,
  label,
  count: ACTIVE_ALERTS.filter((alert) => alert.severity === severity).length,
}))

export const ALERT_METRICS: { label: string; value: string; unit: string; hint: string }[] = [
  { label: '平均确认时长 MTTA', value: '2.4', unit: '分钟', hint: '目标 ≤ 5 分钟' },
  { label: '平均恢复时长 MTTR', value: '18.6', unit: '分钟', hint: '目标 ≤ 30 分钟' },
  { label: '自动恢复占比', value: '64', unit: '%', hint: '由预案自动闭环' },
  { label: '7 日告警噪声率', value: '11', unit: '%', hint: '被标记为误报的比例' },
]

export const ALERT_TIMELINE: TimelineEvent[] = [
  { time: '14:21:06', title: '规则触发', detail: '上游依赖超时率连续 5 分钟 > 2%，实测 8.4%', tone: 'critical' },
  { time: '14:21:14', title: '通知已送达', detail: '企业微信值班群 · 电话呼叫 陈见山（8 秒接通）', tone: 'neutral' },
  { time: '14:23:32', title: '已认领', detail: '陈见山认领，确认耗时 2 分 26 秒', tone: 'neutral' },
  { time: '14:26:10', title: '关联归因', detail: '定位到银行渠道适配器上游 504，同时关联到小程序商城 JS 错误率上涨', tone: 'warning' },
  { time: '14:38:47', title: '预案执行', detail: '自动切换备用银行渠道并降级为异步补单', tone: 'neutral' },
  { time: '15:12:20', title: '指标恢复', detail: '超时率回落至 0.4%，告警进入恢复观察期', tone: 'healthy' },
]

// ============================================================
// 告警规则
// ============================================================

export type NotifyChannel = '企业微信' | '钉钉' | '邮件' | 'Webhook' | '电话'

export interface AlertRule {
  id: string
  name: string
  /** 作用范围可以是全部项目、某一类项目，或具体某个项目 */
  scope: string
  metric: string
  condition: string
  severity: AlertSeverity
  silence: string
  channels: NotifyChannel[]
  enabled: boolean
  fired7d: number
}

export const ALERT_RULES: AlertRule[] = [
  { id: 'RULE-001', name: '上游依赖超时率突增', scope: '全部生产项目', metric: 'upstream.timeout_rate', condition: '> 2% 持续 5 分钟', severity: 'critical', silence: '30 分钟', channels: ['企业微信', '电话'], enabled: true, fired7d: 4 },
  { id: 'RULE-002', name: 'P95 响应耗时劣化', scope: '支付网关', metric: 'latency.p95', condition: '> 1500ms 持续 10 分钟', severity: 'critical', silence: '30 分钟', channels: ['企业微信', '钉钉'], enabled: true, fired7d: 7 },
  { id: 'RULE-003', name: '依赖实例不足', scope: '全部项目', metric: 'service.replicas_ready', condition: '< 期望实例数 持续 2 分钟', severity: 'critical', silence: '15 分钟', channels: ['企业微信', '电话', 'Webhook'], enabled: true, fired7d: 3 },
  { id: 'RULE-004', name: '成功率下滑', scope: '全部项目', metric: 'task.success_rate', condition: '< 95% 持续 15 分钟', severity: 'warning', silence: '1 小时', channels: ['企业微信'], enabled: true, fired7d: 11 },
  { id: 'RULE-005', name: '管道积压超限', scope: '数据管道类', metric: 'pipeline.backlog', condition: '> 50 万条 持续 10 分钟', severity: 'critical', silence: '30 分钟', channels: ['企业微信', '电话'], enabled: true, fired7d: 2 },
  { id: 'RULE-006', name: '管道时延劣化', scope: '数据管道类', metric: 'pipeline.e2e_latency', condition: '> 5 分钟 持续 10 分钟', severity: 'warning', silence: '1 小时', channels: ['企业微信', '钉钉'], enabled: true, fired7d: 4 },
  { id: 'RULE-007', name: '任务错过排期', scope: '定时任务类', metric: 'job.missed_schedule', condition: '> 0 次', severity: 'warning', silence: '2 小时', channels: ['钉钉', '邮件'], enabled: true, fired7d: 5 },
  { id: 'RULE-008', name: '任务执行超时', scope: '定时任务类', metric: 'job.duration', condition: '> 60 分钟', severity: 'warning', silence: '4 小时', channels: ['钉钉', '邮件'], enabled: true, fired7d: 6 },
  { id: 'RULE-009', name: '主从复制延迟', scope: '数据库类', metric: 'db.replica_lag', condition: '> 3s 持续 5 分钟', severity: 'warning', silence: '1 小时', channels: ['企业微信'], enabled: true, fired7d: 6 },
  { id: 'RULE-010', name: '前端 JS 错误率', scope: 'Web 应用类', metric: 'web.js_error_rate', condition: '> 1% 持续 15 分钟', severity: 'warning', silence: '1 小时', channels: ['钉钉'], enabled: true, fired7d: 9 },
  { id: 'RULE-011', name: '上下文溢出频次', scope: 'AI Agent 类', metric: 'llm.context_exceeded', condition: '> 100 次/小时', severity: 'warning', silence: '2 小时', channels: ['钉钉', '邮件'], enabled: true, fired7d: 8 },
  { id: 'RULE-012', name: 'Token 成本超预算', scope: 'AI Agent 类', metric: 'llm.daily_cost', condition: '> 日预算 120%', severity: 'warning', silence: '24 小时', channels: ['企业微信', '邮件'], enabled: false, fired7d: 0 },
  { id: 'RULE-013', name: '慢查询突增', scope: '数据库类', metric: 'db.slow_query', condition: '> 200 条/小时', severity: 'info', silence: '4 小时', channels: ['邮件'], enabled: true, fired7d: 12 },
  { id: 'RULE-014', name: '限流拒绝突增', scope: 'API 服务类', metric: 'api.rate_limited', condition: '> 500 次/小时', severity: 'info', silence: '4 小时', channels: ['邮件'], enabled: true, fired7d: 18 },
]

export const NOTIFY_CHANNELS: { name: NotifyChannel; target: string; enabled: boolean; hint: string }[] = [
  { name: '企业微信', target: '平台运维值班群', enabled: true, hint: '严重与警告级别推送' },
  { name: '钉钉', target: '研发效能群 · 机器人', enabled: true, hint: '仅工作时段推送' },
  { name: '邮件', target: 'platform-ops@example.com', enabled: true, hint: '每日汇总 + 提示级别' },
  { name: 'Webhook', target: 'https://ops.example.com/hooks/alert', enabled: true, hint: '同步至内部工单系统' },
  { name: '电话', target: '值班轮值表 · 三级升级', enabled: true, hint: '仅严重级别，5 分钟未认领升级' },
]

/**
 * 规则编辑面板的阈值预览：把阈值线叠在被监控项目过去 24 小时的真实曲线上。
 *
 * 越界次数与「换个阈值会触发几次」全部由曲线现算，不写死——
 * 手填的对照数字一旦和曲线对不上，这个面板最有说服力的地方反而变成破绽。
 */
const PREVIEW_PROJECT = getProject('payment-gateway')

function breachCountAt(threshold: number): number {
  return PREVIEW_PROJECT.latency.filter((value) => value > threshold).length
}

export const THRESHOLD_PREVIEW = {
  ruleId: 'RULE-002',
  ruleName: 'P95 响应耗时劣化',
  projectName: PREVIEW_PROJECT.name,
  metricLabel: `latency.p95（${PREVIEW_PROJECT.spec.latencyUnit}）`,
  unit: PREVIEW_PROJECT.spec.latencyUnit,
  series: PREVIEW_PROJECT.latency,
  threshold: PREVIEW_PROJECT.latencyThreshold,
  breaches: PREVIEW_PROJECT.latency
    .map((value, index) => ({ hour: HOURS[index], value }))
    .filter((item) => item.value > PREVIEW_PROJECT.latencyThreshold),
  breachCount: breachCountAt(PREVIEW_PROJECT.latencyThreshold),
  /**
   * 上调 / 下调阈值的对照，回答「会不会天天被吵醒」。
   * 下限刻意取到基线附近（200ms）而不是 800ms：该项目日常延迟只有 200 出头，
   * 阈值定在 800 与 1500 的触发次数完全一样，这样的对照说明不了任何事。
   */
  alternatives: [
    { threshold: 3000, count: breachCountAt(3000) },
    { threshold: 200, count: breachCountAt(200) },
  ],
}
