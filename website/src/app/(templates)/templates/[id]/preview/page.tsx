import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSurfaceById, getTemplateById } from '@/features/site-templates/registry'
import { PreviewFrame } from '@/features/site-templates/workbench/PreviewFrame'
import { TEMPLATE_PLATFORM_LABELS } from '@/features/site-templates/types'

interface RouteParams {
  id: string
}

interface PreviewSearchParams {
  // Next.js 对重复的同名 query（如 ?surface=a&surface=b）在运行时会给出 string[]，
  // 而不是 string；只声明 string 会让类型系统对这种输入撒谎。
  surface?: string | string[]
}

/** 重复传参视同未传：绝不能让数组静默流进字符串比较。 */
function readParam(value: string | string[] | undefined): string | undefined {
  return typeof value === 'string' ? value : undefined
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>
}): Promise<Metadata> {
  const { id } = await params
  const template = getTemplateById(id)
  return { title: { absolute: template ? `预览 · ${template.name}` : '预览' } }
}

export default async function TemplatePreviewPage({
  params,
  searchParams,
}: {
  params: Promise<RouteParams>
  searchParams: Promise<PreviewSearchParams>
}) {
  const { id } = await params
  const { surface: requestedSurface } = await searchParams

  const template = getTemplateById(id)
  if (!template) notFound()

  // 不带 ?surface 时预览第一个端；注册表保证 surfaces 非空
  const surfaceId = readParam(requestedSurface)
  const activeSurface = surfaceId ? getSurfaceById(template, surfaceId) : template.surfaces[0]
  if (!activeSurface) notFound()

  /**
   * 预览一律从该端首页进，**不提供页面切换**。
   *
   * 模板站点自己就有导航（官网的顶部菜单、控制台的侧边栏），预览页顶上再列一遍全部页面
   * 是同一件事说两遍；更重要的是，客户要判断的恰恰是"这套东西自己好不好用"，
   * 让他用模板自己的导航翻页才是真实体验，外挂一排 tab 反而把这一点遮住了。
   *
   * 代价明确：模板必须自带能覆盖全部页面的站内导航，否则某些页面在预览里点不到。
   * 这条写进了 README 的约束，新增模板时要自查。
   */
  const previewSrc = `/templates/${template.id}/${activeSurface.id}`

  /**
   * 窗口地址栏里显示的是一个示意域名，不是模板在本站的真实路径。
   * 路径形如 /templates/aegis/console 会立刻暴露"这是嵌在别人站里的一个页面"，
   * 而这块窗口要传达的恰恰相反——框里是一个独立的站点。
   * 域名用 IANA 保留给文档示例的 example.com 子域，不会撞上任何真实机构。
   * 多端时用端 id 做子域，让「官网」与「后台」在地址栏里也是两个站。
   *
   * 只显示主机名不显示路径：iframe 内部导航时这个装饰性地址栏不会跟着变，
   * 带上路径反而会与框里的实际页面对不上。
   */
  const mockAddress =
    template.surfaces.length > 1
      ? `${activeSurface.id}.${template.id}.example.com`
      : `${template.id}.example.com`

  return (
    <main className="mx-auto w-full max-w-[1600px] px-6 pb-24 pt-14 sm:px-10">
      <Link
        href="/templates"
        className="font-mono text-[12px] tracking-[0.14em] text-graphite-dim transition hover:text-graphite"
      >
        ← 工作台
      </Link>

      <div className="mt-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-4 border-b border-rule pb-8">
        <div>
          <h1 className="text-[clamp(1.75rem,3.2vw,2.5rem)] font-semibold leading-[1.1] tracking-[-0.03em]">
            {template.name}
          </h1>
        </div>
        <a
          href={previewSrc}
          target="_blank"
          rel="noreferrer"
          className="text-[14px] text-graphite-dim transition hover:text-graphite"
        >
          在新标签打开 ↗
        </a>
      </div>

      {/* 端切换只在多端时出现。端之间是彼此独立的站点，模板内部不会有跨端的导航，
          所以这一层必须由工作台提供——和页面切换不是一回事。 */}
      {template.surfaces.length > 1 ? (
        <nav aria-label="切换端" className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
          {template.surfaces.map((surface) => {
            const isActive = surface.id === activeSurface.id
            return (
              <Link
                key={surface.id}
                href={`/templates/${template.id}/preview?surface=${surface.id}`}
                aria-current={isActive ? 'page' : undefined}
                className={
                  isActive
                    ? 'rounded-btn border border-blue px-3 py-1.5 text-[13px] text-graphite'
                    : 'rounded-btn border border-rule px-3 py-1.5 text-[13px] text-graphite-dim transition hover:border-rule-strong hover:text-graphite'
                }
              >
                {surface.name}
                <span className="ml-2 text-graphite-dim">
                  {TEMPLATE_PLATFORM_LABELS[surface.platform]}
                </span>
              </Link>
            )
          })}
        </nav>
      ) : null}

      <div className="mt-10">
        <PreviewFrame
          src={previewSrc}
          title={`${template.name} - ${activeSurface.name}`}
          address={mockAddress}
          accentColor={template.accentColor}
        />
      </div>
    </main>
  )
}
