'use client'

import Link from 'next/link'
import { useState } from 'react'
import { TEMPLATE_DEVICES } from '../devices'
import type { TemplateDevice, TemplatePresentation, TemplateScreenshot } from '../types'

function ScreenshotCarousel({ screenshots, device }: { screenshots: TemplateScreenshot[]; device: TemplateDevice }) {
  const [index, setIndex] = useState(0)
  const shot = screenshots[index]
  const preset = TEMPLATE_DEVICES[device]
  const move = (direction: number) => setIndex(current => (current + direction + screenshots.length) % screenshots.length)
  return <>
    <div className="market-gallery" data-device={device} onKeyDown={event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault()
        move(event.key === 'ArrowLeft' ? -1 : 1)
      }
    }} tabIndex={0} aria-label={`${preset.label} 截图，使用左右方向键切换`}>
      <div className="market-gallery-media" style={{ aspectRatio: `${shot.width ?? preset.width} / ${shot.height ?? preset.height}` }}><img src={shot.src} alt={shot.alt} width={shot.width ?? preset.width} height={shot.height ?? preset.height} className="market-gallery-image" fetchPriority="high" /></div>
      {screenshots.length > 1 && <>
        <button type="button" className="market-gallery-arrow left-4" aria-label="上一张截图" onClick={() => move(-1)}>←</button>
        <button type="button" className="market-gallery-arrow right-4" aria-label="下一张截图" onClick={() => move(1)}>→</button>
      </>}
      <span className="market-gallery-count" aria-hidden>{index + 1} / {screenshots.length}</span>
    </div>
    <div className="market-thumbnail-list">
      {screenshots.map((item, itemIndex) => <button key={item.src} type="button" onClick={() => setIndex(itemIndex)} aria-label={`查看截图 ${itemIndex + 1}：${item.alt}`} aria-pressed={index === itemIndex} className={`market-thumbnail ${index === itemIndex ? 'is-active' : ''}`}>
        <img src={item.src} alt="" width={item.width ?? preset.width} height={item.height ?? preset.height} loading="lazy" />
      </button>)}
    </div>
    <p className="mt-3 text-center text-[12px] text-muted" aria-live="polite">{shot.alt}</p>
  </>
}

export function TemplateGallery({ template }: { template: TemplatePresentation }) {
  const devices = [...new Set(template.screenshots.map(shot => shot.device ?? 'desktop'))]
  const [device, setDevice] = useState<TemplateDevice>(devices[0])
  const screenshots = template.screenshots.filter(shot => (shot.device ?? 'desktop') === device)
  return <section aria-label="模板截图画廊" aria-roledescription="轮播图">
    {devices.length > 1 && <div className="market-device-options" role="group" aria-label="选择适配设备">
      {devices.map(item => {
        const preset = TEMPLATE_DEVICES[item]
        const previewPath = item === 'desktop'
          ? `/templates/${template.id}/${template.surfaces[0].id}`
          : `/templates/${template.id}/preview?viewport=${item}`
        return <div key={item} className={`market-device-option ${device === item ? 'is-active' : ''}`}>
          <button type="button" onClick={() => setDevice(item)} aria-pressed={device === item}>
            <strong>{preset.label}</strong><span>{preset.width} × {preset.height}</span>
          </button>
          <Link href={previewPath} target="_blank" rel="noopener noreferrer" aria-label={`在新标签页预览 ${preset.label}`}>预览 ↗</Link>
        </div>
      })}
    </div>}
    <ScreenshotCarousel key={device} screenshots={screenshots} device={device} />
  </section>
}
