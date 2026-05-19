import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050507] px-4 text-center text-[#fffdf7]">
      <section className="flex max-w-md flex-col items-center gap-5">
        <span className="font-mono text-xs tracking-[0.4em] text-[#8a7e6f]">404</span>
        <h1 className="font-serif-zh text-[30px] font-semibold tracking-[0.08em]">
          页面暂未上线
        </h1>
        <p className="text-sm leading-[1.9] text-[#b8aa96]">
          你访问的路径不存在，或内容尚未公开。可以回到方法论首页继续浏览。
        </p>
        <Link
          href="/playbook"
          className="inline-flex rounded-full bg-[#fffdf7] px-5 py-2.5 text-[13px] font-semibold text-[#2a241e] transition-transform hover:-translate-y-0.5"
        >
          回到方法论首页
        </Link>
      </section>
    </main>
  )
}
