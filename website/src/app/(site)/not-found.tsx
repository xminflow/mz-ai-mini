import Link from 'next/link'

import { buttonClassName } from '@/components/ui'

// 官网只开放首页，其余路径由 middleware 307 回首页，因此这一页只对带扩展名的路径
//（不走 matcher）可达。它用浅色 token，不能再引深色那套，否则浅底浅字看不见。
export default function NotFound() {
  return (
    <section className="relative mx-auto flex w-full max-w-3xl flex-col items-center gap-5 px-4 py-24 text-center sm:gap-6 sm:px-6 sm:py-32">
      <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-graphite-dim">404</span>
      <h1 className="text-[clamp(1.6rem,4vw,2.5rem)] font-semibold leading-[1.2] tracking-[-0.02em] text-graphite">
        页面暂未上线
      </h1>
      <p className="max-w-md text-[15px] leading-[1.85] text-graphite-soft">
        您访问的路径不存在，或内容尚未公开。
      </p>
      <Link href="/" className={buttonClassName('primary', 'mt-2')}>
        回到首页
      </Link>
    </section>
  )
}
