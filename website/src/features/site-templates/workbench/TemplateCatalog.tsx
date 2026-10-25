'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui'
import type { TemplatePresentation } from '../types'
import { TemplateCard } from './TemplateCard'
import { WorkBuddyIntro } from './WorkBuddyIntro'

const TEMPLATE_BATCH_SIZE = 9

function TemplateResults({ templates }: { templates: TemplatePresentation[] }) {
  const [visibleCount, setVisibleCount] = useState(TEMPLATE_BATCH_SIZE)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const hasMore = visibleCount < templates.length
  const loadMore = () => setVisibleCount(count => Math.min(count + TEMPLATE_BATCH_SIZE, templates.length))

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!hasMore || !sentinel) return

    // 每批追加后重新观察新位置，避免底部连续通知重复追加同一批。
    let active = true
    const observer = new IntersectionObserver(entries => {
      if (!active || !entries.some(entry => entry.isIntersecting)) return
      active = false
      observer.disconnect()
      setVisibleCount(count => Math.min(count + TEMPLATE_BATCH_SIZE, templates.length))
    }, { rootMargin: '300px 0px' })
    observer.observe(sentinel)
    return () => {
      active = false
      observer.disconnect()
    }
  }, [hasMore, visibleCount, templates.length])

  return <>
    <div className="market-card-grid" id="market-template-results">
      {templates.slice(0, visibleCount).map(template => <TemplateCard key={template.id} template={template} />)}
    </div>
    <div ref={sentinelRef} className="mt-10 text-center">
      <p role="status" className="text-sm text-muted">
        已显示 {Math.min(visibleCount, templates.length)} / {templates.length} 个模板
      </p>
      {hasMore && <Button className="market-secondary mt-4" aria-controls="market-template-results" onClick={loadMore}>加载更多模板</Button>}
    </div>
  </>
}

export function TemplateCatalog({ templates }: { templates: TemplatePresentation[] }) {
  const [scene, setScene] = useState('all')
  const categories = [...new Map(templates.map((template) => [template.sceneId, template.category])).entries()]
  const visible = templates.filter((template) => scene === 'all' || template.sceneId === scene)

  return (
    <>
      <header className="market-catalog-hero">
        <div className="market-catalog-intro">
          <p className="market-eyebrow">THE TEMPLATE COLLECTION</p>
          <h1>好设计，让想法<span>先一步成形<i aria-hidden="true" /></span></h1>
          <WorkBuddyIntro />
        </div>
      </header>

      <section aria-label="模板集合" className="pb-24">
        <div className="market-filter-bar">
          <div className="flex flex-wrap gap-2" role="group" aria-label="按业务场景筛选">
            {[['all', '全部模板'], ...categories].map(([id, name]) => (
              <button key={id} type="button" onClick={() => setScene(id)} aria-pressed={scene === id} className={`market-filter ${scene === id ? 'is-active' : ''}`}>{name}</button>
            ))}
          </div>
        </div>
        {visible.length > 0 ? (
          // 分类变化时重建列表，让新分类始终从首批开始。
          <TemplateResults key={scene} templates={visible} />
        ) : (
          <div className="py-24 text-center">
            <h2 className="text-xl">没有匹配的模板</h2>
            <p className="mb-7 mt-3 text-sm text-muted">请选择其他业务场景，或查看全部模板。</p>
            <Button className="market-secondary" onClick={() => setScene('all')}>重置筛选</Button>
          </div>
        )}
      </section>
    </>
  )
}
