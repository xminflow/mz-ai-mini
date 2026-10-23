/**
 * 模板市场作为主站首页，开发与生产默认开启。
 * TEMPLATES_MODULE_ENABLED=true|false 仍可显式控制整个模块；关闭时不恢复旧软件定制首页。
 * middleware 与页面共用此判断，保持 process.env.X 的静态访问方式以兼容 Edge runtime。
 */
export function isTemplatesModuleEnabled(): boolean {
  const raw = process.env.TEMPLATES_MODULE_ENABLED
  if (raw === 'true') return true
  if (raw === 'false') return false
  return true
}
