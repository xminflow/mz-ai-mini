import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '产品 · 微域生光',
  description: '微域生光产品，敬请期待。',
}

export default function ProductPage() {
  return (
    <section className="mx-auto flex min-h-[60vh] w-full max-w-6xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6">
      <h1 className="font-serif-zh text-[28px] font-semibold leading-[1.3] tracking-[0.005em] text-ink sm:text-[36px]">
        产品
      </h1>
      <p className="mt-4 text-[15px] leading-[1.8] text-muted sm:text-[16px]">
        敬请期待。
      </p>
    </section>
  )
}
