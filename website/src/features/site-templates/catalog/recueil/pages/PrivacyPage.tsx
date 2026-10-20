import type { SiteTemplatePageProps } from '../../../types'
import { pick, policies, t } from '../data'
import { Reveal, Shell } from '../components/Shell'

export default function PrivacyPage({basePath,locale='zh'}:SiteTemplatePageProps){
  return <Shell basePath={basePath} locale={locale}><article className="rc-policy rc-container"><Reveal><span className="rc-eyebrow">{t(locale,'隐私与演示说明','Privacy & demo notice')}</span><h1>{t(locale,'隐私说明','Privacy notice')}</h1><p className="rc-policy-intro">{t(locale,'关于你填写的信息，以及这个模板如何运作。用清楚的话，说明当前功能的真实边界。','A clear account of the information you enter and how this template works in its current demonstration state.')}</p></Reveal><div className="rc-policy-layout"><nav aria-label={t(locale,'说明目录','Notice contents')}>{policies.map((section,i)=><a key={i} href={`#policy-${i+1}`}><span>{String(i+1).padStart(2,'0')}</span>{pick(locale,section.title)}</a>)}</nav><div>{policies.map((section,i)=><section id={`policy-${i+1}`} key={i}><h2>{pick(locale,section.title)}</h2><p>{pick(locale,section.body)}</p></section>)}</div></div></article></Shell>
}
