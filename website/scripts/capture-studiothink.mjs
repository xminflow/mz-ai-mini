/** 用本机 Chrome 与标准 CDP 生成 Studio Think 三端真实截图。 */
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const base = process.env.STUDIOTHINK_PREVIEW_URL || 'http://127.0.0.1:3000'
const candidates = [process.env.CHROME_PATH, 'C:/Program Files/Google/Chrome/Application/chrome.exe', '/usr/bin/google-chrome', '/usr/bin/chromium'].filter(Boolean)
const chrome = candidates.find(path => existsSync(path))
if (!chrome) throw new Error('请通过 CHROME_PATH 指定本机 Chrome。')

const profile = await mkdtemp(join(tmpdir(), 'studiothink-capture-'))
const browser = spawn(chrome, ['--headless=new', '--disable-gpu', '--disable-dev-shm-usage', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' })
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
let socket
let nextId = 0
const pending = new Map()

function send(method, params = {}, sessionId) {
  const id = ++nextId
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timed out: ${method}`)) }, 25000)
    pending.set(id, { resolve, reject, timeout })
    socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }))
  })
}

try {
  let portData = ''
  const portFile = join(profile, 'DevToolsActivePort')
  for (let attempt = 0; attempt < 100; attempt++) {
    if (existsSync(portFile)) { portData = await readFile(portFile, 'utf8'); break }
    if (browser.exitCode !== null) throw new Error(`Chrome exited: ${browser.exitCode}`)
    await delay(100)
  }
  if (!portData) throw new Error('Chrome 调试端口启动超时。')
  const [port, path] = portData.trim().split(/\r?\n/)
  socket = new WebSocket(`ws://127.0.0.1:${port}${path}`)
  await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }) })
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data)
    const task = pending.get(message.id)
    if (!task) return
    clearTimeout(task.timeout)
    pending.delete(message.id)
    if (message.error) task.reject(new Error(JSON.stringify(message.error)))
    else task.resolve(message.result)
  })

  const { targetId } = await send('Target.createTarget', { url: 'about:blank' })
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true })
  const page = (method, params) => send(method, params, sessionId)
  const evaluate = async expression => {
    const result = await page('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails))
    return result.result.value
  }

  await page('Page.enable')
  await page('Runtime.enable')
  await page('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })

  const shots = [
    { name: 'home', path: '', ready: '设计始于' },
    { name: 'about', path: '/about', ready: '我们把想法变成视觉体验' },
    { name: 'works', path: '/works', ready: '有思考的设计，真实的影响' },
    { name: 'contact', path: '/contact', ready: '一起创造一些东西' },
  ]
  const devices = [
    { prefix: '', width: 1440, height: 1000 },
    { prefix: 'tablet-', width: 834, height: 1180 },
    { prefix: 'mobile-', width: 390, height: 844 },
  ]
  const output = resolve(root, 'public/templates/studiothink/screenshots')
  await mkdir(output, { recursive: true })
  const report = []

  for (const device of devices) {
    await page('Emulation.setDeviceMetricsOverride', { width: device.width, height: device.height, deviceScaleFactor: 1, mobile: false })
    for (const shot of shots) {
      const url = `${base}/templates/studiothink/site${shot.path}`
      const navigation = await page('Page.navigate', { url })
      if (navigation.errorText) throw new Error(navigation.errorText)
      let ready = false
      for (let attempt = 0; attempt < 100; attempt++) {
        ready = await evaluate(`location.href === ${JSON.stringify(url)} && document.readyState === 'complete' && !!document.querySelector('.st-footer') && document.body.innerText.includes(${JSON.stringify(shot.ready)})`)
        if (ready) break
        await delay(100)
      }
      if (!ready) throw new Error(`页面未就绪: ${url}`)
      const result = await evaluate(`(async () => {
        document.documentElement.style.scrollBehavior = 'auto';
        [...document.images].forEach(image => image.loading = 'eager');
        await document.fonts.ready;
        const broken = (await Promise.all([...document.images].map(image => image.decode().then(() => null, () => image.src)))).filter(Boolean);
        document.querySelector('nextjs-portal')?.setAttribute('style', 'display:none');
        window.scrollTo({ top: 0, behavior: 'instant' });
        await new Promise(resolve => setTimeout(resolve, 700));
        return { width: innerWidth, height: innerHeight, broken, overflow: document.documentElement.scrollWidth > innerWidth };
      })()`)
      if (result.broken.length || result.overflow || result.width !== device.width || result.height !== device.height) throw new Error(JSON.stringify(result))
      const screenshot = await page('Page.captureScreenshot', { format: 'webp', quality: 85, captureBeyondViewport: false })
      const file = `${device.prefix}${shot.name}.webp`
      await writeFile(join(output, file), Buffer.from(screenshot.data, 'base64'))
      report.push({ file, url, ...result })
      console.log(`Captured ${file}: ${result.width}x${result.height}`)
    }
  }
  await writeFile(join(output, 'capture-report.json'), JSON.stringify({ capturedAt: new Date().toISOString(), base, reducedMotion: true, shots: report }, null, 2))
} finally {
  if (socket?.readyState === WebSocket.OPEN) {
    await send('Browser.close')
    socket.close()
  }
  if (browser.exitCode === null) browser.kill()
  await delay(500)
  await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 })
}
