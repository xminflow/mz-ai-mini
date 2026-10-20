export type Copy = readonly [zh: string, en: string]
export const asset = (id: string) => `/templates/grovia/assets/${id}.webp`

export const features: { label: Copy; title: Copy; description: Copy; visual: 'customers' | 'metrics' | 'workflow' | 'team' }[] = [
  { label: ['客户门户', 'Client portal'], title: ['让团队与客户\n在同一处协作', 'Centralized access for teams and clients'], description: ['安全共享项目进展、文件、反馈与时间安排。无需切换平台，让每位参与者掌握同样的信息。', 'Securely share progress, files, feedback, and timelines with stakeholders. Keep everyone on the same page without switching platforms.'], visual: 'customers' },
  { label: ['指标追踪', 'KPI tracking'], title: ['让重要的进展\n清晰可见', 'Turn performance into clear insights'], description: ['将关键指标集中到清晰的看板，了解业务趋势，及时发现机会，让每次决策都有依据。', 'Bring your key metrics into one clear dashboard. Understand trends, identify opportunities, and make informed decisions.'], visual: 'metrics' },
  { label: ['工作流自动化', 'Workflow automation'], title: ['减少重复工作\n专注真正重要的事', 'Put repetitive work on autopilot'], description: ['连接任务、负责人和常用工具，让日常工作自动流转，把时间留给更有价值的创造。', 'Connect tasks, owners, and everyday tools. Automate routine handoffs and give your team more time for meaningful work.'], visual: 'workflow' },
  { label: ['团队管理', 'Team management'], title: ['让合适的人\n一起做好每件事', 'Build a team that moves together'], description: ['明确角色与职责，在统一空间协调任务、共享反馈，帮助团队保持方向一致。', 'Clarify roles, coordinate tasks, and share feedback in one workspace, keeping everyone aligned as you grow.'], visual: 'team' },
]

export const steps: { title: Copy; description: Copy }[] = [
  { title: ['轻松开启', 'Easy setup'], description: ['创建工作空间并邀请团队，几分钟即可准备就绪。', 'Create your workspace and invite your team. Get everything ready in minutes.'] },
  { title: ['高效协作', 'Collaborate'], description: ['分配任务，保持清晰沟通，让每位成员步调一致。', 'Assign tasks and keep communication clear. Everyone stays aligned.'] },
  { title: ['追踪增长', 'Track growth'], description: ['通过看板了解进展与趋势，专注真正重要的目标。', 'Use dashboards to monitor progress, trends, and what matters most.'] },
]

export const plans: { name: Copy; caption: Copy; price: number; description: Copy; items: Copy[] }[] = [
  { name: ['起步版', 'Starter'], caption: ['适合初创团队', 'For early-stage teams'], price: 24, description: ['为起步阶段的团队提供清晰洞察，稳步迈向下一个目标。', 'Ideal for early-stage teams who need actionable insights to move forward.'], items: [['核心功能访问', 'Access to core features'], ['基础绩效报表', 'Basic performance reporting'], ['邮件支持', 'Email support'], ['战略上手指南', 'Strategy onboarding guide'], ['每月进度摘要', 'Monthly check-in summary']] },
  { name: ['成长版', 'Growth'], caption: ['热门之选', 'Most popular'], price: 49, description: ['为持续成长的团队连接流程、数据与日常协作。', 'Connect workflows, insights, and collaboration for a growing team.'], items: [['包含起步版全部功能', 'Everything in Starter'], ['进阶分析与自定义指标', 'Advanced analytics and custom KPIs'], ['工作流自动化', 'Workflow automation'], ['优先支持', 'Priority support'], ['定期战略回顾', 'Regular strategy reviews']] },
  { name: ['规模版', 'Scale'], caption: ['适合快速扩展的业务', 'For fast-scaling startups'], price: 99, description: ['为复杂业务提供灵活集成与持续支持，让扩展更从容。', 'Flexible integrations and dedicated support for more complex operations.'], items: [['包含成长版全部功能', 'Everything in Growth'], ['定制集成方案', 'Custom integrations'], ['专属协作支持', 'Dedicated advisory support'], ['组织级权限管理', 'Organization-wide access controls'], ['定制增长路线图', 'Tailored growth roadmap']] },
]

export const faqs: { question: Copy; answer: Copy }[] = [
  { question: ['你们服务哪些类型的企业？', 'What types of companies do you work with?'], answer: ['我们与各行业的初创企业、小型企业及成长团队合作。无论科技、零售还是服务行业，都可以结合团队需求调整方案。', 'We partner with startups, small businesses, and growing teams across industries. Whether you are in tech, retail, or services, our solutions adapt to your needs.'] },
  { question: ['多久能看到变化？', 'How long does it take to see results?'], answer: ['通常在最初几周就能观察到流程改善。更深入的运营调整，一般需要 2 至 3 个月持续推进。具体效果取决于团队目标与实施情况。', 'Most clients begin noticing improvements within the first few weeks. For deeper operational changes, we typically see lasting impact within 2 to 3 months. Results depend on your goals and implementation.'] },
  { question: ['可以连接我们现有的工具吗？', 'Can Weelume integrate with our existing tools?'], answer: ['可以。方案支持与 Slack、Notion、Google Workspace 等常用工具协作。当前模板展示集成方式，实际连接需接入对应服务。', 'Yes. The platform is designed to work with Slack, Notion, Google Workspace, and more. This template demonstrates integrations; live connections require service setup.'] },
  { question: ['可以选择单次咨询或长期支持吗？', 'Do you offer one-time consultations or ongoing support?'], answer: ['两种方式都可以。根据业务目标与团队需求，选择单次战略讨论或持续顾问支持。', 'Both. You can engage us for one-time strategy sessions or ongoing advisory support depending on your goals and team needs.'] },
  { question: ['开始合作需要哪些步骤？', 'What does onboarding look like?'], answer: ['从启动讨论开始，了解现状、对齐目标，再共同制定适合团队的实施路线图。', 'Our onboarding process is simple and collaborative. We start with a kickoff session, align on goals, and provide a tailored roadmap to guide the next steps.'] },
]

export const team: { name: Copy; role: Copy; image: string }[] = [
  { name: ['索菲娅·雷诺兹', 'Sophia Reynolds'], role: ['创始人兼首席执行官', 'Founder & CEO'], image: 'xpMG8oUdEw7CpqLRsue7IqHi0BI' },
  { name: ['卢卡斯·里维拉', 'Lucas Rivera'], role: ['首席财务官', 'CFO'], image: '45k1dkhYTRA3baw3QGQscvhIxf8' },
  { name: ['艾米莉·约翰逊', 'Emily Johnson'], role: ['首席设计师', 'Lead Designer'], image: 'VBSgebMoKxmwTXmrevgnbZZS2y0' },
  { name: ['伊桑·摩尔', 'Ethan Moore'], role: ['项目经理', 'Project Manager'], image: 'ldx5nQyCav6RcxlyX1wdvjZ6ICs' },
]

export const reviews: { quote: Copy; name: Copy; role: Copy; image: string }[] = [
  { quote: ['微域生光帮助我们理顺运营，以超出预期的速度成长。战略思考与落地执行，让变化真正发生。', 'Weelume helped us streamline our operations and scale faster than we imagined. Their mix of strategy and execution is unmatched.'], name: ['塔莉娅·史密斯', 'Talia Smith'], role: ['Forma 产品负责人', 'Head of Product at Forma'], image: '5JOZsibBgQ896ZHozxgNAzUBVR4' },
  { quote: ['合作过程就像团队多了一位伙伴。他们理解我们的挑战，也带来了真实、可衡量的成果。', 'Working with Weelume felt like having an extension of our team. They understood our challenges and delivered real, measurable results.'], name: ['乔丹·约翰逊', 'Jordan Johnson'], role: ['Metricon 首席运营官', 'COO at Metricon'], image: 'VBSgebMoKxmwTXmrevgnbZZS2y0' },
  { quote: ['从第一次讨论开始，团队就为招聘策略带来了清晰方向。现在，协作与团队表现都有了显著改善。', 'From the first meeting, Weelume brought clarity and momentum to our hiring strategy. We have seen a major improvement in team performance.'], name: ['塞缪尔·托雷斯', 'Samuel Torres'], role: ['Bloomtech 创始人', 'Founder at Bloomtech'], image: '3ipsfIRe38epPP7KIRIcBwg3YQE' },
]
