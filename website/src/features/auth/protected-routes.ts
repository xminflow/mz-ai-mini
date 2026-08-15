export const PROTECTED_ROUTES: string[] = ['/account']

export function isProtectedPath(pathname: string): boolean {
  // 章节子页（/playbook/xxx）需要登录；主目录页 /playbook 本身保持公开
  if (pathname.startsWith('/playbook/')) return true
  return PROTECTED_ROUTES.some((route) => {
    if (route === '/') return pathname === '/'
    return pathname === route || pathname.startsWith(`${route}/`)
  })
}
