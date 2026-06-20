import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { cache } from 'react'

import { parseManifest } from './manifest'
import type { Manifest } from './types'

const PUBLIC_DIR = path.join(process.cwd(), 'public')

async function readJson(contentDir: string, relativePath: string): Promise<unknown> {
  const abs = path.join(PUBLIC_DIR, contentDir, relativePath)
  const raw = await readFile(abs, 'utf-8')
  return JSON.parse(raw) as unknown
}

// 读顶层章节清单（id/title），与各章 sections.json 合并成完整 manifest。
// contentDir 为 public 下的内容目录名（如 'courses' / 'community'），不同合集互不影响。
// 单请求内多次调用（layout + page）复用同一结果，避免重复 fs 读（按 contentDir 分别缓存）。
export const loadManifest = cache(async (contentDir: string): Promise<Manifest> => {
  // 下面内联 guard 仅为"组装阶段"安全访问 c.id / s.file（拼路径要先用到它们），
  // 不是完整校验；结构合法性由末尾 parseManifest 权威校验，勿删。
  const top = await readJson(contentDir, 'manifest.json')
  if (!top || typeof top !== 'object' || Array.isArray(top)) {
    throw new Error('manifest.json 必须是非数组对象')
  }
  const topRecord = top as Record<string, unknown>
  if (!Array.isArray(topRecord.chapters)) {
    throw new Error('manifest.json.chapters 缺失或非数组')
  }

  const chapters = await Promise.all(
    topRecord.chapters.map(async (ch) => {
      const c = ch as Record<string, unknown>
      if (typeof c.id !== 'string') {
        throw new Error('manifest.json 存在缺少 id 的章节')
      }
      const sectionsDoc = await readJson(contentDir, `${c.id}/sections.json`)
      const sd = sectionsDoc as Record<string, unknown>
      if (!Array.isArray(sd.sections)) {
        throw new Error(`${c.id}/sections.json 缺少 sections 数组`)
      }
      // file 由章内文件名拼成 <chapterId>/<file>，与 public/courses 下真实路径对齐
      const sections = sd.sections.map((sec) => {
        const s = sec as Record<string, unknown>
        if (typeof s.file !== 'string') {
          throw new Error(`${c.id}/sections.json 存在缺少 file 的小节`)
        }
        return { ...s, file: `${c.id}/${s.file}` }
      })
      return { ...c, title: c.title, sections }
    }),
  )

  return parseManifest({ title: topRecord.title, chapters })
})
