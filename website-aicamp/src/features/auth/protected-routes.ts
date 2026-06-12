// 本期只做登录态基础设施：首页与所有现有页面公开，无强制登录页面。
// 未来新增受保护页面时，往 PROTECTED_ROUTES 添加路径前缀即可（中间件会重定向到 /login）。
// /course 及其子路径需登录；会员等级在 course/layout 与小节页用 requireTier 进一步校验
export const PROTECTED_ROUTES: string[] = ['/course']

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => {
    if (route === '/') return pathname === '/'
    return pathname === route || pathname.startsWith(`${route}/`)
  })
}
