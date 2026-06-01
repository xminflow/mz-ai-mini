import SiteHeader from './SiteHeader'
import SiteFooter from './SiteFooter'

export default function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">{children}</main>
      <SiteFooter />
    </div>
  )
}
