import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { websiteRoot, SHARED_TEMPLATE_IDS } from './deformo-package.mjs'

/** 发布清单和生产快照必须一致，防止预览已更新而下载包仍是旧版本。 */
export async function verifyTemplateReleases(root = websiteRoot, requiredIds = SHARED_TEMPLATE_IDS) {
  const releases = JSON.parse(await readFile(join(root, 'templates/releases.json'), 'utf8'))
  for (const id of requiredIds) if (!releases[id]) throw new Error(id + ': 源码 ZIP 尚未发布')
  for (const [id, record] of Object.entries(releases)) {
    if (!/^[a-f0-9]{40}$/.test(record.sourceCommit) || !/^[a-f0-9]{64}$/.test(record.sha256) || !(record.size > 0)) throw new Error(id + ': 源码 ZIP 发布记录无效')
    const url = new URL(record.url)
    if (url.protocol !== 'https:' || !url.pathname.startsWith('/website/template-packages/' + id + '/') || !url.pathname.endsWith('/' + record.sha256 + '.zip') || url.search || url.hash) throw new Error(id + ': ZIP 下载地址无效')
    if (requiredIds.includes(id)) {
      const lock = JSON.parse(await readFile(join(root, 'templates', id + '.lock.json'), 'utf8'))
      if (record.snapshotSha256 !== lock.sha256 || record.sourceCommit !== lock.sourceCommit || lock.sourceDirty !== false) throw new Error(id + ': 生产快照已更新，请重新发布源码 ZIP')
    }
  }
  return Object.keys(releases)
}
