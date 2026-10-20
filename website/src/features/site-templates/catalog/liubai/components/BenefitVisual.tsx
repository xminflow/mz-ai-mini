'use client'

import { motion, useReducedMotion } from 'framer-motion'

/**
 * 三条主张各配一块顶部视觉，形态与内容都对齐参考站的 Benefits 三卡：
 *   01 设计系统 → 一张组件表（按钮变体 + 色板 + 字号）
 *   02 网站表现 → 一张数据卡（访客/浏览量 + 折线）
 *   03 交付即上线 → 一张项目卡（头像 + 状态徽标 + 缩略图）
 *
 * 画的都是"我们交付的东西本身"，不是装饰插画——这是参考站这三张图真正的用意：
 * 与其形容"我们做设计系统"，不如直接把一张组件表摆在那里。
 *
 * 全部内联 SVG，不引任何图表或插画库。text 不设 font-family，靠继承拿到模板正文字体。
 * **不使用随机数**：服务端与客户端各算一次，取值不确定会导致 hydration 报错。
 */

export function BenefitVisual({ index, className }: { index: number; className?: string }) {
  return (
    <motion.svg viewBox="0 0 320 200" className={className} fill="none" aria-hidden
      initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.4 }}>
      {index === 0 ? <ComponentSheet /> : null}
      {index === 1 ? <AnalyticsCard /> : null}
      {index === 2 ? <ProjectCard /> : null}
    </motion.svg>
  )
}

/** 01 组件表：按钮的四种变体 + 一条灰阶色板 + 字号示例。 */
function ComponentSheet() {
  const buttons = [
    { label: '主要', x: 96, y: 40, solid: true },
    { label: '次要', x: 186, y: 40, solid: false },
    { label: '描边', x: 96, y: 76, outline: true },
    { label: '幽灵', x: 186, y: 76, ghost: true },
  ]

  return (
    <motion.g variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.65 }}>
      {/* 面板 */}
      <rect x={28} y={22} width={264} height={156} rx={10} fill="var(--tpl-card)" />
      <rect
        x={28}
        y={22}
        width={264}
        height={156}
        rx={10}
        stroke="var(--tpl-ink)"
        strokeOpacity={0.08}
      />

      {/* 左侧工具条：把这张图交代成"在设计工具里"，不必画得像素级还原 */}
      <rect x={44} y={38} width={36} height={124} rx={7} fill="var(--tpl-surface)" />
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x={54}
          y={50 + i * 24}
          width={16}
          height={4}
          rx={2}
          fill="var(--tpl-ink)"
          fillOpacity={i === 0 ? 0.55 : 0.18}
        />
      ))}

      {/* 按钮变体：实心 / 填充 / 描边 / 幽灵，四种状态一次排开 */}
      {buttons.map((b) => (
        <g key={b.label}>
          <rect
            x={b.x}
            y={b.y}
            width={80}
            height={26}
            rx={6}
            fill={b.solid ? 'var(--tpl-ink)' : b.outline || b.ghost ? 'none' : 'var(--tpl-surface)'}
            stroke={b.outline ? 'var(--tpl-ink)' : 'none'}
            strokeOpacity={b.outline ? 0.25 : 0}
          />
          <text
            x={b.x + 40}
            y={b.y + 17}
            textAnchor="middle"
            fontSize={11}
            fill={b.solid ? 'var(--tpl-ink-invert)' : 'var(--tpl-ink-dim)'}
          >
            {b.label}
          </text>
        </g>
      ))}

      {/* 灰阶色板。本模板是无彩色体系，色板画成一条明度阶梯才说得通——
          画成一排彩色反而与整站配色自相矛盾 */}
      {[0.04, 0.1, 0.22, 0.4, 0.62, 0.86].map((op, i) => (
        <rect
          key={i}
          x={96 + i * 26}
          y={118}
          width={20}
          height={20}
          rx={5}
          fill="var(--tpl-ink)"
          fillOpacity={op}
        />
      ))}

      {/* 字号示例 */}
      <text x={96} y={162} fontSize={15} fill="var(--tpl-ink)">
        Aa
      </text>
      <rect x={124} y={152} width={64} height={5} rx={2.5} fill="var(--tpl-ink)" fillOpacity={0.16} />
      <rect x={124} y={161} width={40} height={5} rx={2.5} fill="var(--tpl-ink)" fillOpacity={0.1} />
    </motion.g>
  )
}

/** 02 数据卡：两行指标 + 一条折线。数字写死，不做动画也不算随机值。 */
function AnalyticsCard() {
  const reduced = useReducedMotion()
  // 折线的取样点写成常量数组：既避免随机数，也让曲线形状可复现
  const points = [
    [46, 150],
    [76, 132],
    [106, 138],
    [136, 112],
    [166, 120],
    [196, 88],
    [226, 96],
    [274, 66],
  ]
  const line = points.map(([x, y]) => `${x},${y}`).join(' ')
  const area = `46,166 ${line} 274,166`

  return (
    <g>
      {/* 折线在底、卡片浮在上：与参考站一样，卡片是压在图表之上的一层信息 */}
      <polygon points={area} fill="var(--tpl-ink)" fillOpacity={0.05} />
      <motion.polyline
        variants={{ hidden: { pathLength: 0 }, visible: { pathLength: 1 } }}
        transition={{ duration: reduced ? 0 : 1.2, delay: reduced ? 0 : 0.2, ease: 'easeInOut' }}
        points={line}
        stroke="var(--tpl-ink)"
        strokeOpacity={0.45}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={i === points.length - 1 ? 3.2 : 2}
          fill={i === points.length - 1 ? 'var(--tpl-ink)' : 'var(--tpl-card)'}
          stroke="var(--tpl-ink)"
          strokeOpacity={0.45}
          strokeWidth={1.2}
        />
      ))}

      <rect x={96} y={30} width={186} height={76} rx={10} fill="var(--tpl-card)" />
      <rect
        x={96}
        y={30}
        width={186}
        height={76}
        rx={10}
        stroke="var(--tpl-ink)"
        strokeOpacity={0.08}
      />

      <text x={112} y={50} fontSize={11} fill="var(--tpl-ink-faint)">
        本月 · 8 月
      </text>

      <circle cx={116} cy={68} r={3.2} fill="var(--tpl-ink)" fillOpacity={0.28} />
      <text x={126} y={72} fontSize={11} fill="var(--tpl-ink-dim)">
        独立访客
      </text>
      <text x={266} y={72} fontSize={11.5} textAnchor="end" fill="var(--tpl-ink)">
        9,706
      </text>

      <circle cx={116} cy={90} r={3.2} fill="var(--tpl-ink)" fillOpacity={0.62} />
      <text x={126} y={94} fontSize={11} fill="var(--tpl-ink-dim)">
        页面浏览
      </text>
      <text x={266} y={94} fontSize={11.5} textAnchor="end" fill="var(--tpl-ink)">
        16,842
      </text>
    </g>
  )
}

/** 03 项目卡：头像 + 工作室名 + 两个状态徽标 + 三张缩略图。 */
function ProjectCard() {
  return (
    <g>
      {/* 顶部一条消息，交代"客户找上门"这件事 */}
      <rect x={40} y={22} width={190} height={34} rx={17} fill="var(--tpl-card)" />
      <rect x={40} y={22} width={190} height={34} rx={17} stroke="var(--tpl-ink)" strokeOpacity={0.08} />
      <circle cx={60} cy={39} r={10} fill="var(--tpl-surface)" />
      <circle cx={60} cy={36} r={3.4} fill="var(--tpl-ink)" fillOpacity={0.3} />
      <path d="M53.5 47a6.5 6.5 0 0 1 13 0" fill="var(--tpl-ink)" fillOpacity={0.3} />
      <rect x={78} y={32} width={92} height={5} rx={2.5} fill="var(--tpl-ink)" fillOpacity={0.2} />
      <rect x={78} y={42} width={56} height={5} rx={2.5} fill="var(--tpl-ink)" fillOpacity={0.1} />

      {/* 主卡 */}
      <rect x={56} y={70} width={216} height={108} rx={12} fill="var(--tpl-card)" />
      <rect x={56} y={70} width={216} height={108} rx={12} stroke="var(--tpl-ink)" strokeOpacity={0.08} />

      {/* 两个状态徽标 */}
      <rect x={74} y={84} width={54} height={20} rx={10} fill="var(--tpl-ink)" fillOpacity={0.06} />
      <text x={101} y={98} textAnchor="middle" fontSize={10} fill="var(--tpl-ink-dim)">
        可承接
      </text>
      <rect x={134} y={84} width={72} height={20} rx={10} fill="var(--tpl-ink)" />
      <text x={170} y={98} textAnchor="middle" fontSize={10} fill="var(--tpl-ink-invert)">
        官方认证
      </text>

      {/* 工作室署名 */}
      <rect x={74} y={114} width={26} height={26} rx={7} fill="var(--tpl-ink)" />
      <text x={87} y={132} textAnchor="middle" fontSize={13} fill="var(--tpl-ink-invert)">
        留
      </text>
      <rect x={110} y={118} width={78} height={6} rx={3} fill="var(--tpl-ink)" fillOpacity={0.24} />
      <rect x={110} y={130} width={50} height={5} rx={2.5} fill="var(--tpl-ink)" fillOpacity={0.12} />

      {/* 三张作品缩略图 */}
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x={74 + i * 62}
          y={150}
          width={54}
          height={16}
          rx={4}
          fill="var(--tpl-ink)"
          fillOpacity={0.06 + i * 0.04}
        />
      ))}
    </g>
  )
}
