import type { TemplateLocale } from '../../types'
import * as zh from './data'
import type { LuneraArticle, LegalSection, FaqItem } from './data'

const features = [
  { title: 'Real-time analytics', description: 'See your cash flow clearly and stay on top of every change.', image: 'analytics.svg' },
  { title: 'Automated reports', description: 'Skip the busywork with financial summaries that build themselves.', image: 'reports.svg' },
  { title: 'Smarter budgets', description: 'Plan each expense with insights into where your money goes.', image: 'budget.svg' },
  { title: 'Secure account sync', description: 'Connect your everyday accounts and keep your finances up to date.', image: 'sync.svg' },
  { title: 'Growth insights', description: 'Understand your progress and find a clear direction for what comes next.', image: 'score.svg' },
]
const steps = [
  { title: 'Connect your accounts', description: 'Bring your bank accounts and business tools together in one place.', image: 'sync.svg', icon: 'connect' },
  { title: 'Follow your cash flow', description: 'See income, spending, and trends in one dashboard. Spot what matters at a glance.', image: 'live-chart.svg', icon: 'trend' },
  { title: 'Turn insight into action', description: 'Understand the bigger picture and make a practical plan for your next move.', image: 'reports.svg', icon: 'rocket' },
] as const
const plans = [
  { name: 'Starter', price: 0, description: 'For independent founders and projects just getting started.', icon: 'cube', features: ['1 connected account', 'Live dashboard', 'Basic financial reports', 'Email support', 'Up to 2 team members'] },
  { name: 'Growth', price: 25, description: 'Clear insights for small teams ready to grow their business.', icon: 'growth', features: ['Up to 5 connected accounts', 'Advanced analytics', 'Automated reports', 'Priority email support', 'Up to 10 team members'] },
  { name: 'Pro', price: 75, description: 'For growing businesses with more complex financial needs.', icon: 'rocket', features: ['Unlimited connected accounts', 'Custom dashboards', 'Report exports', 'Dedicated support', 'Unlimited team members'] },
] as const
const reviews = [
  { name: 'Sarah Chen', role: 'Co-founder at Stackly', image: 'sarah.png', title: 'Finally, clarity on our spending', text: 'Our daily check-ins now start with a clear view of cash flow. With the key numbers together, planning our next steps feels much more grounded.' },
  { name: 'Marcus Reed', role: 'CEO at Folio Labs', image: 'marcus.png', title: 'One platform, three fewer tools', text: 'Cards, expenses, and reports used to live in different places. A shared dashboard saves our team hours of organizing every week.' },
  { name: 'Priya Nair', role: 'Founder at Calla Studio', image: 'priya.png', title: 'Better habits, clearer budgets', text: 'Simple categories make recurring costs easy to understand. We spotted subscriptions we no longer needed and adjusted our budget in time.' },
  { name: 'Daniel Osei', role: 'Business manager at Novu Health', image: 'daniel.png', title: 'Clear from the very first day', text: 'Our team could find what they needed right away. Everyday financial questions get quick answers without digging through complicated tools.' },
]
const homeFaq: FaqItem[] = [
  { question: 'How does Weelume help teams manage their finances?', answer: 'Weelume brings account activity, budgets, and reports into one view. Spend less time gathering numbers and more time understanding them and making plans.' },
  { question: 'Can I connect my existing banks and tools?', answer: 'The product design includes a guided connection flow for banks and business tools. This template preview demonstrates the interface; live financial services are not connected.' },
  { question: 'How is financial information protected?', answer: 'The template demonstrates a privacy-conscious financial product. The preview collects no bank accounts or payment credentials. A live service should describe its verified data protection measures here.' },
  { question: 'Can team members have different access levels?', answer: 'The example plans cover teams of different sizes. Once a live service is connected, organizations can configure owner, administrator, and read-only roles to suit their needs.' },
  { question: 'What do I need to get started?', answer: 'The example journey has three steps: connect accounts, explore the dashboard, and review insights. Actual setup time depends on the account provider and connected tools.' },
]
const contactFaq: FaqItem[] = [
  { question: 'Is Weelume free to use?', answer: 'The example Starter plan is $0 per month. Growth and Pro demonstrate paid plans with more connections, reporting features, and team members.' },
  { question: 'Which banks and cards does Weelume support?', answer: 'This template demonstrates bank connections and card management. Supported institutions and card types should be confirmed when a live provider is integrated.' },
  { question: 'Will my financial information be stored?', answer: 'The preview uses demonstration data and does not connect to bank accounts. Replace this copy with verified processing and privacy details before launching a live service.' },
  { question: 'Can I use Weelume for business finances?', answer: 'The pages are designed around founders, small businesses, and finance teams, including expense categories, reports, and shared account views.' },
  homeFaq[4],
]

// 路由、封面、日期等结构数据复用中文版本，译文按 slug 显式关联，避免语言间顺序耦合。
const articleCopy: Record<string, Omit<LuneraArticle, 'slug' | 'image' | 'avatar' | 'dateTime'>> = {
  '5-metrics': {
    title: 'Five metrics every SaaS founder should follow', description: 'Understand the growth and rhythm of your subscription business through a few essential numbers.', imageAlt: 'Two founders discussing financial data at a laptop', author: 'Sarah Lin', role: 'Product strategy consultant', date: 'April 23, 2025',
    sections: [
      { heading: 'Build a clear view of your business', text: 'A useful dashboard starts with a few questions. Are customers staying? Is recurring revenue growing? What does it cost to acquire a customer? Monthly recurring revenue, churn, acquisition cost, lifetime value, and cash runway help founders focus without getting lost in a sea of numbers.' },
      { heading: 'Give every metric a decision to support', text: 'A number becomes useful when the team knows what action it informs. Review retention alongside product activity, compare acquisition costs by channel, and assess cash reserves against planned spending. Agree on consistent definitions so everyone works from the same picture.' },
      { heading: 'Make regular reviews a habit', text: 'Set aside time each week to notice meaningful changes and investigate their causes. Record the decisions you make, then revisit the results. A focused rhythm turns a dashboard into a tool for setting priorities rather than a report that disappears into a folder.' },
    ],
  },
  'simpler-dashboard-experience': {
    title: 'How we designed a simpler dashboard experience', description: 'From early research to everyday details, a look at designing a clear and useful financial dashboard.', imageAlt: 'A bright workspace overlooking the sea', author: 'Jake Chen', role: 'UX design lead', date: 'April 16, 2025',
    sections: [
      { heading: 'Start with everyday questions', text: 'We organize the dashboard around the information people check most: available cash, recent spending, and progress toward their goals. Understanding those tasks comes before deciding what belongs on the first screen and what can wait until it is needed.' },
      { heading: 'Make important information easy to find', text: 'A clear hierarchy does more than another widget. Keep related information together, use familiar labels, and give charts a consistent visual language. Put supporting actions beside their tasks so the main view stays focused on the financial picture.' },
      { heading: 'Keep refining through feedback', text: 'Short feedback sessions reveal unclear labels and unnecessary steps. We observe how people move between accounts, reports, and budgets, then refine those details. The result is a dashboard organized around frequent tasks and comfortable daily use.' },
    ],
  },
  'styling-elements': {
    title: 'Why secure data synchronization matters', description: 'A good account connection protects information while making the flow of data easy to understand.', imageAlt: 'Colleagues celebrating a successful collaboration', author: 'Lauren Park', role: 'Engineering lead', date: 'March 19, 2025',
    sections: [
      { heading: 'Understand the flow of data', text: 'Connected tools save time, but every connection needs a clear explanation. People should know what information is needed, why it is needed, and how to disconnect. A thoughtful sync experience makes those choices visible before a connection begins.' },
      { heading: 'Build protection into the connection', text: 'Live financial integrations need carefully scoped access, protected transmission, and reliable permission reviews. Teams should choose providers based on verified controls and clearly document how credentials, tokens, and connection errors are handled.' },
      { heading: 'Make trust visible', text: 'Useful status messages show when an account last updated and whether a connection needs attention. Plain privacy explanations and straightforward access revocation give people control. Reliable sync comes from responsible engineering and clear interaction design.' },
    ],
  },
  'importing-content': {
    title: 'Financial habits that grow with your startup', description: 'Build a sustainable financial routine so your business can grow with confidence.', imageAlt: 'A team sharing ideas around a table', author: 'Miguel Reyes', role: 'Startup advisor', date: 'March 9, 2025',
    sections: [
      { heading: 'Start with reliable information', text: 'Track revenue, recurring expenses, and available cash before the business becomes complicated. Clear categories and regular reconciliation help reveal missing transactions and show how decisions today affect resources next month.' },
      { heading: 'Choose tools around the workflow', text: 'Automated summaries and budget views reduce administrative work when they fit how a team actually operates. Start with a few dependable routines and agree who reviews them. Add forecasting or approvals when business volume makes them useful.' },
      { heading: 'Keep a sustainable rhythm', text: 'A short weekly review is easier to maintain than a scramble at the end of each quarter. Discuss changing costs, upcoming expenses, and the assumptions behind a plan. Keep responsibilities clear as the team expands so financial visibility grows with it.' },
    ],
  },
  'what-we-learned-from-10k-users': {
    title: 'What we learned from more than 10,000 users', description: 'Finding a direction for improvement in recurring questions, everyday habits, and real feedback.', imageAlt: 'People exchanging ideas in a collaborative workspace', author: 'Emma Zhao', role: 'Customer experience lead', date: 'February 25, 2025',
    sections: [
      { heading: 'Look for recurring needs', text: 'Individual feedback becomes more useful when similar themes appear across conversations. We organize input around the task someone wants to complete, the obstacle they encounter, and the outcome they expect. This helps separate personal preferences from persistent product needs.' },
      { heading: 'Learn from everyday habits', text: 'People who regularly review a small set of goals tend to have a clearer sense of progress. Simple reports, timely account updates, and an easy review routine help build that habit. These observations guide focused improvements rather than an endless list of new features.' },
      { heading: 'Close the feedback loop', text: 'Feedback deserves a response and a clear path into product decisions. We group related needs, test ideas with users, and explain what changes next. Ongoing conversations help the product stay connected to real work as its community grows.' },
    ],
  },
}
const articles: LuneraArticle[] = zh.articles.map(article => {
  const copy = articleCopy[article.slug]
  if (!copy) throw new Error(`[lunera:i18n] Missing article translation: ${article.slug}`)
  return { ...article, ...copy }
})
const privacySections: LegalSection[] = [
  { title: 'Information we collect', points: ['A live service may request contact details, account information, billing details, and order information when you use relevant features.', 'Technical information may include browser details, network addresses, and consented analytics. This template preview uses example content only.'] },
  { title: 'How information is used', points: ['Provide requested services and respond to support inquiries.', 'Understand product usage and improve the experience.', 'Send product news when you choose to receive it.', 'Meet applicable obligations and investigate misuse.'] },
  { title: 'How information is shared', points: ['Identify the categories of providers that receive personal information.', 'Share only the information needed for stated purposes, according to the live service arrangements.', 'Explain disclosures required by applicable obligations or valid requests.'] },
  { title: 'Cookies and tracking', points: ['List the cookies and similar technologies used by the deployed website.', 'Explain available consent choices and how browser settings affect the experience.'] },
  { title: 'Data protection', points: ['The operator should describe its actual technical and organizational measures.', 'Online services involve some risk. Descriptions should reflect verified measures.'] },
  { title: 'Your rights and choices', points: ['Where applicable, provide a clear process to request access, correction, or deletion.', 'Explain how to adjust communication preferences and withdraw optional consent.'] },
  { title: 'Third-party links', points: ['Links may open independently operated websites. Read the privacy notices provided by those websites.'] },
  { title: 'Policy updates', points: ['Publish revisions and effective dates, and communicate significant changes appropriately.', 'Keep the policy consistent with the actual behavior of the service.'] },
  { title: 'Contact details', points: ['Email: privacy@[companyname].com', 'Phone: +1 (123) 456-7890', 'Address: [Country / City / Street address]'] },
]
const termsSections: LegalSection[] = [
  { title: 'Using the website', points: ['Use the service according to published requirements and applicable rules.', 'Respect other people’s access permissions, accounts, and information.', 'The operator may update features under the published service agreement.'] },
  { title: 'Products and orders', points: ['Confirm availability and product details before purchase.', 'A live service should explain how orders are accepted, changed, or cancelled.'] },
  { title: 'Payments and billing', points: ['Publish supported payment methods, billing cycles, and applicable charges.', 'Keep billing information accurate and follow the published process for payment inquiries.'] },
  { title: 'Shipping and delivery', points: ['If physical products are offered, explain delivery areas, estimates, and shipping fees.', 'Describe how to report delayed delivery or missing items.'] },
  { title: 'Returns and refunds', points: ['State return periods, eligibility requirements, and refund procedures.', 'Explain product-specific exceptions before a purchase is completed.'] },
  { title: 'Intellectual property', points: ['Identify the owners or licensors of the website brand, content, and assets.', 'Explain permitted use and how to request further usage rights.'] },
  { title: 'Scope of responsibility', points: ['Review responsibility provisions against the actual service and operating regions.', 'This page demonstrates a terms layout. A live financial product needs an agreement tailored to its operations.'] },
  { title: 'Privacy policy', points: ['The privacy policy explains how personal information is handled and the choices available to users.'] },
  { title: 'Updates to these terms', points: ['Display the effective date of revised terms and explain how significant updates are announced.'] },
  { title: 'Contact details', points: ['Email: support@[companyname].com', 'Phone: +1 (123) 456-7890', 'Address: [Country / City / Street address]'] },
]

const en = { features, steps, plans, reviews, homeFaq, contactFaq, articles, privacySections, termsSections }
export function getContent(locale: TemplateLocale) {
  return locale === 'en' ? en : zh
}
