import catalog from './catalog.generated.json'
import type { TemplatePresentation } from './types'

// 由类型化注册表生成的纯展示数据；此入口不得导入模板运行模块。
// JSON 导入会拓宽字符串字面量并丢失非空元组信息，断言仅限此序列化边界。
if (catalog.some(template => template.screenshots.length === 0)) {
  throw new Error('[site-templates] 生成目录缺少模板截图')
}
const templates = catalog as unknown as TemplatePresentation[]

export function getCatalogNewestFirst(): TemplatePresentation[] {
  return templates.toReversed()
}
