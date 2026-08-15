import type { Metadata } from 'next'

import { SectionHeading } from '@/components/ui'
import { SceneContact } from '@/features/site-templates/gallery/SceneContact'
import { getListedTemplates } from '@/features/site-templates/gallery/selectors'
import { TemplateRow } from '@/features/site-templates/workbench/TemplateRow'

// 与首页同理：不定义 openGraph，避免整体替换掉根 layout 的 images 等字段。
export const metadata: Metadata = {
  title: '案例',
  description: '微域生光按业务场景整理的项目案例：官网、小程序、管理后台，按你要做的东西挑。',
  // 必须显式覆盖：根 layout 把 canonical 定死指向 '/'，不覆盖的话这里会静默继承成首页，
  // 而 /cases 是将来要独立可索引的着陆页，指向首页会让这个设计前提直接落空。
  alternates: {
    canonical: '/cases',
  },
}

export default function CasesPage() {
  const templates = getListedTemplates()

  return (
    <>
      <SectionHeading
        as="h1"
        eyebrow="Cases"
        title="按你要做的东西挑"
        description="左侧按业务场景分类，从官网、小程序到管理后台。点开任一场景，能看到我们在那类项目上的做法。"
        align="left"
      />

      {templates.length > 0 ? (
        /* 整行式陈列，不用网格：TemplateRow 自带上边细线做行分隔 */
        <div className="mt-12">
          {templates.map((template) => (
            <TemplateRow key={template.id} template={template} />
          ))}
        </div>
      ) : (
        /* 一套都还没上架时的样子。不放空列表也不放「敬请期待」：
           写清楚为什么现在没有，比留白更有交代。 */
        <div className="mt-10 border-l-2 border-blue/40 pl-5">
          <p className="max-w-[34em] text-[15px] leading-[1.9] text-graphite-soft">
            可以公开展示的成品还在逐套整理，所以这里暂时没有可以直接翻的完整页面。
            想看我们具体做过什么，直接联系我们——会挑与你业务最接近的项目讲给你听。
          </p>
          <SceneContact />
        </div>
      )}
    </>
  )
}
