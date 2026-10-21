import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { websiteRoot } from './lib/deformo-package.mjs'

const root = resolve(websiteRoot, '..')
const output = process.env.TEMPLATE_RELEASE_OUTPUT ?? '/tmp/weelume-template-release'
const script = join(root, 'scripts/template_release.py')
const args = process.argv.slice(2)
if (args.length && (args.length !== 2 || args[0] !== '--ids' || !/^[a-z0-9-]+(?:,[a-z0-9-]+)*$/.test(args[1]))) throw new Error('用法: template:release [--ids id1,id2]')
const windows = process.platform === 'win32'
const run = (file, args) => execFileSync(file, args, { stdio: 'inherit', windowsHide: true })
const wslPath = path => execFileSync('wsl', ['-e', 'wslpath', '-u', path], { encoding: 'utf8', windowsHide: true }).trim()
const python = process.env.TEMPLATE_RELEASE_PYTHON ?? join(root, 'server/.venv', windows ? 'Scripts/python.exe' : 'bin/python')
if (!existsSync(python)) throw new Error('请配置 TEMPLATE_RELEASE_PYTHON 为已有 COS SDK 的 Python，不自动安装依赖')
if (windows) {
  run('wsl', ['-e', 'python3', wslPath(script), 'pack', output, ...args])
  const hostOutput = execFileSync('wsl', ['-e', 'wslpath', '-w', output], { encoding: 'utf8', windowsHide: true }).trim()
  run(python, [script, 'publish', hostOutput, ...args])
} else {
  run('python3', [script, 'pack', output, ...args])
  run(python, [script, 'publish', output, ...args])
}
run(process.execPath, [join(websiteRoot, 'scripts/template-release-check.mjs')])
