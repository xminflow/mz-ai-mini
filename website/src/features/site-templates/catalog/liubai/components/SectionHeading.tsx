import type { ReactNode } from 'react'
import { Icon, type IconName } from './Icons'
import { Reveal } from './Motion'

/**
 * section 眉标三件套：药丸小标签 → 大标题 → 灰色副标题。
 *
 * 全站每个 section 都走这一个组件。参考站的秩序感就建立在"每一节的开头长得一模一样"上，
 * 各页各写一遍必然会飘。
 *
 * 字号与行高由模板主题统一管理，副标题宽度上限 560px。
 * 眉标到标题 24px、标题到副标题 16px——三者的间距是固定关系，不由使用处调。
 */
interface SectionHeadingProps {
  /**
   * 眉标文字。**传 null 表示这一节没有眉标**——参考站的「服务范围」一节就没有，
   * 做成可空是为了照实还原，而不是让每节都必须有一颗药丸。
   */
  eyebrow?: string | null
  /** 眉标药丸里的图标，参考站的「流程」一节带一个 */
  eyebrowIcon?: IconName
  title: ReactNode
  description?: string
  /** 默认居中；左对齐用在信息型区块上 */
  align?: 'center' | 'left'
  className?: string
}

export function SectionHeading({
  eyebrow,
  eyebrowIcon,
  title,
  description,
  align = 'center',
  className,
}: SectionHeadingProps) {
  const centered = align === 'center'

  return (
    <Reveal
      className={`${centered ? 'mx-auto max-w-[560px] text-center' : 'max-w-[560px]'} ${className ?? ''}`}
    >
      {eyebrow ? (
        <span className="tpl-pill">
          {eyebrowIcon ? <Icon name={eyebrowIcon} className="size-3.5" /> : null}
          {eyebrow}
        </span>
      ) : null}
      <h2 className={`tpl-display tpl-section-title ${eyebrow ? 'mt-5' : ''}`}>{title}</h2>
      {description ? (
        <p className="mt-4 tpl-copy text-[var(--tpl-ink-dim)]">
          {description}
        </p>
      ) : null}
    </Reveal>
  )
}

/**
 * 页面级 section 容器。
 *
 * 容器宽 1152px、左右 24px，区块上下间距随屏幕调整。
 * 标题块与内容之间桌面端 64px，手机端由主题收敛为 36px。
 */
export function Section({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`tpl-section px-6 py-14 sm:py-20 ${className ?? ''}`}>
      <div className="mx-auto max-w-[1152px]">{children}</div>
    </section>
  )
}
