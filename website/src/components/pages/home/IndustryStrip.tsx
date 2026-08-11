'use client'

import { useContact } from '@/components/layout/contact-context'
import { Pill, SectionHeading } from '@/components/ui'

import { INDUSTRIES } from '../custom-software/data'

export const IndustryStrip = () => {
  const { openContact } = useContact()

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-28">
      <SectionHeading eyebrow="Industries" title="已经在这些行业里落过地" />
      <div className="mt-12 flex flex-wrap justify-center gap-3">
        {INDUSTRIES.map((industry) => (
          <Pill key={industry}>{industry}</Pill>
        ))}
        {/* 兜底入口：行业清单必然列不全，让不在列表里的客户也有一个明确的下一步 */}
        <button
          type="button"
          onClick={openContact}
          className="inline-flex items-center gap-2 rounded-full border border-dashed border-rule-strong px-4 py-2 text-[13px] text-graphite transition-colors hover:border-ember hover:text-ember"
        >
          + 你的行业
        </button>
      </div>
    </section>
  )
}
