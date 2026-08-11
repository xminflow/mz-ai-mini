import { PROCESS_STEPS } from '../custom-software/data'
import { SectionHeading } from './ui'

export const Process = () => (
  <section id="process" className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
    <SectionHeading eyebrow="Process" title="合作怎么走" description="四步，每一步你都看得见进度。" />
    <div className="relative mt-16">
      {/* 贯穿线：桌面横向、移动纵向。圆点靠 border-paper 描边把线断开，避免糊成一团 */}
      <div
        aria-hidden
        className="absolute bottom-2 left-[7px] top-2 w-px bg-rule md:bottom-auto md:left-0 md:right-0 md:top-[7px] md:h-px md:w-auto"
      />
      <ol className="relative grid grid-cols-1 gap-10 md:grid-cols-4 md:gap-8">
        {PROCESS_STEPS.map((step, index) => (
          <li key={step.code} className="relative pl-8 md:pl-0 md:pt-8">
            <span
              aria-hidden
              className={[
                'absolute left-0 top-[3px] h-[15px] w-[15px] rounded-full border-[3px] border-paper md:top-0',
                index === 0 ? 'bg-ember' : 'bg-graphite-dim',
              ].join(' ')}
            />
            <span className="text-[12px] font-medium tracking-[0.12em] text-graphite-dim">
              {step.code}
            </span>
            <h3 className="mt-2 text-[16px] font-semibold tracking-[-0.01em] text-graphite">
              {step.title}
            </h3>
            <p className="mt-2 max-w-[18em] text-[14px] leading-relaxed text-graphite-soft">
              {step.body}
            </p>
          </li>
        ))}
      </ol>
    </div>
  </section>
)
