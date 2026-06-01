export interface PublicPost {
  slug: string
  title: string
  excerpt: string
  body: string
  author: string
  publishedAt: string
}

const POSTS: Record<string, PublicPost> = {
  'welcome-to-zhihui': {
    slug: 'welcome-to-zhihui',
    title: '欢迎来到知识汇',
    excerpt: '一个把问题聊到通透的通用知识问答社区。',
    body: '这里是公开精华帖的正文占位。后续接入 community-server 后，正文将由服务端取数渲染。',
    author: '知识汇',
    publishedAt: '2026-06-01',
  },
}

export function getPublicPost(slug: string): PublicPost | null {
  return POSTS[slug] ?? null
}

export function getPublicPostSlugs(): string[] {
  return Object.keys(POSTS)
}

export interface PublicColumn {
  slug: string
  title: string
  description: string
  body: string
}

const COLUMNS: Record<string, PublicColumn> = {
  'getting-started': {
    slug: 'getting-started',
    title: '新手入门专栏',
    description: '如何高效使用知识汇。',
    body: '专栏正文占位。后续接入 community-server 后由服务端取数渲染。',
  },
}

export function getPublicColumn(slug: string): PublicColumn | null {
  return COLUMNS[slug] ?? null
}

export function getPublicColumnSlugs(): string[] {
  return Object.keys(COLUMNS)
}
