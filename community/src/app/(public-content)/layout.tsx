import SiteShell from '@/components/SiteShell'

export default function PublicContentLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell>{children}</SiteShell>
}
