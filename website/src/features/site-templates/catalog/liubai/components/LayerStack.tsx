'use client'

import { motion, useReducedMotion } from 'framer-motion'

/**
 * 服务区的插图：一张轴测的「页面分层」爆炸图，对应参考站 Creative services 右侧那张图。
 *
 * 它替代了此前那张剖面线稿——题材换成设计工作室之后，
 * 讲「我们交付什么」的位置上放一张房屋剖面已经说不通了。
 * 三层从上到下依次是：页面版式 / 视觉系统 / 组件与令牌，
 * 正好对应下方列出的三项服务，图和文字互为索引。
 *
 * 全部内联 SVG，几何量写死，不用随机数。
 */

/** 2:1 等角投影。x 向右后、y 向左后、z 向上。 */
const COS30 = 0.866
const OX = 210
const OY = 250

function iso(x: number, y: number, z: number): [number, number] {
  return [OX + (x - y) * COS30, OY - (x + y) * 0.5 - z]
}

function poly(points: [number, number][]): string {
  return points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
}

/** 一层的宽深，三层共用，层与层之间只差高度 */
const W = 168
const D = 168

interface LayerContent {
  /** 层内的小色块，坐标是层内的 0–1 归一化位置与尺寸 */
  blocks: { x: number; y: number; w: number; h: number; op: number }[]
}

/** 三层各自的内容。从上到下：版式（大块）→ 视觉系统（中块）→ 组件与令牌（细密小块）。 */
const LAYERS: LayerContent[] = [
  {
    blocks: [
      { x: 0.1, y: 0.1, w: 0.8, h: 0.22, op: 0.5 },
      { x: 0.1, y: 0.4, w: 0.36, h: 0.5, op: 0.18 },
      { x: 0.54, y: 0.4, w: 0.36, h: 0.5, op: 0.18 },
    ],
  },
  {
    blocks: [
      { x: 0.1, y: 0.1, w: 0.36, h: 0.34, op: 0.32 },
      { x: 0.54, y: 0.1, w: 0.36, h: 0.34, op: 0.14 },
      { x: 0.1, y: 0.56, w: 0.8, h: 0.34, op: 0.2 },
    ],
  },
  {
    blocks: [
      { x: 0.1, y: 0.1, w: 0.22, h: 0.22, op: 0.28 },
      { x: 0.39, y: 0.1, w: 0.22, h: 0.22, op: 0.16 },
      { x: 0.68, y: 0.1, w: 0.22, h: 0.22, op: 0.1 },
      { x: 0.1, y: 0.42, w: 0.8, h: 0.14, op: 0.12 },
      { x: 0.1, y: 0.66, w: 0.5, h: 0.14, op: 0.2 },
    ],
  },
]

/** 每层的抬升高度，从上到下递减；层间距 60 是让三层都读得出厚度的最小值 */
const LAYER_Z = [128, 64, 0]

export function LayerStack({ className }: { className?: string }) {
  const reduced = useReducedMotion()
  return (
    <motion.svg viewBox="0 0 420 320" className={className} fill="none" aria-hidden
      initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.35 }}>
      {/* 竖直的对位虚线框：说明三层是同一个页面拆开的，不是三个不相干的面 */}
      <g stroke="var(--tpl-ink)" strokeOpacity={0.18} strokeWidth={0.8} strokeDasharray="3 4">
        {[
          [0, 0],
          [W, 0],
          [W, D],
          [0, D],
        ].map(([x, y], i) => {
          const top = iso(x, y, LAYER_Z[0])
          const bottom = iso(x, y, LAYER_Z[LAYER_Z.length - 1])
          return <line key={i} x1={top[0]} y1={top[1]} x2={bottom[0]} y2={bottom[1]} />
        })}
      </g>

      {/* 层从下往上画，上面的层才会盖住下面的 */}
      {[2, 1, 0].map((layerIndex) => {
        const z = LAYER_Z[layerIndex]
        const corners: [number, number][] = [
          iso(0, 0, z),
          iso(W, 0, z),
          iso(W, D, z),
          iso(0, D, z),
        ]

        return (
          <motion.g key={layerIndex} data-layer={layerIndex}
            variants={{ hidden: { opacity: 0, y: 20 + layerIndex * 8 }, visible: { opacity: 1, y: 0 } }}
            transition={{ duration: reduced ? 0 : 0.85, delay: reduced ? 0 : (2 - layerIndex) * 0.16 }}>
            {/* 层板本体 */}
            <polygon
              points={poly(corners)}
              fill="var(--tpl-card)"
              stroke="var(--tpl-ink)"
              strokeOpacity={0.22}
              strokeWidth={1.1}
            />
            {/* 层板厚度：只画前两条边的侧面，轴测里也只看得到这两面 */}
            <polygon
              points={poly([
                corners[3],
                corners[2],
                [corners[2][0], corners[2][1] + 5],
                [corners[3][0], corners[3][1] + 5],
              ])}
              fill="var(--tpl-ink)"
              fillOpacity={0.08}
            />
            <polygon
              points={poly([
                corners[2],
                corners[1],
                [corners[1][0], corners[1][1] + 5],
                [corners[2][0], corners[2][1] + 5],
              ])}
              fill="var(--tpl-ink)"
              fillOpacity={0.05}
            />

            {/* 层内的内容块 */}
            {LAYERS[layerIndex].blocks.map((b, i) => (
              <polygon
                key={i}
                points={poly([
                  iso(b.x * W, b.y * D, z),
                  iso((b.x + b.w) * W, b.y * D, z),
                  iso((b.x + b.w) * W, (b.y + b.h) * D, z),
                  iso(b.x * W, (b.y + b.h) * D, z),
                ])}
                fill="var(--tpl-ink)"
                fillOpacity={b.op}
              />
            ))}
          </motion.g>
        )
      })}
    </motion.svg>
  )
}
