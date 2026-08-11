export const LightFooter = () => {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-rule">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-2">
          <img src="/logo/weiyu-logo-web-dark.svg" alt="微域生光" className="h-8 w-8" />
          <span className="text-[14px] font-semibold tracking-tight text-graphite">微域生光</span>
        </div>
        <div className="flex flex-col gap-2 text-[12px] text-graphite-dim sm:flex-row sm:items-center sm:gap-6">
          <span className="inline-flex items-center gap-2">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-ember" />
            正在接收新的合作申请
          </span>
          <span>© {year} 微域生光</span>
        </div>
      </div>
    </footer>
  )
}
