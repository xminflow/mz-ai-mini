import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { cache } from 'react'

import { scopeCss } from './scope-css'
import type { SectionContent } from './types'

const COURSES_DIR = path.join(process.cwd(), 'public', 'courses')

// 拼接文档内所有 <style> 内容
function extractStyles(htmlDoc: string): string {
  const styles: string[] = []
  const re = /<style[^>]*>([\s\S]*?)<\/style>/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(htmlDoc)) !== null) styles.push(m[1])
  return styles.join('\n')
}

// 取 <body> 内部；无 body 时回退为去掉 <head> 的整体。再防御性剥离 <script>。
function extractBody(htmlDoc: string): string {
  const m = htmlDoc.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  const inner = m ? m[1] : htmlDoc.replace(/<head[\s\S]*?<\/head>/i, '')
  return inner.replace(/<script[\s\S]*?<\/script>/gi, '')
}

// 服务端读取课程 HTML 文件并产出作用域化内容。文件缺失时抛错（由页面捕获）。
// cache() 单请求去重（layout/page 不重复读）。
export const loadSectionContent = cache(async (file: string): Promise<SectionContent> => {
  const abs = path.join(COURSES_DIR, file)
  const raw = await readFile(abs, 'utf-8')
  const css = scopeCss(extractStyles(raw))
  const html = extractBody(raw)
  return { css, html }
})
