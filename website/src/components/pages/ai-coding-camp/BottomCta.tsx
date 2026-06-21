'use client'

import { motion } from 'framer-motion'

import { GradientText, Reveal } from '../../motion'
import { EnrollButton } from './primitives'

export function BottomCta({ onContact }: { onContact: () => void }) {
  return (
    <section className="relative mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6 sm:pb-28 lg:pb-32">
      <Reveal>
        <div className="relative overflow-hidden rounded-[24px] p-7 text-center sm:rounded-[32px] sm:p-12 lg:p-16"
          style={{
            background: 'rgba(5,5,7,0.65)',
            boxShadow: '0 14px 36px -22px rgba(0,0,0,0.85)',
          }}
        >
          {/* 4 角彩色高亮（紫青琥珀玫红） */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 40% 55% at 0% 0%, rgba(0,153,255,0.36), transparent 60%), radial-gradient(ellipse 40% 55% at 100% 0%, rgba(1,174,240,0.28), transparent 60%), radial-gradient(ellipse 40% 55% at 100% 100%, rgba(248,236,29,0.26), transparent 60%), radial-gradient(ellipse 40% 55% at 0% 100%, rgba(212,38,114,0.24), transparent 60%)',
            }}
          />
          {/* 中心通透层：让标题/CTA 干净浮起 */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 55% 70% at 50% 50%, rgba(5,5,7,0.62) 0%, rgba(5,5,7,0.25) 50%, transparent 80%)',
            }}
          />
          {/* 清晰光点（无 blur） */}
          <motion.span
            aria-hidden
            className="pointer-events-none absolute left-[8%] top-[18%] h-16 w-16 rounded-full sm:h-20 sm:w-20"
            style={{ background: 'radial-gradient(circle, rgba(0,153,255,0.62) 0%, transparent 58%)' }}
            animate={{ y: [0, -16, 0], opacity: [0.85, 1, 0.85] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.span
            aria-hidden
            className="pointer-events-none absolute right-[10%] bottom-[16%] h-14 w-14 rounded-full sm:h-16 sm:w-16"
            style={{ background: 'radial-gradient(circle, rgba(248,236,29,0.55) 0%, transparent 58%)' }}
            animate={{ y: [0, 14, 0], opacity: [0.85, 1, 0.85] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          />
          <motion.span
            aria-hidden
            className="pointer-events-none absolute right-[16%] top-[24%] h-10 w-10 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(1,174,240,0.55) 0%, transparent 60%)' }}
            animate={{ y: [0, -12, 0], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          />
          <motion.span
            aria-hidden
            className="pointer-events-none absolute left-[14%] bottom-[22%] h-9 w-9 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(212,38,114,0.55) 0%, transparent 60%)' }}
            animate={{ y: [0, 12, 0], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 1.6 }}
          />
          <div className="relative flex flex-col items-center gap-5">
            <h2 className="font-serif-zh max-w-2xl text-balance text-[24px] font-semibold leading-[1.35] sm:text-[30px] sm:leading-[1.3] lg:text-[38px]">
              想看看自己学完
              <GradientText className="font-semibold">能做出什么</GradientText>
              ？
            </h2>
            <p className="max-w-xl text-[13px] leading-[1.85] text-ink-soft sm:text-sm">
              训练营按期开班、限量招生。先扫码联系，我们会按你的基础与目标给出具体的入营建议。
            </p>
            <div className="mt-2">
              <EnrollButton label="立即咨询报名" onClick={onContact} />
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
