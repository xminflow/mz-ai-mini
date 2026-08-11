import { Card, SectionHeading } from '@/components/ui'

import { SERVICES } from '../custom-software/data'

export const ServiceGrid = () => (
  <section id="services" className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
    <SectionHeading
      eyebrow="Services"
      title="11 类软件定制，覆盖你会用到的场景"
      description="从一个官网到一整套企业系统。需求不在列表里，也可以直接聊。"
    />
    <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {SERVICES.map((service) => (
        <Card key={service.code} interactive className="flex flex-col">
          <span className="text-[13px] font-medium tracking-[0.08em] text-ember">
            {service.code}
          </span>
          <h3 className="mt-4 text-[17px] font-semibold leading-snug tracking-[-0.01em] text-graphite">
            {service.title}
          </h3>
          <p className="mt-2 text-[14px] leading-relaxed text-graphite-soft">{service.hook}</p>
          <ul className="mt-5 flex flex-col gap-2 border-t border-rule pt-4">
            {service.points.map((point) => (
              <li
                key={point}
                className="flex items-start gap-2 text-[13px] leading-relaxed text-graphite-dim"
              >
                <span
                  aria-hidden
                  className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-graphite-dim"
                />
                {point}
              </li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  </section>
)
