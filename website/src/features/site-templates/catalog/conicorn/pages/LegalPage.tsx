'use client'

import type { SiteTemplatePageProps } from '../../../types'
import { Shell } from '../components/Shell'
import { useCopy } from '../components/Locale'
import '../theme.css'

export type LegalKind = 'terms' | 'privacy'

function LegalContent({ kind }: { kind: LegalKind }) {
  const { t } = useCopy()
  const privacy = kind === 'privacy'
  const title = privacy ? t('隐私政策', 'Privacy Policy') : t('服务条款', 'Terms of Service')
  const sections = privacy ? [
    [t('信息收集', 'Information We Collect'), t('当你提交联系表单时，我们只收集完成咨询所需的姓名、邮箱和项目描述。', 'When you submit the contact form, we collect only the name, email, and project description needed to respond to your inquiry.')],
    [t('信息使用', 'How We Use Information'), t('信息仅用于回复咨询、评估自动化需求和改进演示体验，不会出售给第三方。', 'Information is used to respond to inquiries, evaluate automation needs, and improve the demo experience. We do not sell it to third parties.')],
    [t('数据保留', 'Data Retention'), t('演示表单不会将数据发送到外部服务。真实项目的数据保留期限会在项目协议中明确。', 'The demo form does not send data to an external service. Retention periods for live projects are defined in the project agreement.')],
    [t('联系我们', 'Contact'), t('如果你对隐私有疑问，请通过联系页面与我们沟通。', 'If you have a privacy question, contact us through the contact page.')],
  ] : [
    [t('服务范围', 'Scope of Services'), t('Conicorn 为团队提供 AI 策略、工作流自动化、系统集成和持续优化服务。', 'Conicorn provides AI strategy, workflow automation, system integration, and ongoing optimization services.')],
    [t('项目交付', 'Project Delivery'), t('每个项目的范围、时间、费用和验收方式以双方确认的项目方案为准。', 'The scope, timeline, fees, and acceptance criteria for each project are defined in the agreed project plan.')],
    [t('知识产权', 'Intellectual Property'), t('客户提供的数据和素材归客户所有；定制交付物的使用权按项目协议执行。', 'Client-provided data and materials remain the client’s property. Usage rights for custom deliverables follow the project agreement.')],
    [t('联系与更新', 'Contact and Updates'), t('条款更新后会在本页面发布。继续使用演示站点表示你接受更新后的条款。', 'Updates to these terms will be published on this page. Continued use of the demo site indicates acceptance of the updated terms.')],
  ]
  return <><header className="cc-page-header"><span className="cc-pill">{privacy ? t('010 / 隐私', '010 / PRIVACY') : t('010 / 条款', '010 / TERMS')}</span><h1>{title}</h1><p>{t('最后更新：2026 年。', 'Last updated: 2026.')}</p></header><section className="cc-legal-page cc-section">{sections.map(([heading, body]) => <article key={heading}><h2>{heading}</h2><p>{body}</p></article>)}</section></>
}

export default function LegalPage({ kind, ...props }: SiteTemplatePageProps & { kind: LegalKind }) {
  return <Shell {...props}><LegalContent kind={kind} /></Shell>
}
