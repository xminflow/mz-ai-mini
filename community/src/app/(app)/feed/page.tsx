'use client'

import { useEffect, useState } from 'react'
import { bffGet } from '@/lib/api/client'
import type { FeedItem } from '@/lib/mock/feed'

export default function FeedPage() {
  const [items, setItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    bffGet<{ items: FeedItem[] }>('feed')
      .then((data) => setItems(data.items))
      .catch(() => setError('加载失败，请稍后重试'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section>
      <h1 className="font-display text-3xl font-medium text-ink">信息流</h1>
      {loading ? (
        <p className="mt-6 text-sm text-mute">加载中…</p>
      ) : error ? (
        <p className="mt-6 text-sm text-amber">{error}</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {items.map((item) => (
            <li key={item.id} className="glass rounded-card p-5">
              <p className="text-ink-2">{item.title}</p>
              <p className="mt-2 text-sm text-mute">{item.author}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
