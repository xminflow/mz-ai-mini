import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { register } from 'node:module'

register('./template-catalog-loader.mjs', import.meta.url)
const { SITE_TEMPLATES } = await import('../src/features/site-templates/registry.ts')
const { toTemplatePresentation } = await import('../src/features/site-templates/workbench/presentation.ts')

const target = join(import.meta.dirname, '../src/features/site-templates/catalog.generated.json')
const content = JSON.stringify(SITE_TEMPLATES.map(toTemplatePresentation), (key, value) => {
  if (typeof value === 'function') throw new Error(`目录字段不可包含运行函数：${key}`)
  return value
}, 2) + '\n'
let current
try { current = await readFile(target, 'utf8') } catch (error) { if (error.code !== 'ENOENT') throw error }
if (current !== content) await writeFile(target, content)
console.debug(`[template:catalog] templates=${SITE_TEMPLATES.length} bytes=${Buffer.byteLength(content)} updated=${current !== content}`)
