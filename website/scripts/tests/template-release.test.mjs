import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { verifyTemplateReleases } from '../lib/template-release.mjs'

test('发布检查拒绝缺包、过期快照及临时下载链接', async () => {
  const root = await mkdtemp(join(tmpdir(), 'template-release-'))
  try {
    await mkdir(join(root, 'templates'))
    const save = (name, value) => writeFile(join(root, 'templates', name), JSON.stringify(value))
    await save('releases.json', {})
    await assert.rejects(verifyTemplateReleases(root, ['demo']), /尚未发布/)
    const record = { sourceCommit: 'a'.repeat(40), sha256: 'b'.repeat(64), size: 100, snapshotSha256: 'c'.repeat(64), url: `https://bucket.cos.ap-shanghai.myqcloud.com/website/template-packages/demo/1.0.0/${'b'.repeat(64)}.zip` }
    await save('releases.json', { demo: record })
    await save('demo.lock.json', { sha256: record.snapshotSha256, sourceCommit: record.sourceCommit, sourceDirty: false })
    assert.deepEqual(await verifyTemplateReleases(root, ['demo']), ['demo'])
    await save('demo.lock.json', { sha256: 'changed' })
    await assert.rejects(verifyTemplateReleases(root, ['demo']), /生产快照已更新/)
    await save('releases.json', { demo: { ...record, url: record.url + '?signature=expires' } })
    await assert.rejects(verifyTemplateReleases(root, ['demo']), /下载地址无效/)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
