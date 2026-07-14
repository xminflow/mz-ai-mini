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

export type ProjectCategory = '传统' | 'LLM'

export type Project = {
  code: string
  title: string
  category: ProjectCategory
  tier: ProjectTierKey
  body: string
}

// 20 个课程实战项目，按难度分三档；每张卡片的核心价值段落均为完整文案，不做截断
export const PROJECTS: Project[] = [
  {
    code: '01',
    title: '短链接服务与访问统计平台',
    category: '传统',
    tier: 'basic',
    body: '麻雀虽小五脏俱全的系统设计题实体化。发号器怎么设计、哈希冲突怎么处理、301 还是 302、热点链接怎么缓存、访问统计怎么异步化——每一个决策都是面试经典题。学员做完这个项目，等于把"系统设计入门"整章内容变成了亲手踩过的路。',
  },
  {
    code: '02',
    title: '会议纪要生成与待办任务提取工具',
    category: 'LLM',
    tier: 'basic',
    body: '完整的"语音 → 文本 → 结构化信息"AI 管道。本地部署 Whisper 做转写（省 API 费还能讲本地模型部署经验），LLM 做摘要和待办提取，输出结构化 JSON 对接任务系统。企业办公自动化是 AI 落地最实在的场景，面试官一听就懂价值。',
  },
  {
    code: '03',
    title: '浏览器插件：网页摘要与划词问答',
    category: 'LLM',
    tier: 'basic',
    body: '差异化和演示效果。会写浏览器插件的初级工程师很少，简历上天然醒目；当场打开任意网页划词提问，demo 三十秒征服面试官。技术上覆盖插件架构（content script / background 通信）、页面内容提取、流式输出渲染。',
  },
  {
    code: '04',
    title: '服务监控告警平台',
    category: '传统',
    tier: 'medium',
    body: '可观测性（Observability）是后端和运维的硬通货技能。指标采集、时序数据存储、告警规则引擎、可视化大盘，做完等于把 Prometheus + Grafana 那套原理亲手实现了一遍。配合班级生态，监控对象就是其他团队的真实服务——简历上可以写"为 X 个团队的 Y 个服务提供监控"。',
  },
  {
    code: '05',
    title: '在线考试系统',
    category: '传统',
    tier: 'medium',
    body: '业务复杂度扎实的代表。自动组卷（题型、难度、知识点的约束求解）、防作弊（切屏检测、行为日志）、考试进行中的状态恢复（断网重连不丢答案）、交卷瞬间的并发。每个功能背后都有值得讲的设计决策，属于"越问越有料"的项目。',
  },
  {
    code: '06',
    title: '医院挂号预约平台',
    category: '传统',
    tier: 'medium',
    body: '秒杀的温和版 + 民生场景的亲切感。放号瞬间的抢号并发、号源库存的防超卖、候补队列的设计，核心技术点和秒杀同源但业务更真实。面试官都挂过号，业务背景零解释成本，学员可以把讲解火力全部集中在技术上。',
  },
  {
    code: '07',
    title: '博客社区与内容推荐系统',
    category: '传统',
    tier: 'medium',
    body: '内容型产品的通用架构。Feed 流的推模式 vs 拉模式、标签推荐的实现、热榜的滑动窗口计算——这套东西是知乎、小红书、掘金们的共同地基。做过它，学员面所有内容社区类公司都有对口话题。',
  },
  {
    code: '08',
    title: '统一认证与权限管理平台（SSO + RBAC）',
    category: '传统',
    tier: 'medium',
    body: '把后端面试的必考区做成实体。Session vs JWT 的取舍、OAuth2 授权码流程、单点登录与统一登出、RBAC 权限模型设计，全在这一个项目里。更独特的是"平台方"体验：全班其他团队的项目都接入它做登录，这个团队要写接入文档、发 SDK、答疑对接——简历上写"为 X 个业务系统提供统一认证服务"，这是别处买不到的经历。',
  },
  {
    code: '09',
    title: '企业知识库智能问答系统（RAG）',
    category: 'LLM',
    tier: 'medium',
    body: '当前企业 AI 落地的第一需求，没有之一。文档切分策略、向量化与检索、召回质量优化、引用溯源、幻觉抑制——RAG 已经成为 LLM 应用岗面试的必考题。语料直接用你的课程讲义，做出来还能给下一届学员当学习助手用。',
  },
  {
    code: '10',
    title: 'AI 模拟面试与评测平台',
    category: 'LLM',
    tier: 'medium',
    body: '题材自带传播性和自用价值。多轮对话的上下文管理、追问策略的 prompt 设计、回答质量的多维评分体系（评分标准怎么定、怎么保证评分稳定）——评测体系的设计深度是这个项目的护城河。做完之后全班学员用它练面试，又是一个"吃自己狗粮"的故事。',
  },
  {
    code: '11',
    title: '智能客服工单系统',
    category: 'LLM',
    tier: 'medium',
    body: 'AI 融入传统业务流的最典型范本。难的不是让 AI 回答，而是工程设计：置信度不够时怎么转人工、转接时上下文怎么交接、工单状态机怎么流转、AI 解决率怎么统计。企业真实采购 AI 客服时问的就是这些问题，学员等于提前做过一遍方案。',
  },
  {
    code: '12',
    title: '合同/文档智能审查工具',
    category: 'LLM',
    tier: 'medium',
    body: 'toB 场景 + 长文档处理的技术深度。超长合同的分块与上下文保持、风险条款的识别与定位（要能标注出原文位置，不能只给结论）、结构化审查报告输出。这类场景对准确率的苛刻要求，会逼着学员学会 prompt 工程之外的工程手段——校验、比对、置信度分层。',
  },
  {
    code: '13',
    title: 'AI 论文阅读助手',
    category: 'LLM',
    tier: 'medium',
    body: '工程量适中但效果出众的性价比之王。PDF 解析（公式、图表、双栏排版这些硬骨头）、长文本的分段 RAG、精读模式的追问设计。用户自传 PDF 零外部依赖，demo 拿一篇经典论文当场演示，效果直观。适合想做 LLM 但团队实力中等的组。',
  },
  {
    code: '14',
    title: '电商秒杀系统',
    category: '传统',
    tier: 'advanced',
    body: '高并发面试的顶流题材。Redis 原子扣减防超卖、消息队列削峰、多级限流、库存最终一致性——这些词面试官听了无数遍，但配上一份自己压出来的 JMeter 报告（"单机扛住了 X QPS，瓶颈在哪、怎么优化的"），立刻和背八股的人拉开身位。数据是这个项目的灵魂，没有压测报告等于白做。',
  },
  {
    code: '15',
    title: '即时通讯 IM 系统',
    category: '传统',
    tier: 'advanced',
    body: '消息可靠性协议设计，长连接场景的通用功底。WebSocket 只是入门，真正值钱的是 ack 确认、超时重发、消息去重、时序保证、离线消息同步这套协议设计能力。IM、推送、实时协同、物联网，所有长连接场景都吃这套功底，就业面极宽。',
  },
  {
    code: '16',
    title: '在线代码评测系统 OJ',
    category: '传统',
    tier: 'advanced',
    body: '安全 + 架构双考点，全场唯一深入沙箱隔离的项目。不可信代码的安全执行（Docker、资源限制、网络隔离、防逃逸）是别的项目摸不到的领域；判题任务的异步队列、评测机的水平扩展是标准的架构考点。"如何安全地执行用户提交的任意代码"这个问题本身就足够面试聊半小时。',
  },
  {
    code: '17',
    title: '分布式网盘系统',
    category: '传统',
    tier: 'advanced',
    body: '存储领域的经典三连——分片上传、断点续传、hash 秒传。大文件处理是很多业务绕不开的需求，但多数初级工程师只会调 OSS 的 SDK，理解分片合并、并发上传边界、去重原理的人稀缺。用本地 MinIO 做存储层，完全自足，还是四星里翻车率最低的稳健之选。',
  },
  {
    code: '18',
    title: '定时任务调度平台',
    category: '传统',
    tier: 'advanced',
    body: '中间件级别的面试素材。分布式环境下防止任务重复执行（抢锁）、失败重试的幂等设计、任务依赖的 DAG 编排、错过调度（misfire）的补偿策略。做业务的人多，做过"中间件"的人少——这个项目让学员的简历从"业务开发"档跳到"有基础架构视野"档。',
  },
  {
    code: '19',
    title: 'AI 工作流编排平台（类 Dify 简化版）',
    category: 'LLM',
    tier: 'advanced',
    body: 'LLM 应用层当下最热的产品形态，赛道直接对口。前端可视化画布（节点拖拽、连线）、后端 DAG 执行引擎（拓扑排序、循环检测、节点失败恢复）、LLM/检索/条件分支等节点类型的抽象设计。它本质是"传统硬架构 + LLM"的合体，一个项目同时回答"基本功行不行"和"懂不懂 AI 应用"两个质疑，是全部 20 个里单项目含金量的天花板。',
  },
  {
    code: '20',
    title: '自然语言数据分析助手（NL 转 SQL）',
    category: 'LLM',
    tier: 'advanced',
    body: 'Text-to-SQL 是企业数据侧最热的 AI 需求——让业务人员用人话查数据。schema 信息怎么喂给模型、生成 SQL 的校验与安全（防注入、防全表扫描）、执行结果自动选图表类型渲染。数据分析 + LLM 的复合背景，面数据平台、BI 方向的公司是直接命中。',
  },
]
