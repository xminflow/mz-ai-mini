/** 用本机 Chrome 与标准 CDP 生成三端真实截图，无新增 npm 依赖。 */
import { spawn } from 'node:child_process'
import { mkdtemp, readFile, mkdir, writeFile, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const base = process.env.GROVIA_PREVIEW_URL || 'http://127.0.0.1:3000'
const candidates = [process.env.CHROME_PATH, 'C:/Program Files/Google/Chrome/Application/chrome.exe', '/usr/bin/google-chrome', '/usr/bin/chromium'].filter(Boolean)
const chrome = candidates.find(path => existsSync(path))
if (!chrome) throw new Error('请通过 CHROME_PATH 指定本机 Chrome。')
const profile = await mkdtemp(join(tmpdir(), 'grovia-capture-'))
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
    { name: 'home', path: '', selector: '' },
    { name: 'features', path: '', selector: '#feature' },
    { name: 'cases', path: '/case-studies', selector: '' },
    { name: 'contact', path: '', selector: '#contact' },
  ]
  const output = resolve(root, 'public/templates/grovia/screenshots')
  await mkdir(output, { recursive: true })
  const report = []
  for (const device of [{ name: '', width: 1440, height: 1000 }, { name: 'tablet-', width: 834, height: 1180 }, { name: 'mobile-', width: 390, height: 844 }]) {
    await page('Emulation.setDeviceMetricsOverride', { width: device.width, height: device.height, deviceScaleFactor: 1, mobile: false })
    for (const shot of shots) {
      const url = `${base}/templates/grovia/site${shot.path}`
      const navigation = await page('Page.navigate', { url })
      if (navigation.errorText) throw new Error(navigation.errorText)
      let ready = false
      for (let attempt = 0; attempt < 100; attempt++) {
        ready = await evaluate(`location.href === ${JSON.stringify(url)} && document.readyState === 'complete' && !!document.querySelector('.gv-footer')`)
        if (ready) break
        await delay(100)
      }
      if (!ready) throw new Error(`页面未就绪: ${url}`)
      const selector = shot.name === 'contact' && device.width < 768 ? '.gv-form' : shot.selector
      const result = await evaluate(`(async () => {
        document.documentElement.style.scrollBehavior='auto';
        [...document.images].forEach(image => image.loading='eager');
        await document.fonts.ready;
        const broken = (await Promise.all([...document.images].map(image => image.decode().then(()=>null,()=>image.src)))).filter(Boolean);
        document.querySelector('nextjs-portal')?.setAttribute('style','display:none');
        const element = ${JSON.stringify(selector)} ? document.querySelector(${JSON.stringify(selector)}) : null;
        window.scrollTo({top: element ? element.getBoundingClientRect().top + scrollY - 90 : 0, behavior:'instant'});
        await new Promise(resolve=>setTimeout(resolve,900));
        const loadedFonts = [...document.fonts].filter(font => font.family === 'Weelume MiSans' && font.status === 'loaded');
        return { width:innerWidth, height:innerHeight, broken, overflow:document.documentElement.scrollWidth>innerWidth, scroll:scrollY, chineseFontWeights:[...new Set(loadedFonts.map(font=>font.weight))], footerSlogan:document.querySelector('.gv-footer h2').textContent };
      })()`)
      if (result.broken.length || result.overflow || result.width !== device.width || result.height !== device.height || !['400', '700'].every(weight => result.chineseFontWeights.includes(weight)) || result.footerSlogan !== '让团队成长更有方向') throw new Error(JSON.stringify(result))
      const screenshot = await page('Page.captureScreenshot', { format: 'webp', quality: 85, captureBeyondViewport: false })
      const file = `${device.name}${shot.name}.webp`
      await writeFile(join(output, file), Buffer.from(screenshot.data, 'base64'))
      report.push({ file, ...result })
      console.log(`Captured ${file}: ${result.width}x${result.height}, scroll=${result.scroll}`)
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
