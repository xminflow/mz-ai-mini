import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary'

// 按钮规格集中在此：圆角与内边距取自参考站实测值（radius 12px / padding 14px 22px）。
// primary 走黑底，橙色不用于按钮——橙色配额只留给编号、流程节点与状态点。
const BASE_CLASS =
  'inline-flex items-center justify-center gap-2 rounded-btn px-[22px] py-[14px] text-[14px] font-medium leading-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  // primary 保持黑底实心：它是页面上对比度最高的一处落点，做成玻璃会削掉它的分量
  primary: 'bg-graphite text-paper hover:bg-graphite-soft',
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
