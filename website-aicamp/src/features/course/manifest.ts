import type { Manifest, FlatSection, ChapterTier } from './types'

const VALID_TIERS: ChapterTier[] = ['basic', 'premium']

// 严格校验 manifest 结构，非法时抛出明确错误，禁止静默兜底
export function parseManifest(data: unknown): Manifest {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('manifest 必须是非数组对象')
  }
  const m = data as Record<string, unknown>
  if (typeof m.title !== 'string') {
    throw new Error('manifest.title 缺失或非字符串')
  }
  if (!Array.isArray(m.chapters)) {
    throw new Error('manifest.chapters 缺失或非数组')
  }
  m.chapters.forEach((ch, ci) => {
    const c = ch as Record<string, unknown>
    if (typeof c.id !== 'string' || typeof c.title !== 'string') {
      throw new Error(`chapters[${ci}] 缺少 id/title`)
    }
    if (typeof c.tier !== 'string' || !VALID_TIERS.includes(c.tier as ChapterTier)) {
      throw new Error(`chapters[${ci}].tier 非法（应为 basic/premium）`)
    }
    if (!Array.isArray(c.sections)) {
      throw new Error(`chapters[${ci}].sections 缺失或非数组`)
    }
    c.sections.forEach((sec, si) => {
      const s = sec as Record<string, unknown>
      if (typeof s.id !== 'string' || typeof s.title !== 'string' || typeof s.file !== 'string') {
        throw new Error(`chapters[${ci}].sections[${si}] 缺少 id/title/file`)
      }
    })
  })
  return data as Manifest
}

// 跨章节扁平化小节序列，保留所属章节信息
export function flattenSections(manifest: Manifest): FlatSection[] {
  return manifest.chapters.flatMap((ch) =>
    ch.sections.map((s) => ({ ...s, chapterId: ch.id, chapterTitle: ch.title })),
  )
}

export interface Adjacent {
  prev: FlatSection | null
  current: FlatSection | null
  next: FlatSection | null
}

// 在扁平序列中定位当前小节及其前后项；首尾对应项为 null
export function findAdjacent(
  flat: FlatSection[],
  chapterId: string,
  sectionId: string,
): Adjacent {
  const idx = flat.findIndex((s) => s.chapterId === chapterId && s.id === sectionId)
  if (idx === -1) {
    return { prev: null, current: null, next: null }
  }
  return {
    prev: idx > 0 ? flat[idx - 1] : null,
    current: flat[idx],
    next: idx < flat.length - 1 ? flat[idx + 1] : null,
  }
}
