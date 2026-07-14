// src/components/pages/studio/data.ts
// 研发团队页的纯数据层：CTO 资料 + 项目清单。不含 JSX 与客户端逻辑。

import type { ThemeKey } from '../ai-coding-camp/data'

export const CTO_PROFILE = {
  name: '十一',
  nameEn: 'SHI YI',
  title: '创业公司 CTO',
  avatarUrl:
    'https://weelume-pro-1420922170.cos.ap-shanghai.myqcloud.com/website/instructor/shiyi.jpg',
  avatarPosition: '50% 22%',
  quote: '这里的每个部门，我都会亲自参与关键决策。',
}

export type ProjectTierKey = 'basic' | 'medium' | 'advanced'

export type ProjectTier = {
  label: string
  stars: string
  theme: ThemeKey
}

export const PROJECT_TIERS: Record<ProjectTierKey, ProjectTier> = {
  basic: { label: '基础级', stars: '⭐⭐', theme: 'mindset' },
  medium: { label: '中等级', stars: '⭐⭐⭐', theme: 'cognition' },
  advanced: { label: '进阶级', stars: '⭐⭐⭐⭐', theme: 'launch' },
}

// 分类标签：按用户要求不出现"传统"二字，AI 相关项目统一标"AI项目"
export type ProjectCategory = '系统项目' | 'AI项目' | '系统+AI'

export type Project = {
  code: string
  title: string
  category: ProjectCategory
  tier: ProjectTierKey
  businessValue: string
  hiringFocus: string
}

// 20 个课程实战项目，按难度分三档；每张卡片含"业务价值"与"招聘重点"两段完整文案，不做截断
export const PROJECTS: Project[] = [
  {
    code: '01',
    title: '营销短链与投放归因系统',
    category: '系统项目',
    tier: 'basic',
    businessValue:
      '短信按字数计费，短链直接省投放成本；更关键的是渠道归因——市场部投了十个渠道，钱花在哪个渠道有转化，靠它说话。没有归因数据，投放预算就是盲投。',
    hiringFocus:
      '企业招营销技术（MarTech）和增长工程方向时，看重的就是"懂投放链路的工程师"——既能写高可用服务，又理解转化漏斗和归因逻辑的人，在增长团队里非常抢手。',
  },
  {
    code: '02',
    title: '会议纪要生成与待办任务提取工具',
    category: 'AI项目',
    tier: 'basic',
    businessValue:
      '会议是企业最贵的时间开销，纪要整理和待办跟进又长期靠人肉，漏记漏办是管理黑洞。自动转写、提炼待办并同步到任务系统，直接压缩管理成本、提升执行闭环率。',
    hiringFocus:
      '企业效率工具和 AI 办公赛道正在集中招"能把 LLM 接进真实工作流"的工程师，看重的是端到端管道能力：语音处理、模型调用、结构化输出、与办公系统的集成对接。',
  },
  {
    code: '03',
    title: '浏览器插件：网页摘要与划词问答',
    category: 'AI项目',
    tier: 'basic',
    businessValue:
      '这是可以真实上架、真实获客的独立产品，价值直接用安装量和留存说话。信息过载是普遍痛点，摘要与划词问答切的是知识工作者每天都在发生的场景。',
    hiringFocus:
      '企业招 AI 应用产品工程师时格外看重"独立交付过完整产品"的人——从开发、上架、获客到迭代全链路走过一遍，这种 owner 心态和产品感是大量岗位 JD 里明写的要求。',
  },
  {
    code: '04',
    title: '用户行为分析平台（埋点系统）',
    category: '系统项目',
    tier: 'medium',
    businessValue:
      '增长和运营的所有决策——渠道质量、转化漏斗、功能留存——都建立在行为数据上；而数据合规要求越来越严，行为数据不出内网成为大量企业私有化自建的直接动因。',
    hiringFocus:
      '数据工程是长期供不应求的方向。企业招的是懂"高吞吐写入 + OLAP 分析"这套数据架构的人：SDK 采集、实时接收、ClickHouse 类分析库、漏斗留存模型，正好是数据平台岗位的核心技能画像。',
  },
  {
    code: '05',
    title: '统一认证与权限中台（SSO + RBAC）',
    category: '系统项目',
    tier: 'medium',
    businessValue:
      '公司系统一多，账号密码各自为政就是安全事故温床和管理噩梦；统一认证是安全合规（等保、审计）的基础设施，员工入离职的权限收发效率直接关系数据安全。',
    hiringFocus:
      '安全与基础平台方向的硬需求。企业看重的是真正理解认证授权体系的工程师——OAuth2、单点登录、权限模型不是背概念，而是设计并运营过被多个系统依赖的服务，这种"平台方"经验在中大厂内部平台团队招聘里是明确加分项。',
  },
  {
    code: '06',
    title: '企业知识库智能问答系统（RAG）',
    category: 'AI项目',
    tier: 'medium',
    businessValue:
      '企业知识散落在文档、wiki、聊天记录里，新人上手慢、老员工重复答疑，都是隐性人力成本；私有化知识问答让内部知识变成可检索资产，且数据不出内网满足合规。',
    hiringFocus:
      'RAG 是当前企业 AI 落地量最大的形态，几乎所有招"大模型应用工程师"的 JD 都点名要求 RAG 经验——检索质量优化、引用溯源、幻觉抑制，是这个岗位面试的核心盘问区。',
  },
  {
    code: '07',
    title: '智能客服工单系统',
    category: 'AI项目',
    tier: 'medium',
    businessValue:
      '客服是人力密集成本中心，AI 分流常见问题能直接把人力成本砍下一截，同时保住响应速度和满意度；AI 解决率、转人工率这些指标直接换算成钱。',
    hiringFocus:
      '企业采购或自建 AI 客服时最缺的是"懂业务流的 AI 工程师"——不是会调 API，而是能设计置信度兜底、人机交接、工单状态流转的完整方案。客服中台经验在电商、SaaS、金融的招聘里都直接对口。',
  },
  {
    code: '08',
    title: '合同/文档智能审查工具',
    category: 'AI项目',
    tier: 'medium',
    businessValue:
      '中小企业没有专职法务，合同风险靠肉眼；大企业法务被海量合同淹没。AI 初筛风险条款把法务从重复劳动里解放出来，审查周期从天级压到分钟级。',
    hiringFocus:
      '法律科技和更广的"AI + 专业服务"赛道在扩张，企业招的是能处理长文档、保证输出可靠性的工程师——结果必须可溯源、可定位原文，这种对准确性苛刻的场景经验比聊天机器人经验值钱得多。',
  },
  {
    code: '09',
    title: 'AI 论文阅读助手',
    category: 'AI项目',
    tier: 'medium',
    businessValue:
      '面向研究生和科研人员的真实工具产品，文献阅读效率是这个群体愿意付费的痛点；可真实运营、真实积累用户，价值用留存和口碑说话。',
    hiringFocus:
      '复杂文档解析（双栏排版、公式、图表）+ 长文本处理是 AI 应用岗的高频技术要求，知识管理和教育科技类公司招聘时对这类经验直接对口。',
  },
  {
    code: '10',
    title: '电商订单中台（OMS）',
    category: '系统项目',
    tier: 'medium',
    businessValue:
      '订单是电商公司的心脏——所有的钱都从这里流过。订单状态错乱、支付回调丢失、超时不关单，每一个都直接造成资损或客诉，它的稳定性就是公司的营收底线。',
    hiringFocus:
      '电商类公司招后端时，交易系统经验是含金量最高的一档——状态机设计、支付幂等、最终一致性，这些是"碰过钱的系统"才有的经验，招聘方用它区分业务 CRUD 工程师和交易工程师。',
  },
  {
    code: '11',
    title: '优惠券与营销活动系统',
    category: '系统项目',
    tier: 'medium',
    businessValue:
      '促销是拉新和转化的核心武器，而营销预算是被薅羊毛的重灾区——发券的并发峰值、防刷风控、核销对账，任何一环失守都是真金白银的损失。',
    hiringFocus:
      '消费互联网公司的营销系统团队常年招人，看重的是"高并发 + 资损防控"的复合经验：既扛得住瞬时流量，又懂风控规则和资金安全意识，这在电商、本地生活、出行类公司都是通用硬通货。',
  },
  {
    code: '12',
    title: '多租户 SaaS 客户管理系统（CRM）',
    category: '系统项目',
    tier: 'medium',
    businessValue:
      'CRM 是 toB SaaS 里最大的品类之一，客户资料、销售跟进、成交漏斗是每家有销售团队的公司都要管的资产；多租户架构决定了 SaaS 的成本结构和数据安全底线。',
    hiringFocus:
      '国内 SaaS 赛道扩张但懂多租户的工程师稀缺——数据隔离方案的取舍、租户级配置、跨租户安全防线，是 SaaS 公司招聘时反复确认的核心能力，有这段经验等于拿到赛道入场券。',
  },
  {
    code: '13',
    title: 'AI 内容审核中台',
    category: '系统+AI',
    tier: 'medium',
    businessValue:
      '有 UGC 就必须审核，这是写进法规的合规刚需，审核不力直接面临下架处罚；纯人审成本高、纯规则漏判多，"规则快筛 + LLM 语义审核 + 人审兜底"的三层漏斗是行业标准解法。',
    hiringFocus:
      '内容平台、社区、游戏公司的风控审核团队持续招人，看重的是既懂工程漏斗设计、又懂 AI 语义理解能力边界的人；合规类系统经验还自带"稳健可靠"的印象分。',
  },
  {
    code: '14',
    title: '平台内嵌 IM（买卖家/客服沟通系统）',
    category: '系统项目',
    tier: 'advanced',
    businessValue:
      '电商、招聘、二手交易平台都必须自建站内沟通——把用户留在平台内是交易安全和抽佣模式的前提，消息丢失或延迟直接影响成交。',
    hiringFocus:
      '长连接与消息可靠性是一套通用稀缺功底，IM、推送、实时协同、车联网全都依赖它；招聘方非常清楚"能把消息不丢不重不乱做出来"的工程师和"会用 WebSocket"的工程师是两个价位。',
  },
  {
    code: '15',
    title: '招聘笔试评测系统',
    category: '系统项目',
    tier: 'advanced',
    businessValue:
      '技术招聘的笔试环节需要安全地执行候选人提交的任意代码并自动判分，牛客、赛码这类产品支撑着企业校招的海量笔试场次；判分的公正性和评测机的安全性是产品生命线。',
    hiringFocus:
      '安全沙箱（隔离、资源限制、防逃逸）是极少有人真正做过的领域，招聘科技、在线教育、云厂商（在线运行环境）都需要这个能力；"如何安全执行不可信代码"的实战经验在安全和基础设施岗位上辨识度极高。',
  },
  {
    code: '16',
    title: '企业文件协作系统（私有化网盘）',
    category: '系统项目',
    tier: 'advanced',
    businessValue:
      '设计稿、合同、代码资产不能放公有云网盘，是金融、制造、政企客户的普遍合规要求，私有化文件系统是数据安全采购清单上的常客；大文件传输体验（断点续传、秒传）直接决定产品可用性。',
    hiringFocus:
      '存储方向的工程师长期稀缺——多数人只会调云存储 SDK，理解分片、去重、一致性的人才能进入云厂商和存储产品公司的候选池。',
  },
  {
    code: '17',
    title: '统一任务调度中台',
    category: '系统项目',
    tier: 'advanced',
    businessValue:
      '对账、报表、数据同步、消息推送，公司业务跑起来后定时任务会膨胀到几十上百个，散落各处的 crontab 就是故障黑箱；统一调度让任务可视、可控、可追溯，是稳定性建设的基础件。',
    hiringFocus:
      '这是从"业务开发"跨入"基础架构"的标志性经验——分布式锁、幂等、重试补偿、DAG 依赖编排，中间件团队和稳定性团队招聘时就认这套东西。',
  },
  {
    code: '18',
    title: 'AI 工作流编排平台（类 Dify 简化版）',
    category: 'AI项目',
    tier: 'advanced',
    businessValue:
      '企业 AI 需求爆炸但工程师有限，让运营、客服等非技术岗自己拖拽搭建 AI 流程，是把 AI 产能规模化的唯一解——这正是 Dify、Coze 被大量企业引入后又纷纷定制自研的原因。',
    hiringFocus:
      '这是当前 LLM 应用层最热的产品形态，相关公司在密集招人；它同时考察前端画布、后端 DAG 引擎、LLM 集成三块能力，招聘方视之为"全栈 + AI"的复合信号，单项目含金量全场最高。',
  },
  {
    code: '19',
    title: '业务自助取数平台（NL 转 SQL）',
    category: 'AI项目',
    tier: 'advanced',
    businessValue:
      '每家公司数据团队都被业务方的临时取数需求淹没，排期以周计；让业务人员用自然语言直接查数，把数据团队从"人肉 SQL 机"里解放出来，是数据中台建设的当红方向。',
    hiringFocus:
      'Text-to-SQL 是企业数据侧最热的 AI 需求，BI 厂商和各公司数据平台团队都在招；考察点是 schema 理解、生成 SQL 的安全校验（防注入、防全表扫描）、查询结果可视化，数据 + AI 的复合背景在市场上溢价明显。',
  },
  {
    code: '20',
    title: '演出票务抢购平台',
    category: '系统项目',
    tier: 'advanced',
    businessValue:
      '演出市场火爆，开票瞬间的流量洪峰是票务平台的生死时刻——超卖是资损和公关事故，系统崩溃就是把生意让给对手；座位锁定与释放的准确性直接关系用户付款体验。',
    hiringFocus:
      '高并发交易经验是后端招聘金字塔的上层——瞬时洪峰下的库存准确性、削峰限流、状态管理，配上真实压测数据，这是所有高流量业务（电商、出行、票务、游戏）通用的核心能力凭证。',
  },
]
