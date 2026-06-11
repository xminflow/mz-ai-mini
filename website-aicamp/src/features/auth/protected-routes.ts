// 本期只做登录态基础设施：首页与所有现有页面公开，无强制登录页面。
// 未来新增受保护页面时，往 PROTECTED_ROUTES 添加路径前缀即可（中间件会重定向到 /login）。
export const PROTECTED_ROUTES: string[] = []

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => {
    if (route === '/') return pathname === '/'
    return pathname === route || pathname.startsWith(`${route}/`)
  })
}
