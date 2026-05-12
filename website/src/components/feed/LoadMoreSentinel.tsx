'use client'

import { useEffect, useRef } from 'react'

interface LoadMoreSentinelProps {
  onReach: () => void
  disabled?: boolean
}

export const LoadMoreSentinel = ({ onReach, disabled = false }: LoadMoreSentinelProps) => {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (disabled) {
      return
    }
    const node = ref.current
    if (!node) {
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            onReach()
          }
        }
      },
      { rootMargin: '200px 0px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [disabled, onReach])

  return <div ref={ref} aria-hidden className="h-8 w-full" />
}
