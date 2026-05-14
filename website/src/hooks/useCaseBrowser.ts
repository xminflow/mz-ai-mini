import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ApiClientError } from '../api'
import { fetchStoryDetail, fetchStoryList } from '../services'
import type { Story, StoryDetail, StoryListResult } from '../types'

const KEYWORD_DEBOUNCE_MS = 300
const PAGE_SIZE = 50
const PREFETCH_DELAY_MS = 150

export interface UseCaseBrowserOptions {
  initialData?: StoryListResult
}

export interface UseCaseBrowserResult {
  items: Story[]
  loading: boolean
  error: string
  keyword: string
  setKeyword: (value: string) => void
  industry: string
  setIndustry: (value: string) => void
  availableIndustries: string[]
  availableTags: string[]
  selectedTags: Set<string>
  toggleTag: (tag: string) => void
  clearTags: () => void
  selectedCaseId: string | null
  selectCase: (caseId: string) => void
  selectedDetail: StoryDetail | null
  detailLoading: boolean
  detailError: string
  prefetchDetail: (caseId: string) => void
  cancelPrefetch: () => void
  reload: () => void
}

export const useCaseBrowser = (options: UseCaseBrowserOptions = {}): UseCaseBrowserResult => {
  const { initialData } = options
  const [allItems, setAllItems] = useState<Story[]>(initialData?.list ?? [])
  const [availableIndustries, setAvailableIndustries] = useState<string[]>(initialData?.availableIndustries ?? [])
  const [loading, setLoading] = useState(!initialData)
  const [error, setError] = useState('')
  const [keyword, setKeywordState] = useState('')
  const [debouncedKeyword, setDebouncedKeyword] = useState('')
  const [industry, setIndustry] = useState('')
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')

  const detailCacheRef = useRef<Map<string, StoryDetail>>(new Map())
  const listAbortRef = useRef<AbortController | null>(null)
  const detailAbortRef = useRef<AbortController | null>(null)
  const prefetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKeyword(keyword.trim()), KEYWORD_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [keyword])

  const fetchDetailById = useCallback(async (caseId: string, signal?: AbortSignal) => {
    if (detailCacheRef.current.has(caseId)) return
    detailAbortRef.current?.abort()
    const controller = new AbortController()
    detailAbortRef.current = controller

    const onExternalAbort = () => controller.abort()
    signal?.addEventListener('abort', onExternalAbort, { once: true })

    setDetailLoading(true)
    setDetailError('')
    try {
      const detail = await fetchStoryDetail(caseId, { signal: controller.signal })
      if (controller.signal.aborted) return
      detailCacheRef.current.set(caseId, detail)
    } catch (err) {
      if (controller.signal.aborted) return
      if (err instanceof ApiClientError && err.code === 'NETWORK_ABORTED') return
      setDetailError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      signal?.removeEventListener('abort', onExternalAbort)
      if (!controller.signal.aborted) setDetailLoading(false)
    }
  }, [])

  const loadAllCases = useCallback(async (params: { industry: string; keyword: string }) => {
    listAbortRef.current?.abort()
    const controller = new AbortController()
    listAbortRef.current = controller
    setLoading(true)
    setError('')

    try {
      const accumulated: Story[] = []
      let cursor = ''
      let industries: string[] = []

      for (;;) {
        const result = await fetchStoryList(
          { pageSize: PAGE_SIZE, cursor, industry: params.industry, keyword: params.keyword },
          { signal: controller.signal },
        )
        if (controller.signal.aborted) return
        accumulated.push(...result.list)
        if (industries.length === 0) {
          industries = result.availableIndustries
        }
        if (!result.hasMore) break
        cursor = result.nextCursor
      }

      setAllItems(accumulated)
      setAvailableIndustries(industries)
      if (accumulated.length > 0) {
        const firstId = accumulated[0].id
        setSelectedCaseId(firstId)
        void fetchDetailById(firstId, controller.signal)
      }
    } catch (err) {
      if (controller.signal.aborted) return
      if (err instanceof ApiClientError && err.code === 'NETWORK_ABORTED') return
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      if (!controller.signal.aborted) setLoading(false)
    }
  }, [fetchDetailById])

  const didUseInitialDataRef = useRef(!!initialData)

  useEffect(() => {
    if (didUseInitialDataRef.current) {
      didUseInitialDataRef.current = false
      if (allItems.length > 0) {
        const firstId = allItems[0].id
        setSelectedCaseId(firstId)
        void fetchDetailById(firstId)
      }
      return
    }
    void loadAllCases({ industry, keyword: debouncedKeyword })
    return () => { listAbortRef.current?.abort() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [industry, debouncedKeyword, loadAllCases])

  const filteredItems = useMemo(() => {
    if (selectedTags.size === 0) return allItems
    return allItems.filter((item) =>
      item.tags.some((tag) => selectedTags.has(tag)),
    )
  }, [allItems, selectedTags])

  const availableTags = useMemo(() => {
    const tagSet = new Set<string>()
    for (const item of allItems) {
      for (const tag of item.tags) {
        tagSet.add(tag)
      }
    }
    return Array.from(tagSet)
  }, [allItems])

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev)
      if (next.has(tag)) {
        next.delete(tag)
      } else {
        next.add(tag)
      }
      return next
    })
  }, [])

  const clearTags = useCallback(() => {
    setSelectedTags(new Set())
  }, [])

  const selectedDetail = useMemo(
    () => (selectedCaseId ? detailCacheRef.current.get(selectedCaseId) ?? null : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedCaseId, detailLoading],
  )

  const selectCase = useCallback((caseId: string) => {
    setSelectedCaseId(caseId)
    void fetchDetailById(caseId)
  }, [fetchDetailById])

  const prefetchDetail = useCallback((caseId: string) => {
    if (detailCacheRef.current.has(caseId)) return
    prefetchTimerRef.current = setTimeout(() => {
      void fetchDetailById(caseId)
    }, PREFETCH_DELAY_MS)
  }, [fetchDetailById])

  const cancelPrefetch = useCallback(() => {
    if (prefetchTimerRef.current !== null) {
      clearTimeout(prefetchTimerRef.current)
      prefetchTimerRef.current = null
    }
  }, [])

  const setKeyword = useCallback((value: string) => setKeywordState(value), [])

  const reload = useCallback(() => {
    void loadAllCases({ industry, keyword: debouncedKeyword })
  }, [loadAllCases, industry, debouncedKeyword])

  return {
    items: filteredItems,
    loading,
    error,
    keyword,
    setKeyword,
    industry,
    setIndustry,
    availableIndustries,
    availableTags,
    selectedTags,
    toggleTag,
    clearTags,
    selectedCaseId,
    selectCase,
    selectedDetail,
    detailLoading,
    detailError,
    prefetchDetail,
    cancelPrefetch,
    reload,
  }
}
