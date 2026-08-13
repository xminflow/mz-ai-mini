import Link from "next/link";

const FOOTER_GROUPS: Array<{
  title: string;
  links: Array<{ label: string; href: string }>;
}> = [
  {
    title: "浏览",
    links: [
      { label: "软件定制", href: "/" },
      { label: "实战项目培训", href: "/studio" },
      { label: "AI架构师训练营", href: "/ai-coding-camp" },
    ],
  },
];

export const SiteFooter = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-16 border-t border-hairline bg-canvas sm:mt-24">
      <div className="pointer-events-none absolute inset-x-0 -top-px h-px hairline-divider" />
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-14">
        <div className="grid grid-cols-1 gap-8 sm:gap-10 md:grid-cols-[2fr_1fr]">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <img
                src="/logo/weiyu-logo-web-light.svg"
                alt="微域生光"
                className="h-10 w-10"
              />
              <span className="text-[15px] font-semibold tracking-tight text-ink">
                微域生光
              </span>
            </div>
          </div>
          {FOOTER_GROUPS.map((group) => (
            <div key={group.title} className="flex flex-col gap-3">
              <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted sm:text-[11px]">
                {group.title}
              </h4>
              <ul className="flex flex-col gap-2">
                {group.links.map((link) => (
                  <li key={`${group.title}-${link.label}`}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-ink-soft transition-colors hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-hairline pt-5 text-[11px] text-muted sm:flex-row sm:items-center sm:text-xs">
          <span>© {year} 微域生光</span>
          <span className="inline-flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.6)]" />
            正在接收新的合作申请
          </span>
        </div>
      </div>
    </footer>
  );
};
