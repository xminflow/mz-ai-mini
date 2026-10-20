'use client'

import { useInView } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { useMotionPreference } from './Motion'

/** 画廊中的动态素材在进入视口后播放；离屏、切后台或减少动态时暂停。 */
export function WorldVideo({ src, label }: { src: string; label?: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  const visible = useInView(ref, { amount: .15 })
  const reduced = useMotionPreference()
  useEffect(() => {
    const video = ref.current
    if (!video) return
    const update = () => {
      if (visible && !reduced && !document.hidden) {
        void video.play().catch(cause => {
          if (cause instanceof DOMException && cause.name === 'AbortError') {
            if (process.env.NODE_ENV === 'development') console.debug('[unseen/world] Preview playback interrupted', { src })
          } else console.error('[unseen/world] Preview playback failed', { src, cause })
        })
      } else video.pause()
    }
    update()
    document.addEventListener('visibilitychange', update)
    return () => { video.pause(); document.removeEventListener('visibilitychange', update) }
  }, [visible, reduced, src])
  return <video ref={ref} src={src} muted loop playsInline preload="metadata" aria-label={label} aria-hidden={label ? undefined : true} />
}
