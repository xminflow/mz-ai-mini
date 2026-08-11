// 七步各自的示意图。刻意手写内联 SVG、不引图表框架：
// 每张只用线、点、对勾三种元素，stroke 走 currentColor，颜色交给外层的文字色控制，
// 因此不占用橙色配额（橙色仍只留给展开行的脊线与页脚状态点）。
//
// 统一规格：viewBox 0 0 200 132、stroke-width 1.5、圆头圆角、无填充（小圆点除外）。

type DiagramProps = {
  className?: string
}

const SVG_PROPS = {
  viewBox: '0 0 200 132',
  fill: 'none' as const,
  stroke: 'currentColor' as const,
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

/** 01 先聊一次：两个对话气泡，一问一答 */
const TalkDiagram = ({ className }: DiagramProps) => (
  <svg {...SVG_PROPS} className={className}>
    <path d="M20 26h86a8 8 0 0 1 8 8v30a8 8 0 0 1-8 8H46l-14 12V72h-12a8 8 0 0 1-8-8V34a8 8 0 0 1 8-8Z" />
    <path d="M38 44h50M38 56h30" />
    <path d="M180 62h-56a8 8 0 0 0-8 8v26a8 8 0 0 0 8 8h46l14 11V104h-4a8 8 0 0 0 8-8V70a8 8 0 0 0-8-8Z" />
    <path d="M132 78h36M132 90h22" />
  </svg>
)

/** 02 功能清单与报价：逐项功能对逐项价格，底部一条合计 */
const QuoteDiagram = ({ className }: DiagramProps) => (
  <svg {...SVG_PROPS} className={className}>
    <rect x="30" y="14" width="140" height="104" rx="8" />
    <path d="M46 40h60M132 40h22" />
    <path d="M46 58h72M138 58h16" />
    <path d="M46 76h52M128 76h26" />
    <path d="M46 94h108" />
    <path d="M112 106h42" strokeWidth={2.5} />
  </svg>
)

/** 03 签合同建群：一份带签名的合同，右边是拉起来的项目群 */
const ContractDiagram = ({ className }: DiagramProps) => (
  <svg {...SVG_PROPS} className={className}>
    <path d="M22 14h62l20 20v84H22z" />
    <path d="M84 14v20h20" />
    <path d="M36 50h46M36 64h34" />
    <path d="M36 88c8-8 14 8 22 0s14 8 22 0" />
    <circle cx="152" cy="38" r="10" />
    <circle cx="132" cy="76" r="10" />
    <circle cx="172" cy="76" r="10" />
    <path d="M152 48v18M141 72l-1-2M143 70l16-8M145 84h14" />
  </svg>
)

/** 04 每周交可试版本：四周依次交付，最后一周已落到可打开的界面上 */
const WeeklyDiagram = ({ className }: DiagramProps) => (
  <svg {...SVG_PROPS} className={className}>
    <rect x="30" y="16" width="26" height="18" rx="4" />
    <rect x="66" y="16" width="26" height="18" rx="4" />
    <rect x="102" y="16" width="26" height="18" rx="4" />
    <rect x="138" y="16" width="26" height="18" rx="4" strokeWidth={2.5} />
    <path d="M151 34v14" />
    <rect x="30" y="52" width="140" height="64" rx="8" />
    <path d="M30 70h140" />
    <circle cx="44" cy="61" r="2" fill="currentColor" stroke="none" />
    <circle cx="54" cy="61" r="2" fill="currentColor" stroke="none" />
    <path d="M50 86h60M50 100h34" />
  </svg>
)

/** 05 逐项验收：对着清单一条条打勾 */
const AcceptDiagram = ({ className }: DiagramProps) => (
  <svg {...SVG_PROPS} className={className}>
    <rect x="30" y="14" width="140" height="104" rx="8" />
    <path d="M48 40l7 7 12-13" />
    <path d="M80 42h68" />
    <path d="M48 70l7 7 12-13" />
    <path d="M80 72h54" />
    <path d="M48 100l7 7 12-13" />
    <path d="M80 102h62" />
  </svg>
)

/** 06 上线与交付：打包好的东西连同钥匙一起交出去 */
const HandoverDiagram = ({ className }: DiagramProps) => (
  <svg {...SVG_PROPS} className={className}>
    <path d="M24 44l38-20 38 20v44l-38 20-38-20z" />
    <path d="M24 44l38 20 38-20M62 64v44" />
    <path d="M112 66h50" />
    <path d="M152 56l12 10-12 10" />
    <circle cx="182" cy="40" r="9" />
    <path d="M182 49v20M176 62h6M176 68h6" />
  </svg>
)

/** 07 一年维保：一整圈时间刻度，中间是一个随时能应的信号点 */
const SupportDiagram = ({ className }: DiagramProps) => (
  <svg {...SVG_PROPS} className={className}>
    <circle cx="100" cy="66" r="44" />
    <path d="M100 22v8M100 102v8M56 66h8M136 66h8M131 35l-6 6M69 97l-6 6M131 97l-6-6M69 35l-6 6" />
    <circle cx="100" cy="66" r="5" fill="currentColor" stroke="none" />
    <path d="M100 66l22-16" />
    <path d="M100 66v20" />
  </svg>
)

const DIAGRAMS: Record<string, (props: DiagramProps) => React.ReactElement> = {
  '01': TalkDiagram,
  '02': QuoteDiagram,
  '03': ContractDiagram,
  '04': WeeklyDiagram,
  '05': AcceptDiagram,
  '06': HandoverDiagram,
  '07': SupportDiagram,
}

export const StepDiagram = ({ code, className }: { code: string; className?: string }) => {
  const Diagram = DIAGRAMS[code]
  // 数据里加了新步骤但忘了配图时直接不画，而不是渲染一个空框占位
  if (!Diagram) return null
  return <Diagram className={className} />
}
