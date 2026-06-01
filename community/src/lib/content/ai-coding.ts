import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

// 冷调强调色（青→靛家族），给每个阶段一个变体
export type AccentKey = 'cyan' | 'sky' | 'indigo' | 'violet' | 'teal'

export interface Accent {
  hex: string
  rgb: string // "r, g, b" 便于在 rgba() 内插值
  from: string
  to: string
}

export const ACCENTS: Record<AccentKey, Accent> = {
  cyan: { hex: '#22d3ee', rgb: '34, 211, 238', from: '#67e8f9', to: '#0891b2' },
  sky: { hex: '#38bdf8', rgb: '56, 189, 248', from: '#7dd3fc', to: '#0284c7' },
  indigo: { hex: '#6366f1', rgb: '99, 102, 241', from: '#818cf8', to: '#4338ca' },
  violet: { hex: '#8b5cf6', rgb: '139, 92, 246', from: '#a78bfa', to: '#6d28d9' },
  teal: { hex: '#2dd4bf', rgb: '45, 212, 191', from: '#5eead4', to: '#0d9488' },
}

export interface Stage {
  slug: string
  order: number
  title: string
  tagline: string
  summary: string
  accent: AccentKey
  objectives: string[]
  content: string // 原始 markdown 正文
}

const CN_NUMERALS = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'] as const

// 阶段中文序号标签：第一阶段 / 第二阶段……（超过 10 退化为数字）
export function stageLabel(order: number): string {
  return `第${CN_NUMERALS[order] ?? order}阶段`
}

const CONTENT_DIR = path.join(process.cwd(), 'src/content/ai-coding')
const ACCENT_KEYS: AccentKey[] = ['cyan', 'sky', 'indigo', 'violet', 'teal']

// 校验单个文件的 frontmatter，非法即抛错（禁止静默兜底），错误信息带文件名
function parseStageFile(filename: string): Stage {
  const slug = filename.replace(/\.md$/, '')
  const raw = fs.readFileSync(path.join(CONTENT_DIR, filename), 'utf-8')
  const { data, content } = matter(raw)

  const where = `content/ai-coding/${filename}`
  const required = ['order', 'title', 'tagline', 'summary', 'accent', 'objectives'] as const
  for (const key of required) {
    if (data[key] === undefined || data[key] === null) {
      throw new Error(`[ai-coding] ${where} 缺少必填 frontmatter 字段：${key}`)
    }
  }
  if (typeof data.order !== 'number') {
    throw new Error(`[ai-coding] ${where} 的 order 必须是数字，实际：${typeof data.order}`)
  }
  if (!ACCENT_KEYS.includes(data.accent)) {
    throw new Error(`[ai-coding] ${where} 的 accent 非法：${data.accent}（应为 ${ACCENT_KEYS.join('|')}）`)
  }
  if (!Array.isArray(data.objectives) || data.objectives.some((o: unknown) => typeof o !== 'string')) {
    throw new Error(`[ai-coding] ${where} 的 objectives 必须是字符串数组`)
  }

  return {
    slug,
    order: data.order,
    title: String(data.title),
    tagline: String(data.tagline),
    summary: String(data.summary),
    accent: data.accent,
    objectives: data.objectives,
    content,
  }
}

// 模块级缓存：构建期/ISR 读取一次即可
let cachedStages: Stage[] | null = null

function loadStages(): Stage[] {
  if (cachedStages) return cachedStages
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.md'))
  if (files.length === 0) {
    throw new Error(`[ai-coding] 内容目录为空：${CONTENT_DIR}`)
  }
  const stages = files.map(parseStageFile).sort((a, b) => a.order - b.order)

  // order 冲突检查：重复 order 会让排序与「第N阶段」标签产生歧义
  const seen = new Map<number, string>()
  for (const s of stages) {
    const dup = seen.get(s.order)
    if (dup) throw new Error(`[ai-coding] order 冲突：${dup}.md 与 ${s.slug}.md 都是 order=${s.order}`)
    seen.set(s.order, s.slug)
  }

  cachedStages = stages
  return stages
}

export function getStages(): Stage[] {
  return loadStages()
}

export function getStage(slug: string): Stage | null {
  return loadStages().find((s) => s.slug === slug) ?? null
}

export function getStageSlugs(): string[] {
  return loadStages().map((s) => s.slug)
}

export function getAdjacentStages(slug: string): { prev: Stage | null; next: Stage | null } {
  const ordered = loadStages()
  const idx = ordered.findIndex((s) => s.slug === slug)
  if (idx === -1) return { prev: null, next: null }
  return {
    prev: idx > 0 ? ordered[idx - 1] : null,
    next: idx < ordered.length - 1 ? ordered[idx + 1] : null,
  }
}
