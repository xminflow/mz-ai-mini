import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary'

// 按钮规格集中在此：内边距取自参考站实测值（padding 14px 22px），圆角走全站统一的 --radius-btn。
//
// focus 描边用主色蓝，配合 outline-offset-2 落在按钮之外的浅色纸底上——
// 没有这个 offset，蓝描边贴着蓝底按钮会完全看不见。
const BASE_CLASS =
  'inline-flex items-center justify-center gap-2 rounded-btn px-[22px] py-[14px] text-[14px] font-medium leading-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  // primary 走描边而非实心：站点整体是极简排版加毛玻璃，任何实心色块（原来的纯黑、
  // 试过的蓝底）都比周围重一大截，读起来突兀。
  // 彩色只给边框，文字保持中性黑——蓝字加蓝边两处上色会让按钮整体偏蓝、抢过版面，
  // 黑字也让按钮文案与全站正文同一读法。悬停时补一层极淡蓝填充并把边加深一档。
  primary: 'border border-blue text-graphite hover:bg-blue/[0.07] hover:border-blue-deep',
  // secondary 靠玻璃与深灰字退到次要位：它不带彩色，与带蓝的 primary 拉开层级
  secondary: 'glass-medium text-graphite hover:bg-white/75',
}

/**
 * 给需要按钮外观但必须用别的元素渲染的场景用——典型是 next/link 的页面跳转。
 * 有了它就不必为「Link 形态的按钮」再造一个组件，样式仍然只有这一份来源。
 */
export const buttonClassName = (variant: ButtonVariant = 'primary', className = ''): string =>
  `${BASE_CLASS} ${VARIANT_CLASS[variant]} ${className}`

type SharedProps = {
  variant?: ButtonVariant
  className?: string
  children: ReactNode
}

type ButtonProps = SharedProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'>

type ButtonLinkProps = SharedProps & { href: string } & Omit<
    AnchorHTMLAttributes<HTMLAnchorElement>,
    'className' | 'children' | 'href'
  >

export const Button = ({
  variant = 'primary',
  className = '',
  children,
  type = 'button',
  ...rest
}: ButtonProps) => (
  <button type={type} className={buttonClassName(variant, className)} {...rest}>
    {children}
  </button>
)

// 页内锚点跳转用原生 a，不走 next/link：next/link 对 hash 锚点没有额外价值。
// 跨页跳转请用 next/link + buttonClassName，否则会整页刷新。
export const ButtonLink = ({
  variant = 'primary',
  className = '',
  children,
  href,
  ...rest
}: ButtonLinkProps) => (
  <a href={href} className={buttonClassName(variant, className)} {...rest}>
    {children}
  </a>
)
