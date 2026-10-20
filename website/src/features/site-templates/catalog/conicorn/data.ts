export type Copy = readonly [zh: string, en: string]

export const asset = (name: string) => `/templates/conicorn/assets/${name}`

export const capabilities = [
  { label: ['AI 工作流自动化', 'AI Workflow Automation'] as Copy, text: ['跨部门自动处理重复任务，使用智能触发器与决策逻辑，让流程持续运行。', 'Automate repetitive tasks across departments using intelligent triggers and decision logic.'] as Copy, points: [['工作流梳理', 'Workflow mapping'], ['实时系统集成', 'Live system integrations'], ['结果验证', 'Outcome validation']] as Copy[] },
  { label: ['AI 聊天机器人', 'AI Chatbots & Agents'] as Copy, text: ['全天候客户支持、线索筛选、预约系统与 AI 销售代表，随时响应每一次机会。', '24/7 customer support, lead qualification, booking systems, and AI sales reps.'] as Copy, points: [['自然语言对话', 'Natural language conversations'], ['自动线索评分', 'Automatic lead scoring'], ['预约与跟进', 'Booking and follow-up']] as Copy[] },
  { label: ['CRM 与销售自动化', 'CRM & Sales Automation'] as Copy, text: ['自动推进销售管道，进行 AI 线索评分、跟进与预测，让团队专注高价值关系。', 'Pipeline automation, AI lead scoring, follow-ups, and predictive insights.'] as Copy, points: [['线索评分', 'Lead scoring'], ['自动跟进', 'Automated follow-ups'], ['预测洞察', 'Predictive insights']] as Copy[] },
  { label: ['数据与报告系统', 'AI Data & Reporting'] as Copy, text: ['自动生成仪表盘、经营分析与绩效预测，让每个决策都建立在实时数据之上。', 'Automated dashboards, business intelligence, and performance forecasting.'] as Copy, points: [['统一数据', 'Unified data'], ['实时仪表盘', 'Live dashboards'], ['绩效预测', 'Performance forecasting']] as Copy[] },
]

export const faqs = [
  ['你们服务哪些行业？', 'What industries do you work with?', '我们服务房地产、医疗、电商、金融、教育、法律、SaaS、营销机构和本地服务等行业。系统会根据你的工作流定制，无论你需要获客、客户支持、预约、CRM 自动化还是内部运营优化，都可以从流程开始设计。', 'We work with real estate, healthcare, e-commerce, finance, education, legal, SaaS, marketing agencies, and local service businesses. Our systems are customized to your workflows, from lead generation and support to booking, CRM automation, and internal operations.'],
  ['实施需要多久？', 'How long does implementation take?', '项目通常需要 2 至 6 周，具体取决于系统复杂度。AI 聊天机器人与 CRM 集成通常 2 至 3 周即可上线，多平台集成和复杂报告系统可能需要 4 至 6 周或更久。', 'Project timelines typically range from 2 to 6 weeks. Smaller chatbot and CRM systems can launch within 2–3 weeks, while multi-platform workflows and reporting dashboards may take 4–6 weeks or longer.'],
  ['没有技术背景也能合作吗？', 'Do we need technical knowledge to work with you?', '不需要。我们负责策略、设置、集成、测试与部署，并让团队在上线后能够轻松管理和使用系统。', 'No technical background is required. We handle strategy, setup, integrations, testing, and deployment so your team can easily manage the system after launch.'],
  ['AI 自动化安全吗？', 'Is AI automation secure?', '安全与数据隐私是每个系统的优先事项。我们使用安全 API、加密连接、基于角色的访问控制和可信平台，保护业务数据与系统可靠性。', 'Security and data privacy are priorities in every system. We use secure APIs, encrypted connections, role-based access controls, and trusted platforms to protect business data and reliability.'],
  ['可以带来什么回报？', 'What kind of ROI can we expect?', '回报通常来自减少人工、缩短响应时间、提高线索转化与运营效率。根据自动化范围，客户通常每周节省数十小时，同时扩展业务而不增加相同比例的管理成本。', 'ROI usually comes through less manual work, faster response times, higher lead conversion, and better operational efficiency. Depending on scope, clients often save dozens of hours per week while scaling without the same increase in overhead.'],
] as const

export const cases = [
  { image: 'case-property.png', title: ['房地产 AI 询盘机器人', 'AI Property Inquiry Chatbot'], text: ['筛选购房咨询、回答问题并自动安排看房。', 'Qualifies property inquiries, answers buyer questions, and schedules viewings.'], stats: [['3x', '线索响应', 'Lead response'], ['+40%', '看房预约', 'Viewings booked'], ['24/7', '持续互动', 'Always-on engagement']] },
  { image: 'case-project.png', title: ['创意团队项目管理自动化', 'AI Project Management Automation'], text: ['简化项目协调与任务分配，让交付更快、协作更顺畅。', 'Streamlines project coordination and task assignments for faster delivery.'], stats: [['+38%', '交付速度', 'Faster delivery'], ['-62%', '行政工作', 'Admin work'], ['4x', '团队效率', 'Team efficiency']] },
  { image: 'case-finance.png', title: ['金融 SaaS 工作流自动化', 'AI Workflow Automation for Finance SaaS'], text: ['分析业务流程，识别运营瓶颈并发现收入机会。', 'Identifies operational bottlenecks and uncovers revenue opportunities.'], stats: [['+40%', '演示预约', 'Demos booked'], ['+25%', '成交率', 'Close rate'], ['3x', '互动效率', 'Engagement']] },
] as const

export const caseDetails = {
  'ai-property-inquiry-chatbot-for-real-estate-firms': {
    title: ['房地产 AI 询盘机器人', 'AI Property Inquiry Chatbot for Real Estate Firms'] as Copy,
    image: 'case-property.png',
    intro: ['智能筛选购房咨询、回答买家问题并自动安排看房。', 'An intelligent chatbot that qualifies property inquiries, answers buyer questions, and schedules viewings.'] as Copy,
    challenge: ['客户线索分散在多个渠道，销售团队需要手动回复每一次咨询。', 'Property inquiries arrived from multiple channels and sales teams had to respond manually to every question.'] as Copy,
    solution: ['我们将对话式 AI、线索评分和 CRM 同步整合成一个全天候接待系统。', 'We connected conversational AI, lead scoring, and CRM sync into one always-on inquiry system.'] as Copy,
    results: [['3x', '线索响应', 'Lead response'], ['+40%', '看房预约', 'Viewings booked'], ['24/7', '持续互动', 'Always-on engagement']] as const,
  },
  'ai-project-management-automation-for-creative-teams': {
    title: ['创意团队项目管理自动化', 'AI Project Management Automation for Creative Teams'] as Copy,
    image: 'case-project.png',
    intro: ['让项目协调与任务分配自动流转，提升交付速度与协作体验。', 'Streamlining project coordination and task assignments for faster delivery and smoother collaboration.'] as Copy,
    challenge: ['项目状态依赖人工更新，交付节点和责任人经常需要反复确认。', 'Project status depended on manual updates, with delivery milestones and ownership checked repeatedly.'] as Copy,
    solution: ['我们把任务创建、状态提醒和客户更新连接到团队已有的工作流中。', 'We connected task creation, status reminders, and client updates to the team’s existing workflow.'] as Copy,
    results: [['+38%', '交付速度', 'Faster delivery'], ['-62%', '行政工作', 'Admin work'], ['4x', '团队效率', 'Team efficiency']] as const,
  },
  'ai-workflow-automation-for-finance-saas-company': {
    title: ['金融 SaaS 工作流自动化', 'AI Workflow Automation for Finance SaaS Company'] as Copy,
    image: 'case-finance.png',
    intro: ['分析业务流程，识别运营瓶颈并发现收入机会。', 'We analyze workflows, identify operational bottlenecks, and uncover revenue opportunities.'] as Copy,
    challenge: ['销售、客户成功和经营数据分散在不同工具，团队缺少统一视图。', 'Sales, success, and operating data lived in separate tools without one shared view.'] as Copy,
    solution: ['我们统一数据触发器、报告和跟进流程，形成可持续扩展的自动化层。', 'We unified data triggers, reporting, and follow-up into an automation layer built to scale.'] as Copy,
    results: [['+40%', '演示预约', 'Demos booked'], ['+25%', '成交率', 'Closing rate'], ['3x', '互动效率', 'Engagement']] as const,
  },
} as const

export const testimonials = [
  ['Daniel Kim', ['创始人，ScaleLabs Education', 'Founder, ScaleLabs Education'] as Copy, '过去我们的招生流程依赖人工跟进和表格记录。现在 AI 自动完成线索筛选、预约、提醒与 CRM 更新，一个季度内招生转化率提升了 35%。', 'Our enrollment process used to require manual follow-ups and spreadsheet tracking. Now, AI handles lead qualification, scheduling, reminders, and CRM updates automatically. We increased enrollment conversion by 35% in one quarter.'],
  ['Alex Johnson', ['运营负责人，Finovate Consulting', 'Head of Operations, Finovate Consulting'] as Copy, '安全与合规是我们最关注的问题。他们设计了高效、符合企业级安全标准的自动化架构。', 'Security and compliance were major concerns for us. They designed an automation architecture that was highly efficient and enterprise-grade secure.'],
  ['David Lee', ['创始人，Atodio Studio', 'Founder, Atodio Studio'] as Copy, '自动化系统每周为我们节省 30 多个小时，也显著提升了销售表现。', 'Their automation system saved us 30+ hours per week and dramatically improved our sales performance.'],
  ['Sarah Mitchell', ['首席运营官，BrightPath SaaS', 'COO, BrightPath SaaS'] as Copy, '我们的 CRM 现在可以智能运行，线索自动评分，跟进也无需人工操作。', 'Our CRM now runs intelligently, leads are scored automatically, and follow-ups happen without manual effort.'],
  ['Jonathan Reed', ['董事总经理，Nexora Digital Agency', 'Managing Director, Nexora Digital Agency'] as Copy, '他们把 CRM、邮件营销与报告连接成一个智能流程，让整个销售管道清晰可见。', 'They connected our CRM, email marketing, and reporting into one intelligent flow with complete pipeline visibility.'],
  ['Michael Tran', ['创始人兼 CEO，Skyline Realty Group', 'Founder & CEO, Skyline Realty Group'] as Copy, '我们减少了近 50% 的行政工作，并将合格预约提升了一倍。', 'We reduced admin work by nearly 50% and doubled qualified appointment bookings.'],
  ['Laura Martinez', ['首席营销官，Elevate Commerce Co.', 'CMO, Elevate Commerce Co.'] as Copy, '他们把分散的营销工具统一到一个智能生态中，实现了精准自动化。', 'They unified fragmented marketing tools into one intelligent ecosystem with precise automation.'],
] as const

export const team = [
  ['Taylor Jones', ['创始人兼 CEO', 'Founder & CEO'] as Copy, 'avatar-1.png'], ['Arjun Lim', ['首席技术官', 'CTO'] as Copy, 'avatar-2.png'], ['Minh Nguyen', ['AI 工程师', 'AI Engineer'] as Copy, 'avatar-3.png'], ['Aisha Rahman', ['设计负责人', 'Head of Design'] as Copy, 'avatar-4.png'], ['Leo Martin', ['技术负责人', 'Tech Lead'] as Copy, 'avatar-5.png'], ['Kevin Peterson', ['数据科学家', 'Data Scientist'] as Copy, 'avatar-6.png'], ['Naomi Walker', ['项目经理', 'Project Manager'] as Copy, 'avatar-7.png'],
] as const

export const integrations = ['HubSpot', 'Salesforce', 'Zoho', 'Mailchimp', 'ActiveCampaign', 'Zapier', 'OpenAI', 'Cloud AI', 'Make', 'Custom APIs']
