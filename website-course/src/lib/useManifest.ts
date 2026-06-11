import { useEffect, useState } from 'react'
import type { Manifest } from '../types'
import { loadManifest } from './manifest'

interface State {
  manifest: Manifest | null
  error: string | null
  loading: boolean
}

// 应用级一次性加载 manifest，暴露 loading/error/数据三态
export function useManifest(): State {
  const [state, setState] = useState<State>({ manifest: null, error: null, loading: true })
  useEffect(() => {
    let alive = true
    loadManifest()
      .then((m) => alive && setState({ manifest: m, error: null, loading: false }))
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : String(e)
        if (alive) setState({ manifest: null, error: msg, loading: false })
      })
    return () => {
      alive = false
    }
  }, [])
  return state
}
