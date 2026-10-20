import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises'
import { resolve, join, basename } from 'node:path'
import { websiteRoot, templateLocalFile, localRoot, installedRoot, validateRoot, syncAssets, verifySnapshot, digest } from './lib/deformo-package.mjs'

const args = process.argv.slice(2)
const idIndex = args.indexOf('--id')
if (idIndex >= 0 && !args[idIndex + 1]) throw new Error('--id 需要指定共享模板标识')
const id = idIndex < 0 ? 'deformo' : args.splice(idIndex, 2)[1]
const localFile = templateLocalFile(id)
const [command, argument] = args
if (command === 'local') {
  if (!argument) throw new Error('用法: pnpm run template:local -- <模板仓库路径>')
  const source = await validateRoot(resolve(argument), id)
  await writeFile(localFile, JSON.stringify({ source }, null, 2) + '\n')
  console.log(JSON.stringify(await syncAssets(source, undefined, id), null, 2))
  console.log('开发服务器将直接读取该模板源码；生产构建始终使用固定部署包。')
} else if (command === 'snapshot') {
  if (!argument) throw new Error('用法: pnpm run template:update <模板 .tgz 路径>')
  const input = resolve(argument)
  const version = basename(input).match(new RegExp('^' + id + '-template-(\\d+\\.\\d+\\.\\d+)\\.tgz$'))?.[1]
  if (!version) throw new Error('模板归档名称应包含明确版本')
  const bytes = await readFile(input), sha256 = digest(bytes)
  const archive = 'vendor/' + id + '-template-' + version + '-' + sha256.slice(0, 12) + '.tgz'
  await mkdir(join(websiteRoot, 'vendor'), { recursive: true })
  await mkdir(join(websiteRoot, 'templates'), { recursive: true })
  // 不解包或执行外部提供的脚本；由包管理器完成显式安装。
  await copyFile(input, join(websiteRoot, archive))
  let provenance
  try { provenance = JSON.parse(await readFile(join(resolve(input, '..'), 'bundle.json'), 'utf8')) } catch (error) { if (error.code !== 'ENOENT') throw error }
  const record = { name: id + '-template', version, archive, sha256, sourceCommit: provenance?.sourceCommit ?? null, sourceDirty: provenance?.sourceDirty ?? null }
  await writeFile(join(websiteRoot, 'templates', id + '.lock.json'), JSON.stringify(record, null, 2) + '\n')
  const pkg = JSON.parse(await readFile(join(websiteRoot, 'package.json'), 'utf8'))
  pkg.dependencies[id + '-template'] = 'file:./' + archive
  await writeFile(join(websiteRoot, 'package.json'), JSON.stringify(pkg, null, 2) + '\n')
  console.log(JSON.stringify(record, null, 2))
  console.log('请执行 pnpm install 更新锁文件，再 pnpm run build 验证；生成包无需手工编辑。')
} else if (command === 'assets') {
  console.log(JSON.stringify(await syncAssets((await localRoot(id)) ?? installedRoot(id), undefined, id), null, 2))
} else if (command === 'check') {
  console.log(JSON.stringify(await verifySnapshot(id), null, 2))
} else {
  throw new Error('支持 local <模板目录>、snapshot <tgz>、assets、check')
}
