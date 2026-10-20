// 首页「服务矩阵」的数据与类型层：主题色板与服务清单的纯数据定义，不含 JSX 与客户端逻辑。
// 原先放在一个独立的软件定制页目录里，该页下线后随唯一使用者 ServiceTypes 收敛到 home/。

// 主题键沿用早期命名，与卡片语义的对应关系如下（改键名会同时波及 SERVICES 的 theme 字段）：
//   cognition 官网·品牌 / frontend 小程序·应用 / backend 企业系统 / agent 智能体 /
//   launch 数据·洞察 / mobile 交易·电商 / mindset 桌面·客户端 / advance SaaS 平台 /
//   enterprise 集成·自动化 / career 内容·AIGC
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
  hex: string;
};

// 服务卡沿用类别映射，视觉统一读取首页品牌黄色令牌，避免数据层再次引入多套配色。
const SERVICE_THEME: Theme = {
  hex: "var(--home-brand-yellow)",
};

export const THEMES: Record<ThemeKey, Theme> = {
  cognition: SERVICE_THEME,
  frontend: SERVICE_THEME,
  backend: SERVICE_THEME,
  agent: SERVICE_THEME,
  launch: SERVICE_THEME,
  mobile: SERVICE_THEME,
  mindset: SERVICE_THEME,
  advance: SERVICE_THEME,
  enterprise: SERVICE_THEME,
  career: SERVICE_THEME,
};

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
