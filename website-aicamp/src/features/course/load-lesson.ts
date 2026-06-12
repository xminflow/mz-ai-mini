import type { ComponentType } from 'react'

// 按 manifest 的 file 键（<chapterId>/<slug>）动态加载课件 TSX 组件。
// webpack 对 ../../content/courses/** 建动态 context 解析 .tsx；缺失/无默认导出返回 null。
export async function loadLesson(file: string): Promise<ComponentType | null> {
  try {
    const mod = (await import(`../../content/courses/${file}`)) as { default?: ComponentType }
    return mod.default ?? null
  } catch {
    return null
  }
}
