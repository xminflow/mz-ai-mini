import assert from 'node:assert/strict'
import test from 'node:test'
import { mkdtemp, mkdir, writeFile, readFile, readdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve, sep } from 'node:path'
import { syncAssets, templateLocalFile, validateRoot } from '../lib/deformo-package.mjs'

test('素材同步覆盖变化、传播删除、优先使用市场截图，且不改动其他模板', async () => {
  const root = await mkdtemp(join(tmpdir(), 'deformo-assets-'))
  try {
    const source = join(root, 'source'), target = join(root, 'website/public/templates/deformo')
    for (const path of ['public/templates/deformo/screenshots', '.tpl/assets']) await mkdir(join(source, path), { recursive: true })
    await mkdir(target, { recursive: true })
    await mkdir(join(root, 'website/public/templates/other'), { recursive: true })
    await writeFile(join(root, 'website/public/templates/other/keep.txt'), 'unchanged')
    await writeFile(join(target, 'old.txt'), 'deleted in source')
    await writeFile(join(source, 'public/templates/deformo/grain.svg'), 'v1')
    await writeFile(join(source, 'public/templates/deformo/screenshots/home.webp'), 'historical')
    await writeFile(join(source, '.tpl/assets/home.webp'), 'current')
    const first = await syncAssets(source, target)
    assert.equal(first.removed, 1)
    assert.equal(await readFile(join(target, 'screenshots/home.webp'), 'utf8'), 'current')
    assert.equal((await syncAssets(source, target)).written, 0)
    await writeFile(join(source, 'public/templates/deformo/grain.svg'), 'v2')
    assert.equal((await syncAssets(source, target)).written, 1)
    assert.equal(await readFile(join(target, 'grain.svg'), 'utf8'), 'v2')
    assert.equal(await readFile(join(root, 'website/public/templates/other/keep.txt'), 'utf8'), 'unchanged')
    assert(!(await readdir(target)).includes('old.txt'))
  } finally {
    if (!resolve(root).startsWith(resolve(tmpdir()) + sep + 'deformo-assets-')) throw new Error('测试目录越界')
    await rm(root, { recursive: true, force: true })
  }
})

test('新增共享模板使用独立素材目录，默认 Deformo 配置仍兼容', async () => {
  assert.ok(templateLocalFile().endsWith('deformo.local'))
  assert.ok(templateLocalFile('uiuxfolio').endsWith('uiuxfolio.local'))
  assert.ok(templateLocalFile('latte').endsWith('latte.local'))
  assert.ok(templateLocalFile('cerno').endsWith('cerno.local'))
  assert.throws(() => templateLocalFile('../other'), /未登记/)
  const root = await mkdtemp(join(tmpdir(), 'uiuxfolio-assets-'))
  try {
    const source = join(root, 'source'), target = join(root, 'output')
    await mkdir(join(source, 'public/templates/uiuxfolio'), { recursive: true })
    await mkdir(join(source, '.tpl/assets'), { recursive: true })
    await writeFile(join(source, 'package.json'), JSON.stringify({ name: 'uiuxfolio-template', exports: { './template': './meta.ts', './host': './host.tsx' } }))
    await writeFile(join(source, 'public/templates/uiuxfolio/logo.svg'), 'uiuxfolio')
    await writeFile(join(source, '.tpl/assets/desktop-home.webp'), 'screenshot')
    assert.equal(await validateRoot(source, 'uiuxfolio'), source)
    await assert.rejects(validateRoot(source), /不是可引用/)
    const result = await syncAssets(source, target, 'uiuxfolio')
    assert.equal(result.files, 2)
    assert.equal(await readFile(join(target, 'logo.svg'), 'utf8'), 'uiuxfolio')
    assert.equal(await readFile(join(target, 'screenshots/desktop-home.webp'), 'utf8'), 'screenshot')
  } finally {
    if (!resolve(root).startsWith(resolve(tmpdir()) + sep + 'uiuxfolio-assets-')) throw new Error('测试目录越界')
    await rm(root, { recursive: true, force: true })
  }
})
