import { NextResponse, type NextRequest } from 'next/server'

// 官网当前只对外开放首页，其余路径统一 307 回首页。页面与组件代码均保留未删。
//
// 恢复某个板块时：
//   1. 把它的路径前缀加进 PUBLIC_PATH_PREFIXES，例如 '/studio'
//   2. 若该板块需要登录，把 token 静默续签与受保护路由判断接回本文件
//      （续签实现保留在 features/auth/server/backend.ts，受保护路由判断保留在
//       features/auth/protected-routes.ts，两者都未删除）
//   3. 同步更新 app/sitemap.ts 的路径清单与 (site)/layout.tsx 的导航渲染
const PUBLIC_PATH_PREFIXES: string[] = ['/', '/service-models']

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATH_PREFIXES.some((prefix) => {
    // '/' 只按精确匹配，否则会把所有路径都放行
    if (prefix === '/') return pathname === '/'
    return pathname === prefix || pathname.startsWith(`${prefix}/`)
  })
}

export function middleware(request: NextRequest) {
  if (isPublicPath(request.nextUrl.pathname)) {
    return NextResponse.next()
  }

  // Next.js 15 的 middleware adapter 会用 new URL(Location) 解析响应头，相对路径会抛 Invalid URL → 500。
  // 走 request.nextUrl.clone() 保证是绝对地址，host 由 Next.js 按 x-forwarded-host 解析。
  const target = request.nextUrl.clone()
  target.pathname = '/'
  target.search = ''
  return NextResponse.redirect(target, 307)
}

// 排除 /api、/_next，以及任何带扩展名的路径——后者覆盖 public 下的静态资源
// （/logo/*.svg、/og/cover.png、/contact.jpg、/favicon.svg）与 robots.txt、sitemap.xml。
export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
}
