// 官网当前只对外开放首页（见 middleware.ts）。首页自带浅色导航与页脚
// （components/pages/home/HomeNav.tsx、HomeFooter.tsx），因此这里不再渲染
// 全站深色 TopNav / SiteFooter，也不再读取登录态。
//
// 恢复 studio / ai-coding-camp 等板块时，把下面三样接回来即可（文件都保留未删）：
//   import { SiteFooter } from '@/components/layout/SiteFooter'
//   import { TopNav } from '@/components/layout/TopNav'
//   import { getWebsiteAuthState } from '@/features/auth/server/session'
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <div className="relative flex min-h-screen flex-col">{children}</div>
}
