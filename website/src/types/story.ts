export const STORY_TYPES = {
  CASE: 'case',
  PROJECT: 'project',
} as const

export type StoryType = (typeof STORY_TYPES)[keyof typeof STORY_TYPES]

export interface RawStory {
  case_id?: string | number
  _id?: string
  type?: string
  title?: string
  summary?: string
  industry?: string
  cover_image_url?: string
  coverImageUrl?: string
  tags?: string[]
  stage?: string
  city?: string
  resultText?: string
  readTime?: number
  published_at?: string
  publishedAt?: string
}

export interface RawStoryListResult {
  items?: RawStory[]
  next_cursor?: string
  available_industries?: string[]
}

export interface Story {
  id: string
  type: StoryType
  title: string
  summary: string
  industry: string
  coverImage: string
  tags: string[]
  metaItems: string[]
  resultText: string
  readTimeText: string
  publishedAtText: string
}

export interface StoryListQuery {
  type?: StoryType
  cursor?: string
  pageSize?: number
  industry?: string
  keyword?: string
}

export interface StoryListResult {
  list: Story[]
  nextCursor: string
  hasMore: boolean
  availableIndustries: string[]
}

export interface RawStoryDetail {
  case_id?: string | number
  type?: string
  title?: string
  summary?: string
  summary_markdown?: string | null
  industry?: string
  cover_image_url?: string
  coverImageUrl?: string
  tags?: string[]
  stage?: string
  city?: string
  resultText?: string
  readTime?: number
  published_at?: string
  publishedAt?: string
  documents?: RawStoryDocuments
}

export interface RawStoryDocument {
  document_id?: string
  title?: string
  markdown_content?: string
}

export interface RawStoryDocuments {
  business_case?: RawStoryDocument
  market_research?: RawStoryDocument
  business_model?: RawStoryDocument | null
  ai_business_upgrade?: RawStoryDocument
  how_to_do?: RawStoryDocument | null
}

export interface StoryReportSection {
  key: string
  label: string
  title: string
  content: string
}

export interface StoryDetail extends Story {
  summaryMarkdown: string
  reportSections: StoryReportSection[]
}
