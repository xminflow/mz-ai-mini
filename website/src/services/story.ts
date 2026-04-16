import { request } from '../api'
import {
  STORY_TYPES,
  type RawStory,
  type RawStoryListResult,
  type Story,
  type StoryListQuery,
  type StoryListResult,
  type StoryType,
} from '../types'
import { formatDateLabel, formatReadTime, isCloudFileId } from './format'

export const STORY_PAGE_SIZE = 12

const normalizeTags = (tags: string[] | undefined): string[] => {
  if (!Array.isArray(tags)) {
    return []
  }
  return tags.filter((tag): tag is string => Boolean(tag) && typeof tag === 'string').slice(0, 3)
}

const normalizeIndustry = (industry: string | undefined): string => {
  if (typeof industry !== 'string') {
    return ''
  }
  return industry.trim()
}

const normalizeStoryType = (value: string | undefined): StoryType => {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error('story type is invalid.')
  }
  const normalized = value.trim()
  const allowed: StoryType[] = [STORY_TYPES.CASE, STORY_TYPES.PROJECT]
  if (!allowed.includes(normalized as StoryType)) {
    throw new Error('story type is invalid.')
  }
  return normalized as StoryType
}

const normalizeAvailableIndustries = (industries: string[] | undefined): string[] => {
  if (!Array.isArray(industries)) {
    return []
  }
  const result: string[] = []
  const seen = new Set<string>()
  for (const value of industries) {
    if (typeof value !== 'string') continue
    const trimmed = value.trim()
    if (!trimmed || seen.has(trimmed)) continue
    seen.add(trimmed)
    result.push(trimmed)
  }
  return result
}

const buildMetaItems = (raw: RawStory): string[] => {
  const candidates = [raw.stage, raw.industry, raw.city]
  return candidates.filter((item): item is string => typeof item === 'string' && item.trim() !== '')
}

const resolvePublishedAt = (raw: RawStory): string => raw.published_at ?? raw.publishedAt ?? ''

const resolveCoverImage = (raw: RawStory): string => {
  const candidate = typeof raw.cover_image_url === 'string'
    ? raw.cover_image_url
    : typeof raw.coverImageUrl === 'string'
      ? raw.coverImageUrl
      : ''
  const trimmed = candidate.trim()
  if (trimmed === '') {
    return ''
  }
  // Website cannot resolve WeChat cloud file IDs; fall back to empty and rely on placeholder UI.
  if (isCloudFileId(trimmed)) {
    return ''
  }
  return trimmed
}

const resolveStoryId = (raw: RawStory): string => {
  if (raw.case_id !== undefined && raw.case_id !== null) {
    return String(raw.case_id)
  }
  return raw._id ?? ''
}

export const normalizeStory = (raw: RawStory): Story => ({
  id: resolveStoryId(raw),
  type: normalizeStoryType(raw.type),
  title: raw.title ?? '',
  summary: raw.summary ?? '',
  industry: normalizeIndustry(raw.industry),
  coverImage: resolveCoverImage(raw),
  tags: normalizeTags(raw.tags),
  metaItems: buildMetaItems(raw),
  resultText: raw.resultText ?? '',
  readTimeText: formatReadTime(raw.readTime),
  publishedAtText: formatDateLabel(resolvePublishedAt(raw)),
})

export const fetchStoryList = async (
  query: StoryListQuery,
  options: { signal?: AbortSignal } = {},
): Promise<StoryListResult> => {
  const pageSize = query.pageSize && query.pageSize > 0 ? query.pageSize : STORY_PAGE_SIZE
  const queryParams: Record<string, string | number> = {
    limit: pageSize,
    cursor: query.cursor ?? '',
    industry: query.industry ?? '',
    keyword: query.keyword ?? '',
  }
  if (query.type) {
    queryParams.type = normalizeStoryType(query.type)
  }
  const result = await request<RawStoryListResult>({
    path: '/business-cases',
    method: 'GET',
    query: queryParams,
    signal: options.signal,
  })
  const rawItems = Array.isArray(result.items) ? result.items : []
  return {
    list: rawItems.map(normalizeStory),
    nextCursor: result.next_cursor ?? '',
    hasMore: Boolean(result.next_cursor),
    availableIndustries: normalizeAvailableIndustries(result.available_industries),
  }
}
