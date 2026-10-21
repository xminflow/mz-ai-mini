import { createRequire } from 'node:module'
import { spawn } from 'node:child_process'
import { watch } from 'node:fs'
import { join } from 'node:path'
import { verifyTemplateReleases } from './lib/template-release.mjs'
import { websiteRoot, localRoot, installedRoot, syncAssets, verifySnapshot, SHARED_TEMPLATE_IDS } from './lib/deformo-package.mjs'

const command = process.argv[2]
if (!['dev', 'build', 'start'].includes(command)) throw new Error('使用 dev、build 或 start')
if (command === 'build') await verifyTemplateReleases()
const watchers = []
const timers = new Map()
let queue = Promise.resolve()
for (const id of SHARED_TEMPLATE_IDS) {
  const source = command === 'dev' ? (await localRoot(id)) ?? installedRoot(id) : installedRoot(id)
  if (command !== 'dev') await verifySnapshot(id)
  if (command !== 'start') console.log('[' + id + ':assets]', await syncAssets(source, undefined, id))
  if (command === 'dev') for (const path of ['public/templates/' + id, '.tpl/assets']) {
    watchers.push(watch(join(source, path), { recursive: true }, () => {
      clearTimeout(timers.get(id))
      timers.set(id, setTimeout(() => {
        queue = queue.then(() => syncAssets(source, undefined, id)).then(result => console.debug('[' + id + ':assets]', result)).catch(error => { console.error('[' + id + ':assets] 同步失败', error); child.kill(); process.exitCode = 1 })
      }, 150))
    }))
  }
}
const require = createRequire(import.meta.url)
const childEnvironment = { ...process.env, NEXT_TELEMETRY_DISABLED: '1' }
if (command === 'dev') {
  const nextArgs = process.argv.slice(3)
  const portIndex = nextArgs.findIndex(argument => argument === '--port' || argument === '-p')
  const inlinePort = nextArgs.find(argument => argument.startsWith('--port='))?.slice(7)
  const port = portIndex >= 0 ? nextArgs[portIndex + 1] : inlinePort ?? process.env.PORT ?? '3000'
  if (!port || !/^\d+$/.test(port) || Number(port) < 1 || Number(port) > 65535) throw new Error('开发端口无效')
  // 不同端口的预览服务不得同时写入同一份 Next 客户端模块清单。
  childEnvironment.WEBSITE_DEV_PORT = port
}
const child = spawn(process.execPath, [require.resolve('next/dist/bin/next'), command, ...process.argv.slice(3)], {
  cwd: websiteRoot, stdio: 'inherit', windowsHide: true, env: childEnvironment,
})
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal))
child.on('error', error => { console.error(error); process.exitCode = 1 })
child.on('close', code => {
  for (const timer of timers.values()) clearTimeout(timer)
  for (const watcher of watchers) watcher.close()
  process.exitCode = process.exitCode || code || 0
})
