import { SiteFooter } from '@/components/layout/SiteFooter'
import { TopNav } from '@/components/layout/TopNav'
import { getWebsiteAuthState } from '@/features/auth/server/session'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const authState = await getWebsiteAuthState()
  return (
    <div className="relative flex min-h-screen flex-col">
      <TopNav initialAuthState={authState} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  )
}
