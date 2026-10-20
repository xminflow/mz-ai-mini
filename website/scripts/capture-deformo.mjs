/** 用本机 Chrome 与标准 CDP 生成 Deformo 三端真实截图。 */
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { basename, join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const base = process.env.DEFORMO_PREVIEW_URL || 'http://127.0.0.1:3000'
const candidates = [process.env.CHROME_PATH, 'C:/Program Files/Google/Chrome/Application/chrome.exe', '/usr/bin/google-chrome', '/usr/bin/chromium'].filter(Boolean)
const chrome = candidates.find(path => existsSync(path))
if (!chrome) throw new Error('请通过 CHROME_PATH 指定本机 Chrome。')

const profile = await mkdtemp(join(tmpdir(), 'deformo-capture-'))
const browser = spawn(chrome, ['--headless=new', '--disable-gpu', '--disable-dev-shm-usage', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' })
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
let socket
const browserErrors = []
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
    if (message.method === 'Runtime.exceptionThrown') browserErrors.push(message.params.exceptionDetails)
    if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') {
      const detail = message.params.args.map(arg => arg.value || arg.description).join(' ')
      browserErrors.push(detail.length > 6000 ? detail.slice(0, 400) + '\n…\n' + detail.slice(-5600) : detail)
    }
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
  await page('Page.addScriptToEvaluateOnNewDocument', { source: 'window.__deformoDocumentIdentity = crypto.randomUUID()' })
  await page('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })

  const shots = [
    { name: 'home', path: '', ready: '用不一样的想法' },
    { name: 'projects', path: '/projects', ready: '不止于预期' },
    { name: 'blog', path: '/blog', ready: '新的视角' },
    { name: 'contact', path: '/contact', ready: '好的合作' },
  ]
  const devices = [
    { prefix: '', width: 1440, height: 1000 },
    { prefix: 'tablet-', width: 834, height: 1180 },
    { prefix: 'mobile-', width: 390, height: 844 },
  ]
  const output = resolve(root, 'public/templates/deformo/screenshots')
  await mkdir(output, { recursive: true })
  const report = []

  for (const device of devices) {
    await page('Emulation.setDeviceMetricsOverride', { width: device.width, height: device.height, deviceScaleFactor: 1, mobile: false })
    for (const shot of shots) {
      const url = `${base}/templates/deformo/site${shot.path}`
      const navigation = await page('Page.navigate', { url })
      if (navigation.errorText) throw new Error(navigation.errorText)
      let ready = false
      for (let attempt = 0; attempt < 300; attempt++) {
        ready = await evaluate(`location.href === ${JSON.stringify(url)} && document.readyState === 'complete' && !!document.querySelector('.dm-footer') && Object.keys(document.querySelector('.dm-menu-toggle') || {}).some(key => key.startsWith('__reactProps$')) && document.body.innerText.includes(${JSON.stringify(shot.ready)})`)
        if (ready) break
        await delay(100)
      }
      if (!ready) throw new Error(`页面未就绪: ${url}`)
      const result = await evaluate(`(async () => {
        document.documentElement.style.scrollBehavior = 'auto';
        await document.fonts.ready;
        // 独立探测所有图片，保留页面本身的懒加载属性，避免干扰尚在进行的水合。
        const broken = (await Promise.all([...document.images].map(image => { const probe = new Image(); probe.src = image.currentSrc || image.src; return probe.decode().then(() => null, () => probe.src); }))).filter(Boolean);
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

  const routes = ["","projects","about-us","blog","contact","projects/colorado","projects/kinetic","projects/growthview","blog/why-visual-hierarchy-determines-digital-success","blog/why-accessibility-should-be-your-competitive-advantage","blog/why-user-research-should-drive-your-digital-strategy","blog/measuring-digital-success-beyond-vanity-metrics","blog/brand-identity-through-bold-typography-choices","blog/e-commerce-trends-that-will-shape-2025","blog/mobile-first-design-strategies-that-convert-better","blog/why-data-should-drive-your-design-decisions","blog/breaking-design-conventions-that-actually-work","blog/accessible-design-creating-digital-spaces-for-everyone","legal/privacy-policy","legal/terms-of-service"]
  await writeFile(join(output, 'capture-report.json'), JSON.stringify({ capturedAt: new Date().toISOString(), base, reducedMotion: true, shots: report }, null, 2))
  const routeChecks = []
  const waitUntil = async expression => {
    for (let attempt = 0; attempt < 300; attempt++) {
      if (await evaluate(expression)) return
      await delay(100)
    }
    const state = await evaluate("({ url:location.href, ready:document.readyState, content:document.body?.innerText.slice(0,1200) })")
    throw new Error('Condition timed out: ' + expression + '\nPage state: ' + JSON.stringify(state) + '\nBrowser errors: ' + JSON.stringify(browserErrors))
  }
  const navigate = async (path, readySelector = '.dm-footer') => {
    const url = base + path
    const result = await page('Page.navigate', { url })
    if (result.errorText) throw new Error(result.errorText)
    await waitUntil("location.href === " + JSON.stringify(url) + " && document.readyState === 'complete' && !!document.querySelector(" + JSON.stringify(readySelector) + ") && !document.querySelector('[data-nextjs-dialog]')")
    // 等待导航交互绑定后再开始页面检查。
    if (readySelector === '.dm-footer') await waitUntil("Object.keys(document.querySelector('.dm-menu-toggle') || {}).some(key => key.startsWith('__reactProps$'))")
  }
  const click = async selector => {
    // 深链接与客户端切换可能仍在恢复滚动；等待两帧并确认实际命中目标后再发送鼠标事件。
    const point = await evaluate("(async () => { await document.fonts.ready; document.documentElement.style.scrollBehavior='auto'; const e = document.querySelector(" + JSON.stringify(selector) + "); if (!e) throw new Error('Missing click target: ' + " + JSON.stringify(selector) + "); e.scrollIntoView({ block: 'center', behavior: 'instant' }); await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); const r = e.getBoundingClientRect(); const x = r.x + r.width / 2, y = r.y + r.height / 2; const hit=document.elementFromPoint(x,y); if (!hit || !(hit===e || e.contains(hit))) throw new Error('Click target obscured: ' + " + JSON.stringify(selector) + " + ' by ' + hit?.outerHTML); return { x, y }; })()")
    await page('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...point })
    await page('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...point })
  }
  for (const device of [...devices, { prefix: 'narrow-', width: 320, height: 844 }]) {
    await page('Emulation.setDeviceMetricsOverride', { width: device.width, height: device.height, deviceScaleFactor: 1, mobile: false })
    for (const locale of ['zh', 'en']) {
      for (const route of routes) {
        const path = '/templates/deformo/site' + (locale === 'en' ? '/en' : '') + (route ? '/' + route : '')
        await navigate(path)
        const result = await evaluate(`(async () => {
          await document.fonts.ready;
          const broken = (await Promise.all([...document.images].map(image => { const probe = new Image(); probe.src = image.currentSrc || image.src; return probe.decode().then(() => null, () => probe.src); }))).filter(Boolean);
          return { width: innerWidth, height: innerHeight, broken, overflow: document.documentElement.scrollWidth > innerWidth,
            heading: document.querySelector('h1')?.innerText, h1Count: document.querySelectorAll('h1').length,
            language: document.querySelector('[data-template]').lang,
            links: [...document.querySelectorAll('.dm-site a[href]')].map(a => a.getAttribute('href')),
            badFields: [...document.querySelectorAll('.dm-site input:not([type=checkbox]),.dm-site textarea,.dm-site select')].filter(e => !document.querySelector('label[for="' + e.id + '"]')).map(e => e.name)
          };
        })()`)
        if (result.broken.length || result.overflow || !result.heading || result.h1Count !== 1 || result.badFields.length || result.language !== (locale === 'zh' ? 'zh-CN' : 'en')) throw new Error(JSON.stringify({ path, device, ...result }))
        const englishHasChinese = locale === 'en' && /[\u4e00-\u9fff]/.test(result.heading)
        if (englishHasChinese) throw new Error('Untranslated heading: ' + path)
        for (const href of result.links.filter(href => href.startsWith('/templates/deformo/site'))) {
          const relative = href.split(/[?#]/)[0].replace(/^\/templates\/deformo\/site(?:\/en(?=\/|$))?\/?/, '')
          if (!routes.includes(relative)) throw new Error('Unregistered internal link: ' + href)
        }
        routeChecks.push({ path, width: device.width, height: device.height, language: result.language, heading: result.heading, overflow: result.overflow, broken: result.broken })
      }
    }
    console.log('Verified 40 localized pages at ' + device.width + 'px')
  }
  const interactions = []
  await page('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: false })
  await navigate('/templates/deformo/site')
  await click('.dm-menu-toggle')
  await waitUntil("document.querySelector('.dm-menu-toggle').getAttribute('aria-expanded') === 'true'")
  await click('#deformo-menu a[href$="/projects"]')
  await waitUntil("location.pathname.endsWith('/projects') && !!document.querySelector('.dm-project-card')")
  if (await evaluate("document.querySelector('.dm-menu-toggle').getAttribute('aria-expanded') !== 'false'")) throw new Error('Menu stayed open after navigation')
  const identity = await evaluate('window.__deformoDocumentIdentity')
  await click('.dm-language')
  await waitUntil("location.pathname.endsWith('/en/projects') && document.querySelector('[data-template]').lang === 'en'")
  if (identity !== await evaluate('window.__deformoDocumentIdentity')) throw new Error('Language switch caused a full navigation')
  interactions.push('mobile-menu-and-client-side-navigation')

  await navigate('/templates/deformo/site/blog/why-visual-hierarchy-determines-digital-success?source=verification#section-2')
  const articleIdentity = await evaluate('window.__deformoDocumentIdentity')
  await click('.dm-language')
  await waitUntil("location.pathname.includes('/site/en/blog/') && location.search === '?source=verification' && location.hash === '#section-2'")
  if (articleIdentity !== await evaluate('window.__deformoDocumentIdentity')) throw new Error('Article language switch reloaded document')
  await click('.dm-toc a[href="#section-3"]')
  await waitUntil("location.hash === '#section-3'")
  interactions.push('language-retains-article-query-anchor-and-client-routing', 'article-table-of-contents')

  await navigate('/templates/deformo/site')
  await click('.dm-menu-toggle')
  await page('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 })
  await page('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 })
  await waitUntil("document.querySelector('.dm-menu-toggle').getAttribute('aria-expanded') === 'false'")
  await click('.dm-faq button[aria-controls="dm-faq-1"]')
  await waitUntil("document.querySelector('#dm-faq-1')?.offsetHeight > 0")
  await click('.dm-faq button[aria-controls="dm-faq-1"]')
  await waitUntil("!document.querySelector('#dm-faq-1')")
  await click('.dm-accordion button[aria-controls="dm-service-1"]')
  await waitUntil("!!document.querySelector('#dm-service-1') && !document.querySelector('#dm-service-0')")
  await click('.dm-carousel-controls button[aria-label="下一条评价"]')
  await waitUntil("document.querySelector('.dm-quote figcaption').innerText.includes('Daniel Marsh')")
  interactions.push('escape-closes-menu', 'faq-expand-collapse', 'service-accordion', 'testimonial-carousel')

  for (const locale of ['zh', 'en']) {
    await navigate('/templates/deformo/site' + (locale === 'en' ? '/en' : '') + '/contact')
    if (await evaluate("document.querySelector('#contact-form').checkValidity()")) throw new Error('Empty contact form should be invalid')
    await evaluate(`(() => {
      const set = (selector, value) => { const e = document.querySelector(selector); const prototype = e.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : e.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(prototype, 'value').set.call(e, value); e.dispatchEvent(new Event('input', { bubbles:true })); e.dispatchEvent(new Event('change', { bubbles:true })); };
      set('#dm-name', 'Template verification'); set('#dm-email', 'invalid'); set('#dm-subject', 'Website Design'); set('#dm-message', 'A clearly scoped demonstration project.');
    })()`)
    if (await evaluate("document.querySelector('#contact-form').checkValidity()")) throw new Error('Invalid email passed')
    await evaluate(`(() => { const e=document.querySelector('#dm-email'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,'template@example.com'); e.dispatchEvent(new Event('input',{bubbles:true})); })()`)
    await click('#contact-form button[type="submit"]')
    await waitUntil("!!document.querySelector('#contact-form [role=status]')")
    const status = await evaluate("document.querySelector('#contact-form [role=status]').innerText")
    if (!/演示|demo/.test(status)) throw new Error('Form status does not disclose demo behavior')
    interactions.push(locale + '-contact-validation-and-demo-status')
    await evaluate(`(() => { const e=document.querySelector('#dm-newsletter-email'); e.value='template@example.com'; e.dispatchEvent(new Event('input',{bubbles:true})); })()`)
    if (await evaluate("document.querySelector('.dm-newsletter').checkValidity()")) throw new Error('Newsletter accepted without consent')
    await click('.dm-consent input')
    await click('.dm-newsletter button[type="submit"]')
    await waitUntil("!!document.querySelector('.dm-newsletter [role=status]')")
    interactions.push(locale + '-newsletter-consent-and-demo-status')
  }

  for (const viewport of ['desktop', 'tablet', 'mobile']) {
    await navigate('/templates/deformo/preview?viewport=' + viewport, 'iframe')
    await waitUntil("!!document.querySelector('iframe')?.contentDocument?.querySelector('.dm-footer')")
    const frame = await evaluate("(() => { const f=document.querySelector('iframe'); return {width:f.contentWindow.innerWidth,height:f.contentWindow.innerHeight,root:f.contentDocument.querySelector('[data-template]')?.dataset.template}; })()")
    const expected = { desktop: [1440,1000], tablet: [834,1180], mobile: [390,844] }[viewport]
    if (frame.width !== expected[0] || frame.height !== expected[1] || frame.root !== 'deformo') throw new Error('Invalid preview dimensions: ' + JSON.stringify(frame))
    interactions.push(viewport + '-real-viewport-preview')
  }
  await navigate('/templates/deformo', 'img[src*="/deformo/screenshots/"]')
  const previewLinks = await evaluate("[...document.querySelectorAll('a[target=_blank]')].map(a=>a.href)")
  if (!previewLinks.some(href => href.includes('/deformo/'))) throw new Error('Missing new-tab preview')
  const gallery = await evaluate("[...document.querySelectorAll('img')].filter(i=>i.src.includes('/deformo/screenshots/')).map(i=>i.src)")
  if (!gallery.length) throw new Error('Missing template gallery')
  interactions.push('template-details-gallery-and-new-tab-preview')
  if (browserErrors.length) throw new Error('Browser errors (' + browserErrors.length + '): ' + JSON.stringify(browserErrors.slice(0, 2)))
  await writeFile(join(output, 'verification-report.json'), JSON.stringify({ verifiedAt: new Date().toISOString(), routes: routeChecks, interactions, browserErrors }, null, 2))
  console.log('Passed ' + routeChecks.length + ' localized viewport checks and ' + interactions.length + ' interaction checks')

  await writeFile(join(output, 'capture-report.json'), JSON.stringify({ capturedAt: new Date().toISOString(), base, reducedMotion: true, shots: report }, null, 2))
} finally {
  if (socket?.readyState === WebSocket.OPEN) {
    await send('Browser.close')
    socket.close()
  }
  if (browser.exitCode === null) browser.kill()
  await delay(500)
  if (!resolve(profile).startsWith(resolve(tmpdir()) + sep) || !basename(profile).startsWith('deformo-capture-')) throw new Error('Unexpected temporary profile path')
  await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 })
}


