// 首页「合作流程」板块的数据层：两种合作模式的对比 + 七步流程与每步的产出物。
//
// 与 custom-software/data.ts 里的 PROCESS_STEPS 无关——那份是旧版四步流程，保留未动。
// 本文件不含 JSX 与客户端逻辑。

export const MODE_CHECKLIST = '先定清单'
export const MODE_ITERATIVE = '边做边定'

export type ModeComparisonRow = {
  label: string
  checklist: string
  iterative: string
}

// 选错模式对双方代价都很高，因此把对比放在流程之前，让客户先自己对号入座。
export const MODE_COMPARISON: ModeComparisonRow[] = [
  {
    label: '适合你如果',
    checklist: '已经清楚要什么',
    iterative: '还说不清具体要什么，得看到东西才能决定',
  },
  {
    label: '怎么报价',
    checklist: '功能拆成一条条，逐项标价',
    iterative: '先梳理大体框架，按周计价：总价 = 周数 × 周单价',
  },
  {
    label: '什么是固定的',
    checklist: '功能范围和总价都固定',
    iterative: '总周期和总价固定，做什么可以边走边调',
  },
  {
    label: '怎么收尾',
    checklist: '对照清单逐项验收',
    iterative: '每周确认，周期结束结项',
  },
  {
    label: '这几种情况请走另一种',
    checklist: '需求还在变、说不清',
    iterative:
      '招投标项目（合同要有明确范围）、有硬上线时间点（展会 / 大促前必须上）、公司里没人能当场拍板优先级',
  },
]

// 「边做边定」的地基句。不写清这一句，客户会把这个模式理解成「固定价钱做完我全部想法」，
// 范围就没有边界了——这是这类合作最主要的亏损来源。
export const ITERATIVE_PREMISE =
  '你买的是这段时间里的开发产能。想加东西可以，但要从清单里拿掉分量差不多的一项——总时间是固定的。'

export type EngagementModeBlock = {
  mode: string
  body: string
  bullets?: string[]
}

export type EngagementStep = {
  code: string
  title: string
  lead?: string
  /** 「你能拿到」——每步都要有客户可验证的产出物，这是把「相信我」换成「你自己看」的唯一办法 */
  gain?: string
  why?: string
  notes?: string[]
  /** 两项 = 两种模式分列；一项 = 只有该模式才有的附加约定 */
  modeBlocks?: EngagementModeBlock[]
  /** 工期 / 费用 / 付款节点 */
  meta?: string
}

export const ENGAGEMENT_STEPS: EngagementStep[] = [
  {
    code: '01',
    title: '先聊一次，免费',
    lead: '先搞清楚你要解决什么问题，不谈技术，顺便判断你适合哪种模式。',
    gain: '一个明确答复——能做、不建议做，或者建议换个更省钱的做法',
    meta: '当天回复 · 免费',
  },
  {
    code: '02',
    title: '出报价',
    modeBlocks: [
      {
        mode: MODE_CHECKLIST,
        body: '把你要的东西拆成一条条功能，逐项标价、标工期。你能拿到功能清单、逐项报价、总工期，以及一份验收标准——这份标准就是日后验收时逐条对照的依据。',
      },
      {
        mode: MODE_ITERATIVE,
        body: '一起梳理出大体框架，把想做的事排出优先级。按周计价，预算不够就减周数、不降标准。总周期在这一步一次定死，写进合同。',
      },
    ],
    meta: '3–5 个工作日 · 免费',
  },
  {
    code: '03',
    title: '签合同，建项目群',
    lead: '签合同、排开发计划、拉项目微信群。',
    gain: '合同、排期表、项目群（你和业务负责人都在群里）、一个唯一对接人',
    modeBlocks: [
      {
        mode: MODE_ITERATIVE,
        body: '还会约定每周固定的会议时间，每周至少一次。',
      },
    ],
    meta: '分阶段付款，具体比例按项目规模定 · 对公转账，专票普票都能开',
  },
  {
    code: '04',
    title: '每周给你一个能上手试的版本',
    lead: '网站和管理系统给测试网址，小程序给体验版二维码，App 和桌面软件给安装包。做偏了第一周就发现，不用等到最后返工。',
    modeBlocks: [
      {
        mode: MODE_ITERATIVE,
        body: '还多这几条：',
        bullets: [
          '每周至少开一次会，只干三件事：看上周做出来的东西、定下周做什么、处理清单调整',
          '想加新的可以，但要从清单里拿掉分量差不多的一项——总时间是固定的',
          '每次会议出纪要发在群里，纪要就是需求变更的正式记录',
          '如果你连续缺席会议，我们按上一次纪要继续推进',
        ],
      },
    ],
    meta: '到约定进度节点付款',
  },
  {
    code: '05',
    title: '验收',
    modeBlocks: [
      {
        mode: MODE_CHECKLIST,
        body: '拿第 02 步那份验收标准，一条条过。你能拿到逐项验收记录，不是一句「差不多了」。',
      },
      {
        mode: MODE_ITERATIVE,
        body: '每周会议确认过的成果就是分段验收，周期结束时结项，交付的是已确认成果之和。周期内没排上的功能不承诺免费补做——想继续做，续购下一个周期。',
      },
    ],
    meta: '验收通过后付尾款',
  },
  {
    code: '06',
    title: '上线，全部交给你',
    lead: '部署到你的服务器或云账号上。',
    gain: '源码、部署文档、数据库、全部账号密码——全部归你',
    why: '以后自己维护还是换人接手，都不用重做一遍',
  },
  {
    code: '07',
    title: '一年免费维保，7×24 小时响应',
    lead: '上线后一年内，系统出问题随时找我们，7×24 小时响应、故障优先处理。',
    notes: [
      '覆盖范围：故障修复与小幅调整；新增功能另行报价',
      '一年之后：按订单总价 10% / 年续费，服务标准不变',
    ],
  },
]
