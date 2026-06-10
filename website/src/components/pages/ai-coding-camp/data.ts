// AI 编程训练营页面的数据与类型层：集中存放主题色、课时、交付物、讲师资历、
// 服务阶段、能力主线时间线等纯数据定义与相关纯函数。本模块不含 JSX 与客户端逻辑。

export type ThemeKey =
  | 'cognition'
  | 'frontend'
  | 'backend'
  | 'agent'
  | 'launch'
  | 'mobile'
  | 'mindset'

export type Theme = {
  label: string
  hex: string
  rgb: string
  gradientFrom: string
  gradientTo: string
}

export const THEMES: Record<ThemeKey, Theme> = {
  cognition: { label: '认知 · 工具', hex: '#A78BFA', rgb: '167, 139, 250', gradientFrom: '#C4B5FD', gradientTo: '#7C3AED' },
  frontend: { label: '前端 · 视觉', hex: '#22D3EE', rgb: '34, 211, 238', gradientFrom: '#67E8F9', gradientTo: '#0891B2' },
  backend: { label: '后端 · 全栈', hex: '#E879F9', rgb: '232, 121, 249', gradientFrom: '#F0ABFC', gradientTo: '#A21CAF' },
  agent: { label: '智能体', hex: '#FB7185', rgb: '251, 113, 133', gradientFrom: '#FDA4AF', gradientTo: '#E11D48' },
  launch: { label: '部署 · 上线', hex: '#FBBF24', rgb: '251, 191, 36', gradientFrom: '#FCD34D', gradientTo: '#D97706' },
  mobile: { label: '小程序形态', hex: '#38BDF8', rgb: '56, 189, 248', gradientFrom: '#7DD3FC', gradientTo: '#0284C7' },
  mindset: { label: '工程心智', hex: '#34D399', rgb: '52, 211, 153', gradientFrom: '#6EE7B7', gradientTo: '#047857' },
}

export type SubLesson = {
  code: string
  title: string
  brief: string
}

export type Warning = {
  label: string
  body: string
}

export type Chapter = {
  index: number
  title: string
  hours: string
  deliverable: string
  intro: string
  theme: ThemeKey
  warning?: Warning
  lessons: SubLesson[]
}

export const STAGE1_CHAPTERS: Chapter[] = [
  {
    index: 1,
    title: 'AI 基础工具学习',
    hours: '6–8 课时',
    deliverable: '一个能在本地浏览器打开的静态网页',
    theme: 'cognition',
    intro: '本节课时先补齐零基础最缺的认知地基，再带学员安装并跑通主力 AI 工具，最后做出第一版能本地打开的网页。',
    warning: {
      label: '零基础提示',
      body: '1.1 与 1.2 是整门课的地基，宁可慢一点。学员在这里建立的概念地图，决定了后面九节课时是否「踩得稳」。',
    },
    lessons: [
      { code: '1.1', title: '开发世界速览', brief: '用大白话讲清前端、后端、数据库、终端，给后面所有内容打地基。' },
      { code: '1.2', title: '认识并安装主力工具', brief: '一个主力工具贯穿全程 + 其余工具横向了解，降低学习负担。' },
      { code: '1.3', title: '搭建自己的 AI 开发环境', brief: '编辑器 + 终端 + AI 工具三件套如何协同工作。' },
      { code: '1.4', title: '设计自己的 AI 编程工作流', brief: '提需求 → 看产出 → 读报错 → 再交流的核心闭环。' },
      { code: '1.5', title: '用 AI 做出第一版能本地打开的网页', brief: '完成第一次完整的「描述—生成—调整」闭环。' },
    ],
  },
  {
    index: 2,
    title: 'AI 编程工具进阶技巧',
    hours: '5–6 课时',
    deliverable: '一套个人提示词模板 + 一个持续积累的知识库',
    theme: 'cognition',
    intro: '把「与 AI 高效交流」提升为本节课时核心能力，并教学员沉淀经验、搭建个人外脑。',
    lessons: [
      { code: '2.1', title: '学会与 AI 高效交流(核心)', brief: '清晰描述需求、有效贴报错、拆分复杂任务、给错答案时如何纠偏。' },
      { code: '2.2', title: '各类智能体工具的使用技巧', brief: '横向对比国内外工具的定位与取舍，知道何时用什么。' },
      { code: '2.3', title: '让 AI 帮你复用经验', brief: '把常用提示词沉淀为模板库，用规则文件让 AI 记住项目规范。' },
      { code: '2.4', title: '用 AI 搭建个人知识库并持续赋能', brief: '让知识库成为可随时查询的「外脑」，积累随时间复利。' },
    ],
  },
  {
    index: 3,
    title: '制作美观的 AI 应用',
    hours: '6–7 课时',
    deliverable: '一份美观、响应式的前端页面',
    theme: 'frontend',
    intro: '承接第一节课时的静态页面，把它升级为有设计感、能适配手机的版本。',
    lessons: [
      { code: '3.1', title: '如何让你的应用更加美观', brief: '掌握配色、排版、间距、对齐等基础原则，并准确传达给 AI。' },
      { code: '3.2', title: '如何制作炫酷的动画效果', brief: '过渡、悬停、加载等常见动画，让页面活起来。' },
      { code: '3.3', title: '如何使用市面上现成的组件库', brief: '理解组件能省下多少工作，让 AI 帮你接入与使用。' },
      { code: '3.4', title: '把第一版页面升级为美观的前端站点', brief: '综合运用配色、动画、组件完成一次完整的美化迭代。' },
    ],
  },
  {
    index: 4,
    title: 'AI 应用工程化进阶',
    hours: '5–6 课时',
    deliverable: '结构清晰、主题统一、组件可复用的前端工程',
    theme: 'frontend',
    intro: '前端工程化，把页面从「能看」升级为「好维护」，为后面接后端打基础。',
    lessons: [
      { code: '4.1', title: '设计整个应用的主题效果', brief: '用变量统一管理颜色、字体、圆角，一处修改全局生效。' },
      { code: '4.2', title: '如何设计可复用的组件', brief: '识别页面中重复出现的结构，让 AI 帮你抽象成组件。' },
      { code: '4.3', title: '如何将自己的工程整理得井井有条', brief: '合理的目录结构与命名规范，是长期维护的前提。' },
      { code: '4.4', title: '如何通过 AI 查找和修复前端问题', brief: '看懂控制台报错并喂给 AI，闭环「报错—定位—修复—验证」。' },
    ],
  },
  {
    index: 5,
    title: '搭建自己的后端服务',
    hours: '8–10 课时',
    deliverable: '前后端打通、数据能存能取的完整应用',
    theme: 'backend',
    intro: '全程最陡的一段坡。本节课时特意放慢节奏：先把概念讲透再动手，并把「前后端联调」作为独立难点专门攻克。',
    lessons: [
      { code: '5.1', title: '后端是什么 + 用 AI 搭建管理数据库', brief: '先花足篇幅讲明白「数据存哪、接口是什么」，再动手建库。' },
      { code: '5.2', title: '基于 AI 搭建自己的后端开发环境', brief: '把后端跑起来，让 AI 一步步配置并启动环境。' },
      { code: '5.3', title: '开发自己的第一个后端接口', brief: '实现「新增 / 读取一条数据」接口并存进数据库，用工具测试通。' },
      { code: '5.4', title: '连接前后端 + 联调排错专题(难点)', brief: '跨域、接口格式、异步问题——历史劝退重灾区，系统化排错。' },
    ],
  },
  {
    index: 6,
    title: 'AI 后端服务工程化进阶',
    hours: '5–6 课时',
    deliverable: '结构清晰、有日志、有安全意识的后端工程',
    theme: 'backend',
    intro: '后端工程化，并把「数据安全」意识提前埋在这里——因为搭后端时就该建立。',
    lessons: [
      { code: '6.1', title: '借助 AI 管理后端服务工程结构', brief: '后端代码的合理分层与组织，用 AI 协助梳理。' },
      { code: '6.2', title: '设计后端服务的日志系统', brief: '为后面「分析问题」做铺垫，给服务加上清晰日志。' },
      { code: '6.3', title: '如何基于 AI 分析后端问题并修复', brief: '形成「看日志—定位—交给 AI」的闭环并验证修复。' },
      { code: '6.4', title: '业务拆解 + 数据安全基础', brief: '在拆解业务的同时把敏感数据与密钥保护意识打牢。' },
    ],
  },
  {
    index: 7,
    title: '开发自己的智能体',
    hours: '6–7 课时',
    deliverable: '一个可对话、有记忆的 AI 智能体应用',
    theme: 'agent',
    intro: '点明智能体本质就是一个「调用大模型的后端服务」，与第五、六节课时一脉相承——做出一个可对话、有记忆的智能体应用。',
    lessons: [
      { code: '7.1', title: '认识智能体的基本结构', brief: '破除神秘感:它本质是个会调用大模型 API 的后端服务。' },
      { code: '7.2', title: '使用 AI 来设计自己的智能体', brief: '定义角色与能力边界，用 AI 协助设计提示词与行为。' },
      { code: '7.3', title: '给智能体接入记忆系统', brief: '衔接第五节课时数据库:记忆本质就是把对话存下来。' },
      { code: '7.4', title: '开发出自己的第一个 AI 智能体应用', brief: '完整跑通一次真实对话，让记忆系统真正生效。' },
    ],
  },
  {
    index: 8,
    title: '如何上线自己的应用',
    hours: '6–7 课时',
    deliverable: '应用正式上线，可用手机公网访问',
    theme: 'launch',
    intro: '把前面做好的应用真正部署到公网，让任何人都能访问，并强调「本地能跑 ≠ 线上能跑」。',
    lessons: [
      { code: '8.1', title: '学会使用腾讯云服务器', brief: '云服务器是什么、如何购买与连接，掌握基本操作。' },
      { code: '8.2', title: '如何使用 AI 管理服务器', brief: '让 AI 当你的运维助手，安全完成常见服务器操作。' },
      { code: '8.3', title: '如何构建自己的生产环境', brief: '讲清「本地能跑 ≠ 线上能跑」这一新手大坑。' },
      { code: '8.4', title: '如何使用自己的域名', brief: '域名是什么、如何购买与解析，指向你的服务器。' },
      { code: '8.5', title: '如何自动申请 HTTPS 证书', brief: '让访问更安全、更专业，自动申请并续期。' },
      { code: '8.6', title: '将应用发布到公网并验证', brief: '用手机实地验证线上访问，并完成上线检查清单。' },
    ],
  },
  {
    index: 9,
    title: '开发自己的微信小程序',
    hours: '7–8 课时',
    deliverable: '一个可上线的微信小程序版本(复用已有后端)',
    theme: 'mobile',
    intro: '复用前面已学的后端，强调小程序是「换一个壳」而非从零重来。',
    lessons: [
      { code: '9.1', title: '准备小程序开发环境', brief: '小程序账号与开发者工具，理解与网页开发的异同。' },
      { code: '9.2', title: '如何在小程序中设计自己的应用主题', brief: '把第四节课时的主题思路迁移到小程序，掌握界面要点。' },
      { code: '9.3', title: '基于 AI 开发自己的小程序应用', brief: '用熟悉的 AI 工作流，把已有应用的核心功能搬进小程序。' },
      { code: '9.4', title: '复用已有后端构造小程序服务', brief: '直接对接第五、六节课时的后端，不重复造轮子。' },
      { code: '9.5', title: '学会如何上线自己的小程序', brief: '掌握提交、审核、发布与后续更新流程。' },
    ],
  },
  {
    index: 10,
    title: '工程思想：长期稳定维护软件应用',
    hours: '5–6 课时',
    deliverable: '一份属于自己的「长期维护 + 产品设计」检查清单',
    theme: 'mindset',
    intro: '数据安全已提前到第六节课时，本节聚焦真正长期、思想层面的内容，并对全程做一次完整复盘，作为收尾升华。',
    lessons: [
      { code: '10.1', title: '保证系统整洁 + 数据备份策略', brief: '承接第六节课时的安全意识，落到具体的备份与恢复实践。' },
      { code: '10.2', title: '如何升级迭代自己的应用', brief: '建立版本管理思想，安全发布与出问题如何回退。' },
      { code: '10.3', title: '如何与其他人协作', brief: '从单打独斗到团队协作，用 AI 辅助沟通与代码整合。' },
      { code: '10.4', title: '如何监控自己的应用访问数据', brief: '关注关键访问指标，用监控发现潜在问题。' },
      { code: '10.5', title: '好产品的设计维度 + 课程总复盘', brief: '设计一个好产品要考虑的核心维度，复盘从想法到上线的全旅程。' },
    ],
  },
]

export type Deliverable = {
  code: string
  title: string
  subtitle: string
  body: string
  badges: string[]
  theme: ThemeKey
}

export const STAGE1_DELIVERABLES: Deliverable[] = [
  {
    code: '01',
    title: '一个上线的微信小程序',
    subtitle: '可提交审核 · 能被搜索到',
    body: '从账号注册、开发、联调到提交审核全流程跑通，结业时手里是一个能让朋友直接打开使用的小程序，而不是一个本地 demo。',
    badges: ['提交审核', '可搜索', '复用后端'],
    theme: 'mobile',
  },
  {
    code: '02',
    title: '一个上线的网页应用',
    subtitle: '公网可访问 · 绑自己的域名 · HTTPS 全程加密',
    body: '前端 + 后端 + 数据库全栈打通，部署到云服务器，绑定自己的域名，自动续期 HTTPS。手机扫码就能进，不再是「我电脑上能跑」。',
    badges: ['自有域名', '公网访问', '全栈'],
    theme: 'frontend',
  },
  {
    code: '03',
    title: '一个属于自己的 AI 智能体',
    subtitle: '可对话 · 有记忆 · 接进自己的应用',
    body: '把大模型 API 包装成一个真正「懂你」的助手——能记住对话、按你定的角色和能力边界工作，并融入到你的网站或小程序里。',
    badges: ['长期记忆', '角色定制', '已上线'],
    theme: 'agent',
  },
  {
    code: '04',
    title: '一套持续生长的本地知识库',
    subtitle: 'AI 加持 · 随时间复利',
    body: '把学习笔记、报错解决方案、个人经验沉淀成一个可查询的「外脑」——让 AI 在你的私有上下文里工作，越用越懂你。',
    badges: ['可查询', '本地化', '复利累积'],
    theme: 'cognition',
  },
]

export type InstructorCredential = {
  metric: string
  label: string
  detail: string
  theme: ThemeKey
}

export const INSTRUCTOR_CREDENTIALS: InstructorCredential[] = [
  {
    metric: '12 年',
    label: 'AI 与大数据工程研发经验',
    detail: '从大数据平台、推荐系统，到 AI 模型工程化落地，一线写过、设计过、上过线。',
    theme: 'cognition',
  },
  {
    metric: '大厂 × 国央企',
    label: '一线项目与架构经历',
    detail: '在真实头部互联网公司与国央企做过核心系统的方案设计、技术选型与落地交付。',
    theme: 'frontend',
  },
  {
    metric: '4 年',
    label: '创业公司 CTO 首席技术官',
    detail: '从 0 到 1 带过技术团队，把架构、上线、运维、招人这些"教科书外"的真问题全部踩过。',
    theme: 'launch',
  },
  {
    metric: '2 年',
    label: 'AI 大模型应用产品教学经验',
    detail: '专做 AI 编程 / 大模型应用方向的教学，知道零基础学员真正卡在哪里、怎么把他们带过去。',
    theme: 'agent',
  },
]

export type ServiceStage = {
  code: string
  stage: string
  duration: string
  title: string
  highlight: string
  body: string
  features: string[]
  theme: ThemeKey
}

export const STAGE1_SERVICE_STAGES: ServiceStage[] = [
  {
    code: '01',
    stage: '第一阶段',
    duration: '1 个月',
    title: '线上直播 · 集中授课',
    highlight: '每周固定时间在线直播 · 跟着节奏走完十节课时主线',
    body: '把十节课时系统化课程结构化交付给你，现场答疑、现场演示，节奏紧凑而不慌乱——一个月跑通从认识工具到独立上线全流程。',
    features: [
      '每周固定时间在线直播，按课时推进',
      '现场答疑、现场演示，不容易掉队',
      '直播全程录像，永久回放、可反复看',
      '边学边做，结业时 4 件你自己亲手做出来的交付成果同步产出',
    ],
    theme: 'cognition',
  },
  {
    code: '02',
    stage: '第二阶段 · 重点服务',
    duration: '最长 6 个月',
    title: '持续陪跑 · 长期答疑',
    highlight: '合同期内随时提问 · 真正稳住你的能力',
    body: '直播结束不代表关系结束。课程之外的真实项目、新工具、新模型、上线踩坑——6 个月内都可以继续来问，把"学会"变成"真的能用"。',
    features: [
      '课程之外的真实项目问题，随时来问',
      '新工具、新模型上线，第一时间帮你跟进解读',
      '上线踩坑、线上 bug、性能问题，远程一起排查',
      '产品迭代方向、技术选型，一起讨论决策',
      '专属沟通渠道，6 个月合同期内有效',
    ],
    theme: 'launch',
  },
]

export type TimelineNode = {
  chapter: string
  milestone: string
  detail: string
  theme: ThemeKey
}

export const PROJECT_TIMELINE: TimelineNode[] = [
  { chapter: '课时 1', milestone: '静态网页', detail: '用 AI 做出第一版能在本地浏览器打开的网页。', theme: 'cognition' },
  { chapter: '课时 3', milestone: '美观响应式', detail: '掌握设计原则与组件库，做出美观、适配手机的页面。', theme: 'frontend' },
  { chapter: '课时 4', milestone: '前端工程化', detail: '主题、组件、目录结构与控制台排错四件套到位。', theme: 'frontend' },
  { chapter: '课时 5', milestone: '接上后端', detail: '数据库 + 接口 + 联调，第一个真正能用的全栈应用。', theme: 'backend' },
  { chapter: '课时 6', milestone: '后端工程化', detail: '给后端加上日志、分层与数据安全基础。', theme: 'backend' },
  { chapter: '课时 7', milestone: '智能体应用', detail: '做出一个可对话、有记忆的 AI 智能体应用。', theme: 'agent' },
  { chapter: '课时 8', milestone: '部署上线', detail: '服务器、域名、HTTPS——让应用真正能被公网访问。', theme: 'launch' },
  { chapter: '课时 9', milestone: '小程序形态', detail: '复用已有后端，发布一个微信小程序版本。', theme: 'mobile' },
  { chapter: '课时 10', milestone: '长期维护', detail: '形成版本管理、备份、监控与产品设计的工程心智。', theme: 'mindset' },
]

export const OVERVIEW_CARDS = [
  {
    eyebrow: '01',
    title: '课程定位',
    body: '面向完全零基础的学员，借助 AI 编程工具，从认识开发世界开始，逐步做出一个属于自己的、可上线访问的完整应用——含网页与微信小程序两种形态。',
    theme: 'cognition' as ThemeKey,
  },
  {
    eyebrow: '02',
    title: '能力主线',
    body: '十节课时不是十个孤立练习——前端、后端、智能体、上线、小程序按序叠加，后一节课时的能力都建立在前一节之上。每节课时都有看得见、摸得着的交付物。',
    theme: 'backend' as ThemeKey,
  },
  {
    eyebrow: '03',
    title: '核心理念',
    body: 'AI 不是魔法。学会「如何描述需求、如何读懂报错、如何把问题讲清楚给 AI」，是比任何具体工具都重要的能力——这条暗线将贯穿全部十节课时反复训练。',
    theme: 'agent' as ThemeKey,
  },
]

// ===== 第二阶段：AI 编程专家 =====

// 第二阶段「职业硬核」深色系,与第一阶段明快七彩区分
export type Stage2ThemeKey = 'advance' | 'enterprise' | 'career'

export const STAGE2_THEMES: Record<Stage2ThemeKey, Theme> = {
  advance:    { label: '能力进阶', hex: '#60A5FA', rgb: '96, 165, 250',  gradientFrom: '#93C5FD', gradientTo: '#1E40AF' }, // 钢蓝/靛
  enterprise: { label: '企业实战', hex: '#D4A24E', rgb: '212, 162, 78',  gradientFrom: '#E8C77A', gradientTo: '#92600E' }, // 暗金/铜
  career:     { label: '求职冲刺', hex: '#2DD4BF', rgb: '45, 212, 191',  gradientFrom: '#5EEAD4', gradientTo: '#0F766E' }, // 翡翠深绿
}

export type Stage2Lesson = {
  code: string          // 课号,如 'S2-1'
  title: string
  hours: string         // 拟稿待确认
  goal: string          // 本节目标(outline)
  points: string[]      // 子条目(outline 的 x.y 行,逐字照抄)
  output: string        // 课后产出;拟稿项以 outputDraft 标记为准
  outputDraft?: boolean // true 表示该 output 为拟稿待确认
  theme: Stage2ThemeKey
}

export type Stage2Group = {
  key: Stage2ThemeKey
  title: string
  subtitle: string
  lessons: Stage2Lesson[]
}

export const STAGE2_GROUPS: Stage2Group[] = [
  {
    key: 'advance',
    title: '能力进阶',
    subtitle: '补齐企业级 AI 工程能力地图(课 1–8)',
    lessons: [
      {
        code: 'S2-1',
        title: 'Claude Code 与 Codex 进阶',
        hours: '待确认',
        goal: '掌握两大 agentic 编程工具的深度用法,建立一套可复用的 AI 开发工作流。',
        points: [
          '1.1 工具全景与选型：Claude Code 与 Codex 的能力边界、计费方式与适用场景，什么任务用哪个。',
          '1.2 项目级配置：CLAUDE.md / AGENTS.md 编写规范，把项目约定与上下文喂给 AI。',
          '1.3 自定义命令、hooks 与权限管理：把重复操作固化成命令，控制 AI 的操作边界与安全范围。',
          '1.4 上下文工程实战：context window 控制、压缩策略、长会话管理，避免越聊越乱。',
          '1.5 subagent 与并行开发：用子代理拆分任务，基于 git worktree 多分支并行推进。',
          '1.6 MCP 工具接入：接入数据库、文档、第三方服务，扩展 AI 的实际能力。',
          '1.7 大型与陌生代码库导航：快速理解既有架构，安全地定位与改动。',
        ],
        output: '一套可复用的个人 AI 开发工作流配置(CLAUDE.md / 自定义命令 / hooks)',
        outputDraft: true,
        theme: 'advance',
      },
      {
        code: 'S2-2',
        title: 'AI 全栈工程',
        hours: '待确认',
        goal: '补齐全栈知识地图,学会用 AI 快速进入任意技术栈。',
        points: [
          '2.1 现代全栈技术栈全景：前端、后端、数据库、部署的主流选择与取舍。',
          '2.2 选型方法论：按项目规模、团队能力与长期维护成本做技术决策。',
          '2.3 用 AI 攻克陌生技术栈：从"读文档"到"能上手"的高效路径。',
          '2.4 前端工程化生态：构建工具、包管理、类型系统。',
          '2.5 后端服务生态：API 设计、ORM、缓存、消息队列。',
          '2.6 存储选型：关系型、NoSQL、向量数据库的适用场景。',
          '2.7 云原生与容器化基础：Docker、镜像、基础编排概念。',
        ],
        output: '一张个人全栈技术地图 + 一次陌生技术栈上手记录',
        outputDraft: true,
        theme: 'advance',
      },
      {
        code: 'S2-3',
        title: 'AI 测试工程',
        hours: '待确认',
        goal: '建立企业级测试思维,用 AI 把测试做扎实,而非只凑覆盖率数字。',
        points: [
          '3.1 测试策略与金字塔：单元、集成、E2E 测试的分层与配比。',
          '3.2 用 AI 生成测试用例：让 AI 覆盖边界条件与异常路径。',
          '3.3 测试数据与场景构造：用 AI 生成贴近真实业务的测试数据。',
          '3.4 TDD 与 AI 协作的节奏：先写测试、再让 AI 实现的工作方式。',
          '3.5 Mock、桩与依赖隔离：隔离外部依赖的工程实践。',
          '3.6 有效覆盖率：区分"覆盖率数字"与"是否真的测到了"。',
          '3.7 接入 CI：把自动化测试纳入持续集成流水线。',
        ],
        output: '为一个已有项目补上分层测试并接入 CI',
        outputDraft: true,
        theme: 'advance',
      },
      {
        code: 'S2-4',
        title: 'AI 运维工程',
        hours: '待确认',
        goal: '掌握应用上线后「看得见、稳得住」的运维基本功。',
        points: [
          '4.1 可观测性三支柱：日志、指标、链路追踪。',
          '4.2 用 AI 搭建监控告警：关键指标设计与告警阈值设定。',
          '4.3 容器化与编排：Docker 与 Kubernetes 基础。',
          '4.4 CI/CD 流水线设计：从代码提交到自动部署的完整链路。',
          '4.5 基础设施即代码（IaC）：用代码管理运行环境。',
          '4.6 线上故障排查：AI 辅助的根因分析（RCA）方法。',
        ],
        output: '给应用接上监控告警 + 一条可用的 CI/CD 流水线',
        outputDraft: true,
        theme: 'advance',
      },
      {
        code: 'S2-5',
        title: 'SDD 驱动编程与协作开发',
        hours: '待确认',
        goal: '从「凭感觉写」升级到「规范驱动」,让 AI 协作可控、可复现。',
        points: [
          '5.1 什么是 SDD：规范驱动开发（Spec-Driven Development）与 vibe coding 的本质区别。',
          '5.2 写好一份 spec：需求、约束与验收标准的清晰表达，让 AI 真正听懂。',
          '5.3 完整链路：spec → 设计 → 任务拆解 → 实现 → 验收。',
          '5.4 工具实践：spec-kit、openspec、superpowers 等工具的实战用法。',
          '5.5 团队规范沉淀：把团队约定变成可复用的资产。',
          '5.6 AI 代码评审协作：让 AI 参与 Code Review，提升评审效率与一致性。',
        ],
        output: '用 spec-kit / superpowers 跑通一次 spec → 实现 → 验收',
        outputDraft: true,
        theme: 'advance',
      },
      {
        code: 'S2-6',
        title: '工程结构设计',
        hours: '待确认',
        goal: '掌握让代码长期可维护的架构方法,并教会 AI 守住架构。',
        points: [
          '6.1 整洁架构核心思想：分层、依赖方向与关注点分离。',
          '6.2 依赖倒置与模块边界：让业务核心不依赖具体框架。',
          '6.3 DDD 基础：限界上下文、聚合、实体、值对象。',
          '6.4 用 AI 重构"屎山代码"：渐进式重构策略与风险控制。',
          '6.5 维持架构一致性：把架构约束表达给 AI，防止改着改着结构崩坏。',
        ],
        output: '把一段高耦合代码重构为清晰分层，并写下一份架构约束说明。',
        theme: 'advance',
      },
      {
        code: 'S2-7',
        title: '大模型应用开发 · RAG 与上下文工程',
        hours: '待确认',
        goal: '掌握大模型应用的核心能力——把私有知识接进模型。',
        points: [
          '7.1 大模型应用基础：token、embedding、prompt 的底层机制。',
          '7.2 上下文工程原理：如何组织进入模型的信息以获得稳定输出。',
          '7.3 RAG 全流程：检索 → 召回 → 重排 → 生成。',
          '7.4 文档切分与 embedding 策略：影响召回质量的关键环节。',
          '7.5 向量库工程化：选型、索引构建与数据更新。',
          '7.6 RAG 效果评估：召回率、准确率的衡量与迭代方法。',
        ],
        output: '搭建一个能基于自己文档问答的最小 RAG 应用。',
        theme: 'advance',
      },
      {
        code: 'S2-8',
        title: '大模型应用开发 · 智能体与 harness',
        hours: '待确认',
        goal: '理解智能体的真实结构,能从零搭建一个可控的 agent。',
        points: [
          '8.1 智能体核心架构：感知 - 决策 - 行动循环。',
          '8.2 Agent Harness 设计：工具调用、循环控制与错误恢复。',
          '8.3 记忆系统：短期与长期记忆、状态管理。',
          '8.4 工具与 MCP：给智能体接入外部能力。',
          '8.5 多智能体协作：常见的编排与协作模式。',
          '8.6 可靠性与评估：让智能体可控、可测、可信。',
        ],
        output: '实现一个带工具调用与基础记忆的智能体。',
        theme: 'advance',
      },
    ],
  },
  {
    key: 'enterprise',
    title: '企业实战直播',
    subtitle: '从零搭两套可上线的企业级系统(课 9–12)',
    lessons: [
      {
        code: 'S2-9',
        title: '企业级实战直播 · 智能问数系统（上）',
        hours: '待确认',
        goal: '从零启动一个企业级 Text-to-SQL 系统,完成核心链路。',
        points: [
          '9.1 项目拆解：业务场景分析与需求边界确定。',
          '9.2 整体架构设计：模块划分与数据流设计。',
          '9.3 schema 与元数据管理：让模型理解数据库结构。',
          '9.4 业务语义层：把业务术语映射到具体的表与字段。',
          '9.5 Text-to-SQL 核心实现：自然语言到查询语句的生成。',
        ],
        output: '跑通"提问 → 生成 SQL → 返回结果"的最小闭环。',
        theme: 'enterprise',
      },
      {
        code: 'S2-10',
        title: '企业级实战直播 · 智能问数系统（下）',
        hours: '待确认',
        goal: '把 demo 打磨成可上线、准确且安全的产品。',
        points: [
          '10.1 准确率优化：schema linking 与 few-shot 示例工程。',
          '10.2 自校验与纠错：让模型自我检查并修正 SQL。',
          '10.3 结果可视化：根据查询结果自动生成图表。',
          '10.4 部署上线：生产环境配置与发布。',
          '10.5 权限隔离与数据安全：行级权限、防注入与数据脱敏。',
        ],
        output: '把智能问数系统部署到可访问环境，并加上权限控制。',
        theme: 'enterprise',
      },
      {
        code: 'S2-11',
        title: '企业级实战直播 · Hermes/Openclaw 智能体系统（上）',
        hours: '待确认',
        goal: '从零搭建一个智能体系统的骨架与核心能力。',
        points: [
          '11.1 系统定位与边界：明确这个智能体要解决的核心问题。',
          '11.2 整体架构设计：引擎、工具、记忆、接口之间的关系。',
          '11.3 核心引擎与调度循环：智能体主循环的实现。',
          '11.4 工具系统设计：工具的注册、调用与结果处理。',
          '11.5 外部能力接入：接入真实业务接口与数据。',
        ],
        output: '跑通智能体"接收任务 → 调用工具 → 产出结果"的主流程。',
        theme: 'enterprise',
      },
      {
        code: 'S2-12',
        title: '企业级实战直播 · Hermes/Openclaw 智能体系统（下）',
        hours: '待确认',
        goal: '把智能体从「能跑」做到「能上线、稳定、可运营」。',
        points: [
          '12.1 记忆与长期上下文管理：跨会话的状态维护。',
          '12.2 多轮对话与任务编排：复杂任务的拆解与衔接。',
          '12.3 异常处理与降级：工具失败、超时等情况的兜底策略。',
          '12.4 生产部署：环境与配置管理。',
          '12.5 监控与稳定性：可观测性建设与告警。',
        ],
        output: '把智能体系统部署上线，并接入基础监控。',
        theme: 'enterprise',
      },
    ],
  },
  {
    key: 'career',
    title: '求职冲刺',
    subtitle: '把课程实战讲成 offer(课 13–14)',
    lessons: [
      {
        code: 'S2-13',
        title: '求职面试专题（一）· 大模型应用',
        hours: '待确认',
        goal: '系统梳理大模型应用方向高频面试题,做到能答、能讲、能动手。',
        points: [
          '13.1 大模型基础高频题：token、embedding、上下文窗口、温度等关键参数；Transformer 的高层原理；主流模型的对比与选型逻辑。',
          '13.2 Prompt 与上下文工程题：prompt 设计原则、few-shot 与示例工程、上下文工程，以及常见失效场景与应对。',
          '13.3 RAG 系统面试题：RAG 全流程、切分与 embedding 策略、检索与重排、混合检索；RAG 效果如何评估；RAG、微调、长上下文三者如何取舍。',
          '13.4 智能体面试题：agent 架构、工具调用、记忆设计、任务规划、多智能体协作、harness 设计与可靠性保障。',
          '13.5 大模型应用系统设计题：如何设计企业知识库问答 / 智能客服 / 智能体平台，重点考查成本、延迟、并发、评估与安全的权衡。',
          '13.6 工程与生产实战题：幻觉治理、prompt 注入防护、评估体系（eval）建设、成本与延迟优化、线上可观测性。',
          '13.7 项目讲述与实战演示：用 STAR 结构把课程里的 RAG / 智能体实战讲到面试官认可，并能现场口述或白板还原核心设计。',
          '13.8 高频追问演练：覆盖以上各模块的高频追问与压力测试式准备。',
        ],
        output: '整理一份"大模型应用面试题库 + 个人答案稿"。',
        theme: 'career',
      },
      {
        code: 'S2-14',
        title: '求职面试专题（二）· VibeCoding 与企业架构',
        hours: '待确认',
        goal: '梳理 AI 编程工作流与企业级工程能力高频面试题。',
        points: [
          '14.1 AI 编程工具与工作流题：Claude Code / Codex 的用法、上下文工程、subagent、MCP，以及"如何用 AI 高效开发一个项目"这类开放题的应答思路。',
          '14.2 SDD 与协作开发题：规范驱动开发与 vibe coding 的区别、如何写好 spec、AI 时代的团队协作与代码评审。',
          '14.3 整洁架构与 DDD 题：分层、依赖倒置、限界上下文、聚合、实体、值对象等核心概念的考查与辨析。',
          '14.4 测试工程题：测试金字塔、TDD、Mock 与依赖隔离、覆盖率的真实含义，以及如何用 AI 做测试。',
          '14.5 运维与 DevOps 题：可观测性三支柱、CI/CD、容器化与编排、IaC、线上故障排查。',
          '14.6 全栈与技术选型题：技术栈选型的权衡、前后端生态、存储选型。',
          '14.7 企业级系统设计题：设计一个高可用 Web 系统 / 后台服务（非大模型方向），考查架构、扩展性、数据一致性与容量评估。',
          '14.8 工程素养开放题：代码可维护性、如何带 AI 维持架构、如何评估一个系统/产品的好坏；结合项目讲述如何作答。',
        ],
        output: '一份 VibeCoding/企业架构面试题库 + 个人答案稿',
        outputDraft: true,
        theme: 'career',
      },
    ],
  },
]

export type Stage2Deliverable = {
  code: string; title: string; subtitle: string; body: string; badges: string[]; theme: Stage2ThemeKey
}

export const STAGE2_DELIVERABLES: Stage2Deliverable[] = [
  { code: '01', title: '一套企业级 AI 工程能力', subtitle: '测试 · 运维 · SDD · 整洁架构',
    body: '从有效测试、可观测运维、规范驱动开发到整洁架构与 DDD,补齐职业开发者真正缺的工程地图,并教 AI 守住架构。',
    badges: ['分层测试', 'CI/CD', '架构约束'], theme: 'advance' },
  { code: '02', title: 'RAG 问答应用 + 带记忆的智能体', subtitle: '大模型应用核心能力 · 可运行',
    body: '把私有文档接进模型做出最小 RAG 问答应用,并从零实现一个带工具调用与基础记忆的可控智能体。',
    badges: ['RAG', '工具调用', '记忆系统'], theme: 'advance' },
  { code: '03', title: '智能问数系统(可上线)', subtitle: 'Text-to-SQL · 带权限与数据安全',
    body: '从「提问 → 生成 SQL → 返回结果」最小闭环,打磨到准确率优化、自校验、结果可视化、行级权限与防注入,部署到可访问环境。',
    badges: ['Text-to-SQL', '可上线', '权限隔离'], theme: 'enterprise' },
  { code: '04', title: 'Hermes/Openclaw 智能体系统(可上线)', subtitle: '引擎 · 工具 · 记忆 · 监控',
    body: '从智能体主循环、工具系统到长期记忆、多轮编排、异常降级与生产监控,搭出一套能上线、稳定、可运营的智能体系统。',
    badges: ['Agent 引擎', '生产部署', '监控告警'], theme: 'enterprise' },
  { code: '05', title: '面试题库 + 个人答案稿', subtitle: '大模型应用 / VibeCoding 与架构 两方向',
    body: '把课程里的 RAG / 智能体 / 架构实战,用 STAR 结构讲到面试官认可;沉淀两方向的高频题库与个人答案稿。',
    badges: ['题库', 'STAR 讲述', '答案稿'], theme: 'career' },
]

// 第二阶段服务模式
export const STAGE2_SERVICE_DRAFT = {
  note: '第二阶段服务安排',
  duration: '3 个月直播 · 6 个月服务期',
  title: '企业级实战直播 + 长期陪跑',
  highlight: '3 个月企业级实战直播 · 6 个月服务期内课程外问题持续答疑',
  body: '第二阶段以企业级实战直播为主,持续 3 个月,带你从零做出智能问数与智能体两套可上线系统;在 6 个月服务期内,直播之外的真实项目、求职准备等问题持续陪跑答疑。',
  features: [
    '3 个月企业级实战直播,带做两套可上线系统',
    '求职面试专题答疑',
    '6 个月服务期内,课程外真实项目与求职问题持续答疑',
    '专属沟通渠道',
  ],
}

export const STAGE1_PRICE = { now: '¥1999', original: '¥2999' }
export const STAGE2_PRICE = { now: '¥3999', includes: '含第一阶段全部内容' }

// 适合人群(拟稿待确认)
export const AUDIENCES = {
  stage1: { name: '零基础 AI 编程', price: '¥1999', coverage: '第一阶段 · 10 课',
    fit: '零开发经验、想用 AI 做出自己的应用' },
  stage2: { name: 'AI 编程专家', price: '¥3999', coverage: '第一阶段 + 第二阶段 · 共 24 课',
    fit: '已有基础、想进阶到企业级 AI 工程并拿下求职 offer' },
}

// 全景路径里程碑(第二阶段 3 簇;第一阶段复用 PROJECT_TIMELINE)
export type JourneyMilestone = { label: string; range: string; gain: string; theme: Stage2ThemeKey }
export const STAGE2_MILESTONES: JourneyMilestone[] = [
  { label: '能力进阶', range: '课 1–8', gain: '企业级工程能力 + RAG 应用 + 智能体', theme: 'advance' },
  { label: '企业实战', range: '课 9–12', gain: '2 套可上线的企业级实战系统', theme: 'enterprise' },
  { label: '求职冲刺', range: '课 13–14', gain: '面试题库 + 答案稿', theme: 'career' },
]
