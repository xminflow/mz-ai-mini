import type { ProjectKind } from './model'
import type { Project } from './project-model'
import { buildProject, ev, kpi, svc } from './project-model'

/**
 * 24 个被监控项目，横跨 6 种技术类型。
 *
 * 叙事设定：一个技术服务商同时运维多家客户的系统，外加一批不属于任何单个客户的
 * 平台自有基础设施。项目名一律写成「品牌名-系统名」——泛泛的品类名（"小程序商城"）
 * 读起来像分类标签而不是一个真实在跑的系统，而运维平台的说服力恰恰来自"这些都是真的"。
 *
 * 客户品牌：新环家电（家电零售）、恒益物流、明泉茶业、云栖健康、简屿家居、星野烘焙。
 * 「平台-」前缀留给支付、认证、数据库、对账这类多客户共用的基础设施。
 *
 * 故障叙事集中在 14:00–16:00：平台统一支付网关的上游银行渠道返回 504，
 * 连锁影响到新环家电小程序商城的前端错误率与平台主库的连接池占用。
 */

export const PROJECTS: Project[] = [
  // ==================== Web 应用 ====================

  buildProject({
    id: 'xinhuan-mall',
    name: '新环家电-小程序商城',
    kind: 'web',
    role: '家电零售的小程序交易入口',
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
      svc('统一支付网关', '外部', 'critical', 3860, 99.41, '3 / 3', 1313),
      svc('营销活动服务', '业务', 'healthy', 118, 99.94, '2 / 2', 1314),
    ],
    events: [
      ev('14:24', '连锁影响', '统一支付网关异常导致下单页 JS 错误率升至 2.8%', 'critical'),
      ev('12:08', '活动开始', '限时秒杀开启，流量较日常上涨 3.2 倍', 'warning'),
      ev('10:15', '版本发布', 'v5.2.0 灰度 20%，新增分享裂变组件', 'neutral'),
    ],
  }),

  buildProject({
    id: 'xinhuan-site',
    name: '新环家电-品牌官网',
    kind: 'web',
    role: '品牌形象与产品图鉴',
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
      ev('13:20', '内容发布', '上新 3 款空调详情页，CDN 全量刷新耗时 42s', 'neutral'),
      ev('09:05', '证书轮换', 'TLS 证书自动续期完成，有效期至 2027-08-15', 'neutral'),
      ev('02:10', '定期巡检', '全站链接巡检通过，无 404', 'healthy'),
    ],
  }),

  buildProject({
    id: 'mingquan-site',
    name: '明泉茶业-品牌官网',
    kind: 'web',
    role: '茶叶品牌官网与产区故事',
    env: '生产',
    status: 'healthy',
    owner: '周宛清',
    uptime: 99.96,
    successRate: 99.8,
    budgetUsed: 11,
    activeAlerts: 0,
    peak: 940,
    latencyBase: 1240,
    latencyThreshold: 2500,
    errorBase: 0.16,
    cpuBase: 29,
    memoryBase: 44,
    seed: 1401,
    extraKpis: [
      kpi('LCP 最大内容绘制', '2.06', 's', '优秀区间 ≤ 2.5s', 'healthy'),
      kpi('JS 错误率', '0.18', '%', '按会话统计 · 阈值 1%', 'healthy'),
      kpi('静态资源命中率', '97.8', '%', '产区图片占比高', 'healthy'),
    ],
    services: [
      svc('CDN 边缘节点', '边缘', 'healthy', 26, 99.99, '全球 18 节点', 1411),
      svc('页面渲染服务', '核心', 'healthy', 92, 99.96, '2 / 2', 1412),
      svc('内容管理 API', '外部', 'healthy', 158, 99.93, '2 / 2', 1413),
    ],
    events: [
      ev('15:02', '内容发布', '春茶专题页上线，图片资源压缩率提升 34%', 'neutral'),
      ev('11:26', '容量扩缩', '按流量预测自动扩容至 2 实例', 'neutral'),
      ev('03:40', '定期巡检', '全站可用性拨测通过', 'healthy'),
    ],
  }),

  buildProject({
    id: 'yunqi-booking',
    name: '云栖健康-预约小程序',
    kind: 'web',
    role: '到店预约与健康档案入口',
    env: '生产',
    status: 'healthy',
    owner: '林拾',
    uptime: 99.93,
    successRate: 99.5,
    budgetUsed: 22,
    activeAlerts: 0,
    peak: 1560,
    latencyBase: 1380,
    latencyThreshold: 2500,
    errorBase: 0.28,
    cpuBase: 43,
    memoryBase: 57,
    seed: 1501,
    extraKpis: [
      kpi('LCP 最大内容绘制', '2.28', 's', '优秀区间 ≤ 2.5s', 'healthy'),
      kpi('JS 错误率', '0.42', '%', '主要来自日历组件', 'healthy'),
      kpi('静态资源命中率', '95.6', '%', '门店图片未走长缓存', 'healthy'),
    ],
    services: [
      svc('小程序网关', '核心', 'healthy', 88, 99.97, '4 / 4', 1511),
      svc('预约排班服务', '业务', 'healthy', 164, 99.94, '3 / 3', 1512),
      svc('短信通知通道', '外部', 'healthy', 520, 99.82, '2 / 2', 1513),
    ],
    events: [
      ev('14:12', '排班调整', '两家门店周末号源扩容 40%', 'neutral'),
      ev('10:48', '版本发布', 'v3.1.2 上线，改期流程由 4 步缩到 2 步', 'neutral'),
      ev('06:00', '定期巡检', '预约下单链路端到端拨测通过', 'healthy'),
    ],
  }),

  buildProject({
    id: 'hengyi-portal',
    name: '恒益物流-货主自助门户',
    kind: 'web',
    role: '货主查询运单与对账的自助入口',
    env: '生产',
    status: 'healthy',
    owner: '林拾',
    uptime: 99.91,
    successRate: 99.6,
    budgetUsed: 19,
    activeAlerts: 0,
    peak: 780,
    latencyBase: 1520,
    latencyThreshold: 3000,
    errorBase: 0.24,
    cpuBase: 36,
    memoryBase: 51,
    seed: 1601,
    extraKpis: [
      kpi('LCP 最大内容绘制', '2.62', 's', '对账表格首屏较重', 'healthy'),
      kpi('JS 错误率', '0.26', '%', '按会话统计 · 阈值 1%', 'healthy'),
      kpi('静态资源命中率', '94.2', '%', '内网直连，未走 CDN', 'healthy'),
    ],
    services: [
      svc('门户渲染服务', '核心', 'healthy', 104, 99.95, '2 / 2', 1611),
      svc('运单查询接口', '外部', 'healthy', 286, 99.9, '3 / 3', 1612),
      svc('权限中心', '外部', 'healthy', 46, 99.99, '3 / 3', 1613),
    ],
    events: [
      ev('13:34', '版本发布', '对账单导出改为异步生成，首屏耗时下降 1.1s', 'healthy'),
      ev('09:20', '权限变更', '新增货主子账号角色，涉及 8 个页面', 'neutral'),
      ev('04:00', '定期巡检', '关键路径拨测全部通过', 'healthy'),
    ],
  }),

  // ==================== API 服务 ====================

  buildProject({
    id: 'platform-payment',
    name: '平台-统一支付网关',
    kind: 'api',
    role: '多客户共用的收单与渠道路由',
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
      kpi('上游依赖超时数', '520', '次', '银行渠道适配器返回 504', 'critical'),
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
    id: 'platform-auth',
    name: '平台-统一认证中心',
    kind: 'api',
    role: '多客户共用的单点登录与令牌签发',
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
    id: 'platform-openapi',
    name: '平台-开放接口网关',
    kind: 'api',
    role: '对客户与合作方开放的统一入口',
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
      ev('14:10', '配额调整', '为恒益物流临时上调 QPS 配额至 800', 'neutral'),
      ev('10:26', '接口下线', 'v1 版商品接口进入下线倒计时，剩余 30 天', 'warning'),
      ev('07:15', '容量扩缩', '按流量预测自动扩容至 4 实例', 'neutral'),
    ],
  }),

  buildProject({
    id: 'hengyi-waybill-api',
    name: '恒益物流-运单查询接口',
    kind: 'api',
    role: '对外提供运单状态与轨迹查询',
    env: '生产',
    status: 'healthy',
    owner: '许知白',
    uptime: 99.94,
    successRate: 99.7,
    budgetUsed: 24,
    activeAlerts: 0,
    peak: 3200,
    latencyBase: 286,
    latencyThreshold: 1000,
    errorBase: 0.3,
    cpuBase: 44,
    memoryBase: 54,
    seed: 2401,
    extraKpis: [
      kpi('限流拒绝数', '486', '次', '近 24 小时 · 单一货主刷单所致', 'healthy'),
      kpi('鉴权失败率', '0.86', '%', '阈值 2% · 正常波动', 'healthy'),
      kpi('上游依赖超时数', '22', '次', '承运商回传接口偶发', 'healthy'),
    ],
    services: [
      svc('查询服务', '核心', 'healthy', 62, 99.96, '4 / 4', 2411),
      svc('运单轨迹缓存', '存储', 'healthy', 8, 99.99, '3 / 3', 2412),
      svc('承运商回传适配器', '外部', 'healthy', 640, 99.7, '2 / 2', 2413),
    ],
    events: [
      ev('14:44', '缓存优化', '热点运单命中率由 0.71 提升至 0.88', 'healthy'),
      ev('11:02', '承运商接入', '新增一家区域承运商的轨迹回传', 'neutral'),
      ev('08:30', '容量扩缩', '按流量预测自动扩容至 4 实例', 'neutral'),
    ],
  }),

  // ==================== AI Agent ====================

  buildProject({
    id: 'xinhuan-cs-agent',
    name: '新环家电-售后客服 Agent',
    kind: 'agent',
    role: '多轮对话与售后工单自动处理',
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
      ev('12:30', '提示词更新', '售后话术模板 v7 上线，平均输入长度 +18%', 'neutral'),
      ev('09:20', '模型切换', '主模型切换至长上下文版本，单价上浮 12%', 'neutral'),
    ],
  }),

  buildProject({
    id: 'yunqi-booking-agent',
    name: '云栖健康-预约助手 Agent',
    kind: 'agent',
    role: '引导用户完成预约、改期与提醒',
    env: '生产',
    status: 'healthy',
    owner: '林拾',
    uptime: 99.95,
    successRate: 99.2,
    budgetUsed: 16,
    activeAlerts: 0,
    peak: 860,
    latencyBase: 980,
    latencyThreshold: 2000,
    errorBase: 0.24,
    cpuBase: 42,
    memoryBase: 58,
    seed: 3301,
    extraKpis: [
      kpi('24h Token 消耗', '0.31', '亿', '折算成本 ¥386', 'healthy'),
      kpi('工具调用失败率', '0.60', '%', '仅排班与短信两个工具', 'healthy'),
      kpi('上下文溢出次数', '6', '次', '远低于阈值 100 次/小时', 'healthy'),
    ],
    services: [
      svc('Agent 编排引擎', '核心', 'healthy', 16, 99.98, '3 / 3', 3311),
      svc('LLM 网关', '模型', 'healthy', 720, 99.92, '4 / 4', 3312),
      svc('预约排班服务', '业务', 'healthy', 164, 99.94, '3 / 3', 3313),
    ],
    events: [
      ev('14:06', '话术更新', '改期挽留话术上线，改期成功率提升 9%', 'healthy'),
      ev('10:34', '工具接入', '新增"查询医师排班"工具', 'neutral'),
      ev('05:00', '定期巡检', '预约意图识别抽样评测得分 0.94', 'healthy'),
    ],
  }),

  buildProject({
    id: 'platform-kb-agent',
    name: '平台-知识库检索 Agent',
    kind: 'agent',
    role: '面向各客户坐席的语义检索与引用生成',
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
      ev('13:40', '索引重建', '六家客户知识库增量重建完成，新增 12,480 个切片', 'neutral'),
      ev('10:02', '召回调优', '相似度阈值由 0.5 调至 0.46，空召回率下降 38%', 'healthy'),
      ev('04:00', '定期巡检', '召回质量抽样评测得分 0.91', 'healthy'),
    ],
  }),

  // ==================== 数据管道 ====================

  buildProject({
    id: 'platform-order-sync',
    name: '平台-订单数据同步管道',
    kind: 'pipeline',
    role: '各客户业务库变更实时同步至数仓',
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
      svc('数仓写入器', '存储', 'critical', 6240, 96.8, '3 / 4', 4113),
      svc('元数据服务', '元数据', 'healthy', 22, 99.97, '2 / 2', 4114),
      svc('数据质量校验', '质量', 'warning', 340, 99.5, '2 / 2', 4115),
    ],
    events: [
      ev('15:02', '仍在处置', '积压量从 214 万降至 182 万，预计 40 分钟追平', 'warning'),
      ev('14:35', '扩容执行', 'Flink 并行度由 8 提升至 16', 'neutral'),
      ev('14:12', '严重告警触发', '积压条数 182 万超出阈值 50 万', 'critical'),
      ev('13:58', '上游突增', '新环家电批量刷数，变更量瞬时上涨 6 倍', 'critical'),
    ],
  }),

  buildProject({
    id: 'platform-event-stream',
    name: '平台-埋点采集流',
    kind: 'pipeline',
    role: '各客户端埋点的接收、清洗与分发',
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
    id: 'xinhuan-stock-sync',
    name: '新环家电-商品库存同步',
    kind: 'pipeline',
    role: '门店与电商库存的双向实时同步',
    env: '生产',
    status: 'healthy',
    owner: '陈见山',
    uptime: 99.92,
    successRate: 99.4,
    budgetUsed: 31,
    activeAlerts: 0,
    peak: 4200,
    latencyBase: 26,
    latencyThreshold: 120,
    errorBase: 0.36,
    cpuBase: 58,
    memoryBase: 64,
    seed: 4301,
    extraKpis: [
      kpi('积压条数', '0.8', '万', '阈值 10 万', 'healthy'),
      kpi('端到端时延', '41', '秒', '阈值 2 分钟', 'healthy'),
      kpi('脏数据占比', '0.60', '%', '主要为门店条码不规范', 'healthy'),
    ],
    services: [
      svc('库存变更队列', '队列', 'healthy', 14, 99.98, '4 / 4', 4311),
      svc('同步计算服务', '计算', 'healthy', 180, 99.94, '4 / 4', 4312),
      svc('ERP 适配器', '外部', 'healthy', 420, 99.76, '2 / 2', 4313),
    ],
    events: [
      ev('12:16', '促销期扩容', '秒杀开始前并行度由 4 提升至 8', 'neutral'),
      ev('09:50', '策略调整', '门店与电商冲突时以门店实盘为准', 'neutral'),
      ev('02:30', '定期巡检', '全量库存对齐校验通过，差异 0 条', 'healthy'),
    ],
  }),

  buildProject({
    id: 'hengyi-track-stream',
    name: '恒益物流-运单轨迹流',
    kind: 'pipeline',
    role: '承运商轨迹回传的实时归集',
    env: '生产',
    status: 'healthy',
    owner: '许知白',
    uptime: 99.97,
    successRate: 99.9,
    budgetUsed: 8,
    activeAlerts: 0,
    peak: 9600,
    latencyBase: 12,
    latencyThreshold: 60,
    errorBase: 0.12,
    cpuBase: 47,
    memoryBase: 55,
    seed: 4401,
    extraKpis: [
      kpi('积压条数', '1.4', '万', '阈值 20 万', 'healthy'),
      kpi('端到端时延', '18', '秒', '阈值 2 分钟', 'healthy'),
      kpi('脏数据占比', '0.30', '%', '个别承运商时区字段异常', 'healthy'),
    ],
    services: [
      svc('轨迹接收网关', '核心', 'healthy', 18, 99.99, '6 / 6', 4411),
      svc('归集计算集群', '计算', 'healthy', 96, 99.96, '4 / 4', 4412),
      svc('分发消息队列', '队列', 'healthy', 10, 99.99, '4 / 4', 4413),
    ],
    events: [
      ev('11:02', '承运商接入', '新增一家区域承运商，日增轨迹点约 40 万', 'neutral'),
      ev('08:14', '容量扩缩', '按流量预测自动扩容至 6 实例', 'neutral'),
      ev('01:20', '定期巡检', '轨迹点去重与排序校验通过', 'healthy'),
    ],
  }),

  // ==================== 定时任务 ====================

  buildProject({
    id: 'platform-recon',
    name: '平台-每日对账批处理',
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
    id: 'platform-report',
    name: '平台-经营报表生成',
    kind: 'job',
    role: '按客户定时生成经营报表并推送',
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
      ev('13:18', '批次完成', '六家客户日报生成并推送 46 个收件人，耗时 16 分钟', 'healthy'),
      ev('07:22', '批次完成', '晨报生成完成，耗时 21 分钟', 'healthy'),
      ev('01:40', '批次完成', '昨日经营汇总完成，耗时 24 分钟', 'healthy'),
    ],
  }),

  buildProject({
    id: 'jianyu-price-job',
    name: '简屿家居-促销价格刷新',
    kind: 'job',
    role: '按活动排期批量刷新商品价格',
    env: '生产',
    status: 'healthy',
    owner: '周宛清',
    uptime: 99.9,
    successRate: 99.2,
    budgetUsed: 27,
    activeAlerts: 0,
    peak: 6,
    latencyBase: 14,
    latencyThreshold: 30,
    errorBase: 0.4,
    cpuBase: 38,
    memoryBase: 46,
    seed: 5301,
    extraKpis: [
      kpi('错过排期次数', '0', '次', '近 7 天全部准点', 'healthy'),
      kpi('平均执行时长', '11', '分钟', '基线 25 分钟', 'healthy'),
      kpi('重试次数', '2', '次', '近 24 小时 · 商品中心限流', 'healthy'),
    ],
    services: [
      svc('任务调度器', '调度', 'healthy', 8, 99.99, '2 / 2', 5311),
      svc('价格计算服务', '计算', 'healthy', 340, 99.93, '2 / 2', 5312),
      svc('商品中心接口', '外部', 'healthy', 180, 99.95, '2 / 2', 5313),
    ],
    events: [
      ev('13:12', '批次完成', '秋季家纺专场价格刷新 4,820 个 SKU，耗时 12 分钟', 'healthy'),
      ev('07:08', '批次完成', '日常价回滚完成，耗时 9 分钟', 'healthy'),
      ev('01:06', '批次完成', '次日活动价预热完成，耗时 13 分钟', 'healthy'),
    ],
  }),

  buildProject({
    id: 'xingye-daily-close',
    name: '星野烘焙-门店日结',
    kind: 'job',
    role: '各门店当日营业数据结算与报送',
    env: '生产',
    status: 'healthy',
    owner: '陈见山',
    uptime: 99.88,
    successRate: 98.9,
    budgetUsed: 38,
    activeAlerts: 0,
    peak: 4,
    latencyBase: 28,
    latencyThreshold: 60,
    errorBase: 0.6,
    cpuBase: 44,
    memoryBase: 52,
    seed: 5401,
    extraKpis: [
      kpi('错过排期次数', '0', '次', '近 7 天全部准点', 'healthy'),
      kpi('平均执行时长', '23', '分钟', '基线 45 分钟', 'healthy'),
      kpi('重试次数', '3', '次', '近 24 小时 · 个别门店 POS 离线', 'healthy'),
    ],
    services: [
      svc('任务调度器', '调度', 'healthy', 8, 99.99, '2 / 2', 5411),
      svc('日结计算服务', '计算', 'healthy', 620, 99.9, '3 / 3', 5412),
      svc('门店 POS 数据源', '外部', 'healthy', 240, 99.84, '2 / 2', 5413),
    ],
    events: [
      ev('13:26', '批次完成', '午市日结完成，覆盖 38 家门店，耗时 24 分钟', 'healthy'),
      ev('07:18', '门店接入', '新开 2 家门店接入日结，总数达 38 家', 'neutral'),
      ev('01:30', '批次完成', '昨日全量日结完成，耗时 26 分钟', 'healthy'),
    ],
  }),

  // ==================== 数据库 ====================

  buildProject({
    id: 'platform-primary-db',
    name: '平台-主库集群',
    kind: 'database',
    role: '多客户交易数据的主存储',
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
      kpi('慢查询数', '260', '条', '近 24 小时 · 集中在对账表', 'warning'),
      kpi('主从复制延迟', '3.20', 's', '阈值 3s · 已超出', 'warning'),
    ],
    services: [
      svc('主节点', '主库', 'healthy', 8, 99.99, '1 / 1', 6111),
      svc('只读副本 A', '副本', 'healthy', 12, 99.98, '1 / 1', 6112),
      svc('只读副本 B', '副本', 'warning', 46, 99.72, '1 / 1', 6113),
      svc('连接池代理', '代理', 'warning', 4, 99.9, '2 / 2', 6114),
    ],
    events: [
      ev('14:52', '连锁影响', '统一支付网关重试放大，连接池占用升至 86%', 'warning'),
      ev('12:30', '索引优化', '对账表新增复合索引，慢查询下降 41%', 'healthy'),
      ev('03:20', '备份完成', '全量备份完成并校验通过，耗时 38 分钟', 'healthy'),
    ],
  }),

  buildProject({
    id: 'platform-cache',
    name: '平台-Redis 缓存集群',
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

  buildProject({
    id: 'xinhuan-order-db',
    name: '新环家电-订单库',
    kind: 'database',
    role: '电商订单与售后单据的独立库',
    env: '生产',
    status: 'healthy',
    owner: '许知白',
    uptime: 99.95,
    successRate: 99.97,
    budgetUsed: 29,
    activeAlerts: 0,
    peak: 3600,
    latencyBase: 11,
    latencyThreshold: 100,
    errorBase: 0.02,
    cpuBase: 54,
    memoryBase: 68,
    seed: 6301,
    extraKpis: [
      kpi('连接池占用', '62', '%', '阈值 80%', 'healthy'),
      kpi('慢查询数', '48', '条', '近 24 小时 · 售后单模糊查询', 'healthy'),
      kpi('主从复制延迟', '0.80', 's', '阈值 3s', 'healthy'),
    ],
    services: [
      svc('主节点', '主库', 'healthy', 7, 99.98, '1 / 1', 6311),
      svc('只读副本', '副本', 'healthy', 11, 99.97, '1 / 1', 6312),
      svc('连接池代理', '代理', 'healthy', 3, 99.99, '2 / 2', 6313),
    ],
    events: [
      ev('14:18', '分区归档', '归档 2025 年订单至冷存储，主表体积下降 22%', 'healthy'),
      ev('11:44', '索引优化', '售后单新增时间范围索引，慢查询下降 36%', 'healthy'),
      ev('03:50', '备份完成', '全量备份完成并校验通过，耗时 19 分钟', 'healthy'),
    ],
  }),

  buildProject({
    id: 'platform-warehouse',
    name: '平台-数据仓库',
    kind: 'database',
    role: '全客户经营数据的分析型存储',
    env: '生产',
    status: 'healthy',
    owner: '林拾',
    uptime: 99.98,
    successRate: 99.99,
    budgetUsed: 6,
    activeAlerts: 0,
    peak: 1200,
    latencyBase: 320,
    latencyThreshold: 3000,
    errorBase: 0.01,
    cpuBase: 61,
    memoryBase: 73,
    seed: 6401,
    extraKpis: [
      kpi('连接池占用', '44', '%', '阈值 80%', 'healthy'),
      kpi('慢查询数', '12', '条', '近 24 小时 · 均为跨年宽表扫描', 'healthy'),
      kpi('主从复制延迟', '0.40', 's', '阈值 3s', 'healthy'),
    ],
    services: [
      svc('计算节点', '计算', 'healthy', 280, 99.98, '6 / 6', 6411),
      svc('元数据服务', '元数据', 'healthy', 18, 99.99, '2 / 2', 6412),
      svc('对象存储层', '存储', 'healthy', 42, 100, '全域', 6413),
    ],
    events: [
      ev('14:02', '分区重建', '订单宽表按月重分区，扫描量下降 41%', 'healthy'),
      ev('09:36', '查询优化', '经营看板查询改走物化视图，耗时由 8s 降至 1.2s', 'healthy'),
      ev('02:40', '定期巡检', '各客户数据隔离校验通过', 'healthy'),
    ],
  }),
]

/**
 * 平台纳管的项目总数。
 *
 * 上面的 PROJECTS 只有 24 个——那是**总览页展示的重点关注项目**（有活跃告警的、
 * 以及各客户的核心业务系统），不是平台管的全部。真实的运维平台不会把几十上百个项目
 * 平铺在首屏，总览页永远是筛过的。
 *
 * 因此凡是描述"平台整体规模"的计数（在线项目、SLO 达标数、纳管组件数）都以这个数为准，
 * 而分组卡片、项目切换器这些"逐个列出来"的地方仍然是 24。两者不是矛盾，是两个口径，
 * 页面副标题里已经把这层关系写明白了——改动时不要把它们"对齐"成同一个数。
 */
export const MANAGED_PROJECT_TOTAL = 78

/** 详情页默认落在的项目。刻意选一个非 Agent 的项目，模板的定位是通用监控。 */
export const DEFAULT_PROJECT_ID = 'platform-payment'

/**
 * 预算排行图只画消耗最高的这几个项目；24 条横向条形会把面板撑得过高。
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

/** 按类型分组，顺序跟随 PROJECTS 里各类型首次出现的次序，用于总览页的分组展示。 */
export function groupProjectsByKind(): { kind: ProjectKind; projects: Project[] }[] {
  const groups = new Map<ProjectKind, Project[]>()
  for (const project of PROJECTS) {
    const list = groups.get(project.kind)
    if (list) list.push(project)
    else groups.set(project.kind, [project])
  }
  return [...groups.entries()].map(([kind, projects]) => ({ kind, projects }))
}

export type { Project }
