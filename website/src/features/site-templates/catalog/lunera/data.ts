export const asset = (name: string): string => `/templates/lunera/assets/${name}`
export const templatePurchaseUrl = 'https://contra.com/payment-link/ydGWNDMc-lunera-framer-business-template'

export const features = [
  { title: '实时财务分析', description: '清晰呈现收支变化，随时掌握资金动态。', image: 'analytics-zh.svg' },
  { title: '自动生成报表', description: '告别重复整理，让财务摘要自动呈现。', image: 'reports.svg' },
  { title: '智能预算管理', description: '结合支出洞察，为每一笔开销做好规划。', image: 'budget.svg' },
  { title: '安全同步账户', description: '连接常用账户，让财务信息及时更新。', image: 'sync.svg' },
  { title: '成长趋势洞察', description: '直观了解财务进展，让下一步更有方向。', image: 'score.svg' },
]

export const steps = [
  { title: '连接常用账户', description: '将银行账户与业务工具汇聚一处，轻松开启财务管理。', image: 'sync.svg', icon: 'connect' },
  { title: '实时掌握收支', description: '在统一工作台查看收入、支出和趋势，重要变化一目了然。', image: 'live-chart-zh.svg', icon: 'trend' },
  { title: '从洞察走向行动', description: '看清财务全貌，将数据转化为切实可行的下一步计划。', image: 'reports.svg', icon: 'rocket' },
] as const

export const plans = [
  { name: '入门版', price: 0, description: '适合独立创业者与刚刚起步的新项目。', icon: 'cube', features: ['连接 1 个账户', '实时数据看板', '基础财务报表', '邮件支持', '最多 2 位团队成员'] },
  { name: '成长版', price: 25, description: '为准备扩展业务的小团队提供清晰洞察。', icon: 'growth', features: ['最多连接 5 个账户', '进阶数据分析', '自动生成报表', '优先邮件支持', '最多 10 位团队成员'] },
  { name: '专业版', price: 75, description: '满足成长型企业更复杂的财务管理需求。', icon: 'rocket', features: ['不限连接账户数量', '自定义数据看板', '报表导出', '专属服务支持', '不限团队成员数量'] },
] as const

export const reviews = [
  { name: '莎拉·陈', role: 'Stackly 联合创始人', image: 'sarah.png', title: '终于知道钱花在哪里了', text: '现在每天的例会都从清晰的现金流开始。关键数据放在一起，讨论下一步计划也更有依据。' },
  { name: '马库斯·里德', role: 'Folio Labs 首席执行官', image: 'marcus.png', title: '一个平台，省下三套工具', text: '卡片、支出和报表过去分散在不同工具里。现在共用一个看板，团队每周都能省下不少整理时间。' },
  { name: '普莉娅·奈尔', role: 'Calla Studio 创始人', image: 'priya.png', title: '支出习惯变得更有条理', text: '直观的分类让固定开销更容易理解。我们发现了不再需要的订阅，也及时调整了预算。' },
  { name: '丹尼尔·奥塞', role: 'Novu Health 业务经理', image: 'daniel.png', title: '界面清晰，上手很轻松', text: '第一次使用时，团队就能找到需要的信息。日常财务问题很快就能得到答案，不用再翻找复杂的工具。' },
]

export interface FaqItem { question: string; answer: string }

export const homeFaq: FaqItem[] = [
  { question: '微域生光如何帮助团队管理财务数据？', answer: '微域生光将账户动态、预算和报表整合到同一个视图。团队可以减少收集与整理数字的时间，把精力放在理解数据和制定计划上。' },
  { question: '可以连接现有的银行和财务工具吗？', answer: '产品设计包含银行与业务工具的引导式连接流程。当前网站为模板预览，账户连接仅作界面展示，尚未接入实际金融服务。' },
  { question: '企业的财务数据如何得到保护？', answer: '模板展示了注重数据保护的财务产品设计。预览页面不收集银行账户或支付凭证；正式上线时，应在此说明实际采用的数据保护措施。' },
  { question: '支持为成员设置不同的访问权限吗？', answer: '示例套餐覆盖不同规模的团队。接入实际服务后，可按组织需求配置所有者、管理员和只读成员等角色。' },
  { question: '首次使用需要完成哪些设置？', answer: '示例流程分为三步：连接账户、查看看板、了解财务洞察。实际设置时间取决于账户服务商以及所连接的工具。' },
]

export const contactFaq: FaqItem[] = [
  { question: '微域生光可以免费使用吗？', answer: '示例入门版为每月 0 美元。成长版和专业版展示付费套餐，包含更多连接账户、报表功能和团队成员额度。' },
  { question: '微域生光支持哪些银行卡和银行？', answer: '模板演示了银行连接和卡片管理界面。实际支持的银行与卡片类型，需要在接入正式服务商后明确。' },
  { question: '我的财务数据会被保存吗？', answer: '当前预览使用演示数据，不连接银行账户。正式上线前，应将此处内容替换为已核实的数据处理和隐私保护说明。' },
  { question: '可以用微域生光管理企业财务吗？', answer: '页面围绕创业者、小型企业和财务团队设计，涵盖支出分类、财务报表以及团队共享账户视图等场景。' },
  homeFaq[4],
]

export interface ArticleSection { heading: string; text: string }
export interface LuneraArticle {
  slug: string; title: string; description: string; image: string; imageAlt: string
  author: string; role: string; avatar: string; date: string; dateTime: string; sections: ArticleSection[]
}

// 正文按参考站的主题与段落结构重新撰写，路由、作者展示和封面保持一一对应。
export const articles: LuneraArticle[] = [
  {
    slug: '5-metrics', title: 'SaaS 创始人值得关注的五项指标',
    description: '从关键数字出发，看清订阅业务的增长状况与经营节奏。',
    image: 'post-metrics.png', imageAlt: '两位创业者在笔记本电脑前讨论财务数据',
    author: '莎拉·林', role: '产品策略顾问', avatar: 'author-sarah.jpeg', date: '2025年4月23日', dateTime: '2025-04-23',
    sections: [
      { heading: '建立清晰的经营视图', text: '一个有用的看板，首先要回答几个问题：客户是否持续使用？经常性收入是否增长？获得一位新客户需要多少成本？月度经常性收入、客户流失率、获客成本、客户生命周期价值和现金可支撑时长，能帮助创业者抓住重点，避免迷失在大量数据中。' },
      { heading: '让每项指标服务于决策', text: '当团队知道一个数字能支持什么行动时，它才有实际价值。可以结合产品活跃度观察留存，按渠道比较获客成本，再对照计划支出评估现金储备。为每项指标建立一致的定义，让大家基于同一张经营图景展开讨论。' },
      { heading: '养成定期复盘的习惯', text: '每周留出时间，观察有意义的变化并追查原因。记录当时做出的决定，在下一次复盘中检查结果。持续而聚焦的节奏，能让看板成为安排优先级的工作工具，而不是一份看过就归档的报表。' },
    ],
  },
  {
    slug: 'simpler-dashboard-experience', title: '我们如何打造更简洁的财务看板',
    description: '从前期调研到日常操作细节，了解清晰易用的看板是怎样设计出来的。',
    image: 'post-dashboard.png', imageAlt: '可以眺望海景的明亮工作空间',
    author: '杰克·陈', role: '用户体验设计负责人', avatar: 'author-jake.jpeg', date: '2025年4月16日', dateTime: '2025-04-16',
    sections: [
      { heading: '从日常问题开始', text: '我们围绕用户最常查看的信息组织看板：可用资金、近期支出，以及目标完成进度。先梳理这些任务，才能决定哪些内容应该出现在首屏，哪些细节可以在需要时再展开。' },
      { heading: '让重要信息更容易找到', text: '清晰的层级比增加一个组件更有帮助。把相关信息放在一起，使用熟悉的标签，让图表遵循一致的表达方式。辅助操作紧贴它所服务的任务，让主视图始终聚焦财务全貌。' },
      { heading: '在反馈中持续打磨', text: '简短的反馈交流能够暴露含糊的标签和多余步骤。我们观察用户如何在账户、报表和预算之间切换，再逐一调整细节，最终让看板围绕高频任务组织起来，更适合日常使用。' },
    ],
  },
  {
    slug: 'styling-elements', title: '为什么安全的数据同步如此重要',
    description: '好的账户连接体验，既要保护信息，也要让数据流向清晰可见。',
    image: 'post-security.png', imageAlt: '同事们庆祝一次顺利完成的合作',
    author: '劳伦·朴', role: '工程负责人', avatar: 'author-lauren.jpeg', date: '2025年3月19日', dateTime: '2025-03-19',
    sections: [
      { heading: '了解数据的流转过程', text: '连接工具可以节省时间，但每次连接都需要清楚说明。用户应当知道需要哪些信息、为什么需要，以及如何断开账户。好的同步体验，会在连接开始前就让这些选择清晰可见。' },
      { heading: '将保护措施融入连接流程', text: '正式运行的财务集成需要精细的访问范围、受保护的传输过程，以及可靠的权限复核机制。团队应根据已验证的控制措施选择服务商，并明确记录凭证、令牌和连接异常的处理方式。' },
      { heading: '让信任变得可感知', text: '有用的状态提示，会说明账户上次更新的时间，以及连接是否需要处理。直白的隐私说明和便捷的访问撤销方式，让用户更有掌控感。可靠同步来自负责任的工程实现，也来自清晰的交互体验。' },
    ],
  },
  {
    slug: 'importing-content', title: '让财务管理跟上创业公司的成长',
    description: '建立可持续的财务管理节奏，让业务增长时依然保持从容。',
    image: 'post-scaling.png', imageAlt: '团队围坐在桌边交流工作',
    author: '米格尔·雷耶斯', role: '创业顾问', avatar: 'author-miguel.jpeg', date: '2025年3月9日', dateTime: '2025-03-09',
    sections: [
      { heading: '打好可靠的数据基础', text: '在业务变得复杂之前，持续记录收入、固定支出和可用现金。清晰的分类与定期对账，有助于发现遗漏交易，也能看清今天的决定将如何影响下个月的资源。' },
      { heading: '围绕工作流程选择工具', text: '自动摘要和预算视图只有契合团队的实际工作，才能减少重复管理。先建立几项可靠流程，约定由谁复核；当业务量确实需要时，再加入预测或审批能力。' },
      { heading: '保持可持续的管理节奏', text: '简短的每周复盘，比季度末匆忙整理更容易坚持。定期讨论变化的成本、即将发生的支出和计划背后的假设。随着团队扩大，让职责持续清晰，财务可见性也能随之成长。' },
    ],
  },
  {
    slug: 'what-we-learned-from-10k-users', title: '从一万多位用户的反馈中获得的启发',
    description: '从反复出现的问题、日常习惯与真实反馈中，找到产品改进的方向。',
    image: 'post-users.png', imageAlt: '人们在协作空间中分享想法',
    author: '艾玛·赵', role: '客户体验负责人', avatar: 'author-emma.jpeg', date: '2025年2月25日', dateTime: '2025-02-25',
    sections: [
      { heading: '寻找反复出现的需求', text: '当多次交流中出现相似主题时，单个反馈就更有参考价值。我们围绕用户想完成的任务、遇到的障碍和期待的结果整理信息，借此区分个人偏好与持续存在的产品需求。' },
      { heading: '从日常习惯中学习', text: '定期查看少量关键目标的用户，往往能更清楚地感受到进展。简洁的报表、及时的账户更新和轻松的复盘节奏，都有助于建立这种习惯。这些观察引导我们聚焦改进，而不是不断堆叠功能。' },
      { heading: '让反馈形成闭环', text: '反馈值得得到回应，也需要一条进入产品决策的清晰路径。我们归纳相关需求，与用户一起验证想法，并说明后续变化。持续的交流，能让产品随用户群体的成长而贴近真实工作方式。' },
    ],
  },
]

export interface LegalSection { title: string; points: string[] }
export const privacySections: LegalSection[] = [
  { title: '收集的信息', points: ['正式服务可能在您使用相关功能时，请求联系信息、账户资料、账单和订单信息。', '技术信息可能包括浏览器信息、网络地址及经同意的访问分析数据。当前模板预览仅使用示例内容。'] },
  { title: '信息的使用方式', points: ['提供您请求的服务，并回复支持咨询。', '了解产品使用情况，改善使用体验。', '在您选择接收的情况下发送产品动态。', '履行适用义务，并调查不当使用行为。'] },
  { title: '信息的共享方式', points: ['说明接收个人信息的各类服务商。', '根据正式服务的实际安排，仅共享实现明确目的所需的信息。', '说明因适用义务或有效请求而披露信息的情形。'] },
  { title: 'Cookie 与追踪技术', points: ['列明实际部署的网站所使用的 Cookie 及类似技术。', '说明可用的同意选项，以及浏览器设置对体验的影响。'] },
  { title: '数据保护', points: ['运营方应说明实际采用的技术与组织管理措施。', '在线服务均存在一定风险，相关说明应以已核实的措施为依据。'] },
  { title: '您的权利与选择', points: ['在适用情况下，提供申请访问、更正或删除信息的明确流程。', '说明如何调整消息接收偏好，以及撤回可选项目的同意。'] },
  { title: '第三方链接', points: ['页面链接可能打开独立运营的网站。请阅读目标网站提供的隐私说明。'] },
  { title: '政策更新', points: ['发布修订内容及生效日期，并通过适当方式告知重大变更。', '保持政策内容与服务的实际行为一致。'] },
  { title: '联系方式', points: ['邮箱：privacy@[companyname].com', '电话：+1 (123) 456-7890', '地址：[国家／城市／详细地址]'] },
]
export const termsSections: LegalSection[] = [
  { title: '网站的使用', points: ['请按照已公布的要求及适用规则使用服务。', '尊重他人的访问权限、账户与信息。', '运营方可能按照正式服务协议的约定更新功能。'] },
  { title: '产品与订单', points: ['购买时应确认产品是否可用及其具体说明。', '正式服务应明确订单接受、修改与取消的处理方式。'] },
  { title: '付款与账单', points: ['公布支持的支付方式、计费周期与适用费用。', '用户应保持账单信息准确，并按已说明的流程咨询付款问题。'] },
  { title: '配送与交付', points: ['如提供实体产品，应说明配送地区、预计时效和运费。', '说明用户如何反馈交付延迟或物品遗失。'] },
  { title: '退货与退款', points: ['明确适用的退货期限、申请条件与退款流程。', '在完成购买前说明特定产品的例外情形。'] },
  { title: '知识产权', points: ['明确网站品牌、内容及素材的权利人或许可方。', '说明向用户授予的使用范围，以及申请进一步使用的方式。'] },
  { title: '责任范围', points: ['责任范围相关约定应结合实际服务和运营地区进行审查。', '本页面内容仅用于演示条款页面结构，正式财务产品上线前需要另行制定适用协议。'] },
  { title: '隐私政策', points: ['隐私政策说明服务处理个人信息的方式，以及用户可作出的选择。'] },
  { title: '条款更新', points: ['展示修订条款的生效日期，并说明重大更新的通知方式。'] },
  { title: '联系方式', points: ['邮箱：support@[companyname].com', '电话：+1 (123) 456-7890', '地址：[国家／城市／详细地址]'] },
]
