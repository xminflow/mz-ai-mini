import { Reveal } from '@/components/motion'
import { Card, SectionHeading } from '@/components/ui'

import { SERVICES } from '../custom-software/data'

// 11 类平铺成静态网格：内容需要读完，就不能让它动。
// 自动横向滚动试过——移动的卡片上没人读得完三条要点，卡片一瘦身信息又没了。
//
// 分组只在这一层按 code 映射，不改 custom-software/data.ts 的结构：
// 那份数据还被已隐藏的旧页面用着，加字段会牵连它们。
const GROUPS: Array<{ name: string; codes: string[] }> = [
  { name: '客户用的', codes: ['01', '03', '08', '07'] },
  { name: '员工用的', codes: ['02', '06', '10', '09'] },
  { name: 'AI 能力', codes: ['04', '05', '12', '11'] },
]

const byCode = new Map(SERVICES.map((service) => [service.code, service]))

// 分组表和数据对不上时（改了 code 或加了新服务）直接暴露出来，不要静默漏掉某一类
const GROUPED = GROUPS.map((group) => ({
  name: group.name,
  items: group.codes.map((code) => {
    const service = byCode.get(code)
    if (!service) {
      throw new Error(`ServiceTypes: 分组里的 code ${code} 在 SERVICES 中不存在`)
    }
    return service
  }),
}))

export const ServiceTypes = () => (
  <section id="services" className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
    <SectionHeading eyebrow="Services" title="我们做过的软件类型" />

    <div className="mt-14 flex flex-col gap-14 sm:gap-16">
      {GROUPED.map((group) => (
        <div key={group.name}>
          <div className="flex items-center gap-4">
            <h3 className="shrink-0 text-[15px] font-medium tracking-[-0.01em] text-graphite">
              {group.name}
            </h3>
            {/* 一条延伸到右边缘的细线：把这一组框起来，又不用真的画个容器 */}
            <span aria-hidden className="h-px flex-1 bg-rule" />
            <span className="shrink-0 font-mono text-[11px] tracking-[0.1em] text-graphite-dim">
              {String(group.items.length).padStart(2, '0')}
            </span>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {group.items.map((service, index) => (
              <Reveal key={service.code} y={14} duration={0.5} delay={index * 0.05}>
                <Card interactive className="flex h-full flex-col">
                  <h4 className="text-[16px] font-semibold leading-snug tracking-[-0.01em] text-graphite">
                    {service.title}
                  </h4>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-graphite-soft">
                    {service.hook}
                  </p>
                  <ul className="mt-4 flex flex-col gap-2 border-t border-rule pt-4">
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
              </Reveal>
            ))}
          </div>
        </div>
      ))}
    </div>
  </section>
)
