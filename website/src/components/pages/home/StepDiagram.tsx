// 七步各自的示意图。刻意手写内联 SVG、不引图表框架：
// 每张只用线、点、对勾三种元素，stroke 一律走 currentColor，笔画颜色交给外层的文字色控制。
//
// 统一规格：viewBox 0 0 200 132、stroke-width 1.5、圆头圆角。
//
// ===== 填充约定 =====
// 主体形状（气泡、单据框、合同纸、包裹、盾牌）填色，笔画保持深灰不动——
// 全填成实色会糊掉手绘线稿的质感，只留线框又太朴素，「淡填充 + 深线稿」是两者的平衡点。
//
// 三支色按步骤轮转，让七张图连起来有节奏而不是七张同色：
//   01 蓝 · 02 黄 · 03 红 · 04 蓝 · 05 黄 · 06 红 · 07 蓝
// 单张图里若有两个并列主体（01 的一问一答、06 的包裹与钥匙），第二个取邻位色做区分。
//
// fill-opacity 按面积反向给：面积大的形状取低值，小的取高值，
// 否则大色块会盖过线稿、小色块又看不见。
const FILL = {
  blue: 'var(--color-blue)',
  red: 'var(--color-red)',
  yellow: 'var(--color-yellow)',
} as const

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
    {/* 一问一答两个气泡取蓝、黄两色，把「双方」这层意思做出来 */}
    <path
      d="M20 26h86a8 8 0 0 1 8 8v30a8 8 0 0 1-8 8H46l-14 12V72h-12a8 8 0 0 1-8-8V34a8 8 0 0 1 8-8Z"
      fill={FILL.blue}
      fillOpacity={0.16}
    />
    <path d="M38 44h50M38 56h30" />
    <path
      d="M180 62h-56a8 8 0 0 0-8 8v26a8 8 0 0 0 8 8h46l14 11V104h-4a8 8 0 0 0 8-8V70a8 8 0 0 0-8-8Z"
      fill={FILL.yellow}
      fillOpacity={0.26}
    />
    <path d="M132 78h36M132 90h22" />
  </svg>
)

/** 02 功能清单与报价：逐项功能对逐项价格，底部一条合计 */
const QuoteDiagram = ({ className }: DiagramProps) => (
  <svg {...SVG_PROPS} className={className}>
    <rect x="30" y="14" width="140" height="104" rx="8" fill={FILL.yellow} fillOpacity={0.18} />
    <path d="M46 40h60M132 40h22" />
    <path d="M46 58h72M138 58h16" />
    <path d="M46 76h52M128 76h26" />
    <path d="M46 94h108" />
    {/* 合计那一条加粗，是整张单据的落点，用主色点出来 */}
    <path d="M112 106h42" strokeWidth={2.5} stroke={FILL.blue} />
  </svg>
)

/** 03 法律合同：一份带签名的合同，右下角一枚落章 */
const ContractDiagram = ({ className }: DiagramProps) => (
  <svg {...SVG_PROPS} className={className}>
    <path d="M40 12h64l24 24v84H40z" fill={FILL.red} fillOpacity={0.10} />
    <path d="M104 12v24h24" />
    <path d="M56 52h56M56 66h40" />
    <path d="M56 92c9-9 16 9 25 0s16 9 25 0" />
    {/* 落章是这张图的重点，比合同纸实一档 */}
    <circle cx="146" cy="94" r="22" fill={FILL.red} fillOpacity={0.22} />
    <circle cx="146" cy="94" r="15" />
    <path d="M138 94l6 6 11-12" />
  </svg>
)

/** 04 持续反馈：专属沟通渠道，每周一次进展汇报 */
const FeedbackDiagram = ({ className }: DiagramProps) => (
  <svg {...SVG_PROPS} className={className}>
    <path
      d="M28 20h96a8 8 0 0 1 8 8v40a8 8 0 0 1-8 8H58l-16 13V76H28a8 8 0 0 1-8-8V28a8 8 0 0 1 8-8Z"
      fill={FILL.blue}
      fillOpacity={0.16}
    />
    <path d="M44 38h64M44 54h40" />
    <path d="M28 108h144" />
    <path d="M52 104v8M88 104v8M124 104v8M160 104v8" />
    {/* 时间轴上四个实心点代表每周一次的汇报，用主色标出来 */}
    <circle cx="52" cy="108" r="3.5" fill={FILL.blue} stroke="none" />
    <circle cx="88" cy="108" r="3.5" fill={FILL.blue} stroke="none" />
    <circle cx="124" cy="108" r="3.5" fill={FILL.blue} stroke="none" />
    <circle cx="160" cy="108" r="3.5" fill={FILL.blue} stroke="none" />
  </svg>
)

/** 05 逐项验收：对着清单一条条打勾 */
const AcceptDiagram = ({ className }: DiagramProps) => (
  <svg {...SVG_PROPS} className={className}>
    <rect x="30" y="14" width="140" height="104" rx="8" fill={FILL.yellow} fillOpacity={0.18} />
    {/* 三个对勾是「已验收」的信号，用蓝色与单据底色分开 */}
    <path d="M48 40l7 7 12-13" stroke={FILL.blue} strokeWidth={2} />
    <path d="M80 42h68" />
    <path d="M48 70l7 7 12-13" stroke={FILL.blue} strokeWidth={2} />
    <path d="M80 72h54" />
    <path d="M48 100l7 7 12-13" stroke={FILL.blue} strokeWidth={2} />
    <path d="M80 102h62" />
  </svg>
)

/** 06 上线与交付：打包好的东西连同钥匙一起交出去 */
const HandoverDiagram = ({ className }: DiagramProps) => (
  <svg {...SVG_PROPS} className={className}>
    <path d="M24 44l38-20 38 20v44l-38 20-38-20z" fill={FILL.red} fillOpacity={0.14} />
    <path d="M24 44l38 20 38-20M62 64v44" />
    {/* 交付箭头指向钥匙，用主色把「交出去」这个动作串起来 */}
    <path d="M112 66h50" stroke={FILL.blue} strokeWidth={2} />
    <path d="M152 56l12 10-12 10" stroke={FILL.blue} strokeWidth={2} />
    <circle cx="182" cy="40" r="9" fill={FILL.blue} fillOpacity={0.22} />
    <path d="M182 49v20M176 62h6M176 68h6" />
  </svg>
)

/** 07 维修保障：一面盾牌罩住业务，里面是一条不间断的监控心跳 */
const SupportDiagram = ({ className }: DiagramProps) => (
  <svg {...SVG_PROPS} className={className}>
    <path
      d="M100 12l46 16v40c0 30-19 51-46 62-27-11-46-32-46-62V28z"
      fill={FILL.blue}
      fillOpacity={0.14}
    />
    {/* 心跳线是「7×24 不间断监控」的核心意象，用红色让它在盾牌里跳出来 */}
    <path d="M62 70h14l8-16 10 32 9-24 7 12h16" stroke={FILL.red} strokeWidth={2} />
    <circle cx="152" cy="98" r="3.5" fill="currentColor" stroke="none" />
    <circle cx="166" cy="98" r="3.5" fill="currentColor" stroke="none" />
    <circle cx="180" cy="98" r="3.5" fill="currentColor" stroke="none" />
  </svg>
)

const DIAGRAMS: Record<string, (props: DiagramProps) => React.ReactElement> = {
  '01': TalkDiagram,
  '02': QuoteDiagram,
  '03': ContractDiagram,
  '04': FeedbackDiagram,
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
