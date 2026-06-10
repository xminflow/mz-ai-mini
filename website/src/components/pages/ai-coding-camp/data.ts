// AI 编程训练营页面的数据与类型层：集中存放主题色、章节、交付物、讲师资历、
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
  kind: 'beginner' | 'difficulty'
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
    title: 'AI 工具学习',
    hours: '6–8 课时',
    deliverable: '一个能在本地浏览器打开的静态网页',
    theme: 'cognition',
    intro: '本章先补齐零基础最缺的认知地基，再带学员安装并跑通主力 AI 工具，最后做出第一版能本地打开的网页。',
    warning: {
      kind: 'beginner',
      label: '零基础提示',
      body: '1.1 与 1.2 是整门课的地基，宁可慢一点。学员在这里建立的概念地图，决定了后面九章是否「踩得稳」。',
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
    intro: '把「与 AI 高效交流」提升为本章核心能力，并教学员沉淀经验、搭建个人外脑。',
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
    intro: '承接第一章的静态页面，把它升级为有设计感、能适配手机的版本。',
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
    intro: '全程最陡的一段坡。本章特意放慢节奏：先把概念讲透再动手，并把「前后端联调」作为独立难点专门攻克。',
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
    intro: '点明智能体本质就是一个「调用大模型的后端服务」，与第五、六章一脉相承——做出一个可对话、有记忆的智能体应用。',
    lessons: [
      { code: '7.1', title: '认识智能体的基本结构', brief: '破除神秘感:它本质是个会调用大模型 API 的后端服务。' },
      { code: '7.2', title: '使用 AI 来设计自己的智能体', brief: '定义角色与能力边界，用 AI 协助设计提示词与行为。' },
      { code: '7.3', title: '给智能体接入记忆系统', brief: '衔接第五章数据库:记忆本质就是把对话存下来。' },
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
      { code: '9.2', title: '如何在小程序中设计自己的应用主题', brief: '把第四章的主题思路迁移到小程序，掌握界面要点。' },
      { code: '9.3', title: '基于 AI 开发自己的小程序应用', brief: '用熟悉的 AI 工作流，把已有应用的核心功能搬进小程序。' },
      { code: '9.4', title: '复用已有后端构造小程序服务', brief: '直接对接第五、六章的后端，不重复造轮子。' },
      { code: '9.5', title: '学会如何上线自己的小程序', brief: '掌握提交、审核、发布与后续更新流程。' },
    ],
  },
  {
    index: 10,
    title: '工程思想:长期稳定维护自己的软件应用',
    hours: '5–6 课时',
    deliverable: '一份属于自己的「长期维护 + 产品设计」检查清单',
    theme: 'mindset',
    intro: '数据安全已提前到第六章，本章聚焦真正长期、思想层面的内容，并对全程做一次完整复盘，作为收尾升华。',
    lessons: [
      { code: '10.1', title: '保证系统整洁 + 数据备份策略', brief: '承接第六章的安全意识，落到具体的备份与恢复实践。' },
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
    highlight: '每周固定时间在线直播 · 跟着节奏走完十章主线',
    body: '把十章系统化课程结构化交付给你，现场答疑、现场演示，节奏紧凑而不慌乱——一个月跑通从认识工具到独立上线全流程。',
    features: [
      '每周固定时间在线直播，按章节推进',
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
  { chapter: '第一章', milestone: '静态网页', detail: '用 AI 做出第一版能在本地浏览器打开的网页。', theme: 'cognition' },
  { chapter: '第三章', milestone: '美观响应式', detail: '掌握设计原则与组件库，做出美观、适配手机的页面。', theme: 'frontend' },
  { chapter: '第四章', milestone: '前端工程化', detail: '主题、组件、目录结构与控制台排错四件套到位。', theme: 'frontend' },
  { chapter: '第五章', milestone: '接上后端', detail: '数据库 + 接口 + 联调，第一个真正能用的全栈应用。', theme: 'backend' },
  { chapter: '第六章', milestone: '后端工程化', detail: '给后端加上日志、分层与数据安全基础。', theme: 'backend' },
  { chapter: '第七章', milestone: '智能体应用', detail: '做出一个可对话、有记忆的 AI 智能体应用。', theme: 'agent' },
  { chapter: '第八章', milestone: '部署上线', detail: '服务器、域名、HTTPS——让应用真正能被公网访问。', theme: 'launch' },
  { chapter: '第九章', milestone: '小程序形态', detail: '复用已有后端，发布一个微信小程序版本。', theme: 'mobile' },
  { chapter: '第十章', milestone: '长期维护', detail: '形成版本管理、备份、监控与产品设计的工程心智。', theme: 'mindset' },
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
    body: '十章不是十个孤立练习——前端、后端、智能体、上线、小程序按序叠加，后一章的能力都建立在前一章之上。每章都有看得见、摸得着的交付物。',
    theme: 'backend' as ThemeKey,
  },
  {
    eyebrow: '03',
    title: '核心理念',
    body: 'AI 不是魔法。学会「如何描述需求、如何读懂报错、如何把问题讲清楚给 AI」，是比任何具体工具都重要的能力——这条暗线将贯穿全部十章反复训练。',
    theme: 'agent' as ThemeKey,
  },
]

// 9 节点：在 1200×260 viewBox 中沿浅波浪线分布
export const TIMELINE_NODES_XY: ReadonlyArray<{ x: number; y: number }> = [
  { x: 60, y: 170 },
  { x: 200, y: 120 },
  { x: 340, y: 150 },
  { x: 480, y: 90 },
  { x: 620, y: 145 },
  { x: 760, y: 100 },
  { x: 900, y: 160 },
  { x: 1040, y: 105 },
  { x: 1140, y: 175 },
]

export const buildSmoothPath = () => {
  const pts = TIMELINE_NODES_XY
  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 0; i < pts.length - 1; i++) {
    const cur = pts[i]
    const next = pts[i + 1]
    const cx = (cur.x + next.x) / 2
    d += ` Q ${cx} ${cur.y}, ${cx} ${(cur.y + next.y) / 2} T ${next.x} ${next.y}`
  }
  return d
}
