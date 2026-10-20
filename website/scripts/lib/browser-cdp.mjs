import { spawn } from 'node:child_process'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
export const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
export async function openBrowser() {
  const profile = await mkdtemp(join(tmpdir(), 'weelume-unseen-'))
  const chrome = [process.env.CHROME_PATH, 'C:/Program Files/Google/Chrome/Application/chrome.exe', '/usr/bin/google-chrome', '/usr/bin/chromium'].filter(Boolean).find(existsSync)
  if (!chrome) throw new Error('请通过 CHROME_PATH 指定 Chrome')
  const browser = spawn(chrome, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' })
  const portFile = join(profile, 'DevToolsActivePort')
  for (let i = 0; i < 100 && !existsSync(portFile); i++) await delay(100)
  const [port, path] = (await readFile(portFile, 'utf8')).trim().split(/\r?\n/)
  const socket = new WebSocket(`ws://127.0.0.1:${port}${path}`)
  await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }) })
  let id = 0
  const pending = new Map()
  const events = []
  socket.addEventListener('message', event => {
    const m = JSON.parse(event.data)
    if (!m.id) { events.push(m); return }
    const p = pending.get(m.id)
    if (!p) return
    clearTimeout(p.timer); pending.delete(m.id)
    if (m.error) p.reject(new Error(JSON.stringify(m.error))); else p.resolve(m.result)
  })
  const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
    const n = ++id
    const timer = setTimeout(() => { pending.delete(n); reject(new Error(`CDP timeout: ${method}`)) }, 45000)
    pending.set(n, { resolve, reject, timer }); socket.send(JSON.stringify({ id: n, method, params, ...(sessionId ? { sessionId } : {}) }))
  })
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' })
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true })
  const page = (method, params) => send(method, params, sessionId)
  const evaluate = async expression => {
    const r = await page('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
    if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails))
    return r.result.value
  }
  await page('Page.enable'); await page('Runtime.enable'); await page('Network.enable')
  const close = async () => {
    try { await send('Browser.close') } finally { socket.close(); if (browser.exitCode === null) browser.kill(); await delay(300); await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }) }
  }
  return { page, evaluate, events, close, send }
}
