import type { Project } from './project-model'

/**
 * 运维智能体的分析结论，每个页面一条。
 *
 * 它出现在 ConsoleShell 里、每一页顶部同一个位置——「统一」是结构保证的，
 * 不靠每页各自摆一个。变的只有结论内容：智能体在总览页谈全局根因，
 * 在日志页谈异常归并，在规则页谈阈值灵敏度，说的都是**这一页正在看的东西**，
 * 而不是六页复读同一句话。
 *
 * 结论必须说人话、给判断，不复述页面上已有的指标。
 * "P95 是 2272ms" 这种句子毫无价值——读者眼睛就能看到；
 * "上游 504 是根因、本服务自身没问题" 才是智能体该给的东西。
 */
export interface AgentInsight {
  /** 一段结论 */
  conclusion: string
  /** 分析时刻。刻意比页面上其它时间戳更新一点，"实时"由此体现 */
  at: string
  /** 结论的置信度 */
  confidence: number
  /** 这次分析覆盖了什么范围 */
  scope: string
  /** 给出了几条建议 */
  suggestion: string
}

export const OVERVIEW_INSIGHT: AgentInsight = {
  conclusion:
    '平台-统一支付网关的上游 504 是本轮根因，已连累新环家电-小程序商城的前端错误率与平台-主库集群的连接池占用。备用渠道已在 14:38 接管，指标正在回落；建议优先处理「连接池扩容 200 → 320」这一条待授权项，它是目前唯一还在恶化的环节。',
  at: '15:12:51',
  confidence: 0.91,
  scope: '关联 3 个项目',
  suggestion: '建议 2 项',
}

export const INSPECTION_INSIGHT: AgentInsight = {
  conclusion:
    '本轮 11 项发现里 7 项已按预案自动闭环，剩下 4 项都涉及重启、回滚或资金链路，必须人工点头。其中「回滚小程序商城 v5.2.0」影响 20% 灰度用户，建议放到今晚流量低谷执行，其余三项可立即授权。',
  at: '15:12:53',
  confidence: 0.88,
  scope: '覆盖 6 个告警项目',
  suggestion: '建议 4 项待授权',
}

export const LOGS_INSIGHT: AgentInsight = {
  conclusion:
    '6 组异常聚类里有 3 组同源——银行渠道 504、小程序商城空引用、主库全表扫描，都挂在支付链路上，处理根因后会一起消失。真正独立的只有上下文溢出与对账文件重试两类，建议分开派单。',
  at: '15:12:49',
  confidence: 0.86,
  scope: '6 组归并为 4 类',
  suggestion: '建议 1 项',
}

export const ALERTS_INSIGHT: AgentInsight = {
  conclusion:
    '9 条未关闭告警可收敛为 5 组：支付网关的 3 条、订单同步管道的 2 条各自同源，重复派单只会分散人手。当前 2 条待认领已超过 45 分钟，建议先把人派下去，收敛规则可以之后再配。',
  at: '15:12:50',
  confidence: 0.9,
  scope: '9 条可收敛为 5 组',
  suggestion: '建议 2 项',
}

export const RULES_INSIGHT: AgentInsight = {
  conclusion:
    'RULE-014「限流拒绝突增」近 7 天触发 18 次却无一升级为故障，阈值偏灵敏，是当前告警噪声的主要来源；RULE-012「Token 成本超预算」处于停用且 7 天零触发，形同虚设，建议要么调整阈值要么直接下线。',
  at: '15:12:46',
  confidence: 0.83,
  scope: '评估 14 条规则',
  suggestion: '建议 2 项',
}

/**
 * 项目详情页的结论按项目给。
 *
 * 只手写有问题的那几个——健康项目值得说的话就那一句，手写 18 遍只会变成模板复读，
 * 由下面的兜底逻辑从项目自身状态生成反而更准。
 */
const PROJECT_CONCLUSIONS: Record<string, Omit<AgentInsight, 'at'>> = {
  'platform-payment': {
    conclusion:
      '上游银行渠道 504 是根因，本服务自身的交易核心与风控链路均正常。备用渠道已在 14:38 接管，超时率从 8.4% 回落至 0.4%；建议永久摘除故障渠道，但该动作涉及资金链路，需人工确认后执行。',
    confidence: 0.94,
    scope: '排查 5 个依赖',
    suggestion: '建议 1 项待授权',
  },
  'platform-order-sync': {
    conclusion:
      '积压不是消费能力不足，而是 13:58 上游批量刷数造成的瞬时六倍冲击。并行度已从 8 提到 16，按当前消费速率约 40 分钟追平；若要更快需再提到 32，代价是占用预留算力。',
    confidence: 0.89,
    scope: '排查 5 个依赖',
    suggestion: '建议 1 项待授权',
  },
  'xinhuan-mall': {
    conclusion:
      '前端 JS 错误率上涨与本次灰度版本无关，是支付网关返回异常后回调页未做空值兜底所致。根因修复后错误率会自行回落；若需立即止血，可回滚 v5.2.0，但会影响 20% 灰度用户。',
    confidence: 0.87,
    scope: '排查 4 个依赖',
    suggestion: '建议 1 项待授权',
  },
  'xinhuan-cs-agent': {
    conclusion:
      '上下文溢出集中在 12:30 提示词模板更新之后，平均输入长度上涨 18% 是直接原因。裁剪策略已于 14:52 生效，溢出已归零；建议下次改提示词时同步核算 token 预算。',
    confidence: 0.85,
    scope: '排查 5 个依赖',
    suggestion: '建议 1 项',
  },
  'platform-recon': {
    conclusion:
      '批次超时的瓶颈在执行池——6 个实例只有 4 个就绪，而非对账逻辑本身变慢。02:00 批次还叠加了渠道文件未就绪的 14 分钟顺延；建议先补齐实例再评估基线。',
    confidence: 0.82,
    scope: '排查 4 个依赖',
    suggestion: '建议 1 项',
  },
  'platform-primary-db': {
    conclusion:
      '连接池占用抬升是支付网关重试放大的传导结果，不是数据库自身负载增长。慢查询已通过副本补索引下降 41%；连接池扩容至 320 可解，但需重启代理、写入中断约 8 秒。',
    confidence: 0.88,
    scope: '排查 4 个依赖',
    suggestion: '建议 1 项待授权',
  },
}

/** 项目详情页的分析时刻，与其它页面保持在同一分钟内 */
const PROJECT_INSIGHT_AT = '15:12:52'

export function projectInsight(project: Project): AgentInsight {
  const written = PROJECT_CONCLUSIONS[project.id]
  if (written) return { ...written, at: PROJECT_INSIGHT_AT }

  // 兜底：健康项目从自身状态生成一句，比手写 18 遍模板句更准也更省
  const degraded = project.services.filter((service) => service.status !== 'healthy').length
  return {
    conclusion:
      degraded > 0
        ? `${project.name} 核心指标均在阈值内，但有 ${degraded} 个依赖处于非健康状态，暂未影响对外表现；已纳入下一轮巡检重点观察。`
        : `${project.name} 近 24 小时各项指标均在阈值内，${project.services.length} 个依赖全部就绪，误差预算消耗 ${project.budgetUsed}%，无需处理。`,
    at: PROJECT_INSIGHT_AT,
    confidence: 0.95,
    scope: `排查 ${project.services.length} 个依赖`,
    suggestion: '无待办',
  }
}
