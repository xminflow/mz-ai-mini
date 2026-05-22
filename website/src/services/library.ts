import 'server-only'

import {
  BloggerInsightFetchError,
  fetchBloggerInsightList,
} from './blogger-insights'
import {
  TrackAnalysisFetchError,
  fetchTrackAnalysisList,
} from './track-analysis'
import { LIBRARY_TYPES, type LibraryType } from '@/types/library'

export interface LibraryBloggerPreview {
  slug: string
  displayName: string
  avatarUrl: string | null
  platform: string
  fansCount: number | null
  positioning: string | null
}

export interface LibraryTrackPreview {
  slug: string
  trackKeyword: string
  industry: string | null
  stance: string | null
  stanceSummary: string | null
  reportCount: number
}

interface SectionAvailable {
  available: true
}

interface SectionUpcoming {
  available: false
}

export interface LibraryHubData {
  counts: Record<LibraryType, number>
  blogger: SectionAvailable & {
    totalCount: number
    previews: LibraryBloggerPreview[]
    /**
     * 后端不可用时的兜底文案，前台需明确告知用户「内容真实但暂时无法加载」，
     * 不能伪装成 0 条数据。
     */
    errorMessage: string | null
  }
  playbook: SectionAvailable & {
    chapters: number
  }
  breakdown: SectionUpcoming
  track: SectionAvailable & {
    totalCount: number
    previews: LibraryTrackPreview[]
    errorMessage: string | null
  }
}

const BLOGGER_PREVIEW_LIMIT = 6
const TRACK_PREVIEW_LIMIT = 6

// 运营手册章节当下固定来源于 src/app/(playbook)/playbook 下的目录数量，
// 这里硬编码以避免在网页层做文件系统遍历；后续若 playbook 接入后端再改为动态读取。
const PLAYBOOK_CHAPTER_COUNT = 10

export async function fetchLibraryHubData(): Promise<LibraryHubData> {
  let bloggerTotalCount = 0
  let bloggerPreviews: LibraryBloggerPreview[] = []
  let bloggerError: string | null = null

  try {
    const list = await fetchBloggerInsightList({ limit: BLOGGER_PREVIEW_LIMIT })
    bloggerPreviews = list.items.map((item) => ({
      slug: item.slug,
      displayName: item.display_name,
      avatarUrl: item.avatar_url,
      platform: item.platform,
      fansCount: item.fans_count,
      positioning: item.positioning,
    }))
    // 后端当前未返回总数，前端按已加载的 previews 数量推断「已有 N+」展示。
    bloggerTotalCount = bloggerPreviews.length
  } catch (error) {
    bloggerError =
      error instanceof BloggerInsightFetchError
        ? error.message
        : '博主洞察暂时无法加载，请稍后再试。'
  }

  let trackTotalCount = 0
  let trackPreviews: LibraryTrackPreview[] = []
  let trackError: string | null = null

  try {
    const list = await fetchTrackAnalysisList({ limit: TRACK_PREVIEW_LIMIT })
    trackPreviews = list.items.map((item) => ({
      slug: item.slug,
      trackKeyword: item.track_keyword,
      industry: item.industry,
      stance: item.stance,
      stanceSummary: item.stance_summary,
      reportCount: item.report_metas.length,
    }))
    trackTotalCount = trackPreviews.length
  } catch (error) {
    trackError =
      error instanceof TrackAnalysisFetchError
        ? error.message
        : '赛道分析暂时无法加载，请稍后再试。'
  }

  return {
    counts: {
      [LIBRARY_TYPES.BREAKDOWN]: 0,
      [LIBRARY_TYPES.BLOGGER]: bloggerTotalCount,
      [LIBRARY_TYPES.TRACK]: trackTotalCount,
      [LIBRARY_TYPES.PLAYBOOK]: PLAYBOOK_CHAPTER_COUNT,
    },
    blogger: {
      available: true,
      totalCount: bloggerTotalCount,
      previews: bloggerPreviews,
      errorMessage: bloggerError,
    },
    playbook: {
      available: true,
      chapters: PLAYBOOK_CHAPTER_COUNT,
    },
    breakdown: { available: false },
    track: {
      available: true,
      totalCount: trackTotalCount,
      previews: trackPreviews,
      errorMessage: trackError,
    },
  }
}
