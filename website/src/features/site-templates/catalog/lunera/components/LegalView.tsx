import { getTranslator } from '../messages'
import Link from 'next/link'
import type { SiteTemplatePageProps } from '../../../types'
import type { LegalSection } from '../data'
import { Reveal } from './Motion'
import { LuneraShell } from './Shared'
import '../theme.css'

export function LegalView({ basePath, locale = 'zh', title, sections, type }: SiteTemplatePageProps & { title: string; sections: LegalSection[]; type: 'privacy-policy' | 'terms-and-conditions' }) {
  const t = getTranslator(locale)
  return <LuneraShell basePath={basePath} locale={locale}><article className="ln-legal"><Reveal className="ln-legal-heading"><h1>{title}</h1><p>{t("版本 1.0 · 更新日期：2025年5月24日")}</p></Reveal>
    <div className="ln-legal-body">{sections.map((section, index) => <Reveal key={section.title}><section><h2>{index + 1}. {section.title}</h2><ul>{section.points.map(point => <li key={point}>{point}</li>)}</ul></section></Reveal>)}</div>
    <nav className="ln-legal-navigation" aria-label={t("政策与条款")}><Link href={`${basePath}/legal-terms/privacy-policy`} aria-current={type === 'privacy-policy' ? 'page' : undefined}>{t("隐私政策")}</Link><Link href={`${basePath}/legal-terms/terms-and-conditions`} aria-current={type === 'terms-and-conditions' ? 'page' : undefined}>{t("服务条款")}</Link></nav>
    <p className="ln-legal-note">{t("本页为模板演示内容。正式上线前，请根据实际服务替换组织信息、隐私政策与服务条款。")}</p>
  </article></LuneraShell>
}
