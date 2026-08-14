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
 * 注意：必须保持 process.env.X 这种静态字面量写法，不能动态拼 key。
 * 原因不是「构建时内联」——TEMPLATES_MODULE_ENABLED 不是 NEXT_PUBLIC_* 前缀，
 * 也没有写进 next.config 的 env 字段，不会被构建期内联替换。真正的原因是：
 * middleware 跑在 Edge runtime，Node 页面/路由跑在 Node runtime，不同 runtime
 * 对 process.env 的注入方式并不一致（且未来 Turbopack 等构建器的实现也可能各不相同），
 * 只有静态字面量形式的写法才能保证在所有这些情形下都被正确识别、正确取到值。
 *
 * 好消息：正因为它不依赖构建时内联，生产环境可以在运行时注入这个变量
 *（docker `-e TEMPLATES_MODULE_ENABLED=true` 或 `.env.production`），
 * middleware 就能读到，不需要重新构建镜像——这正是「上架只改一个环境变量」这个
 * 承诺在技术上能成立的基础。
 */
export function isTemplatesModuleEnabled(): boolean {
  const raw = process.env.TEMPLATES_MODULE_ENABLED
  if (raw === 'true') return true
  if (raw === 'false') return false
  return process.env.NODE_ENV !== 'production'
}
