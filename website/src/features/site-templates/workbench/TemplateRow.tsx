import Link from 'next/link'
import { getGroupOfScene, getSceneById } from '../taxonomy'
import type { SiteTemplate } from '../types'

/**
 * 目录里的一套模板占满一整行，而不是网格里的一张缩略卡。
 *
 * 理由有两个：一是模板只有两三套时，三列网格必然留下空列，看着像没做完；
 * 二是这个页面卖的是"每套模板各有各的设计语言"，缩略图尺寸根本承载不了这句话。
 * 整行 + 大封面才给得出足够的观感，行与行之间只用一条细线分隔，不做卡片套卡片。
 */
export function TemplateRow({ template }: { template: SiteTemplate }) {
  // 眉标走 taxonomy 的「一级分类 / 场景」，而不是再存一份行业字符串——
  // sceneId 是唯一事实来源，注册表已经校验过它一定存在于场景清单里。
  const scene = getSceneById(template.sceneId)
  const group = getGroupOfScene(template.sceneId)
  const category = [group?.name, scene?.name].filter(Boolean).join(' / ')

  return (
    <Link
      href={`/templates/${template.id}/preview`}
      className="group relative block border-t border-rule py-12 lg:py-16"
    >
      {/* 分隔线左端这一小段用的是模板自己的强调色——整个目录页唯一的彩色来源是它陈列的模板，
          而不是我另外发明的装饰色。悬停时这段色线铺满整行，是全页唯一的一处编排动效。 */}
      <span
        aria-hidden
        className="absolute -top-px left-0 h-px w-16 transition-[width] duration-500 ease-out group-hover:w-full motion-reduce:transition-none"
        style={{ backgroundColor: template.accentColor }}
      />

      <div className="grid gap-8 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-7">
          {/* 封面用原生 img：next/image 处理 SVG 需要打开 dangerouslyAllowSVG，
              为一个开发期工具改全局配置不值得。 */}
          <img
            src={template.cover}
            alt={`${template.name} 封面`}
            className="rounded-card aspect-[16/10] w-full border border-rule bg-paper-raised object-cover shadow-soft transition-shadow duration-500 group-hover:shadow-soft-lg motion-reduce:transition-none"
          />
        </div>

        <div className="flex flex-col lg:col-span-5">
          <p className="font-mono text-[11px] tracking-[0.2em] text-graphite-dim">{category}</p>
          <h2 className="mt-3 text-[26px] font-semibold leading-[1.2] tracking-[-0.02em] lg:text-[32px]">
            {template.name}
          </h2>
          <p className="mt-5 text-[15px] leading-[1.85] text-graphite-soft">{template.summary}</p>
          <p className="mt-6 font-mono text-[12px] leading-relaxed text-graphite-dim">
            {template.tags.join(' · ')}
          </p>

          {/* mt-auto 把这块压到行底，与封面下沿对齐。
              这里列出页面名而不是只写「5 个页面」：右栏底部本来会空出一大块，
              用真实内容填比用留白填诚实——读者在点进去之前就知道这套模板包含什么。 */}
          <div className="mt-8 lg:mt-auto lg:pt-10">
            <p className="border-t border-rule pt-5 font-mono text-[12px] leading-[2] text-graphite-dim">
              {template.pages.map((page) => page.title).join(' · ')}
            </p>
            <p className="mt-5 flex items-baseline gap-2 text-[14px] text-graphite">
              <span>查看预览</span>
              <span
                aria-hidden
                className="transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"
              >
                →
              </span>
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}
