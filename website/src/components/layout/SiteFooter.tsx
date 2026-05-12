import Link from "next/link";

const FOOTER_GROUPS: Array<{
  title: string;
  links: Array<{ label: string; href: string }>;
}> = [
  {
    title: "浏览",
    links: [
      { label: "首页", href: "/" },
      { label: "行业报告", href: "/cases" },
      { label: "AI+服务", href: "/ai-services" },
      { label: "关于我们", href: "/about" },
    ],
  },
  {
    title: "我们做什么",
    links: [
      { label: "IP 定位", href: "/ai-services" },
      { label: "IP 生产系统", href: "/ai-services" },
      { label: "长期策略顾问", href: "/ai-services" },
      { label: "行业报告订阅", href: "/cases" },
    ],
  },
  {
    title: "联系",
    links: [
      { label: "免费1v1咨询", href: "/about" },
      { label: "加微信", href: "/about" },
      { label: "合作邮箱", href: "/about" },
    ],
  },
];

export const SiteFooter = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-16 border-t border-hairline bg-canvas sm:mt-24">
      <div className="pointer-events-none absolute inset-x-0 -top-px h-px hairline-divider" />
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-14">
        <div className="grid grid-cols-2 gap-8 sm:gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="col-span-2 flex flex-col gap-3 md:col-span-1">
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
            <p className="max-w-sm text-[13px] leading-[1.8] text-muted">
              多数生意的放缓，不来自商业模式，而来自 AI
              时代的价值尚未进入你的体系。我们为经营者与创业者，重构 IP
              与品牌资产。
            </p>
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
