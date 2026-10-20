import { getSiteCopy, type SiteLocale } from '@/features/site-i18n/copy'

export const CapabilityBar = ({ locale = 'zh' }: { locale?: SiteLocale }) => (
  <section className="home-capabilities mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-28">
    <div className="flex justify-center">
      <div className="glass-medium rounded-btn flex max-w-full flex-wrap items-center justify-center gap-y-1 px-3 py-3">
        {getSiteCopy(locale).capabilities.map((item, index) => (
          <span key={item} className="flex items-center">
            {index > 0 && (
              <span aria-hidden className="mx-1 h-1 w-1 rounded-full bg-graphite-dim/50 sm:mx-2" />
            )}
            <span className="whitespace-nowrap px-2.5 text-[13px] text-graphite-soft sm:px-4 sm:text-[15px]">
              {item}
            </span>
          </span>
        ))}
      </div>
    </div>
  </section>
)
