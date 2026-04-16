import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiClientError } from '../api'
import { fetchStoryList } from '../services'
import type { Story, StoryType } from '../types'

const KEYWORD_DEBOUNCE_MS = 300

export interface UseStoryFeedResult {
  items: Story[]
  loading: boolean
  loadingMore: boolean
  error: string
  hasMore: boolean
  keyword: string
  setKeyword: (value: string) => void
  industry: string
  setIndustry: (value: string) => void
  availableIndustries: string[]
  loadMore: () => void
  reload: () => void
}

interface FetchParams {
  cursor: string
  type?: StoryType
  industry: string
  keyword: string
}

export const useStoryFeed = (type?: StoryType): UseStoryFeedResult => {
  const [items, setItems] = useState<Story[]>([])
  const [availableIndustries, setAvailableIndustries] = useState<string[]>([])
  const [nextCursor, setNextCursor] = useState('')
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const [keyword, setKeywordState] = useState('')
  const [debouncedKeyword, setDebouncedKeyword] = useState('')
  const [industry, setIndustry] = useState('')

  const inflightRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKeyword(keyword.trim()), KEYWORD_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [keyword])

  const runFetch = useCallback(
    async (params: FetchParams, mode: 'reset' | 'append') => {
      inflightRef.current?.abort()
      const controller = new AbortController()
      inflightRef.current = controller
      if (mode === 'reset') {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }
      setError('')
      try {
        const result = await fetchStoryList(
          {
            type: params.type,
            cursor: params.cursor,
            industry: params.industry,
            keyword: params.keyword,
          },
          { signal: controller.signal },
        )
        if (controller.signal.aborted) {
          return
        }
        setItems((prev) => (mode === 'reset' ? result.list : [...prev, ...result.list]))
        setNextCursor(result.nextCursor)
        setHasMore(result.hasMore)
        if (mode === 'reset') {
          setAvailableIndustries(result.availableIndustries)
        }
      } catch (err) {
        if (controller.signal.aborted) {
          return
        }
        if (err instanceof ApiClientError && err.code === 'NETWORK_ABORTED') {
          return
        }
        const message = err instanceof Error ? err.message : 'Unknown error'
        setError(message)
      } finally {
        if (!controller.signal.aborted) {
          if (mode === 'reset') {
            setLoading(false)
          } else {
            setLoadingMore(false)
          }
        }
      }
    },
    [],
  )

  useEffect(() => {
    void runFetch({ type, cursor: '', industry, keyword: debouncedKeyword }, 'reset')
    return () => {
      inflightRef.current?.abort()
    }
  }, [type, industry, debouncedKeyword, runFetch])

  const loadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore || !nextCursor) {
      return
    }
    void runFetch({ type, cursor: nextCursor, industry, keyword: debouncedKeyword }, 'append')
  }, [loading, loadingMore, hasMore, nextCursor, runFetch, type, industry, debouncedKeyword])

  const reload = useCallback(() => {
    void runFetch({ type, cursor: '', industry, keyword: debouncedKeyword }, 'reset')
  }, [runFetch, type, industry, debouncedKeyword])

  const setKeyword = useCallback((value: string) => setKeywordState(value), [])

  return {
    items,
    loading,
    loadingMore,
    error,
    hasMore,
    keyword,
    setKeyword,
    industry,
    setIndustry,
    availableIndustries,
    loadMore,
    reload,
  }
}
