import type { Metadata } from 'next'

import { SectionHeading } from '@/components/ui'
import { TemplateRow } from '@/features/site-templates/workbench/TemplateRow'
import { SITE_TEMPLATES } from '@/features/site-templates/registry'

// 与首页同理：不定义 openGraph，避免整体替换掉根 layout 的 images 等字段。
export const metadata: Metadata = {
  title: '案例',
  description: '微域生光按业务场景整理的项目样板：官网、小程序、管理后台，按你要做的东西挑。',
  // 必须显式覆盖：根 layout 把 canonical 定死指向 '/'，不覆盖的话这里会静默继承成首页，
  // 而 /cases 是将来要独立可索引的着陆页，指向首页会让这个设计前提直接落空。
  alternates: {
    canonical: '/cases',
  },
}

export default function CasesPage() {
  return (
    <>
      <SectionHeading
        as="h1"
        eyebrow="Cases"
        title="按你要做的东西挑"
        description="左侧按业务场景分类。每个场景下是我们做过的同类项目样板，点开可以直接翻完整页面。"
        align="left"
      />

      {/* 整行式陈列，不用网格：TemplateRow 自带上边细线做行分隔 */}
      <div className="mt-12">
        {SITE_TEMPLATES.map((template) => (
          <TemplateRow key={template.id} template={template} />
        ))}
      </div>
    </>
  )
}
