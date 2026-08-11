// 软件定制服务页的数据与类型层：集中存放主题色、服务矩阵、差异化卖点、
// 合作流程、技术栈背书等纯数据定义。本模块不含 JSX 与客户端逻辑。

export type ThemeKey =
  | "cognition"
  | "frontend"
  | "backend"
  | "agent"
  | "launch"
  | "mobile"
  | "mindset"
  | "advance"
  | "enterprise"
  | "career";

export type Theme = {
  label: string;
  hex: string;
  rgb: string;
  gradientFrom: string;
  gradientTo: string;
};

// 复用官网既有品牌色板（与 ai-coding-camp/data.ts 的 THEMES / STAGE2_THEMES 数值一致），
// 保持视觉同源；本页独立维护一份，避免跨 feature 页面互相引用。
export const THEMES: Record<ThemeKey, Theme> = {
  cognition: { label: "官网 · 品牌", hex: "#0099ff", rgb: "0, 153, 255", gradientFrom: "#7dadff", gradientTo: "#155eef" },
  frontend: { label: "小程序 · 应用", hex: "#01aef0", rgb: "1, 174, 240", gradientFrom: "#57beff", gradientTo: "#0284c7" },
  backend: { label: "企业系统", hex: "#8c5eff", rgb: "140, 94, 255", gradientFrom: "#af53ff", gradientTo: "#4a1fb8" },
  agent: { label: "智能体", hex: "#d42672", rgb: "212, 38, 114", gradientFrom: "#ff52b7", gradientTo: "#d1157a" },
  launch: { label: "数据 · 洞察", hex: "#f8ec1d", rgb: "248, 236, 29", gradientFrom: "#fff652", gradientTo: "#eaaa08" },
  mobile: { label: "交易 · 电商", hex: "#ff5a1f", rgb: "255, 90, 31", gradientFrom: "#ff7a4d", gradientTo: "#ff4405" },
  mindset: { label: "桌面 · 客户端", hex: "#bafa77", rgb: "186, 250, 119", gradientFrom: "#d4ff9e", gradientTo: "#16b364" },
  advance: { label: "SaaS 平台", hex: "#155eef", rgb: "21, 94, 239", gradientFrom: "#7dadff", gradientTo: "#175cd3" },
  enterprise: { label: "集成 · 自动化", hex: "#eaaa08", rgb: "234, 170, 8", gradientFrom: "#f8ec1d", gradientTo: "#92600E" },
  career: { label: "内容 · AIGC", hex: "#16b364", rgb: "22, 179, 100", gradientFrom: "#bafa77", gradientTo: "#0f766e" },
};

// 行业/场景清单：面向客户的「主」视角。客户按行业自我识别，避免「按软件类型切分」把
// 需求不在列表里的客户（如供应链）劝退。末尾「+ 您的行业」在 UI 层作为兜底 CTA 呈现。
export const INDUSTRIES: string[] = [
  "供应链",
  "物流",
  "制造",
  "外贸",
  "电商",
  "零售",
  "餐饮连锁",
  "医疗健康",
  "教育培训",
  "金融",
  "企业服务",
  "政务",
];

export type ServiceItem = {
  code: string;
  title: string;
  hook: string;
  points: string[];
  theme: ThemeKey;
};

export const SERVICES: ServiceItem[] = [
  {
    code: "01",
    title: "企业官网 & 品牌落地页",
    hook: "会自己获客的官网，3 秒抓住客户",
    points: ["品牌官网 / 营销活动页", "SEO 结构与移动端自适应", "内容与转化路径一体设计"],
    theme: "cognition",
  },
  {
    code: "02",
    title: "企业级管理系统",
    hook: "把 Excel 和微信群里的生意，装进一套系统",
    points: ["CRM / ERP / OA", "进销存 / 后台管理平台", "多角色权限与审批流"],
    theme: "backend",
  },
  {
    code: "03",
    title: "小程序 & 移动应用",
    hook: "客户在哪，您的入口就在哪",
    points: ["微信小程序 / H5", "原生 / 跨端 App", "复用已有后端，快速上线"],
    theme: "frontend",
  },
  {
    code: "04",
    title: "AI 智能体 / 数字员工",
    hook: "7×24 不下班的员工，一次培训永久上岗",
    points: ["智能客服 / 业务自动化 Agent", "多轮对话与长期记忆", "接入企业真实业务流程"],
    theme: "agent",
  },
  {
    code: "05",
    title: "AI 知识库 & 智能问答",
    hook: "让公司多年的经验，随问随答",
    points: ["RAG 检索增强问答", "企业知识库 / 文档助手", "私有数据不出企业"],
    theme: "agent",
  },
  {
    code: "06",
    title: "数据分析 & BI 看板",
    hook: "经营看板一屏看懂，决策不再靠拍脑袋",
    points: ["经营数据大屏", "自动化报表", "异常与趋势自动提醒"],
    theme: "launch",
  },
  {
    code: "07",
    title: "SaaS 产品 / 平台开发",
    hook: "从 0 到 1，把想法做成能收费的产品",
    points: ["多租户架构", "订阅计费体系", "从产品原型到规模化上线"],
    theme: "advance",
  },
  {
    code: "08",
    title: "电商 & 交易系统",
    hook: "下单、支付、履约，一条龙跑通",
    points: ["商城 / 预约 / 分销", "支付与订单履约", "会员与营销活动"],
    theme: "mobile",
  },
  {
    code: "09",
    title: "桌面客户端",
    hook: "Windows / Mac 一套代码，双端上线",
    points: ["Electron 跨平台桌面应用", "本地化工具与离线能力", "自动更新与安装包分发"],
    theme: "mindset",
  },
  {
    code: "10",
    title: "系统集成 & 流程自动化",
    hook: "让各个软件自己对话，人只管收结果",
    points: ["第三方 API 打通", "跨系统工作流自动化", "定时任务与异步处理"],
    theme: "enterprise",
  },
  {
    code: "11",
    title: "AIGC 内容工具",
    hook: "一个人，干出一个内容团队的产量",
    points: ["自动化内容生产", "营销素材批量生成", "呼应自媒体获客场景"],
    theme: "career",
  },
  {
    code: "12",
    title: "企业业务 AI 化改造",
    hook: "不推翻现有系统，一段段把 AI 接进去",
    points: ["先诊断哪些环节值得上 AI", "在现有系统上接入，不另起一套", "按环节分批改造，业务不停"],
    theme: "agent",
  },
];

export type Advantage = {
  title: string;
  body: string;
  theme: ThemeKey;
};

export const ADVANTAGES: Advantage[] = [
  {
    title: "上市公司 / 国央企架构经验",
    body: "团队核心成员具备 11 年大型企业与国央企架构经验，熟悉复杂系统的设计与演进。您的系统从底层即按可长期扩展的标准构建，规模增长也能稳定支撑。",
    theme: "cognition",
  },
  {
    title: "SaaS 赛道从 0 到 1 实战",
    body: "创始人拥有连续创业与 CTO 经历，主导过成功商业化的产品。既能落地技术，也懂业务与产品，帮您把想法打磨成可持续运营的业务。",
    theme: "backend",
  },
  {
    title: "持续深耕 AI",
    body: "我们持续深耕 AI 应用，清楚哪些环节能真正提升效率、降低成本，并将其稳妥落地到您的业务场景。",
    theme: "agent",
  },
  {
    title: "设计到交互全流程闭环",
    body: "从产品设计到开发上线，由同一支团队完整交付。对接高效、职责清晰，最终成品高度贴合您的预期。",
    theme: "frontend",
  },
  {
    title: "高效高质量交付",
    body: "严格把控进度与质量，按约定周期交付，确保系统稳定可靠、经得起长期使用。",
    theme: "launch",
  },
];

export type ProcessStep = {
  code: string;
  title: string;
  body: string;
  theme: ThemeKey;
};

export const PROCESS_STEPS: ProcessStep[] = [
  { code: "01", title: "聊需求", body: "先搞清楚您要解决什么问题，而不是急着报价。", theme: "cognition" },
  { code: "02", title: "出方案报价", body: "给一份看得懂的方案和明确报价，没有隐藏收费。", theme: "frontend" },
  { code: "03", title: "敏捷开发", body: "分阶段推进，随时可看进度，不做黑箱交付。", theme: "backend" },
  { code: "04", title: "验收交付", body: "对照方案逐项验收，确认没问题再上线。", theme: "agent" },
];

export const TECH_STACK: string[] = [
  "React",
  "Next.js",
  "Electron",
  "微信小程序",
  "FastAPI",
  "SQLAlchemy",
  "LangChain",
  "RAG",
  "Agent",
];
