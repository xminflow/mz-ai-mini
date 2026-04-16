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
  type: StoryType
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
