// src/components/pages/studio/data.ts
// 研发团队页的纯数据层：CTO 资料 + 项目清单。不含 JSX 与客户端逻辑。

import type { ThemeKey } from '../ai-coding-camp/data'

export const CTO_PROFILE = {
  name: '十一',
  nameEn: 'SHI YI',
  avatarUrl:
    'https://weelume-pro-1420922170.cos.ap-shanghai.myqcloud.com/website/instructor/shiyi.jpg',
  avatarPosition: '50% 22%',
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

// 10 个课程实战项目，按难度分三档；每张卡片含"业务价值"与"招聘重点"两段完整文案，不做截断
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
    title: '浏览器插件：网页摘要与划词问答',
    category: 'AI项目',
    tier: 'basic',
    businessValue:
      '这是可以真实上架、真实获客的独立产品，价值直接用安装量和留存说话。信息过载是普遍痛点，摘要与划词问答切的是知识工作者每天都在发生的场景。',
    hiringFocus:
      '企业招 AI 应用产品工程师时格外看重"独立交付过完整产品"的人——从开发、上架、获客到迭代全链路走过一遍，这种 owner 心态和产品感是大量岗位 JD 里明写的要求。',
  },
  {
    code: '03',
    title: '统一认证与权限中台（SSO + RBAC）',
    category: '系统项目',
    tier: 'medium',
    businessValue:
      '公司系统一多，账号密码各自为政就是安全事故温床和管理噩梦；统一认证是安全合规（等保、审计）的基础设施，员工入离职的权限收发效率直接关系数据安全。',
    hiringFocus:
      '安全与基础平台方向的硬需求。企业看重的是真正理解认证授权体系的工程师——OAuth2、单点登录、权限模型不是背概念，而是设计并运营过被多个系统依赖的服务，这种"平台方"经验在中大厂内部平台团队招聘里是明确加分项。',
  },
  {
    code: '04',
    title: '企业知识库智能问答系统（RAG）',
    category: 'AI项目',
    tier: 'medium',
    businessValue:
      '企业知识散落在文档、wiki、聊天记录里，新人上手慢、老员工重复答疑，都是隐性人力成本；私有化知识问答让内部知识变成可检索资产，且数据不出内网满足合规。',
    hiringFocus:
      'RAG 是当前企业 AI 落地量最大的形态，几乎所有招"大模型应用工程师"的 JD 都点名要求 RAG 经验——检索质量优化、引用溯源、幻觉抑制，是这个岗位面试的核心盘问区。',
  },
  {
    code: '05',
    title: '智能客服工单系统',
    category: 'AI项目',
    tier: 'medium',
    businessValue:
      '客服是人力密集成本中心，AI 分流常见问题能直接把人力成本砍下一截，同时保住响应速度和满意度；AI 解决率、转人工率这些指标直接换算成钱。',
    hiringFocus:
      '企业采购或自建 AI 客服时最缺的是"懂业务流的 AI 工程师"——不是会调 API，而是能设计置信度兜底、人机交接、工单状态流转的完整方案。客服中台经验在电商、SaaS、金融的招聘里都直接对口。',
  },
  {
    code: '06',
    title: '电商订单中台（OMS）',
    category: '系统项目',
    tier: 'medium',
    businessValue:
      '订单是电商公司的心脏——所有的钱都从这里流过。订单状态错乱、支付回调丢失、超时不关单，每一个都直接造成资损或客诉，它的稳定性就是公司的营收底线。',
    hiringFocus:
      '电商类公司招后端时，交易系统经验是含金量最高的一档——状态机设计、支付幂等、最终一致性，这些是"碰过钱的系统"才有的经验，招聘方用它区分业务 CRUD 工程师和交易工程师。',
  },
  {
    code: '07',
    title: '平台内嵌 IM（买卖家/客服沟通系统）',
    category: '系统项目',
    tier: 'advanced',
    businessValue:
      '电商、招聘、二手交易平台都必须自建站内沟通——把用户留在平台内是交易安全和抽佣模式的前提，消息丢失或延迟直接影响成交。',
    hiringFocus:
      '长连接与消息可靠性是一套通用稀缺功底，IM、推送、实时协同、车联网全都依赖它；招聘方非常清楚"能把消息不丢不重不乱做出来"的工程师和"会用 WebSocket"的工程师是两个价位。',
  },
  {
    code: '08',
    title: 'AI 工作流编排平台（类 Dify 简化版）',
    category: 'AI项目',
    tier: 'advanced',
    businessValue:
      '企业 AI 需求爆炸但工程师有限，让运营、客服等非技术岗自己拖拽搭建 AI 流程，是把 AI 产能规模化的唯一解——这正是 Dify、Coze 被大量企业引入后又纷纷定制自研的原因。',
    hiringFocus:
      '这是当前 LLM 应用层最热的产品形态，相关公司在密集招人；它同时考察前端画布、后端 DAG 引擎、LLM 集成三块能力，招聘方视之为"全栈 + AI"的复合信号，单项目含金量全场最高。',
  },
  {
    code: '09',
    title: '业务自助取数平台（NL 转 SQL）',
    category: 'AI项目',
    tier: 'advanced',
    businessValue:
      '每家公司数据团队都被业务方的临时取数需求淹没，排期以周计；让业务人员用自然语言直接查数，把数据团队从"人肉 SQL 机"里解放出来，是数据中台建设的当红方向。',
    hiringFocus:
      'Text-to-SQL 是企业数据侧最热的 AI 需求，BI 厂商和各公司数据平台团队都在招；考察点是 schema 理解、生成 SQL 的安全校验（防注入、防全表扫描）、查询结果可视化，数据 + AI 的复合背景在市场上溢价明显。',
  },
  {
    code: '10',
    title: '演出票务抢购平台',
    category: '系统项目',
    tier: 'advanced',
    businessValue:
      '演出市场火爆，开票瞬间的流量洪峰是票务平台的生死时刻——超卖是资损和公关事故，系统崩溃就是把生意让给对手；座位锁定与释放的准确性直接关系用户付款体验。',
    hiringFocus:
      '高并发交易经验是后端招聘金字塔的上层——瞬时洪峰下的库存准确性、削峰限流、状态管理，配上真实压测数据，这是所有高流量业务（电商、出行、票务、游戏）通用的核心能力凭证。',
  },
]

// 赠送课程（往期课程）大纲：手写层级树，无第三方思维导图库依赖
export type CourseNode = {
  title: string
  children?: CourseNode[]
}

export const COURSE_OUTLINE_TITLE = 'AI全栈技术专家训练营（往期课程）'

export const COURSE_OUTLINE: CourseNode[] = [
  {
    title: 'AI全栈技术入门基础',
    children: [
      {
        title: 'AI时代下的市场、产品以及计算机能力培养方向分析',
        children: [
          { title: 'AI市场前景分析' },
          { title: 'AI产品与项目方向分析' },
          { title: 'AI时代下技术栈学习规划' },
          { title: 'AI技术基础认识学习' },
        ],
      },
      {
        title: 'AI大模型应用开发基础认知',
        children: [
          { title: '提示词/上下文工程掌握' },
          { title: 'AI大模型核心技术概念理解' },
          { title: 'AI大模型基础核心API学习' },
          { title: 'AI大模型原生SDK开发' },
        ],
      },
    ],
  },
  {
    title: 'LangChain、LangGraph大模型应用框架精通',
    children: [
      {
        title: 'LangChain基础能力应用',
        children: [
          { title: '多模型适配接入与基础对话' },
          { title: 'Prompt管理' },
          { title: 'AI会话记忆管理' },
          { title: '工具调用/Function calling' },
          { title: '结构化输出' },
          { title: 'LCEL表达式详解' },
        ],
      },
      {
        title: 'LangChain之RAG与Embedding技术详解',
        children: [
          { title: 'RAG与上下文工程基础认知学习' },
          { title: 'Embedding模型使用与原理学习' },
          { title: '基于LangChain的RAG系统构建' },
          { title: '基于LangChain的ReRank精排技术讲解' },
        ],
      },
      {
        title: 'LangGraph基础能力应用',
        children: [
          { title: 'LangGraph核心结构详解' },
          { title: 'LangGraph工作流构建详解' },
          { title: 'LangGraph状态管理' },
        ],
      },
      {
        title: 'LangGraph应用模式进阶',
        children: [
          { title: 'LangGraph智能体构建' },
          { title: 'LangGraph记忆管理' },
          { title: 'LangGraph checkpointer机制详解与状态回溯' },
          { title: 'LangGraph人机协同模式（Human In The Loop）' },
        ],
      },
      { title: '实战训练 - 基于LangChain/LangGraph的基础客服系统实战' },
    ],
  },
  {
    title: 'LLamaIndex核心能力学习',
    children: [
      {
        title: 'LlamaIndex基础能力应用',
        children: [
          { title: 'LlamaIndex优劣势与场景分析' },
          { title: 'LlamaIndex基础结构与应用' },
          { title: 'LlamaIndex数据解析与存储详解' },
          { title: 'LlamaIndex基础索引构建' },
        ],
      },
      {
        title: 'LlamaIndex构建高级RAG系统与索引机制详解',
        children: [
          { title: 'LlamaIndex高阶索引与知识图谱构建' },
          { title: 'LlamaIndex查询与会话引擎详解' },
          { title: 'LlamaIndex会话与记忆系统详解' },
          { title: 'LlamaIndex后置处理与ReRank技术' },
          { title: 'LlamaIndex混合检索技术' },
        ],
      },
      {
        title: 'LlamaIndex智能体、工作流、评估器详解',
        children: [
          { title: 'LlamaIndex智能体应用构建' },
          { title: 'LlamaIndex工作流与人机交互技术(Human In The Loop)' },
          { title: 'LlamaIndex系统评估器应用' },
          { title: 'LlamaIndex系统观测' },
        ],
      },
      { title: '课后实战训练 - 基于LlamaIndex的知识库系统实战' },
    ],
  },
  {
    title: 'RAG与上下文工程',
    children: [
      {
        title: 'RAG技术进阶与向量数据库选型',
        children: [
          { title: 'Embedding技术原理解析' },
          { title: 'Embedding模型选型与开源模型应用' },
          { title: 'ReRank模型选型与开源模型应用' },
          { title: '向量数据库选型分析' },
        ],
      },
      {
        title: 'RAG知识图谱技术详解',
        children: [
          { title: '知识图谱技术基础认知' },
          { title: 'GraphRAG系统构建与优化' },
          { title: 'Rag知识图谱索引构建' },
          { title: 'GraphRag原理源码分析' },
        ],
      },
      {
        title: '优秀RAG项目分析学习',
        children: [
          { title: 'LightRAG轻量级知识图谱技术详解' },
          { title: '非标准格式数据解析与提取技术分析' },
          { title: 'RagFlow可视化RAG系统学习' },
        ],
      },
      {
        title: 'RAG系统评估与优化方案专题',
        children: [
          { title: 'Ragas评估系统详解' },
          { title: 'DeepEval评估系统详解' },
          { title: 'RAG系统优化分析' },
          { title: '数据集构建与数据合成技术分析' },
        ],
      },
      {
        title: 'AI大模型应用记忆管理方案专题',
        children: [
          { title: '记忆方案方案对比与优劣势分析' },
          { title: '基于知识图谱和向量检索的混合记忆管理' },
          { title: '最新记忆管理方案与技术框架分析' },
        ],
      },
    ],
  },
  {
    title: 'VIbeCoding全栈开发能力进阶',
    children: [
      {
        title: 'VibeCoding基础与工具应用',
        children: [
          { title: 'VibeCoding基础认知' },
          { title: 'Claude Code/Codex工具全解' },
          { title: 'Agent Skill与Command设计' },
          { title: 'VibeCoding规范驱动开发设计' },
        ],
      },
      {
        title: 'VIbeCoding之前端开发能力掌握',
        children: [
          { title: '前端基础知识掌握' },
          { title: '前端基础框架应用' },
          { title: '前端代码工程规范掌握' },
          { title: '前端工程构建与部署' },
        ],
      },
      {
        title: 'VibeCoding之Python后端开发能力掌握',
        children: [
          { title: 'Python生态基础开发框架' },
          { title: '后端代码与工程规范学习' },
          { title: 'Python与AI应用生态掌握' },
          { title: '后端工程构建与部署' },
        ],
      },
      {
        title: 'VibeCoding之Java后端开发能力掌握',
        children: [
          { title: 'Java后端开发基础' },
          { title: 'Java应用开发生态学习' },
          { title: 'Java工程规范学习' },
          { title: 'Java工程构建与部署' },
        ],
      },
      { title: '课后实战训练 - VibeCoding全栈工程基础实战' },
    ],
  },
  {
    title: 'AI大模型微调、量化与部署',
    children: [
      {
        title: '大模型微调技术解析',
        children: [
          { title: '大模型微调原理分析' },
          { title: '基于PEFT-Lora的微调技术分析与应用' },
          { title: '医疗行业数据集微调实践' },
          { title: 'Embedding模型微调技术运用' },
          { title: 'ReRank模型微调技术运用' },
        ],
      },
      {
        title: '模型量化与企业级AI模型部署方案解析',
        children: [
          { title: '模型量化原理分析' },
          { title: '大模型量化技术实践' },
          { title: '轻量级部署方案Ollama详解' },
          { title: '基于llama.cpp的模型量化与部署分析' },
          { title: 'vllm企业级部署方案实践' },
        ],
      },
    ],
  },
  {
    title: 'Java AI大模型生态开发进阶',
    children: [
      {
        title: 'LangChain4j核心能力学习',
        children: [
          { title: 'LangChain4j功能完整性与场景分析' },
          { title: 'LangChain4j核心能力详解' },
          { title: '基于LangChain4j的RAG系统构建' },
          { title: 'LangChain4j源码结构分析' },
        ],
      },
      {
        title: 'SpringAI核心能力掌握',
        children: [
          { title: 'SpringAI功能完整性与场景分析' },
          { title: 'SpringAI核心能力掌握' },
          { title: 'SpringAI Rag系统构建' },
          { title: 'SpringAI alibaba 功能对比学习' },
        ],
      },
    ],
  },
  {
    title: 'AI大模型应用生态掌握',
    children: [
      {
        title: 'MCP技术专题讲解与应用',
        children: [
          { title: 'Mcp应用场景分析' },
          { title: 'Mcp核心结构分析' },
          { title: 'Mcp能力接入与Mcp服务开发' },
          { title: '大规模Mcp工具管理与优化' },
        ],
      },
      {
        title: '开源AI大模型产品技术分析',
        children: [
          { title: 'AI大模型产品对比分析' },
          { title: 'Coze开源版原理源码分析部署' },
          { title: 'Dify源码分析与二次开发部署' },
          { title: 'N8n源码分析与二次开发部署' },
        ],
      },
    ],
  },
  {
    title: 'AI智能体协作技术',
    children: [
      {
        title: '多智能体协作框架详解',
        children: [
          { title: '智能体协作技术分析' },
          { title: 'CrewAI智能体协作技术详解' },
          { title: 'AutoGen智能体协作基础' },
          { title: 'AutoGen多智能协作团队模式详解' },
          { title: 'AutoGen自定义智能体技术进阶' },
        ],
      },
      {
        title: '复杂智能体设计模式解析',
        children: [
          { title: 'Plan-and-Execute模式' },
          { title: 'ReAct模式' },
          { title: 'ReWOO模式' },
          { title: 'Self-Reflection模式' },
          { title: 'Self-Ask模式' },
          { title: 'Self-Discover模式' },
          { title: 'OpenManus源码分析' },
        ],
      },
      { title: '课后实战训练 - 容器化多智能体协作平台' },
    ],
  },
  {
    title: '类阿里析言GBI数据分析系统企业级实战（Text2SQL）',
    children: [
      { title: 'AI数据分析系统核心难点分析与工程架构设计' },
      { title: 'Text2SQL以及AI数据分析核心实现详解' },
      { title: 'AI数据分析系统优化与扩展方案详解' },
      { title: '全栈混合技术实现与企业级分布式部署' },
    ],
  },
  {
    title: '类阿里通义晓蜜企业级智能客服系统实战',
    children: [
      { title: '智能客服系统核心难点分析与工程架构设计' },
      { title: '复杂数据集清洗与整合技术实现' },
      { title: '综合性高准确率RAG系统核心实现' },
      { title: '全栈技术实现与企业级分布式部署设计' },
    ],
  },
  {
    title: '类Dify/Coze全栈AI大模型集成与应用产品企业级实战',
    children: [
      { title: '全栈AI通用产品框架设计' },
      { title: '全栈AI工作流系统设计' },
      { title: '知识库系统设计' },
      { title: '插件与工具系统设计' },
    ],
  },
  {
    title: '多模态客户端智能体开发实战-微信智能体',
    children: [
      { title: '基于electron前端多端编译架构设计' },
      { title: '通用知识库系统设计' },
      { title: '多模态以及专用视觉模型应用' },
      { title: '全栈多端架构设计与部署' },
    ],
  },
]

// 基础巩固：从 AI架构师训练营课程中提炼、合并出的应届生/专科生必学地基
// (不含企业实战直播/求职冲刺等项目或面试导向内容)，6 组，做 10 个实战项目前建议先补齐
export type FoundationGroup = {
  code: string
  title: string
  merged: string[]
  reason: string
  theme: ThemeKey
}

export const FOUNDATION_GROUPS: FoundationGroup[] = [
  {
    code: 'A',
    title: 'AI协作与开发工具基础',
    merged: ['AI基础工具学习', 'AI编程工具进阶技巧', 'Claude Code与Codex进阶'],
    reason:
      '10 个项目全靠和 AI 一起写代码完成，从认识开发世界、装好工具，到把 Claude Code / Codex 用出深度，这是动手前必须先跨过的第一道门槛。',
    theme: 'cognition',
  },
  {
    code: 'B',
    title: '前端能力基础',
    merged: ['制作美观的AI应用', 'AI应用工程化进阶'],
    reason:
      '10 个项目里大部分都要交付一个能给别人看的界面，先掌握基础审美和前端工程规范，做出来的东西才不会"能跑但很丑、还没法维护"。',
    theme: 'frontend',
  },
  {
    code: 'C',
    title: '后端与数据库基础',
    merged: ['搭建自己的后端服务', 'AI后端服务工程化进阶'],
    reason:
      'OA 审批、CRM、订单中台这类系统项目全都要接数据库、写接口，没有后端基本功，连"系统项目"这条线都摸不到门。',
    theme: 'backend',
  },
  {
    code: 'D',
    title: '全栈技术选型与工程结构',
    merged: ['AI全栈工程', '工程结构设计', '工程思想：长期稳定维护软件应用'],
    reason:
      '10 个项目技术栈各不相同，要先有一张全栈技术地图知道怎么选型，再懂一点分层架构，做完项目的代码才经得起翻看，不是写一个丢一个。',
    theme: 'mindset',
  },
  {
    code: 'E',
    title: '部署上线与多端发布',
    merged: ['如何上线自己的应用', '开发自己的微信小程序'],
    reason:
      '项目做完只在本地能跑等于没做完，先学会把应用部署到公网、需要时再发布成小程序，交付才算真正完整。',
    theme: 'launch',
  },
  {
    code: 'F',
    title: 'AI应用与智能体基础',
    merged: ['开发自己的智能体', 'RAG与上下文工程', '智能体与harness'],
    reason:
      '20 个项目里将近一半是 AI 项目，从最基础的智能体结构，到 RAG 检索增强，再到复杂智能体的工具调用与记忆管理，这条主线不打好，AI 类选题都做不动。',
    theme: 'agent',
  },
]

// 词云：结合项目优势与课程价值提炼的关键词，weight 越大字号越大(1-4)
export type CloudWord = { text: string; weight: 1 | 2 | 3 | 4 }

export const CLOUD_WORDS: CloudWord[] = [
  { text: '高并发', weight: 4 },
  { text: 'RAG检索增强', weight: 4 },
  { text: '智能体工具调用', weight: 4 },
  { text: '分布式系统', weight: 4 },
  { text: '消息队列削峰', weight: 3 },
  { text: '安全沙箱隔离', weight: 3 },
  { text: 'DAG任务编排', weight: 3 },
  { text: 'Text2SQL', weight: 3 },
  { text: '多租户架构', weight: 3 },
  { text: '分布式锁', weight: 2 },
  { text: 'SSO单点登录', weight: 2 },
  { text: '向量检索', weight: 2 },
  { text: '状态机设计', weight: 2 },
  { text: '幂等设计', weight: 2 },
  { text: '长连接协议', weight: 2 },
  { text: '埋点采集', weight: 1 },
  { text: '分片上传', weight: 1 },
  { text: '库存一致性', weight: 1 },
  { text: 'RBAC权限模型', weight: 1 },
  { text: '断点续传', weight: 1 },
  { text: '风控审核', weight: 1 },
  { text: '引用溯源', weight: 1 },
  { text: '数据脱敏', weight: 1 },
  { text: '系统架构', weight: 3 },
  { text: '智能体', weight: 3 },
  { text: '全栈开发', weight: 2 },
  { text: '工程结构', weight: 2 },
  { text: '企业级', weight: 2 },
  { text: '岗位匹配', weight: 2 },
  { text: '面试题材', weight: 2 },
  { text: '求职', weight: 1 },
]
