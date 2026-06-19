import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { notFound } from 'next/navigation'

import { loadManifest } from './load-manifest'
import { flattenSections, findAdjacent } from './manifest'
import type { FlatSection, SidebarData } from './types'

const COURSES_DIR = path.join(process.cwd(), 'public', 'courses')

export interface SectionPayload {
  current: FlatSection
  content: string
  prev: FlatSection | null
  next: FlatSection | null
}

// 读取单节：先在 manifest（受信来源）中定位 current，再用其 file 字段读取 MD。
// chapterId/sectionId 仅用于查表，不直接拼进文件路径，避免路径穿越。
export async function loadSection(
  chapterId: string,
  sectionId: string,
): Promise<SectionPayload> {
  const manifest = await loadManifest()
  const flat = flattenSections(manifest)
  const { prev, current, next } = findAdjacent(flat, chapterId, sectionId)
  if (!current) {
    notFound()
  }
  const abs = path.join(COURSES_DIR, current.file)
  let content: string
  try {
    content = await readFile(abs, 'utf-8')
  } catch {
    // manifest 声明了该节但磁盘缺文件：按 404 处理，不静默兜底为空白
    notFound()
  }
  return { current, content, prev, next }
}

// 侧栏数据：章节 + 小节（id/title），不下发文件路径
export async function loadSidebar(): Promise<SidebarData> {
  const manifest = await loadManifest()
  return {
    title: manifest.title,
    chapters: manifest.chapters.map((ch) => ({
      id: ch.id,
      title: ch.title,
      sections: ch.sections.map((s) => ({ id: s.id, title: s.title })),
    })),
  }
}
