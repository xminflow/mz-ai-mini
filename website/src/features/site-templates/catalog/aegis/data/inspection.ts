import { PROJECTS } from './projects'

/**
 * 智能体巡检页的数据。
 *
 * 这一页要表达的是「多个智能体在不断巡检有问题的项目」，但它是纯静态页面，
 * 不做任何动效。"不断"这件事由内容结构承担：轮询周期、本轮进度 N/6、下一轮启动时间、
 * 四个智能体处在不同进度，以及巡检输出里**最上面那条是没有结论的进行中记录**。
 * 静态截图里也读得出流水线在转，不依赖定时器。
 *
 * 所有项目名、问题与数字都接现有监控数据，不另编一套互不相干的。
 */

/** 巡检对象是当前有活跃告警的项目——没问题的项目不进本轮巡检队列。 */
export const INSPECTED_PROJECTS = PROJECTS.filter((project) => project.activeAlerts > 0)

export interface InspectionAgent {
  name: string
  /** 这个智能体负责查什么，决定了它在输出流里出现的行长什么样 */
  duty: string
  status: 'running' | 'done'
  /** 正在巡检的项目；本轮已完成时为空 */
  currentTarget?: string
  scanned: number
  findings: number
  /** 状态行右侧的补充说明 */
  note: string
}

/**
 * 四个智能体按职责分工，而不是四个同质的机器人。
 * 分工之后，输出流里每一行一眼就能看出"谁在查什么"，否则就是四路一模一样的刷屏。
 */
export const INSPECTION_AGENTS: InspectionAgent[] = [
  {
    name: '日志分析智能体',
    duty: '扫描异常日志与错误聚类',
    status: 'running',
    currentTarget: '平台-统一支付网关',
    scanned: 4,
    findings: 4,
    note: '正在比对近 24 小时错误签名',
  },
  {
    name: '性能诊断智能体',
    duty: '排查延迟、慢查询与资源水位',
    status: 'running',
    currentTarget: '平台-主库集群',
    scanned: 3,
    findings: 4,
    note: '正在分析连接池占用趋势',
  },
  {
    name: '依赖巡检智能体',
    duty: '核对上下游服务存活与超时',
    status: 'running',
    currentTarget: '平台-订单数据同步管道',
    scanned: 5,
    findings: 2,
    note: '正在探测消费组与写入器就绪状态',
  },
  {
    name: '配置核查智能体',
    duty: '校验阈值、容量、证书与权限',
    status: 'done',
    scanned: 6,
    findings: 1,
    note: '本轮完成 · 下一轮 15:14 启动',
  },
]

/** 巡检轮询周期，写在输出流标题上，是"不断"的直接证据 */
export const INSPECTION_INTERVAL = '每 30 秒一轮'

export type LineOutcome = 'running' | 'finding' | 'clear'

export interface InspectionLine {
  time: string
  agent: string
  target: string
  message: string
  outcome: LineOutcome
}

/**
 * 巡检输出，最新在最上面。
 *
 * 第一条刻意是 running：它没有结论、以省略号结尾，读者据此知道这一刻仍在跑。
 * 其余每条都有明确结论（发现问题 / 未见异常），避免整屏都是含糊的"正在检查"。
 */
export const INSPECTION_LINES: InspectionLine[] = [
  { time: '15:12:47', agent: '性能诊断智能体', target: '平台-主库集群', message: '分析连接池占用趋势与等待队列…', outcome: 'running' },
  { time: '15:12:41', agent: '日志分析智能体', target: '平台-统一支付网关', message: '银行渠道 504 集中在 14:06–15:09，共 520 次', outcome: 'finding' },
  { time: '15:12:33', agent: '依赖巡检智能体', target: '平台-订单数据同步管道', message: '消费组滞后 182 万条，数仓写入器 3/4 就绪', outcome: 'finding' },
  { time: '15:12:26', agent: '配置核查智能体', target: '新环家电-小程序商城', message: '证书链、CDN 缓存头、限流配置均正常', outcome: 'clear' },
  { time: '15:12:18', agent: '性能诊断智能体', target: '平台-每日对账批处理', message: '批处理执行池 4/6 就绪，单批耗时超基线 60%', outcome: 'finding' },
  { time: '15:12:09', agent: '日志分析智能体', target: '新环家电-小程序商城', message: 'pay-result.js:142 空引用，24 小时内 240 次', outcome: 'finding' },
  { time: '15:12:01', agent: '依赖巡检智能体', target: '平台-统一支付网关', message: '银行渠道适配器 2/3 就绪，备用渠道已接管', outcome: 'finding' },
  { time: '15:11:52', agent: '配置核查智能体', target: '平台-主库集群', message: '连接池上限 200 已用 86%，高于扩容水位线', outcome: 'finding' },
  { time: '15:11:44', agent: '性能诊断智能体', target: '新环家电-售后客服 Agent', message: '上下文溢出 214 次/小时，超阈值 100 次', outcome: 'finding' },
  { time: '15:11:36', agent: '日志分析智能体', target: '平台-订单数据同步管道', message: '除消费端积压外，采集与投递链路未见异常', outcome: 'clear' },
  { time: '15:11:27', agent: '依赖巡检智能体', target: '新环家电-售后客服 Agent', message: 'LLM 网关、向量检索、工具执行器全部就绪', outcome: 'clear' },
  { time: '15:11:19', agent: '配置核查智能体', target: '平台-统一支付网关', message: '风控超时阈值、限流配额、证书链均正常', outcome: 'clear' },
  { time: '15:11:10', agent: '性能诊断智能体', target: '平台-订单数据同步管道', message: 'Flink 反压比 0.87，并行度不足以追平积压', outcome: 'finding' },
  { time: '15:11:02', agent: '日志分析智能体', target: '平台-主库集群', message: 't_reconcile 全表扫描 260 次，未走索引', outcome: 'finding' },
  { time: '15:10:54', agent: '依赖巡检智能体', target: '新环家电-小程序商城', message: '小程序网关、营销活动服务均就绪', outcome: 'clear' },
  { time: '15:10:45', agent: '配置核查智能体', target: '平台-每日对账批处理', message: '排期表、重试策略、告警渠道均正常', outcome: 'clear' },
  { time: '15:10:37', agent: '性能诊断智能体', target: '平台-统一支付网关', message: 'P95 响应耗时峰值 4,539ms，超阈值 1,500ms', outcome: 'finding' },
  { time: '15:10:28', agent: '日志分析智能体', target: '平台-每日对账批处理', message: '渠道文件未就绪导致重试 3/3，共 14 次', outcome: 'finding' },
]

export type FixRisk = '高风险' | '中风险' | '低风险'

export interface PendingFix {
  id: string
  project: string
  /** 智能体判定的问题 */
  problem: string
  /** 它建议执行的动作 */
  action: string
  /** 为什么需要人点头——这一栏是这块面板存在的理由 */
  impact: string
  risk: FixRisk
  foundBy: string
  foundAt: string
}

/**
 * 待授权修复：智能体已经定位到问题、也给出了动作，但动作本身有副作用，
 * 必须由人确认。「影响」一栏是这块面板的核心——没有它，"授权"就成了走过场。
 */
export const PENDING_FIXES: PendingFix[] = [
  {
    id: 'FIX-2418',
    project: '平台-统一支付网关',
    problem: '银行渠道适配器持续返回 504，备用渠道已接管但故障渠道仍在轮询',
    action: '将故障银行渠道永久摘出路由池',
    impact: '涉及资金链路，摘除后该渠道的历史订单需人工对账',
    risk: '高风险',
    foundBy: '依赖巡检智能体',
    foundAt: '15:12:01',
  },
  {
    id: 'FIX-2417',
    project: '新环家电-小程序商城',
    problem: 'v5.2.0 灰度版本引入空引用，支付回调页 JS 错误率 2.8%',
    action: '回滚灰度版本至 v5.1.4',
    impact: '影响当前 20% 灰度用户，回滚期间分享裂变组件不可用',
    risk: '高风险',
    foundBy: '日志分析智能体',
    foundAt: '15:12:09',
  },
  {
    id: 'FIX-2415',
    project: '平台-主库集群',
    problem: '连接池上限 200 已用 86%，支付网关重试放大后有耗尽风险',
    action: '连接池上限扩容 200 → 320',
    impact: '需重启连接池代理，预计写入中断 8 秒',
    risk: '中风险',
    foundBy: '配置核查智能体',
    foundAt: '15:11:52',
  },
  {
    id: 'FIX-2413',
    project: '平台-订单数据同步管道',
    problem: 'Flink 反压比 0.87，当前并行度追不平 182 万条积压',
    action: '并行度 16 → 32',
    impact: '占用预留计算资源，日成本增加约 ¥180',
    risk: '中风险',
    foundBy: '性能诊断智能体',
    foundAt: '15:11:10',
  },
]

export interface AppliedFix {
  time: string
  project: string
  action: string
  duration: string
  /** 修复后的实测变化，与监控页上的数字对得上 */
  result: string
  agent: string
}

/**
 * 已自动修复：预案covered、副作用可控的动作，智能体直接执行不等人。
 * 每条都给出修复后的实测变化——只写"已修复"而不给结果，等于什么都没说。
 */
export const APPLIED_FIXES: AppliedFix[] = [
  { time: '14:52', project: '新环家电-售后客服 Agent', action: '启用上下文裁剪策略', duration: '3s', result: '溢出 214 → 0 次/小时', agent: '配置核查智能体' },
  { time: '14:38', project: '平台-统一支付网关', action: '切换至备用银行渠道', duration: '12s', result: '上游超时率 8.4% → 0.4%', agent: '依赖巡检智能体' },
  { time: '14:35', project: '平台-订单数据同步管道', action: '消费组重平衡并扩容分区', duration: '41s', result: '积压 214 万 → 182 万条', agent: '性能诊断智能体' },
  { time: '12:30', project: '平台-主库集群', action: '只读副本补建复合索引', duration: '2m18s', result: '慢查询下降 41%', agent: '性能诊断智能体' },
  { time: '11:12', project: '平台-埋点采集流', action: '按流量预测扩容至 8 实例', duration: '26s', result: '积压回落至 3.2 万条', agent: '性能诊断智能体' },
  { time: '10:22', project: '新环家电-小程序商城', action: '修正静态资源缓存头', duration: '5s', result: '命中率 91.4% → 96.8%', agent: '配置核查智能体' },
  { time: '02:16', project: '平台-每日对账批处理', action: '重试拉取渠道对账文件', duration: '8s', result: '批次顺延 14 分钟后完成', agent: '日志分析智能体' },
]

/** 顶部四项统计全部由上面的数组算出，不手填。 */
export const INSPECTION_SUMMARY = {
  covered: INSPECTED_PROJECTS.length,
  findings: INSPECTION_AGENTS.reduce((sum, agent) => sum + agent.findings, 0),
  pending: PENDING_FIXES.length,
  applied: APPLIED_FIXES.length,
}
