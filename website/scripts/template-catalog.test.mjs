import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { spawnSync } from 'node:child_process'

test('目录抽取保留元数据，同时切断仅供页面加载器使用的客户端依赖', async () => {
  const root = await mkdtemp(join(tmpdir(), 'template-catalog-'))
  try {
    await writeFile(join(root, 'client.tsx'), `throw new Error('不应执行模板客户端模块'); export const Host = () => null`)
    await writeFile(join(root, 'page.css'), '.fixture { color: green; }')
    await writeFile(join(root, 'source.json'), JSON.stringify({ id: 'fixture', name: '目录中文名' }))
    await writeFile(join(root, 'meta.tsx'), `
      import { Host } from './client'
      import './page.css'
      import source from './source.json'
      export const template = {
        ...source,
        surfaces: [{ id: 'site', pages: [{ slug: '', title: '首页', localizedTitles: { en: 'Home' },
          load: async () => ({ default: () => <Host /> })
        }] }]
      }
    `)
    const child = spawnSync(process.execPath, [
      '--input-type=module', '--eval',
      `import { register } from 'node:module'; register(${JSON.stringify(new URL('./template-catalog-loader.mjs', import.meta.url).href)}); const { template } = await import(${JSON.stringify(pathToFileURL(join(root, 'meta.tsx')).href)}); console.log(JSON.stringify(template))`,
    ], { encoding: 'utf8', env: { ...process.env, TEMPLATE_CATALOG_MODE: 'test' }, windowsHide: true })
    assert.equal(child.status, 0, child.stderr)
    assert.deepEqual(JSON.parse(child.stdout), {
      id: 'fixture', name: '目录中文名',
      surfaces: [{ id: 'site', pages: [{ slug: '', title: '首页', localizedTitles: { en: 'Home' } }] }],
    })
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
