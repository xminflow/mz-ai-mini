'use client'

import { useEffect, useRef, useState } from 'react'
import cloud from 'd3-cloud'

import { GradientText, Reveal } from '../../motion'
import { SectionEyebrow } from '../ai-coding-camp/primitives'
import { THEMES } from '../ai-coding-camp/data'
import type { ThemeKey } from '../ai-coding-camp/data'
import { CLOUD_WORDS } from './data'

// 权重(1-4) 对应字号(px)，字号越大代表这个词越核心
const WEIGHT_FONT_SIZE: Record<number, number> = { 4: 42, 3: 30, 2: 21, 1: 15 }
// 逐词轮转站内既有主题色，不新增色值
const WORD_THEMES: ThemeKey[] = ['cognition', 'frontend', 'backend', 'agent', 'launch', 'mobile', 'mindset']
const FONT_STACK =
  '"Inter", "Noto Sans SC", "HarmonyOS Sans SC", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif'

type PlacedWord = { text: string; size: number; x: number; y: number; rotate: number }

export function WordCloudSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [placed, setPlaced] = useState<PlacedWord[]>([])
  const [dims, setDims] = useState({ width: 960, height: 420 })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const width = el.clientWidth || 960
    const height = Math.max(320, Math.min(460, Math.round(width * 0.42)))
    setDims({ width, height })

    const layout = cloud()
      .size([width, height])
      .words(CLOUD_WORDS.map((w) => ({ text: w.text, size: WEIGHT_FONT_SIZE[w.weight] })))
      .padding(6)
      .rotate(() => (Math.random() > 0.82 ? 90 : 0))
      .font(FONT_STACK)
      .fontSize((d) => d.size ?? 16)
      .spiral('rectangular')
      .on('end', (output) => {
        setPlaced(
          output.map((d) => ({
            text: d.text ?? '',
            size: d.size ?? 16,
            x: d.x ?? 0,
            y: d.y ?? 0,
            rotate: d.rotate ?? 0,
          })),
        )
      })

    layout.start()
  }, [])

  return (
    <section className="relative mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-24 lg:pb-28">
      <Reveal>
        <div className="flex flex-col gap-4">
          <SectionEyebrow color="#d42672">硬核关键词</SectionEyebrow>
          <h2 className="font-serif-zh text-[22px] font-semibold leading-[1.5] tracking-[-0.02em] sm:text-[26px] sm:leading-[1.45] lg:text-[34px] lg:leading-[1.3]">
            <span className="block">项目优势与课程价值，</span>
            <span className="mt-1 block sm:mt-1.5">
              <GradientText className="font-semibold">一眼看完这套课程的分量</GradientText>
            </span>
          </h2>
        </div>
      </Reveal>

      <Reveal delay={0.08}>
        <div ref={containerRef} className="relative mt-10 w-full sm:mt-12" style={{ height: dims.height }}>
          <svg width="100%" height="100%" viewBox={`0 0 ${dims.width} ${dims.height}`}>
            <g transform={`translate(${dims.width / 2}, ${dims.height / 2})`}>
              {placed.map((w, i) => {
                const t = THEMES[WORD_THEMES[i % WORD_THEMES.length]]
                return (
                  <text
                    key={w.text}
                    textAnchor="middle"
                    className="font-serif-zh font-bold"
                    transform={`translate(${w.x}, ${w.y}) rotate(${w.rotate})`}
                    style={{ fontSize: w.size, fill: t.hex }}
                  >
                    {w.text}
                  </text>
                )
              })}
            </g>
          </svg>
        </div>
      </Reveal>
    </section>
  )
}
