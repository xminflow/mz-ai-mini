import type { Advantage } from './advantage-data'
import type { EngagementStep } from './flow-data'
import type { OpsScreen } from './ops-data'
import type { ServiceItem } from './service-data'

export const EN_SERVICES: ServiceItem[] = [
  { code: '01', title: 'Business websites', hook: 'Turn your website into a growth channel', points: ['Brand and campaign websites', 'SEO and responsive layouts', 'Content built for conversion'], theme: 'cognition' },
  { code: '02', title: 'Business systems', hook: 'Bring scattered workflows into one place', points: ['CRM / ERP / OA', 'Inventory and admin platforms', 'Roles, permissions and approvals'], theme: 'backend' },
  { code: '03', title: 'Mobile experiences', hook: 'Meet your customers where they are', points: ['WeChat mini apps and H5', 'Native and cross-platform apps', 'One shared business backend'], theme: 'frontend' },
  { code: '04', title: 'AI agents', hook: 'A digital team that works around the clock', points: ['Service and business agents', 'Multi-turn dialogue and memory', 'Connected to real workflows'], theme: 'agent' },
  { code: '05', title: 'AI knowledge bases', hook: 'Put your knowledge to work', points: ['Retrieval-augmented answers', 'Company knowledge and documents', 'Private enterprise deployment'], theme: 'agent' },
  { code: '06', title: 'Analytics & BI', hook: 'See the signals behind your numbers', points: ['Operational dashboards', 'Automated reports', 'Alerts and trend analysis'], theme: 'launch' },
  { code: '07', title: 'SaaS platforms', hook: 'Build a product ready to grow', points: ['Multi-tenant architecture', 'Subscriptions and billing', 'From prototype to scale'], theme: 'advance' },
  { code: '08', title: 'Commerce systems', hook: 'Connect every step of the transaction', points: ['Stores, bookings and distribution', 'Payments, orders and fulfilment', 'Memberships and marketing'], theme: 'mobile' },
  { code: '09', title: 'Desktop apps', hook: 'One experience across Windows and Mac', points: ['Electron desktop applications', 'Offline capabilities', 'Automatic updates and delivery'], theme: 'mindset' },
  { code: '10', title: 'System integration', hook: 'Let systems connect. Let people create.', points: ['Third-party API integrations', 'Cross-system automation', 'Scheduled and async workflows'], theme: 'enterprise' },
  { code: '11', title: 'AI content tools', hook: 'Give a small team a bigger creative reach', points: ['Automated content workflows', 'Marketing assets at scale', 'Content and customer acquisition'], theme: 'career' },
  { code: '12', title: 'Enterprise AI', hook: 'Make existing systems smarter, step by step', points: ['Find high-value AI opportunities', 'Integrate with existing software', 'Incremental, uninterrupted rollout'], theme: 'agent' },
]

export const EN_ENGAGEMENT_STEPS: EngagementStep[] = [
  { deliverables: ["Dedicated architect","Requirements guidance"], code: '01', short: 'Discovery', title: 'Start with a conversation', tag: 'Free', lead: 'Work directly with a dedicated architect with at least 10 years of experience. We explore your business and project plans in depth. Even if your idea is still taking shape, we help you clarify it with practical advice grounded in real delivery experience.' },
  { deliverables: ["Requirements document","Pricing proposal"], code: '02', short: 'Scope & quote', title: 'A clear scope and fair quote', tag: 'Free', lead: 'Together, we turn your needs and decisions into a complete requirements document and a reasonable quote. We keep refining both with you until you are satisfied with the proposed scope and pricing.' },
  { deliverables: ["Custom contract","Code & IP ownership"], code: '03', short: 'Contract', title: 'Your rights, in writing', lead: 'Once the scope and quote are agreed, we provide a binding contract covering delivery timelines, acceptance and your ownership of the source code, business data and related intellectual property. The software truly belongs to you.' },
  { deliverables: ["Dedicated channel","Weekly progress updates"], code: '04', short: 'Progress', title: 'Stay involved throughout', lead: 'After signing, we set up a dedicated communication channel. Weekly progress updates and regular feedback keep development transparent and moving in the right direction.' },
  { deliverables: ["Feature acceptance","Design & feature refinement"], code: '05', short: 'Acceptance', title: 'Check every requirement', lead: 'Review each feature against the requirements document. If a function has an issue or a design needs improvement, we refine it to meet your expectations.' },
  { deliverables: ["Source code deployment","Documentation","Training"], code: '06', short: 'Launch', title: 'A complete handover', lead: 'After acceptance, we launch at an agreed time, deploy the full source code to your servers and test the live system. Detailed documentation and training give you everything you need to take ownership of the project.' },
  { deliverables: ["One year of maintenance","24/7 monitoring","Lifetime fixes within scope"], code: '07', short: 'Maintenance', title: 'Support that lasts', lead: 'Delivery includes one year of free maintenance, 24/7 monitoring and handling of abnormal issues within 24 hours. Bugs within the agreed delivery scope are fixed free of charge for life, including after the maintenance period.' },
]

export const EN_ADVANTAGES: Advantage[] = [
  { highlight: 'Service beyond delivery', question: 'What do you receive?', theirs: 'Code delivered. Job done.', ours: 'A complete service with clear standards for engineering and customer care. We build lasting relationships and a reputation you can trust.' },
  { highlight: 'Competitive pricing', question: 'How is pricing set?', theirs: 'Complexity means a higher bill.', ours: 'Years of large-project delivery, product development and AI-assisted engineering help us offer competitive pricing alongside excellent service.' },
  { highlight: 'Proactive monitoring', question: 'Who spots problems?', theirs: 'Wait for a customer report.', ours: 'Our own AI maintenance platform monitors service health and usage proactively, so we can find and fix problems before you need to report them.' },
  { highlight: '24/7 response', question: 'How soon is the response?', theirs: 'Two business days. No holidays.', ours: '24/7 response, on weekdays and holidays alike. The standard stays the same after delivery and payment, keeping your business supported.' },
  { highlight: 'Free fixes for life', question: 'After maintenance ends?', theirs: 'The contract ends. So does help.', ours: 'Bugs within the agreed delivery scope receive free fixes for life, even after the maintenance period ends.' },
  { highlight: 'Strict delivery standards', question: 'What about the unseen?', theirs: 'Only visible features matter.', ours: 'Data security, reliability, performance and disaster resilience all have strict delivery standards, helping your system run well for the long term.' },
  { highlight: '100% custom', question: 'Where does design begin?', theirs: 'An off-the-shelf, dated template.', ours: '100% custom design. We agree on the visual style and interactions with you, shaping the experience around your real business workflows.' },
  { highlight: 'Direct architect access', question: 'Who works with you?', theirs: 'A developer who misses the context.', ours: 'You work directly with an architect who understands your business, communicates clearly and proactively recommends better solutions.' },
]

export const EN_OPS_SCREENS: Record<OpsScreen['id'], { label: string; alt: string }> = {
  overview: { label: 'Project overview', alt: 'Weelume AI maintenance: projects, active alerts, availability and alert trends. Original Chinese product interface.' },
  inspect: { label: 'Agent inspections', alt: 'Weelume AI maintenance: inspection agents, findings and resolutions. Original Chinese product interface.' },
  alerts: { label: 'Alert centre', alt: 'Weelume AI maintenance: severity, acknowledgement, recovery and incident timelines. Original Chinese product interface.' },
  logs: { label: 'Logs and exceptions', alt: 'Weelume AI maintenance: log levels, exception trends and error groups. Original Chinese product interface.' },
}
