// 课程终端演示(asciinema .cast)作者脚本。
// 用法：从 website/ 目录运行  `node scripts/gen-cast.mjs`
// 产物写入 public/courses/<章>/casts/*.cast，课件里用 ```asciinema 块按 public 绝对路径引用。
// 想加新演示：照下面 buildHookBlockRm 的写法再写一个 build 函数，改写入路径即可。
// 脚本化 cast 比真机录制更干净(无手误、节奏可控、输出理想)，适合教学。
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const COURSES = path.join(__dirname, '..', 'public', 'courses')

// ---- ANSI 上色小工具 ----
const E = String.fromCharCode(27) + '['
const g = (s) => `${E}32m${s}${E}0m` // 绿
const cy = (s) => `${E}36m${s}${E}0m` // 青
const dim = (s) => `${E}90m${s}${E}0m` // 灰
const b = (s) => `${E}1m${s}${E}0m` // 粗
const red = (s) => `${E}31m${s}${E}0m` // 红
const orange = (s) => `${E}38;5;208m${s}${E}0m` // 橙

// ---- 事件流构造器 ----
function newRec() {
  const events = []
  let t = 0
  return {
    out: (s) => events.push([Number(t.toFixed(3)), 'o', s]),
    wait: (dt) => { t += dt },
    type(s, per = 0.09) { for (const ch of s) { events.push([Number(t.toFixed(3)), 'o', ch]); t += per } },
    done: () => ({ events, duration: t }),
  }
}

function writeCast(relDir, name, width, height, events) {
  const dir = path.join(COURSES, relDir, 'casts')
  fs.mkdirSync(dir, { recursive: true })
  const header = { version: 2, width, height, timestamp: 0, env: { SHELL: '/bin/zsh', TERM: 'xterm-256color' } }
  const lines = [JSON.stringify(header), ...events.map((e) => JSON.stringify(e))]
  const file = path.join(dir, `${name}.cast`)
  fs.writeFileSync(file, lines.join('\n') + '\n')
  return file
}

// ---- 演示：PreToolUse hook 当场拦下 rm -rf ----
function buildHookBlockRm() {
  const r = newRec()
  r.wait(0.6)
  r.out(`${g('>')}  ${cy('my-app')} `)
  r.wait(0.3); r.type('claude'); r.wait(0.35); r.out('\r\n')
  r.wait(0.25)
  r.out(`${orange('*')} Claude Code ${dim('v2.1.202')}   ${dim('(已配 PreToolUse hook 拦截危险命令)')}\r\n\r\n`)
  r.wait(0.7)
  r.out(`${dim('> ')}`)
  r.wait(0.3); r.type('帮我清理一下 tmp 目录里的临时文件', 0.1); r.wait(0.4); r.out('\r\n\r\n')
  r.wait(0.7)
  r.out(`${cy('*')} 打算清空 ${b('tmp/')} 下的临时文件，尝试执行：\r\n`)
  r.wait(0.7)
  r.out(`  ${dim('$')} ${b('rm -rf tmp/*')}\r\n`)
  r.wait(1.1)
  r.out(`${red('  x 被 PreToolUse hook 拦下')}${dim('：命中危险命令 rm -rf，退出码 2，操作未执行')}\r\n`)
  r.wait(1.3)
  r.out(`${cy('*')} 收到拦截反馈，换一个稳妥办法：先列出、不用 rm -rf\r\n`)
  r.wait(0.9)
  r.out(`  ${dim('$')} ${b('ls tmp/')}\r\n`)
  r.wait(0.7)
  r.out(`${dim('  cache.tmp   build.log   session.old')}\r\n`)
  r.wait(1.0)
  r.out(`${cy('*')} tmp 下有 3 个临时文件。已列清单，逐个确认后再删，避免误伤\r\n`)
  r.wait(0.9)
  r.out(`\r\n${g('*')} 危险的一次性删除被挡在了执行之前 ${g('√')}\r\n`)
  r.wait(1.6)
  r.out(`\r\n${g('>')}  ${cy('my-app')} ${dim('_')}\r\n`)
  r.wait(1.2)
  const { events, duration } = r.done()
  const file = writeCast('s2-01-claude-code-codex', 'hook-block-rm', 92, 20, events)
  console.log(`wrote ${file}  (events=${events.length}, ${duration.toFixed(1)}s)`)
}

buildHookBlockRm()
