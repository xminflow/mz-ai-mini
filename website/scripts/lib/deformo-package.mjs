import { readFile, writeFile, readdir, mkdir, copyFile, unlink, lstat, realpath } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
import { resolve, join, dirname, sep } from 'node:path'

export const websiteRoot = resolve(import.meta.dirname, '../..')
const require = createRequire(import.meta.url)
export const localFile = join(websiteRoot, 'deformo.local')
export const SHARED_TEMPLATE_IDS = ['deformo', 'uiuxfolio', 'latte', 'cerno', 'foldex', 'souma', 'furnexa', 'mondragon', 'conicorn', 'grovia', 'lunera', 'noirei', 'hellomonday', 'liubai', 'nubo', 'recueil', 'studiothink', 'tabfolio', 'unseen', 'tomasfolio', 'artemis']
export function templateLocalFile(id = 'deformo') {
  if (!SHARED_TEMPLATE_IDS.includes(id)) throw new Error('未登记的共享模板: ' + id)
  return join(websiteRoot, id + '.local')
}
export const digest = bytes => createHash('sha256').update(bytes).digest('hex')

export async function localRoot(id = 'deformo') {
  const localFile = templateLocalFile(id)
  if (!existsSync(localFile)) return null
  const config = JSON.parse(await readFile(localFile, 'utf8'))
  if (typeof config.source !== 'string') throw new Error(id + '.local 缺少 source')
  return validateRoot(config.source, id)
}

export async function validateRoot(root, id = 'deformo') {
  templateLocalFile(id)
  const path = await realpath(resolve(root))
  const pkg = JSON.parse(await readFile(join(path, 'package.json'), 'utf8'))
  if (pkg.name !== id + '-template' || !pkg.exports?.['./template'] || !pkg.exports?.['./host']) throw new Error('不是可引用的 ' + id + '-template 包')
  return path
}

export function installedRoot(id = 'deformo') {
  templateLocalFile(id)
  return dirname(require.resolve(id + '-template/package.json'))
}

async function files(root, prefix = '') {
  const result = []
  for (const item of await readdir(join(root, prefix), { withFileTypes: true })) {
    const path = prefix ? prefix + '/' + item.name : item.name
    if (item.isSymbolicLink()) throw new Error('素材不能包含符号链接: ' + path)
    if (item.isDirectory()) result.push(...await files(root, path))
    else if (item.isFile()) result.push(path)
    else throw new Error('不支持的素材类型: ' + path)
  }
  return result
}

/** 每套共享模板只管理自己的生成目录，避免覆盖主站及其他模板的素材。 */
export async function syncAssets(source, target, id = 'deformo') {
  templateLocalFile(id)
  target ??= join(websiteRoot, 'public/templates', id)
  const input = join(source, 'public/templates', id)
  const sources = new Map((await files(input)).map(path => [path, join(input, path)]))
  // 当前独立模板截图用于市场，源站历史截图/报告不作为新的验收证据。
  for (const name of await readdir(join(source, '.tpl/assets'))) if (name.endsWith('.webp')) sources.set('screenshots/' + name, join(source, '.tpl/assets', name))
  await mkdir(target, { recursive: true })
  if ((await lstat(target)).isSymbolicLink()) throw new Error('素材目标不能是符号链接')
  const existing = await files(target)
  let written = 0
  for (const [path, from] of sources) {
    const destination = resolve(target, path)
    if (!destination.startsWith(resolve(target) + sep)) throw new Error('素材路径越界')
    const bytes = await readFile(from)
    if (existsSync(destination) && digest(await readFile(destination)) === digest(bytes)) continue
    await mkdir(dirname(destination), { recursive: true })
    await copyFile(from, destination)
    written++
  }
  // 清理本目录中已从模板删除的生成文件；不递归删除目录或包外文件。
  for (const path of existing) if (!sources.has(path)) await unlink(join(target, path))
  return { source, files: sources.size, written, removed: existing.filter(path => !sources.has(path)).length }
}

export async function verifySnapshot(id = 'deformo') {
  templateLocalFile(id)
  const record = JSON.parse(await readFile(join(websiteRoot, 'templates', id + '.lock.json'), 'utf8'))
  if (!new RegExp('^vendor/' + id + '-template-[\\w.-]+\\.tgz$').test(record.archive)) throw new Error('模板包路径非法')
  if (digest(await readFile(join(websiteRoot, record.archive))) !== record.sha256) throw new Error('模板部署包摘要不匹配，请重新生成快照')
  const pkg = JSON.parse(await readFile(join(installedRoot(id), 'package.json'), 'utf8'))
  if (pkg.name !== id + '-template' || pkg.version !== record.version) throw new Error('已安装模板与部署快照版本不匹配，请冻结安装依赖')
  const manifest = JSON.parse(await readFile(join(websiteRoot, 'package.json'), 'utf8'))
  if (manifest.dependencies[id + '-template'] !== 'file:./' + record.archive) throw new Error('模板依赖必须固定到随仓部署包')
  return record
}
