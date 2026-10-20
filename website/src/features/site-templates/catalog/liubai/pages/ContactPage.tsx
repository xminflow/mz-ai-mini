import type { SiteTemplatePageProps } from '../../../types'
import { CONTACT_CHECKLIST, FAQS, PROCESS, STUDIO, WORK_CATEGORIES } from '../data'
import { Section, SectionHeading } from '../components/SectionHeading'
import { ScrollGroup } from '../components/Motion'
import { ArrowIcon, SiteShell } from '../components/SiteShell'
import '../theme.css'

export default function ContactPage({ basePath, locale = 'zh' }: SiteTemplatePageProps) {
  return (
    <SiteShell basePath={basePath} activeSlug="contact" locale={locale}>
      <PageHero locale={locale} />
      <FirstSteps />
      <Faq />
    </SiteShell>
  )
}

/** 首屏就是表单本身：联系页上没有比表单更该占据第一屏的东西。 */
function PageHero({ locale }: { locale: 'zh' | 'en' }) {
  const en = locale === 'en'
  return (
    <section className="tpl-page-hero px-6 pb-4">
      <div className="mx-auto max-w-[1152px]">
        <span className="tpl-pill">{en ? 'Start a conversation' : '联系我们'}</span>
        <h1 className="tpl-display tpl-display-xl mt-6">
          {en ? 'Tell us about your project,' : '说说你的项目，'}
          <br />
          <span className="text-[var(--tpl-ink-faint)]">{en ? 'we reply within two days' : '两个工作日内回复'}</span>
        </h1>

        <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_0.72fr] lg:gap-16">
          <InquiryForm locale={locale} />
          <StudioInfo locale={locale} />
        </div>
      </div>
    </section>
  )
}

/**
 * 咨询表单。做成视觉态：模板展示的是界面形态，不实现提交逻辑。
 *
 * 刻意不写 <form action>：一个提交后什么都不发生的表单，比一个明摆着是示意的表单更糟。
 * 字段用 disabled 之外的普通输入框，客户在预览里可以敲字感受填写体验。
 */
function InquiryForm({ locale }: { locale: 'zh' | 'en' }) {
  const en = locale === 'en'
  return (
    <div className="tpl-card rounded-[24px] p-7 sm:p-10">
      <h2 className="tpl-title text-[24px]">{en ? 'Project details' : '项目信息'}</h2>
      <p className="mt-2 text-[15px] leading-6 text-[var(--tpl-ink-dim)]">
        {en ? <>Fields marked <span className="text-[var(--tpl-accent)]">*</span> help us assess the project. Everything else is optional.</> : <>带 <span className="text-[var(--tpl-accent)]">*</span> 的是判断能否承接的必要信息，其余可留空。</>}
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <Field label={en ? 'Name' : '称呼'} required placeholder={en ? 'Your name' : '怎么称呼你'} />
        <Field label={en ? 'Email' : '邮箱'} required placeholder={en ? 'Where we can reply' : '用于回复，不作他用'} />
        <Field label={en ? 'Company / brand' : '公司 / 品牌'} required placeholder={en ? 'e.g. Tidal Notes' : '如 潮汐笔记'} />
        <Field label={en ? 'Target launch' : '期望上线时间'} placeholder={en ? 'e.g. November' : '如 今年 11 月'} />

        <div className="sm:col-span-2">
          <FieldLabel required>{en ? 'Project type' : '项目类型'}</FieldLabel>
          {/* 单选做成一排药丸，第一项预置为选中态 */}
          <div className="mt-2.5 flex flex-wrap gap-2">
            {WORK_CATEGORIES.map((category, index) => (
              <span
                key={category.id}
                className={
                  index === 0
                    ? 'rounded-full bg-[var(--tpl-ink)] px-4 py-2 text-[14px] text-[var(--tpl-ink-invert)]'
                    : 'rounded-full bg-[var(--tpl-surface)] px-4 py-2 text-[14px] text-[var(--tpl-ink-dim)]'
                }
              >
                {category.label}
              </span>
            ))}
          </div>
        </div>

        <div className="sm:col-span-2">
          <FieldLabel>{en ? 'Budget range' : '预算区间'}</FieldLabel>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {['5 万以下', '5–10 万', '10–20 万', '20 万以上', '还没想好'].map((range) => (
              <span
                key={range}
                className="rounded-full bg-[var(--tpl-surface)] px-4 py-2 text-[14px] text-[var(--tpl-ink-dim)]"
              >
                {range}
              </span>
            ))}
          </div>
        </div>

        <div className="sm:col-span-2">
          <FieldLabel>{en ? 'A little more context' : '还想说的'}</FieldLabel>
          <textarea
            name="project-context"
            autoComplete="off"
            rows={4}
            placeholder={en ? 'What is the challenge, what are you referencing, and who makes the final call?' : '现在的问题是什么、有没有参考、内部谁来拍板……写得越具体，我们的判断越准。'}
            className="mt-2.5 w-full resize-none rounded-xl bg-[var(--tpl-surface)] px-4 py-3 text-[15px] outline-none ring-1 ring-transparent transition placeholder:text-[var(--tpl-ink-faint)] focus:ring-[var(--tpl-ink)]"
          />
        </div>
      </div>

      <button type="button" className="tpl-btn mt-8 w-full justify-center">
        {en ? 'Send project details' : '提交项目信息'}
        <ArrowIcon className="w-4" />
      </button>
      <p className="mt-3 text-center text-[12px] text-[var(--tpl-ink-faint)]">
        {en ? 'We will send a confirmation email. Your details are used only for this conversation.' : '提交后我们会发一封确认邮件，信息仅用于本次项目沟通。'}
      </p>
    </div>
  )
}

function FieldLabel({ children, required }: { children: string; required?: boolean }) {
  return (
    <span className="text-[15px] text-[var(--tpl-ink-dim)]">
      {children}
      {required ? <span className="ml-0.5 text-[var(--tpl-accent)]">*</span> : null}
    </span>
  )
}

function Field({
  label,
  placeholder,
  required,
}: {
  label: string
  placeholder: string
  required?: boolean
}) {
  return (
    <label className="block">
      <FieldLabel required={required}>{label}</FieldLabel>
      <input
        name={label}
        autoComplete="off"
        type="text"
        placeholder={placeholder}
        className="mt-2.5 w-full rounded-xl bg-[var(--tpl-surface)] px-4 py-3 text-[15px] outline-none ring-1 ring-transparent transition placeholder:text-[var(--tpl-ink-faint)] focus:ring-[var(--tpl-ink)]"
      />
    </label>
  )
}

/** 工作室信息 + 提交前的准备清单。清单是这一页真正的增量：把门槛写清楚比"欢迎垂询"有用。 */
function StudioInfo({ locale }: { locale: 'zh' | 'en' }) {
  const en = locale === 'en'
  return (
    <div className="space-y-8">
      <dl className="divide-y divide-[var(--tpl-rule)] border-y border-[var(--tpl-rule)]">
        {[
          { label: en ? 'Phone' : '电话', value: STUDIO.phone },
          { label: en ? 'Email' : '邮箱', value: STUDIO.email },
          { label: en ? 'Address' : '地址', value: en ? 'Silian 166 Creative Park, Hangzhou' : STUDIO.address },
          { label: en ? 'Hours' : '接待时间', value: en ? 'Mon–Fri 10:00–19:00' : STUDIO.hours },
        ].map((item) => (
          <div key={item.label} className="py-4">
            <dt className="text-[12.5px] tracking-wide text-[var(--tpl-ink-faint)]">
              {item.label}
            </dt>
            <dd className="mt-1 text-[15px] leading-6">{item.value}</dd>
          </div>
        ))}
      </dl>

      <div className="rounded-[24px] bg-[var(--tpl-paper-2)] p-7">
        <h3 className="tpl-title text-[20px]">{en ? 'Have these four things ready' : '提交前先备好这四样'}</h3>
        <ul className="mt-5 space-y-3">
          {CONTACT_CHECKLIST.map((item, index) => (
            <li key={item} className="flex gap-3 text-[14px] leading-relaxed">
              <span className="tpl-serial shrink-0 text-[12px] text-[var(--tpl-accent)]">
                0{index + 1}
              </span>
              <span className="text-[var(--tpl-ink-dim)]">{item}</span>
            </li>
          ))}
        </ul>
        <p className="mt-6 border-t border-[var(--tpl-rule)] pt-5 text-[13px] leading-relaxed text-[var(--tpl-ink-faint)]">
          {en ? 'No materials yet is fine. Links or files simply help us give a more specific first read.' : '没有现成资料也可以先聊，但有链接或文件的话，我们能直接给出更具体的判断。'}
        </p>
      </div>
    </div>
  )
}

/** 联系之后会发生什么。只取流程的前三步——这一页的读者关心的是"接下来"，不是全流程。 */
function FirstSteps() {
  return (
    <Section>
      <SectionHeading
        eyebrow="接下来"
        title="提交之后的三步"
        description="真正花钱的动作从第三步才开始。前两步不收费，也不构成任何约束。"
      />

      {/* PROCESS 不再带序号字段（首页那条时间轴靠竖线表达先后），
          这里的序号由 index 现算——数据里再存一份 step 会和数组顺序两处维护、迟早对不上 */}
      <ol className="mt-16 grid gap-x-14 gap-y-10 md:grid-cols-3">
        {PROCESS.slice(0, 3).map((item, index) => (
          <li key={item.title} className="border-t border-[var(--tpl-rule)] pt-6">
            <span className="tpl-serial text-[14px] text-[var(--tpl-ink-faint)]">
              0{index + 1}
            </span>
            <h3 className="tpl-title mt-3 text-[22px]">{item.title}</h3>
            <p className="mt-2 tpl-copy text-[var(--tpl-ink-dim)]">
              {item.body}
            </p>
          </li>
        ))}
      </ol>
    </Section>
  )
}

/** 与首页共用同一份 FAQ 数据，这里只取和"要不要联系"直接相关的前四条。 */
function Faq() {
  return (
    <Section>
      <SectionHeading eyebrow="联系之前" title="你可能还想问" align="left" />

      <ScrollGroup className="mt-10 grid gap-x-14 gap-y-8 md:grid-cols-2">
        {FAQS.slice(0, 4).map((faq) => (
          <div key={faq.q} className="border-t border-[var(--tpl-rule)] pt-5">
            <h3 className="tpl-title text-[18px]">{faq.q}</h3>
            <p className="mt-2 tpl-copy text-[var(--tpl-ink-dim)]">{faq.a}</p>
          </div>
        ))}
      </ScrollGroup>
    </Section>
  )
}
