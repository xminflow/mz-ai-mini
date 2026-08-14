/**
 * 模板模块的可见性开关。判定只此一处：middleware 与页面都从这里取，禁止各判各的。
 *
 * 默认行为：开发环境开、生产环境关。
 * 显式覆盖：TEMPLATES_MODULE_ENABLED=true|false 两个方向都能强制指定。
 *   - 将来整体上架：生产环境设 true 即可，代码零改动。
 *   - 本地复现生产拦截：website/.env.local 里设 false 后重启 dev。
 *
 * 之所以把默认值写在代码里而不是靠 .env.development：.gitignore 忽略了 /website/.env.*，
 * 环境文件无法入库，纯环境变量方案会让任何人克隆仓库后模板模块默认不可见。
 *
 * 注意：本函数会在 Edge runtime 的 middleware 中执行，因此只能读取
 * process.env.X 这种静态字面量形式（Next.js 构建时内联），不能动态拼 key。
 */
export function isTemplatesModuleEnabled(): boolean {
  const raw = process.env.TEMPLATES_MODULE_ENABLED
  if (raw === 'true') return true
  if (raw === 'false') return false
  return process.env.NODE_ENV !== 'production'
}
