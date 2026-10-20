'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { TEMPLATE_DEVICES } from '../devices'
import type { TemplateDevice } from '../types'
import './preview-stage.css'

interface StageSurface {
  id: string
  name: string
  platformLabel: string
}

interface PreviewStageProps {
  templateId: string
  src: string
  title: string
  accentColor: string
  surfaces: StageSurface[]
  activeSurfaceId: string
  initialViewport?: TemplateDevice
}

export function PreviewStage({ templateId, src, title, accentColor, surfaces, activeSurfaceId, initialViewport = 'desktop' }: PreviewStageProps) {
  const [viewport, setViewport] = useState(initialViewport)
  const [available, setAvailable] = useState<{ width: number; height: number } | null>(null)
  const canvas = useRef<HTMLDivElement>(null)
  const active = TEMPLATE_DEVICES[viewport]
  const bezel = viewport === 'desktop' ? 1 : viewport === 'tablet' ? 12 : 10
  const frameWidth = active.width + bezel * 2
  const frameHeight = active.height + bezel * 2
  // 缩放整个设备外壳，iframe 始终保留真实 CSS 视口；媒体查询与交互使用实际端尺寸。
  const scale = available ? Math.min(1, available.width / frameWidth, available.height / frameHeight) : 0

  useEffect(() => {
    if (!canvas.current) return
    const observer = new ResizeObserver(([entry]) => setAvailable({ width: entry.contentRect.width, height: entry.contentRect.height }))
    observer.observe(canvas.current)
    return () => observer.disconnect()
  }, [])

  function chooseDevice(device: TemplateDevice) {
    setViewport(device)
    const url = new URL(window.location.href)
    url.searchParams.set('viewport', device)
    window.history.replaceState(null, '', url)
  }

  return <div data-preview-stage className="fixed inset-0 flex flex-col">
    <header className="stage-toolbar">
      <Link href={`/templates/${templateId}`} className="stage-back">← 模板详情</Link>
      {surfaces.length > 1 && <nav aria-label="切换端" className="stage-surfaces">
        {surfaces.map(surface => <Link key={surface.id} href={`/templates/${templateId}/preview?surface=${surface.id}&viewport=${viewport}`} aria-current={surface.id === activeSurfaceId ? 'page' : undefined} title={surface.platformLabel}>{surface.name}</Link>)}
      </nav>}
      <div className="stage-device-controls" role="group" aria-label="选择模拟设备">
        {(Object.keys(TEMPLATE_DEVICES) as TemplateDevice[]).map(device => <button key={device} type="button" onClick={() => chooseDevice(device)} aria-pressed={viewport === device} style={viewport === device ? { borderColor: accentColor } : undefined}>{TEMPLATE_DEVICES[device].label}</button>)}
        <span className="stage-dimensions">{active.width} × {active.height}</span>
      </div>
      <a href={src} target="_blank" rel="noopener noreferrer" className="stage-direct">直接打开页面 ↗</a>
    </header>
    <div ref={canvas} className="stage-canvas">
      <div className="stage-beam" style={{ width: active.width + 560 }} aria-hidden />
      {available && <div className="stage-device-holder" style={{ width: frameWidth * scale, height: frameHeight * scale }}>
        <div className={`stage-screen stage-device-${viewport}`} style={{ width: frameWidth, height: frameHeight, borderWidth: bezel, transform: `scale(${scale})` }}>
          <iframe src={src} title={title} width={active.width} height={active.height} className="block size-full border-0" />
        </div>
      </div>}
    </div>
  </div>
}
