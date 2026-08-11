import { SectionHeading } from '@/components/ui'
import { ENGAGEMENT_STEPS, type EngagementModeBlock } from './data'

const ModeBlock = ({ block }: { block: EngagementModeBlock }) => (
  <div className="flex-1 border-l border-rule pl-4">
    <span className="text-[12px] font-medium tracking-[0.08em] text-graphite-dim">
      {block.mode}
    </span>
    <p className="mt-2 text-[14px] leading-[1.8] text-graphite-soft">{block.body}</p>
    {block.bullets && (
      <ul className="mt-3 flex flex-col gap-2">
        {block.bullets.map((bullet) => (
          <li
            key={bullet}
            className="flex items-start gap-2 text-[13.5px] leading-[1.75] text-graphite-soft"
          >
            <span aria-hidden className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-graphite-dim" />
            {bullet}
          </li>
        ))}
      </ul>
    )}
  </div>
)

export const Process = () => (
  <section id="process" className="mx-auto w-full max-w-6xl px-4 pb-20 pt-20 sm:px-6 sm:pb-28 sm:pt-24">
    <SectionHeading title="七步走完，每步都有你能拿到的东西" align="left" />
    <div className="relative mt-14">
      {/* 纵向贯穿线：七步横排会挤成一团，纵向才放得下每步的产出物与付款说明 */}
      <div aria-hidden className="absolute bottom-3 left-[7px] top-3 w-px bg-rule" />
      <ol className="flex flex-col gap-12 sm:gap-14">
        {ENGAGEMENT_STEPS.map((step, index) => (
          <li key={step.code} className="relative pl-8 sm:pl-12">
            <span
              aria-hidden
              className={[
                // border-paper 描边把贯穿线在圆点处断开，避免糊成一团
                'absolute left-0 top-[3px] h-[15px] w-[15px] rounded-full border-[3px] border-paper',
                index === 0 ? 'bg-ember' : 'bg-graphite-dim',
              ].join(' ')}
            />
            <span className="text-[12px] font-medium tracking-[0.12em] text-graphite-dim">
              {step.code}
            </span>
            <h3 className="mt-2 text-[18px] font-semibold leading-snug tracking-[-0.01em] text-graphite">
              {step.title}
            </h3>

            {step.lead && (
              <p className="mt-3 max-w-[40em] text-[15px] leading-[1.8] text-graphite-soft">
                {step.lead}
              </p>
            )}
            {step.gain && (
              <p className="mt-3 max-w-[40em] text-[15px] leading-[1.8] text-graphite-soft">
                <span className="text-graphite-dim">你能拿到：</span>
                {step.gain}
              </p>
            )}
            {step.why && (
              <p className="mt-3 max-w-[40em] text-[15px] leading-[1.8] text-graphite-soft">
                <span className="text-graphite-dim">为什么这么做：</span>
                {step.why}
              </p>
            )}
            {step.notes?.map((note) => (
              <p
                key={note}
                className="mt-3 max-w-[40em] text-[15px] leading-[1.8] text-graphite-soft"
              >
                {note}
              </p>
            ))}

            {step.modeBlocks && (
              <div className="mt-5 flex flex-col gap-5 md:flex-row md:gap-8">
                {step.modeBlocks.map((block) => (
                  <ModeBlock key={block.mode} block={block} />
                ))}
              </div>
            )}

            {step.meta && (
              <p className="mt-5 border-t border-rule pt-3 text-[12px] text-graphite-dim">
                {step.meta}
              </p>
            )}
          </li>
        ))}
      </ol>
    </div>
  </section>
)
