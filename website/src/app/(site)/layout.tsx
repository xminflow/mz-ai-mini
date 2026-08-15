// 官网当前只对外开放首页（白名单见 middleware.ts）。
// 首页套 components/layout/LightShell.tsx，浅色导航、页脚、底部 CTA 与咨询弹窗都由它提供，
// 因此这里不再渲染全站深色 TopNav / SiteFooter，也不再读取登录态。
//
// 之所以不把 LightShell 提到这一层：本 layout 还包着十几个已隐藏的深色页面，
// 在这里套浅色外壳会对那些页面做出错误断言。
//
// 恢复信息库 / 会员等已隐藏板块时，把下面三样接回来即可（文件都保留未删）：
//   import { SiteFooter } from '@/components/layout/SiteFooter'
//   import { TopNav } from '@/components/layout/TopNav'
//   import { getWebsiteAuthState } from '@/features/auth/server/session'
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <div className="relative flex min-h-screen flex-col">{children}</div>
}
